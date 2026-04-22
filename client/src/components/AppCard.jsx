export function AppCard({ name, url, status, onEdit, onDelete }) {
  const getStatusClass = () => {
    if (status === true) return 'status-up';
    if (status === false) return 'status-down';
    return 'status-loading';
  };

  const getStatusText = () => {
    if (status === true) return 'Online';
    if (status === false) return 'Offline';
    return 'Checking...';
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit({ name, url });
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDelete(name);
    }
  };

  return (
    <div className="app-card">
      <a
        href={url}
        className="app-card-link"
        target="_blank"
        rel="noopener noreferrer"
        title={`Open ${name}`}
      >
        <div className="app-card-header">
          <span className="app-card-name">{name}</span>
          <div
            className={`status-indicator ${getStatusClass()}`}
            title={getStatusText()}
          />
        </div>
        <div className="app-card-url">{url}</div>
      </a>
      <div className="app-card-actions">
        <button
          className="btn-icon"
          onClick={handleEditClick}
          title={`Edit ${name}`}
          aria-label={`Edit ${name}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="btn-icon btn-icon-danger"
          onClick={handleDeleteClick}
          title={`Delete ${name}`}
          aria-label={`Delete ${name}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
