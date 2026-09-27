import { useCallback, useEffect, useState } from 'react';
import api from './api';
import { eventBus } from './eventBus';

// The /api/admin/today summary, shared by the header bell, the dashboard and
// the Notifications page so they agree and only one request is in flight.
let cached = null;
let inflight = null;

const fetchToday = () => {
  if (!inflight) {
    inflight = api.get('/api/admin/today')
      .then(({ data }) => {
        cached = data;
        eventBus.emit('ADMIN_TODAY', data);
        return data;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
};

/** Ask every view to reload the summary, e.g. after assigning a delivery. */
export const refreshToday = () => fetchToday().catch(() => null);

const errorMessage = (err) => err.response?.data?.message || 'Could not load today’s summary';

export const useToday = ({ pollMs = 5 * 60 * 1000 } = {}) => {
  const [today, setToday] = useState(cached);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cached);

  // Background loads never touch `loading` up front, so an effect can start one.
  const load = useCallback(
    () => fetchToday()
      .then(() => setError(null))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false)),
    []
  );

  /** For a Refresh button: shows the spinner while it reloads. */
  const reload = useCallback(() => {
    setLoading(true);
    return load();
  }, [load]);

  useEffect(() => {
    const off = eventBus.on('ADMIN_TODAY', setToday);
    load();
    const timer = pollMs ? setInterval(load, pollMs) : null;
    return () => {
      off();
      if (timer) clearInterval(timer);
    };
  }, [load, pollMs]);

  return { today, error, loading, reload };
};
