import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import SensorChart from './components/SensorChart';
import { fetchSensors, fetchLatest, getBackendUrl } from './api';

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSensors();
      if (Array.isArray(data)) setEntries(data.slice().reverse()); // show oldest->newest
      else setEntries([]);
    } catch (err) {
      // axios error handling
      const msg = err && err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : err.message || String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function pollLatest() {
    try {
      const latest = await fetchLatest();
      if (latest && latest.timestamp) {
        setEntries(prev => {
          const exists = prev.length && prev[prev.length-1] && prev[prev.length-1]._id === latest._id;
          if (exists) return prev;
          const next = prev.concat([latest]);
          if (next.length > 200) return next.slice(-200);
          return next;
        });
      }
    } catch (err) {
      // ignore polling errors silently
    }
  }

  useEffect(() => {
    loadAll();
    pollingRef.current = setInterval(pollLatest, 10000);
    return () => clearInterval(pollingRef.current);
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>IoT Sensor Dashboard</h1>
        <div className="controls">
          <button onClick={loadAll} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error">Error: {error}</div>}
        <SensorChart entries={entries} />
        <section style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Debug</h3>
          <div style={{ fontSize: 13, color: '#333' }}>
            <div><strong>Backend URL:</strong> {getBackendUrl() || '/'}</div>
            <div style={{ marginTop: 8 }}><strong>Entries (raw):</strong></div>
            <pre style={{ maxHeight: 220, overflow: 'auto', background: '#f6f6f6', padding: 8 }}>{JSON.stringify(entries, null, 2)}</pre>
          </div>
        </section>
        <div className="legend">
          <p>Showing {entries.length} samples (server provides newest→oldest; client displays oldest→newest)</p>
        </div>
      </main>
    </div>
  );
}

export default App;