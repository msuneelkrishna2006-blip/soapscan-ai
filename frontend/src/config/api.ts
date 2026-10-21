// SoapScan AI — Production & Local API Configuration
const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

export const IS_LOCAL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

export const API_BASE_URL = (
  envUrl ||
  (IS_LOCAL ? 'http://localhost:3001' : 'https://soapscan-ai.onrender.com')
).replace(/\/+$/, '');

// Clean /api root URL without double slashes
export const API_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

// Dedicated SSE real-time stream endpoint
export const SSE_STREAM_URL = `${API_URL}/realtime/stream`;
