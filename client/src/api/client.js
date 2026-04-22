const API_BASE = '';

export async function fetchStatus() {
  const response = await fetch(`${API_BASE}/api/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }
  return response.json();
}

export async function fetchApps() {
  const response = await fetch(`${API_BASE}/api/apps`);
  if (!response.ok) {
    throw new Error('Failed to fetch apps');
  }
  return response.json();
}

export async function addApp(name, url, host) {
  const body = { name, url };
  if (host) {
    body.host = host;
  }
  const response = await fetch(`${API_BASE}/api/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to add app' }));
    throw new Error(error.error || 'Failed to add app');
  }
  return response.json();
}

export async function updateApp(name, url, host) {
  const body = { url };
  if (host !== undefined) {
    body.host = host;
  }
  const response = await fetch(`${API_BASE}/api/apps/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update app' }));
    throw new Error(error.error || 'Failed to update app');
  }
  return response.json();
}

export async function deleteApp(name) {
  const response = await fetch(`${API_BASE}/api/apps/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete app' }));
    throw new Error(error.error || 'Failed to delete app');
  }
}
