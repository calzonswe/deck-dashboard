import { AppCard } from './AppCard';

export function AppList({ apps, status, onEdit, onDelete }) {
  if (!apps || apps.length === 0) {
    return (
      <div className="empty-state">
        <p>No apps configured yet.</p>
        <p>Click "Add App" to get started.</p>
      </div>
    );
  }

  // Group apps by host
  const grouped = apps.reduce((acc, app) => {
    const host = app.host || 'Other';
    if (!acc[host]) {
      acc[host] = [];
    }
    acc[host].push(app);
    return acc;
  }, {});

  // Sort hosts: "Other" goes last, others alphabetically
  const sortedHosts = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="app-list-grouped">
      {sortedHosts.map((host) => (
        <div key={host} className="host-group">
          <div className="host-header">
            <h2 className="host-name">{host}</h2>
            <span className="host-count">{grouped[host].length}</span>
          </div>
          <div className="app-grid">
            {grouped[host].map((app) => (
              <AppCard
                key={app.name}
                name={app.name}
                url={app.url}
                status={status[app.name]}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
