import {
  AppState,
  InventoryItem,
  UsageEvent,
  FamilyMember,
  AIStatus,
  AIScanResult,
  AIInsight,
  UserProfile,
  AuthResponse,
  ResolvedSoapSpec,
  AutoDetectResult,
} from '../types/soap';

const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('soapscan_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('soapscan_token', token);
  } else {
    localStorage.removeItem('soapscan_token');
  }
}

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication API calls
export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  householdName?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed.');
  }

  setAuthToken(data.token);
  return data;
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed.');
  }

  setAuthToken(data.token);
  return data;
}

export async function demoLogin(): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Instant Commander Login failed.');
  }

  setAuthToken(data.token);
  return data;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      setAuthToken(null);
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } finally {
    setAuthToken(null);
  }
}

// AI API calls
export async function getAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch(`${BASE_URL}/ai/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      online: false,
      model: 'gemma4:latest',
      endpoint: 'http://localhost:11434',
      error: err.message,
    };
  }
}

export async function scanSoapAI(params: {
  imageBase64?: string;
  ocrText?: string;
  barcode?: string;
}): Promise<AIScanResult> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${BASE_URL}/ai/scan-soap`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`Scan request failed with HTTP ${res.status}`);
    }
    const data: AIScanResult = await res.json();
    data.latencyMs = Math.round(performance.now() - startTime);
    return data;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function resolveSoapBarcode(
  code: string,
  frameBase64?: string
): Promise<ResolvedSoapSpec> {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BASE_URL}/ai/barcode-resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ barcode: code, frameBase64 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const spec: ResolvedSoapSpec = await res.json();
      return spec;
    }
  } catch {}

  // Fallback to direct GET endpoint
  const directRes = await fetch(`${BASE_URL}/soaps/barcode/${encodeURIComponent(code)}`);
  if (!directRes.ok) {
    throw new Error(`Barcode lookup returned HTTP ${directRes.status}`);
  }
  return await directRes.json();
}

export async function autoDetectSoapAI(
  imageBase64: string,
  signal?: AbortSignal
): Promise<AutoDetectResult> {
  const startTime = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/ai/auto-detect`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ imageBase64 }),
      signal,
    });
    if (!res.ok) {
      return { detected: false, confidence: 0 };
    }
    const data: AutoDetectResult = await res.json();
    data.latencyMs = Math.round(performance.now() - startTime);
    return data;
  } catch {
    return { detected: false, confidence: 0 };
  }
}

export async function getMonthlyInsights(params: {
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  currentMonth: string;
}): Promise<AIInsight[]> {
  try {
    const res = await fetch(`${BASE_URL}/ai/monthly-insights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.insights || [];
  } catch (err) {
    console.warn('Failed to fetch AI insights:', err);
    return [];
  }
}

// User-Scoped Database State
export async function getAppState(): Promise<AppState> {
  const res = await fetch(`${BASE_URL}/state`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function addInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> {
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function logUsageEvent(event: Partial<UsageEvent>): Promise<{
  event: UsageEvent;
  updatedProduct: InventoryItem;
}> {
  const res = await fetch(`${BASE_URL}/usage`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function addFamilyMember(member: Partial<FamilyMember>): Promise<FamilyMember> {
  const res = await fetch(`${BASE_URL}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function getSchemaSql(): Promise<string> {
  const res = await fetch(`${BASE_URL}/schema`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// Export CSV of Real Data
export function exportUsageEventsToCSV(
  events: UsageEvent[],
  inventory: InventoryItem[],
  members: FamilyMember[]
) {
  const headers = [
    'Date & Time',
    'Product Brand',
    'Product Name',
    'Consumed Quantity',
    'Unit',
    'Previous Remaining',
    'New Remaining',
    'Tracking Method',
    'Logged By / Bathroom',
    'Scale Reading (g)',
    'Tare Weight (g)',
    'Pumps Logged',
  ];

  const rows = events.map(e => {
    const prod = inventory.find(i => i.id === e.productId);
    const mem = members.find(m => m.id === e.memberId);
    return [
      `"${new Date(e.createdAt).toLocaleString()}"`,
      `"${prod?.brand || 'Unknown'}"`,
      `"${prod?.name || 'Soap'}"`,
      e.consumedQuantity,
      e.unit,
      e.previousQuantity,
      e.newQuantity,
      e.method,
      `"${mem?.name || prod?.location || 'General'}"`,
      e.scaleReading ?? '',
      e.tareWeight ?? '',
      e.pumpCount ?? '',
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `soapscan-usage-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function quickUsageAction(params: {
  itemId: string;
  action: 'pump' | 'bar_wash' | 'custom_delta' | 'restock';
  amount?: number;
  newQuantity?: number;
}): Promise<{ event?: UsageEvent; updatedProduct: InventoryItem }> {
  const res = await fetch(`${BASE_URL}/usage/quick`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

// Authenticated Real-Time Server-Sent Events Subscriber
export function subscribeRealtimeStream(callbacks: {
  onItemAdded?: (item: InventoryItem) => void;
  onItemUpdated?: (item: InventoryItem) => void;
  onItemDeleted?: (deletedId: string) => void;
  onUsageLogged?: (data: { event: UsageEvent; updatedProduct: InventoryItem }) => void;
  onStateUpdated?: (data: any) => void;
  onHeartbeat?: (data: { latencyMs: number; ollamaStatus: string; timestamp: string }) => void;
  onConnect?: (data: any) => void;
}) {
  const token = getAuthToken();
  if (!token) return () => {};

  const eventSource = new EventSource(`${BASE_URL}/realtime/stream?token=${encodeURIComponent(token)}`);

  eventSource.addEventListener('connected', e => {
    try {
      callbacks.onConnect?.(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener('AI_HEARTBEAT', e => {
    try {
      callbacks.onHeartbeat?.(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener('STATE_UPDATED', e => {
    try {
      const data = JSON.parse(e.data);
      callbacks.onStateUpdated?.(data);
      if (data.item) callbacks.onItemUpdated?.(data.item);
    } catch {}
  });

  eventSource.addEventListener('item_added', e => {
    try {
      const data = JSON.parse(e.data);
      if (data.item) callbacks.onItemAdded?.(data.item);
    } catch {}
  });

  eventSource.addEventListener('item_updated', e => {
    try {
      const data = JSON.parse(e.data);
      if (data.item) callbacks.onItemUpdated?.(data.item);
    } catch {}
  });

  eventSource.addEventListener('item_deleted', e => {
    try {
      const data = JSON.parse(e.data);
      if (data.deletedId) callbacks.onItemDeleted?.(data.deletedId);
    } catch {}
  });

  eventSource.addEventListener('usage_logged', e => {
    try {
      callbacks.onUsageLogged?.(JSON.parse(e.data));
    } catch {}
  });

  eventSource.addEventListener('USAGE_LOGGED', e => {
    try {
      callbacks.onUsageLogged?.(JSON.parse(e.data));
    } catch {}
  });

  // Generic message handler fallback
  eventSource.onmessage = e => {
    try {
      const parsed = JSON.parse(e.data);
      if (parsed.type === 'AI_HEARTBEAT') {
        callbacks.onHeartbeat?.(parsed);
      } else if (parsed.type === 'STATE_UPDATED') {
        callbacks.onStateUpdated?.(parsed);
        if (parsed.item) callbacks.onItemUpdated?.(parsed.item);
      } else if (parsed.type === 'USAGE_LOGGED') {
        callbacks.onUsageLogged?.(parsed);
      }
    } catch {}
  };

  return () => {
    eventSource.close();
  };
}

export async function teachVisualSampleAI(sample: {
  brand: string;
  name: string;
  variant?: string;
  productType?: 'soap_bar' | 'liquid_handwash' | 'body_wash';
  netQuantity?: number;
  unit?: 'g' | 'ml';
  colorHex?: string;
  priceInr?: number;
  dominantRgb?: [number, number, number];
  fingerprint16x16?: string;
  keyVisualCues?: string[];
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/ai/teach-sample`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(sample),
  });
  if (!res.ok) throw new Error(`Failed to teach visual sample: HTTP ${res.status}`);
  return await res.json();
}

export async function getVisualMemoryAI(): Promise<any> {
  const res = await fetch(`${BASE_URL}/ai/visual-memory`);
  if (!res.ok) throw new Error(`Failed to load visual memory: HTTP ${res.status}`);
  return await res.json();
}
