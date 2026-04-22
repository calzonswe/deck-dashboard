import { useState, useEffect } from 'react';
import { updateApp } from '../api/client';

export function EditAppModal({ isOpen, onClose, app, onAppUpdated }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [host, setHost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (app) {
      setName(app.name);
      setUrl(app.url);
      setHost(app.host || '');
    }
  }, [app]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await updateApp(name, url, host || undefined);
      onAppUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setUrl('');
    setHost('');
    setError('');
    onClose();
  };

  if (!isOpen || !app) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit App</h2>
          <button className="modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="edit-name">App Name</label>
            <input
              type="text"
              id="edit-name"
              value={name}
              disabled
              className="disabled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-url">URL</label>
            <input
              type="url"
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-host">Docker Host (optional)</label>
            <input
              type="text"
              id="edit-host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="server-1"
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
