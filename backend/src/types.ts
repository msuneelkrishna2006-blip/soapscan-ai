export type ProductType = 'soap_bar' | 'liquid_handwash' | 'body_wash' | 'other';
export type Unit = 'g' | 'kg' | 'ml' | 'l';
export type BaseUnit = 'g' | 'ml';
export type ItemStatus = 'active' | 'finished' | 'archived';
export type UsageMethod = 'SCALE' | 'MANUAL' | 'PUMP_ESTIMATE' | 'SAMPLE';

export interface AuditEntry {
  timestamp: string;
  action: 'CREATED' | 'EDITED' | 'CORRECTED';
  reason?: string;
  previousValue?: number;
  newValue?: number;
}

export interface InventoryItem {
  id: string;
  brand: string;
  name: string;
  variant?: string;
  productType: ProductType;
  initialQuantity: number;
  remainingQuantity: number;
  unit: Unit;
  tareWeightG: number;
  costInr: number;
  location: string;
  assignedMemberId?: string;
  barcode?: string;
  imageUrl?: string;
  status: ItemStatus;
  isSampleData: boolean;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
}

export interface UsageEvent {
  id: string;
  productId: string;
  memberId?: string;
  consumedQuantity: number;
  unit: BaseUnit;
  previousQuantity: number;
  newQuantity: number;
  method: UsageMethod;
  scaleReading?: number;
  tareWeight?: number;
  pumpCount?: number;
  mlPerPump?: number;
  notes?: string;
  isSampleData: boolean;
  createdAt: string;
  auditTrail: AuditEntry[];
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationPrefs {
  id: string;
  lowStockThresholdPercent: number;
  depletionWarningDays: number;
  staleMeasurementAlertDays: number;
  browserNotificationsEnabled: boolean;
  updatedAt: string;
}

export interface AppState {
  inventoryItems: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  notificationPrefs: NotificationPrefs;
}

export interface AIStatus {
  online: boolean;
  model: string;
  endpoint: string;
  visionCapable?: boolean;
  hasRequiredModel?: boolean;
  error?: string;
}

export interface AIScanResult {
  brand: string;
  name: string;
  variant?: string;
  productType: ProductType;
  printedNetQuantity: number;
  printedUnit: Unit;
  confidence: number;
  warnings: string[];
  source?: 'barcode_dictionary' | 'openbeautyfacts' | 'gemma4_vision' | 'gemma4_text_fallback' | 'user_manual';
  rawBarcode?: string;
}

export interface AIInsight {
  id: string;
  category: 'efficiency' | 'pacing' | 'depletion' | 'financial';
  title: string;
  message: string;
  metric?: string;
  recommendation?: string;
  confidence: number;
}
