import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function parseTimestamp(ts) {
  if (ts == null) return null;
  // If it's already a Date
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? null : ts;
  }

  // Numbers: could be seconds or milliseconds
  if (typeof ts === 'number') {
    const asMs = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(asMs);
    return isNaN(d.getTime()) ? null : d;
  }

  // Strings: try ISO parse, or epoch seconds string
  if (typeof ts === 'string') {
    // Trim
    const s = ts.trim();
    // pure digits -> epoch seconds or ms
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      const asMs = n > 1e12 ? n : n * 1000;
      const d = new Date(asMs);
      if (!isNaN(d.getTime())) return d;
    }
    // Try Date.parse
    const parsed = Date.parse(s);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }

  return null;
}

function pad(n) { return String(n).padStart(2, '0'); }

function fmtTime(ts) {
  const d = parseTimestamp(ts);
  if (!d) {
    if (ts == null) return '';
    if (typeof ts === 'string') return ts.trim();
    return String(ts);
  }
  // MM:DD  HH:MM (local time)
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${mm}:${dd}  ${hh}:${min}`;
}

export default function SensorChart({ entries }) {
  const chartData = useMemo(() => {
    // Ensure entries are ordered oldest -> newest so new data appears on the right
    const ordered = Array.isArray(entries) ? entries.slice().map((e, i) => ({ e, i })).sort((A, B) => {
      const a = A.e, b = B.e;
      const da = parseTimestamp(a.timestamp);
      const db = parseTimestamp(b.timestamp);
      const ta = da ? da.getTime() : -8640000000000000; // very old if unparseable
      const tb = db ? db.getTime() : -8640000000000000;
      if (ta !== tb) return ta - tb;
      // stable sort fallback to original index
      return A.i - B.i;
    }).map(x => x.e) : [];

    const labels = ordered.map(e => fmtTime(e.timestamp));
    const tempData = ordered.map(e => (typeof e.temperature === 'number' ? Number(e.temperature.toFixed(2)) : null));
    const humData = ordered.map(e => (typeof e.humidity === 'number' ? Number(e.humidity.toFixed(2)) : null));

    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: 'rgb(255,99,132)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          spanGaps: true,
        },
        {
          label: 'Humidity (%)',
          data: humData,
          borderColor: 'rgb(54,162,235)',
          backgroundColor: 'rgba(54,162,235,0.2)',
          spanGaps: true,
        },
      ],
    };
  }, [entries]);

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: {
      title: { display: true, text: 'Sensor data (time shown in local timezone)' },
      legend: { position: 'top' },
    },
    scales: {
      x: { display: true, title: { display: false } },
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Value' } },
    },
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
