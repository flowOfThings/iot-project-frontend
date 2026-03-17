import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

function App() {
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState("");
  const [postResponse, setPostResponse] = useState(null);
  const [postError, setPostError] = useState("");
  const [posting, setPosting] = useState(false);

  const formatIso = (timestamp) => {
    if (timestamp === null || timestamp === undefined) return "";
    const maybeNum = typeof timestamp === "number" ? timestamp : Number(timestamp);
    if (!Number.isNaN(maybeNum)) {
      const ms = maybeNum < 1e12 ? maybeNum * 1000 : maybeNum;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
      return "";
    }
    const parsed = Date.parse(timestamp);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
    return "";
  };

  const getMs = (timestamp) => {
    if (timestamp === null || timestamp === undefined) return NaN;
    const maybeNum = typeof timestamp === "number" ? timestamp : Number(timestamp);
    if (!Number.isNaN(maybeNum)) return maybeNum < 1e12 ? maybeNum * 1000 : maybeNum;
    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sensor`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        console.error('GET /api/sensor failed', res.status);
        return;
      }
      const json = await res.json();

      setHistory(
        json
        // ensure a robust client-side sort: oldest -> newest
        .sort((a, b) => getMs(a.timestamp) - getMs(b.timestamp))
        .map(entry => ({
          time: formatIso(entry.timestamp),
          temperature: entry.temperature,
          humidity: entry.humidity
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const submitToken = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPosting(true);
    setPostError("");
    setPostResponse(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sensor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ token })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setPostResponse(json);
        // refresh list after successful post
        fetchData();
      } else {
        setPostError(json.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setPostError(err.message || String(err));
    } finally {
      setPosting(false);
    }
  };

  const chartData = {
    labels: history.map(entry => entry.time),
    datasets: [
      {
        label: "Temperature (°C)",
        data: history.map(entry => entry.temperature),
        borderColor: "red",
        fill: false,
        tension: 0.3   // smooth line
      },
      {
        label: "Humidity (%)",
        data: history.map(entry => entry.humidity),
        borderColor: "blue",
        fill: false,
        tension: 0.3
      }
    ]
  };

const chartOptions = {
  responsive: true,
  scales: {
    x: {
      title: { display: true, text: "Time" }
    },
    y: {
      title: { display: true, text: "Values" }
    }
  }
};

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1>🌡️ IoT Sensor Dashboard</h1>
      <form onSubmit={submitToken} style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Post device JWT to <code>/api/sensor</code> (for testing):</label>
        <input
          type="text"
          placeholder="paste JWT here"
          value={token}
          onChange={e => setToken(e.target.value)}
          style={{ width: '60%', marginRight: 8 }}
        />
        <button type="submit" disabled={posting || !token}>{posting ? 'Posting...' : 'Send'}</button>
        {postError && <div style={{ color: 'crimson', marginTop: 8 }}>Error: {postError}</div>}
        {postResponse && <div style={{ color: 'green', marginTop: 8 }}>Success: saved {postResponse.data?._id || ''}</div>}
      </form>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default App;