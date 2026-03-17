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

import { parseTimestamp, formatForLabel } from '../time';

function fmtTime(ts) {
  return formatForLabel(ts) || (ts == null ? '' : String(ts));
}

function coerceNumber(v) {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === 'object') {
    // MongoDB extended JSON number formats
    if (v.$numberDouble) return coerceNumber(Number(v.$numberDouble));
    if (v.$numberLong) return coerceNumber(Number(v.$numberLong));
    if (v.$numberInt) return coerceNumber(Number(v.$numberInt));
  }
  return null;
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
    const tempData = ordered.map(e => {
      const raw = e && e.temperature != null ? Number(e.temperature) : null;
      return Number.isFinite(raw) ? Number(raw.toFixed(2)) : null;
    });
    const humData = ordered.map(e => {
      const raw = e && e.humidity != null ? Number(e.humidity) : null;
      return Number.isFinite(raw) ? Number(raw.toFixed(2)) : null;
    });

    const numericCount = tempData.reduce((s, v) => s + (v != null ? 1 : 0), 0) + humData.reduce((s, v) => s + (v != null ? 1 : 0), 0);

    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: 'rgb(255,99,132)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          spanGaps: true,
          pointRadius: 3,
          yAxisID: 'y',
        },
        {
          label: 'Humidity (%)',
          data: humData,
          borderColor: 'rgb(54,162,235)',
          backgroundColor: 'rgba(54,162,235,0.2)',
          spanGaps: true,
          pointRadius: 3,
          yAxisID: 'y1',
        },
      ],
    };
  }, [entries]);

  // If there are no numeric points, show a friendly message instead of a blank chart
  const hasNumeric = useMemo(() => {
    if (!chartData || !chartData.datasets) return false;
    return chartData.datasets.some(ds => Array.isArray(ds.data) && ds.data.some(v => v != null));
  }, [chartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: {
      title: { display: true, text: 'Sensor data (time shown in local timezone)' },
      legend: { position: 'top' },
    },
    scales: {
      x: { display: true, title: { display: false } },
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Temperature (°C)' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Humidity (%)' }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', height: 360 }}>
      {hasNumeric ? (
        <Line data={chartData} options={options} />
      ) : (
        <div style={{ padding: 28, textAlign: 'center', color: '#666' }}>
          No numeric sensor values available to plot.
        </div>
      )}
    </div>
  );
}
