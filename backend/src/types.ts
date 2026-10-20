export type ProductType = 'soap_bar' | 'liquid_handwash' | 'body_wash' | 'other';
export type Unit = 'g' | 'kg' | 'ml' | 'l';
export type BaseUnit = 'g' | 'ml';
export type ItemStatus = 'active' | 'finished' | 'archived';
export type UsageMethod = 'SCALE' | 'MANUAL' | 'PUMP_ESTIMATE';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  householdName: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  householdName: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AuditEntry {
  timestamp: string;
  action: 'CREATED' | 'EDITED' | 'CORRECTED';
  reason?: string;
  previousValue?: number;
  newValue?: number;
}

export interface InventoryItem {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
}

export interface UsageEvent {
  id: string;
  userId: string;
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
  createdAt: string;
  auditTrail: AuditEntry[];
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  role: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationPrefs {
  id: string;
  userId: string;
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

export interface ResolvedSoapSpec {
  brand: string;
  name: string;
  variant?: string;
  productType: ProductType;
  type?: 'solid' | 'liquid';
  weightGrams?: number;
  volumeMl?: number;
  printedNetQuantity: number;
  printedUnit: Unit;
  priceInr: number;
  estimatedPriceInr?: number;
  colorHex: string;
  shape: 'rectangle' | 'oval' | 'cylinder' | 'round';
  fragrance?: string;
  barcode: string;
  confidence: number;
  source: 'local_registry' | 'barcode_catalog' | 'openbeautyfacts' | 'openfoodfacts' | 'gemma4_vision' | 'gemma4_auto_detect';
  warnings?: string[];
  packagingText?: string;
}

export interface AutoDetectResult {
  detected: boolean;
  confidence: number;
  busy?: boolean;
  latencyMs?: number;
  brand?: string;
  name?: string;
  variant?: string;
  productType?: ProductType;
  type?: 'solid' | 'liquid';
  weightGrams?: number;
  volumeMl?: number;
  printedNetQuantity?: number;
  printedUnit?: Unit;
  priceInr?: number;
  estimatedPriceInr?: number;
  colorHex?: string;
  shape?: 'rectangle' | 'oval' | 'cylinder' | 'round';
  packagingText?: string;
  barcode?: string;
  source?: string;
  warnings?: string[];
}

export interface DatabaseSchema {
  users: User[];
  inventoryItems: InventoryItem[];
  usageEvents: UsageEvent[];
  familyMembers: FamilyMember[];
  notificationPrefs: NotificationPrefs[];
  barcodeCatalog?: Record<string, ResolvedSoapSpec>;
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
  latencyMs?: number;
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

export interface RealtimeSyncPayload {
  type: 'state_update' | 'item_updated' | 'item_deleted' | 'usage_logged' | 'heartbeat';
  userId: string;
  item?: InventoryItem;
  deletedId?: string;
  event?: UsageEvent;
  metrics?: {
    solidSoapUsedGrams: number;
    liquidSoapUsedMl: number;
    activeCount: number;
    monthlySpendInr: number;
    estimatedDaysSupply: number;
  };
  timestamp: string;
}
