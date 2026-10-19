import {
  AppState,
  InventoryItem,
  UsageEvent,
  FamilyMember,
  AIStatus,
  AIScanResult,
  AIInsight,
} from '../types/soap';

const BASE_URL = '/api';

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
  const res = await fetch(`${BASE_URL}/ai/scan-soap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Scan request failed with HTTP ${res.status}`);
  }
  return await res.json();
}

export async function getMonthlyInsights(params: {
  inventory: InventoryItem[];
  usageEvents: UsageEvent[];
  currentMonth: string;
}): Promise<AIInsight[]> {
  try {
    const res = await fetch(`${BASE_URL}/ai/monthly-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.insights || [];
  } catch (err) {
    console.warn('Failed to fetch AI insights, returning empty array:', err);
    return [];
  }
}

export async function getAppState(): Promise<AppState> {
  const res = await fetch(`${BASE_URL}/state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function addInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function logUsageEvent(event: Partial<UsageEvent>): Promise<{
  event: UsageEvent;
  updatedProduct: InventoryItem;
}> {
  const res = await fetch(`${BASE_URL}/usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function resetSampleData(action: 'restore' | 'purge'): Promise<AppState> {
  const res = await fetch(`${BASE_URL}/reset-sample-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.state;
}

export async function getSchemaSql(): Promise<string> {
  const res = await fetch(`${BASE_URL}/schema`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

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
    'Sample Data?',
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
      e.isSampleData ? 'YES' : 'NO',
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
