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

function fmtTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch (e) {
    return String(ts);
  }
}

export default function SensorChart({ entries }) {
  const chartData = useMemo(() => {
    const labels = entries.map(e => fmtTime(e.timestamp));
    const tempData = entries.map(e => (typeof e.temperature === 'number' ? Number(e.temperature.toFixed(2)) : null));
    const humData = entries.map(e => (typeof e.humidity === 'number' ? Number(e.humidity.toFixed(2)) : null));

    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: 'rgb(255,99,132)',
          backgroundColor: 'rgba(255,99,132,0.2)',
          yAxisID: 'y',
          spanGaps: true,
        },
        {
          label: 'Humidity (%)',
          data: humData,
          borderColor: 'rgb(54,162,235)',
          backgroundColor: 'rgba(54,162,235,0.2)',
          yAxisID: 'y1',
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
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Temperature (°C)' } },
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Humidity (%)' }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
