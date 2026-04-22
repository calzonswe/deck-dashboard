import { useState, useCallback, useEffect } from 'react';
import { useStatus } from './hooks/useStatus';
import { fetchApps, deleteApp } from './api/client';
import { AppList } from './components/AppList';
import { ThemeToggle } from './components/ThemeToggle';
import { AddAppModal } from './components/AddAppModal';
import { EditAppModal } from './components/EditAppModal';

function AppContent() {
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const { status, loading: statusLoading, error: statusError, refresh } = useStatus();

  const loadApps = useCallback(async () => {
    try {
      const data = await fetchApps();
      setApps(data);
    } catch (err) {
      console.error('Failed to load apps:', err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleAppAdded = useCallback(() => {
    loadApps();
    refresh();
  }, [loadApps, refresh]);

  const handleEdit = useCallback((app) => {
    setEditingApp(app);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (name) => {
    try {
      await deleteApp(name);
      loadApps();
      refresh();
    } catch (err) {
      console.error('Failed to delete app:', err);
    }
  }, [loadApps, refresh]);

  if (loadingApps) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Decksite</h1>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Decksite</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add App
          </button>
          <ThemeToggle />
        </div>
      </header>

      {statusError && (
        <div className="error-message">
          Status check failed: {statusError}
        </div>
      )}

      <AppList apps={apps} status={status} onEdit={handleEdit} onDelete={handleDelete} />

      <AddAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppAdded={handleAppAdded}
      />

      <EditAppModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        app={editingApp}
        onAppUpdated={handleAppAdded}
      />
    </div>
  );
}

export default App;
