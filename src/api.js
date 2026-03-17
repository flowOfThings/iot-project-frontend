import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

export async function fetchSensors() {
  const resp = await client.get('/api/sensor');
  return resp.data;
}

export async function fetchLatest() {
  const resp = await client.get('/api/sensor/latest');
  return resp.data;
}
