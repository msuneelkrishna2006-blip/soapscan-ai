// SoapScan AI — Resilient Cloud API Client with Cold-Start Detection & Auto-Retry
import { API_URL, API_BASE_URL } from '../config/api';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onStatusUpdate?: (status: string) => void;
  skipAuth?: boolean;
}

export interface CloudConnectionState {
  isWakingUp: boolean;
  isOnline: boolean;
  lastPingMs: number | null;
  lastChecked: string;
}

let connectionState: CloudConnectionState = {
  isWakingUp: false,
  isOnline: true,
  lastPingMs: null,
  lastChecked: new Date().toISOString(),
};

type ConnectionListener = (state: CloudConnectionState) => void;
const listeners = new Set<ConnectionListener>();

export function subscribeConnectionState(fn: ConnectionListener): () => void {
  listeners.add(fn);
  fn(connectionState);
  return () => {
    listeners.delete(fn);
  };
}

function updateConnectionState(partial: Partial<CloudConnectionState>) {
  connectionState = { ...connectionState, ...partial, lastChecked: new Date().toISOString() };
  listeners.forEach(fn => fn(connectionState));
}

export function getCloudConnectionState(): CloudConnectionState {
  return connectionState;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('soapscan_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('soapscan_token', token);
  } else {
    localStorage.removeItem('soapscan_token');
    localStorage.removeItem('soapscan_local_user');
  }
}

export function getLocalUser(): any | null {
  try {
    const raw = localStorage.getItem('soapscan_local_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalUser(user: any | null): void {
  if (user) {
    localStorage.setItem('soapscan_local_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('soapscan_local_user');
  }
}

/**
 * Resilient apiClient wrapper:
 * - 10000ms default timeout handling with AbortController
 * - Render free-tier cold start detection (>2.5s)
 * - Automatic exponential backoff retries for transient network/cold-start failures
 * - Automatic header injection (token, application/json, credentials)
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = 10000,
    retries = 2,
    retryDelayMs = 1000,
    onStatusUpdate,
    skipAuth = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // Resolve full URL
  let fullUrl: string;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    fullUrl = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // If endpoint starts with /api, use API_BASE_URL to prevent /api/api duplication
    if (cleanEndpoint.startsWith('/api/')) {
      fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    } else {
      fullUrl = `${API_URL}${cleanEndpoint}`;
    }
  }

  const token = getAuthToken();
  const headers = new Headers(customHeaders || {});

  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth && token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }

  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    let isSlowDetected = false;

    // Detect Render cold-start if request takes longer than 2.5s
    const slowTimer = setTimeout(() => {
      isSlowDetected = true;
      updateConnectionState({ isWakingUp: true });
      const statusMsg = 'Connecting to Render cloud backend (waking from standby)...';
      onStatusUpdate?.(statusMsg);
    }, 2500);

    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const startTime = performance.now();

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(slowTimer);
      clearTimeout(timeoutTimer);

      const roundtripMs = Math.round(performance.now() - startTime);
      updateConnectionState({
        isWakingUp: false,
        isOnline: true,
        lastPingMs: roundtripMs,
      });

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {
          const rawText = await response.text().catch(() => '');
          errData = { error: rawText || `HTTP ${response.status} ${response.statusText}` };
        }
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (err: any) {
      clearTimeout(slowTimer);
      clearTimeout(timeoutTimer);

      attempt++;
      const isAbort = err.name === 'AbortError';
      const isNetworkError =
        isAbort ||
        (err.message &&
          (err.message.includes('Failed to fetch') ||
            err.message.includes('NetworkError') ||
            err.message.includes('network') ||
            err.message.includes('timeout') ||
            err.message.includes('502') ||
            err.message.includes('503') ||
            err.message.includes('504')));

      if (attempt <= retries && isNetworkError) {
        updateConnectionState({ isWakingUp: true, isOnline: false });
        const retryMsg = `Render backend waking up (re-attempting telemetry link ${attempt}/${retries})...`;
        onStatusUpdate?.(retryMsg);
        await new Promise(res => setTimeout(res, retryDelayMs * attempt));
        continue;
      }

      if (isNetworkError) {
        updateConnectionState({ isWakingUp: false, isOnline: false });
      }

      throw err;
    }
  }

  throw new Error('Connection timed out. Server may be starting up.');
}
