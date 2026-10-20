// SoapScan AI — Production & Local API Configuration
export const API_BASE_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://soapscan-ai.onrender.com'
).replace(/\/+$/, '');

// Clean /api root URL without double slashes
export const API_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

// Dedicated SSE real-time stream endpoint
export const SSE_STREAM_URL = `${API_URL}/realtime/stream`;
