// Lightweight timestamp parsing and formatting helpers used by the frontend
export function parseTimestamp(ts) {
  if (ts == null) return null;
  // If already a Date
  if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;

  // MongoDB extended JSON: { "$date": "2026-..." } or { "$date": { "$numberLong": "..." } }
  if (typeof ts === 'object') {
    if (ts.$date) {
      // $date may be string or object
      if (typeof ts.$date === 'string') return parseTimestamp(ts.$date);
      if (typeof ts.$date === 'object' && ts.$date.$numberLong) return parseTimestamp(Number(ts.$date.$numberLong));
    }
    if (ts.$numberLong) return parseTimestamp(Number(ts.$numberLong));
    return null;
  }

  // Numbers: epoch seconds or ms
  if (typeof ts === 'number') {
    const asMs = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(asMs);
    return isNaN(d.getTime()) ? null : d;
  }

  // Strings: try ISO parse or numeric strings
  if (typeof ts === 'string') {
    const s = ts.trim();
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      return parseTimestamp(n);
    }
    const parsed = Date.parse(s);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }

  return null;
}

function pad(n) { return String(n).padStart(2, '0'); }

// Format for chart labels and latest display: MM:DD  HH:MM (local time)
export function formatForLabel(ts) {
  const d = parseTimestamp(ts);
  if (!d) return '';
  return `${pad(d.getMonth() + 1)}:${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatForDisplay(ts) {
  const d = parseTimestamp(ts);
  if (!d) return (ts == null ? '' : String(ts));
  return d.toLocaleString();
}
