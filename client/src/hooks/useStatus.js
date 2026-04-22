import { useState, useEffect, useCallback } from 'react';
import { fetchStatus } from '../api/client';

const POLL_INTERVAL = 5000; // 5 seconds

export function useStatus() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const data = await fetchStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, loading, error, refresh: checkStatus };
}
