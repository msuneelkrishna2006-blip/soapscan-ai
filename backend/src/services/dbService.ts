import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DatabaseSchema,
  User,
  InventoryItem,
  UsageEvent,
  FamilyMember,
  NotificationPrefs,
  AppState,
  ResolvedSoapSpec,
} from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initialize clean database state with ZERO fake soaps
function getCleanDatabase(): DatabaseSchema {
  return {
    users: [],
    inventoryItems: [],
    usageEvents: [],
    familyMembers: [],
    notificationPrefs: [],
  };
}

let currentDb: DatabaseSchema | null = null;

export function loadDatabase(): DatabaseSchema {
  if (currentDb) return currentDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.users) && Array.isArray(parsed.inventoryItems)) {
        currentDb = parsed;
        return currentDb!;
      }
    } catch (err) {
      console.error('[dbService] Error parsing existing db.json, creating clean schema:', err);
    }
  }

  // Create clean initial database
  currentDb = getCleanDatabase();
  saveDatabase(currentDb);
  return currentDb;
}

export function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    currentDb = db;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[dbService] Error writing to db.json:', err);
  }
}

// User CRUD
export function findUserByEmail(email: string): User | undefined {
  const db = loadDatabase();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
}

export function findUserById(id: string): User | undefined {
  const db = loadDatabase();
  return db.users.find(u => u.id === id);
}

// Apple Interactive Quick-Start Soap Dock Provisioner
export function provisionAppleQuickStartDock(userId: string): InventoryItem[] {
  const db = loadDatabase();
  const existing = db.inventoryItems.filter(i => i.userId === userId);
  if (existing.length > 0) return existing;

  const now = Date.now();
  const dayMs = 86400000;

  const quickStartItems: InventoryItem[] = [
    {
      id: `soap-dettol-${userId.slice(-6)}`,
      userId,
      brand: 'Dettol',
      name: 'Original Antiseptic Bar',
      variant: 'Pine Classic Formula',
      productType: 'soap_bar',
      initialQuantity: 125,
      remainingQuantity: 94.5,
      unit: 'g',
      tareWeightG: 0,
      costInr: 58,
      location: 'Master Bathroom',
      barcode: '8901396312502',
      status: 'active',
      createdAt: new Date(now - 7 * dayMs).toISOString(),
      updatedAt: new Date(now - 1 * dayMs).toISOString(),
    },
    {
      id: `soap-dove-${userId.slice(-6)}`,
      userId,
      brand: 'Dove',
      name: 'Beauty Cream Bar',
      variant: '1/4 Moisturising Cream',
      productType: 'soap_bar',
      initialQuantity: 100,
      remainingQuantity: 76.0,
      unit: 'g',
      tareWeightG: 0,
      costInr: 65,
      location: 'Guest Washroom',
      barcode: '8901030383451',
      status: 'active',
      createdAt: new Date(now - 6 * dayMs).toISOString(),
      updatedAt: new Date(now - 2 * dayMs).toISOString(),
    },
    {
      id: `soap-lifebuoy-${userId.slice(-6)}`,
      userId,
      brand: 'Lifebuoy',
      name: 'Total Germ Protection Pump',
      variant: 'Silver Shield Handwash',
      productType: 'liquid_handwash',
      initialQuantity: 200,
      remainingQuantity: 144.0,
      unit: 'ml',
      tareWeightG: 22,
      costInr: 99,
      location: 'Kitchen Sink',
      barcode: '8901030000000',
      status: 'active',
      createdAt: new Date(now - 5 * dayMs).toISOString(),
      updatedAt: new Date(now - 1 * dayMs).toISOString(),
    },
  ];

  db.inventoryItems.push(...quickStartItems);

  // Seed realistic starter telemetry for the last 5 days
  const starterEvents: UsageEvent[] = [
    {
      id: `evt-d1-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[0].id,
      consumedQuantity: 3.2,
      unit: 'g',
      previousQuantity: 101.0,
      newQuantity: 97.8,
      method: 'MANUAL',
      notes: 'Morning shower',
      createdAt: new Date(now - 3 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 3 * dayMs).toISOString(), action: 'CREATED', newValue: 97.8 }],
    },
    {
      id: `evt-d2-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[0].id,
      consumedQuantity: 3.3,
      unit: 'g',
      previousQuantity: 97.8,
      newQuantity: 94.5,
      method: 'MANUAL',
      notes: 'Evening bath',
      createdAt: new Date(now - 1 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 1 * dayMs).toISOString(), action: 'CREATED', newValue: 94.5 }],
    },
    {
      id: `evt-v1-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[1].id,
      consumedQuantity: 2.8,
      unit: 'g',
      previousQuantity: 82.0,
      newQuantity: 79.2,
      method: 'MANUAL',
      notes: 'Hand & face wash',
      createdAt: new Date(now - 4 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 4 * dayMs).toISOString(), action: 'CREATED', newValue: 79.2 }],
    },
    {
      id: `evt-v2-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[1].id,
      consumedQuantity: 3.2,
      unit: 'g',
      previousQuantity: 79.2,
      newQuantity: 76.0,
      method: 'MANUAL',
      notes: 'Gentle moisturising cleanse',
      createdAt: new Date(now - 2 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 2 * dayMs).toISOString(), action: 'CREATED', newValue: 76.0 }],
    },
    {
      id: `evt-l1-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[2].id,
      consumedQuantity: 3.6,
      unit: 'ml',
      previousQuantity: 154.8,
      newQuantity: 151.2,
      method: 'PUMP_ESTIMATE',
      pumpCount: 2,
      mlPerPump: 1.8,
      notes: 'Kitchen meal prep hygiene',
      createdAt: new Date(now - 2 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 2 * dayMs).toISOString(), action: 'CREATED', newValue: 151.2 }],
    },
    {
      id: `evt-l2-${userId.slice(-6)}`,
      userId,
      productId: quickStartItems[2].id,
      consumedQuantity: 7.2,
      unit: 'ml',
      previousQuantity: 151.2,
      newQuantity: 144.0,
      method: 'PUMP_ESTIMATE',
      pumpCount: 4,
      mlPerPump: 1.8,
      notes: 'Family hand hygiene cycle',
      createdAt: new Date(now - 1 * dayMs).toISOString(),
      auditTrail: [{ timestamp: new Date(now - 1 * dayMs).toISOString(), action: 'CREATED', newValue: 144.0 }],
    },
  ];

  db.usageEvents.push(...starterEvents);
  saveDatabase(db);
  console.log(`[dbService] 🍏 Provisioned Apple Quick-Start Soap Dock + Telemetry for user ${userId}`);
  return quickStartItems;
}

export function createUser(user: User): User {
  const db = loadDatabase();
  db.users.push(user);

  // Initialize user's primary family member (the user themselves)
  const defaultMember: FamilyMember = {
    id: `mem-${user.id}-1`,
    userId: user.id,
    name: user.name,
    avatar: '✨',
    role: 'Admin',
    notes: `${user.householdName} Primary Account Holder`,
    createdAt: new Date().toISOString(),
  };
  db.familyMembers.push(defaultMember);

  // Initialize user's notification preferences
  const defaultPrefs: NotificationPrefs = {
    id: `pref-${user.id}`,
    userId: user.id,
    lowStockThresholdPercent: 20,
    depletionWarningDays: 5,
    staleMeasurementAlertDays: 7,
    browserNotificationsEnabled: true,
    updatedAt: new Date().toISOString(),
  };
  db.notificationPrefs.push(defaultPrefs);

  saveDatabase(db);

  // Provision Apple Quick-Start Soap Dock
  provisionAppleQuickStartDock(user.id);

  return user;
}

// Per-User Scoped State Queries
export function getUserState(userId: string): AppState {
  const db = loadDatabase();
  let inventoryItems = db.inventoryItems.filter(i => i.userId === userId);
  
  // If user has zero active soaps, auto-provision Apple Quick-Start Soap Dock
  if (inventoryItems.length === 0) {
    inventoryItems = provisionAppleQuickStartDock(userId);
  }

  const usageEvents = db.usageEvents.filter(e => e.userId === userId);
  const familyMembers = db.familyMembers.filter(m => m.userId === userId);
  const userPrefs =
    db.notificationPrefs.find(p => p.userId === userId) || {
      id: `pref-${userId}`,
      userId,
      lowStockThresholdPercent: 20,
      depletionWarningDays: 5,
      staleMeasurementAlertDays: 7,
      browserNotificationsEnabled: true,
      updatedAt: new Date().toISOString(),
    };

  return {
    inventoryItems,
    usageEvents,
    familyMembers,
    notificationPrefs: userPrefs,
  };
}

// Per-User Inventory Actions
export function addInventoryItem(userId: string, item: Partial<InventoryItem>): InventoryItem {
  const db = loadDatabase();
  const newItem: InventoryItem = {
    id: item.id || `soap-${Date.now()}`,
    userId,
    brand: item.brand || 'Unbranded',
    name: item.name || 'Soap',
    variant: item.variant || '',
    productType: item.productType || 'soap_bar',
    initialQuantity: item.initialQuantity || 100,
    remainingQuantity:
      typeof item.remainingQuantity === 'number' ? item.remainingQuantity : item.initialQuantity || 100,
    unit: item.unit || 'g',
    tareWeightG: item.tareWeightG || 0,
    costInr: item.costInr || 0,
    location: item.location || 'Bathroom',
    assignedMemberId: item.assignedMemberId,
    barcode: item.barcode,
    imageUrl: item.imageUrl,
    status: item.status || 'active',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.inventoryItems.unshift(newItem);
  saveDatabase(db);
  return newItem;
}

export function updateInventoryItem(
  userId: string,
  itemId: string,
  updates: Partial<InventoryItem>
): InventoryItem | null {
  const db = loadDatabase();
  const idx = db.inventoryItems.findIndex(i => i.id === itemId && i.userId === userId);
  if (idx === -1) return null;

  const existing = db.inventoryItems[idx];
  const updated: InventoryItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updated.remainingQuantity <= 0 && updated.status !== 'finished') {
    updated.status = 'finished';
    updated.finishedAt = new Date().toISOString();
  } else if (updated.remainingQuantity > 0 && updated.status === 'finished') {
    updated.status = 'active';
    updated.finishedAt = undefined;
  }

  db.inventoryItems[idx] = updated;
  saveDatabase(db);
  return updated;
}

export function deleteInventoryItem(userId: string, itemId: string): boolean {
  const db = loadDatabase();
  const initialCount = db.inventoryItems.length;
  db.inventoryItems = db.inventoryItems.filter(i => !(i.id === itemId && i.userId === userId));

  if (db.inventoryItems.length === initialCount) return false;

  // Cascade delete associated usage events
  db.usageEvents = db.usageEvents.filter(e => !(e.productId === itemId && e.userId === userId));
  saveDatabase(db);
  return true;
}

// Per-User Usage Event Logging
export function logUsageEvent(
  userId: string,
  event: Partial<UsageEvent>
): { event: UsageEvent; updatedProduct: InventoryItem } | null {
  const db = loadDatabase();
  const product = db.inventoryItems.find(i => i.id === event.productId && i.userId === userId);
  if (!product) return null;

  const newEvent: UsageEvent = {
    id: event.id || `evt-${Date.now()}`,
    userId,
    productId: product.id,
    memberId: event.memberId || product.assignedMemberId,
    consumedQuantity: event.consumedQuantity || 0,
    unit: event.unit || (product.unit === 'ml' ? 'ml' : 'g'),
    previousQuantity: product.remainingQuantity,
    newQuantity:
      typeof event.newQuantity === 'number'
        ? event.newQuantity
        : Math.max(0, +(product.remainingQuantity - (event.consumedQuantity || 0)).toFixed(1)),
    method: event.method || 'MANUAL',
    scaleReading: event.scaleReading,
    tareWeight: event.tareWeight || product.tareWeightG,
    pumpCount: event.pumpCount,
    mlPerPump: event.mlPerPump,
    notes: event.notes,
    createdAt: event.createdAt || new Date().toISOString(),
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'CREATED',
        newValue: typeof event.newQuantity === 'number' ? event.newQuantity : 0,
      },
    ],
  };

  // Update product remaining quantity
  product.remainingQuantity = newEvent.newQuantity;
  product.updatedAt = new Date().toISOString();
  if (product.remainingQuantity <= 0) {
    product.status = 'finished';
    product.finishedAt = new Date().toISOString();
  }

  db.usageEvents.unshift(newEvent);
  saveDatabase(db);
  return { event: newEvent, updatedProduct: product };
}

// Per-User Family Members
export function addFamilyMember(userId: string, member: Partial<FamilyMember>): FamilyMember {
  const db = loadDatabase();
  const newMember: FamilyMember = {
    id: member.id || `mem-${userId}-${Date.now()}`,
    userId,
    name: member.name || 'Household Member',
    avatar: member.avatar || '👤',
    role: member.role || 'Member',
    notes: member.notes,
    createdAt: new Date().toISOString(),
  };

  db.familyMembers.push(newMember);
  saveDatabase(db);
  return newMember;
}

// Global Barcode Catalog Cache (<10ms resolution)
export function getBarcodeCatalogItem(barcode: string): ResolvedSoapSpec | null {
  const db = loadDatabase();
  if (!db.barcodeCatalog) return null;
  return db.barcodeCatalog[barcode.trim()] || null;
}

export function saveBarcodeCatalogItem(spec: ResolvedSoapSpec): void {
  const db = loadDatabase();
  if (!db.barcodeCatalog) {
    db.barcodeCatalog = {};
  }
  db.barcodeCatalog[spec.barcode.trim()] = {
    ...spec,
    source: 'barcode_catalog',
  };
  saveDatabase(db);
}

