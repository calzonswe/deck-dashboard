import { useState, useCallback } from 'react';
import { addApp } from '../api/client';

export function AddAppModal({ isOpen, onClose, onAppAdded }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [host, setHost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await addApp(name, url, host || undefined);
      setName('');
      setUrl('');
      setHost('');
      onAppAdded();
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New App</h2>
          <button className="modal-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">App Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Service"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="host">Docker Host (optional)</label>
            <input
              type="text"
              id="host"
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
              {submitting ? 'Adding...' : 'Add App'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
