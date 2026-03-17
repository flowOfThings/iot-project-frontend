import axios from 'axios';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL && process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')) || '';

const client = axios.create({
  baseURL: BACKEND_URL || '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

export function getBackendUrl() {
  return BACKEND_URL || '/';
}

export async function fetchSensors() {
  const resp = await client.get('/api/sensor');
  return resp.data;
}

export async function fetchLatest() {
  const resp = await client.get('/api/sensor/latest');
  return resp.data;
}
