from flask import Flask, jsonify, render_template, request, send_from_directory
import requests
import json
import asyncio
import aiohttp
import os
import re
import fcntl
from typing import Dict, Any
from urllib.parse import urlparse

app = Flask(__name__, static_folder='../client/dist', static_url_path='')

CONFIG_FILE = 'config.json'

def load_config() -> list:
    """Loads the app configuration from config.json.
    Returns list of app dicts with name, url, and optional host fields.
    """
    try:
        with open(CONFIG_FILE, 'r') as f:
            data = json.load(f)
            # Ensure each app has at least name and url
            apps = []
            for item in data:
                if 'name' in item and 'url' in item:
                    app = {'name': item['name'], 'url': item['url']}
                    if item.get('host'):
                        app['host'] = item['host']
                    apps.append(app)
            return apps
    except FileNotFoundError:
        print(f"Error: {CONFIG_FILE} not found.")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {CONFIG_FILE}.")
        return []

def save_config(apps: list) -> bool:
    """Saves the app configuration to config.json with file locking."""
    # Normalize apps: remove null/empty hosts from saved config
    config_data = []
    for app in apps:
        item = {'name': app['name'], 'url': app['url']}
        if app.get('host'):
            item['host'] = app['host']
        config_data.append(item)
    try:
        with open(CONFIG_FILE, 'r+') as f:
            # Acquire exclusive lock
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
            try:
                f.seek(0)
                f.truncate()
                json.dump(config_data, f, indent=2)
                f.write('\n')
            finally:
                # Release lock
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        return True
    except Exception as e:
        print(f"Error saving config: {e}")
        return False

def validate_url(url: str) -> bool:
    """Validates that a URL is properly formatted with http/https scheme."""
    try:
        result = urlparse(url)
        return result.scheme in ('http', 'https') and bool(result.netloc)
    except Exception:
        return False

def sanitize_app_name(name: str) -> str:
    """Sanitizes app name - allows alphanumeric, spaces, hyphens, underscores."""
    # Strip whitespace and limit length
    name = name.strip()[:50]
    # Only allow safe characters
    if not re.match(r'^[a-zA-Z0-9\s\-_]+$', name):
        return None
    return name if name else None

async def check_url_status(session: aiohttp.ClientSession, url: str) -> bool:
    """Asynchronously checks the status of a single URL."""
    try:
        async with session.head(url, allow_redirects=True, timeout=5) as response:
            # Consider 200-399 as up.
            return 200 <= response.status < 400
    except aiohttp.ClientError as e:
        # print(f"Error checking {url}: {e.__class__.__name__}")
        return False
    except asyncio.TimeoutError:
        # print(f"Timeout checking {url}")
        return False
    except Exception as e:
        # print(f"Unexpected error checking {url}: {e}")
        return False

async def check_all_statuses(apps: list) -> Dict[str, bool]:
    """Runs concurrent status checks for all apps.
    Returns dict mapping app name to status.
    """
    if not apps:
        return {}

    # Use a single session for all checks
    async with aiohttp.ClientSession() as session:
        tasks = [check_url_status(session, app['url']) for app in apps]
        results = await asyncio.gather(*tasks)

        # Map results back to app names
        return {app['name']: status for app, status in zip(apps, results)}

@app.route('/api/status')
async def get_status():
    """API endpoint to retrieve the status of all configured apps."""
    apps = load_config()
    if not apps:
        return jsonify({"error": "Configuration file is empty or invalid."}), 500

    # Flask 2.0+ supports running async functions directly
    try:
        status_results = await check_all_statuses(apps)
        return jsonify(status_results)
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/api/apps', methods=['GET'])
def get_apps():
    """API endpoint to get all configured apps."""
    apps = load_config()
    return jsonify(apps)

@app.route('/api/apps', methods=['POST'])
def add_app():
    """API endpoint to add a new app."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name = data.get('name')
    url = data.get('url')
    host = data.get('host')

    # Validate name
    if not name or not isinstance(name, str):
        return jsonify({"error": "App name is required and must be a string"}), 400

    sanitized_name = sanitize_app_name(name)
    if not sanitized_name:
        return jsonify({"error": "App name contains invalid characters"}), 400

    # Validate URL
    if not url or not isinstance(url, str):
        return jsonify({"error": "App URL is required and must be a string"}), 400

    if not validate_url(url):
        return jsonify({"error": "URL must be a valid http:// or https:// URL"}), 400

    # Load current config
    apps = load_config()

    # Check for duplicates
    if any(app['name'] == sanitized_name for app in apps):
        return jsonify({"error": f"App with name '{sanitized_name}' already exists"}), 409

    # Add new app
    new_app = {'name': sanitized_name, 'url': url}
    if host:
        new_app['host'] = host

    apps.append(new_app)

    # Save config
    if not save_config(apps):
        return jsonify({"error": "Failed to save configuration"}), 500

    return jsonify(new_app), 201

@app.route('/api/apps/<app_name>', methods=['PUT'])
def update_app(app_name):
    """API endpoint to update an existing app's URL and/or host."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    new_url = data.get('url')
    new_host = data.get('host')

    if not new_url or not isinstance(new_url, str):
        return jsonify({"error": "URL is required and must be a string"}), 400

    if not validate_url(new_url):
        return jsonify({"error": "URL must be a valid http:// or https:// URL"}), 400

    # Load current config
    apps = load_config()

    # Find and update app
    app_found = False
    for app in apps:
        if app['name'] == app_name:
            app['url'] = new_url
            if new_host is not None:
                app['host'] = new_host if new_host else None
            app_found = True
            break

    if not app_found:
        return jsonify({"error": f"App '{app_name}' not found"}), 404

    # Save config
    if not save_config(apps):
        return jsonify({"error": "Failed to save configuration"}), 500

    updated_app = next(app for app in apps if app['name'] == app_name)
    return jsonify(updated_app)

@app.route('/api/apps/<app_name>', methods=['DELETE'])
def delete_app(app_name):
    """API endpoint to delete an app."""
    # Load current config
    apps = load_config()

    # Check if app exists and remove it
    apps = [app for app in apps if app['name'] != app_name]

    if len(apps) == len(load_config()):
        return jsonify({"error": f"App '{app_name}' not found"}), 404

    # Save config
    if not save_config(apps):
        return jsonify({"error": "Failed to save configuration"}), 500

    return '', 204

@app.route('/')
def index():
    """Renders the main index page for the React app."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files for client-side routing."""
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Ensure the app runs on a specific host/port if needed for Docker
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
