import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, saveDatabase, initialSampleData } from '../services/dbService';
import { InventoryItem, UsageEvent, FamilyMember } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const inventoryRouter = Router();

// GET /api/state
inventoryRouter.get('/state', (_req: Request, res: Response) => {
  const db = getDatabase();
  return res.json(db);
});

// POST /api/inventory
inventoryRouter.post('/inventory', (req: Request, res: Response) => {
  const db = getDatabase();
  const newItem = req.body as InventoryItem;

  if (!newItem.id) {
    newItem.id = `item-${Date.now()}`;
  }
  newItem.createdAt = newItem.createdAt || new Date().toISOString();
  newItem.updatedAt = new Date().toISOString();
  newItem.status = newItem.status || 'active';

  db.inventoryItems.unshift(newItem);
  saveDatabase(db);
  return res.status(201).json(newItem);
});

// PATCH /api/inventory/:id
inventoryRouter.patch('/inventory/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const updates = req.body as Partial<InventoryItem>;
  const idx = db.inventoryItems.findIndex(i => i.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

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
  return res.json(updated);
});

// DELETE /api/inventory/:id
inventoryRouter.delete('/inventory/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const initialLength = db.inventoryItems.length;
  db.inventoryItems = db.inventoryItems.filter(i => i.id !== id);

  if (db.inventoryItems.length === initialLength) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.usageEvents = db.usageEvents.filter(e => e.productId !== id);
  saveDatabase(db);
  return res.json({ success: true, deletedId: id });
});

// POST /api/usage
inventoryRouter.post('/usage', (req: Request, res: Response) => {
  const db = getDatabase();
  const event = req.body as UsageEvent;

  if (!event.id) {
    event.id = `evt-${Date.now()}`;
  }
  event.createdAt = event.createdAt || new Date().toISOString();

  const product = db.inventoryItems.find(i => i.id === event.productId);
  if (!product) {
    return res.status(404).json({ error: 'Associated inventory product not found' });
  }

  // 15-second duplicate guard
  const recentProductEvents = db.usageEvents.filter(e => e.productId === event.productId);
  if (recentProductEvents.length > 0) {
    const lastEvent = recentProductEvents[0];
    const diffMs = Math.abs(new Date(event.createdAt).getTime() - new Date(lastEvent.createdAt).getTime());
    if (diffMs < 15000) {
      return res.status(409).json({
        error: 'Duplicate event guard: A measurement was already recorded for this product in the last 15 seconds.',
      });
    }
  }

  product.remainingQuantity = event.newQuantity;
  product.updatedAt = new Date().toISOString();

  if (product.remainingQuantity <= 0) {
    product.status = 'finished';
    product.finishedAt = new Date().toISOString();
  }

  event.auditTrail = event.auditTrail || [];
  event.auditTrail.push({
    timestamp: new Date().toISOString(),
    action: 'CREATED',
    newValue: event.newQuantity,
  });

  db.usageEvents.unshift(event);
  saveDatabase(db);

  return res.status(201).json({ event, updatedProduct: product });
});

// POST /api/members
inventoryRouter.post('/members', (req: Request, res: Response) => {
  const db = getDatabase();
  const member = req.body as FamilyMember;
  if (!member.id) {
    member.id = `mem-${Date.now()}`;
  }
  member.createdAt = new Date().toISOString();
  db.familyMembers.push(member);
  saveDatabase(db);
  return res.status(201).json(member);
});

// POST /api/reset-sample-data
inventoryRouter.post('/reset-sample-data', (req: Request, res: Response) => {
  const { action } = req.body as { action: 'restore' | 'purge' };
  let db = getDatabase();

  if (action === 'restore') {
    db = JSON.parse(JSON.stringify(initialSampleData));
  } else {
    db.inventoryItems = db.inventoryItems.filter(i => !i.isSampleData);
    db.usageEvents = db.usageEvents.filter(e => !e.isSampleData);
  }

  saveDatabase(db);
  return res.json({ success: true, state: db });
});

// GET /api/schema
inventoryRouter.get('/schema', (_req: Request, res: Response) => {
  try {
    const schemaPath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      return res.type('text/plain').send(sql);
    }
    return res.status(404).send('-- Schema file not found');
  } catch (err: any) {
    return res.status(500).send(`-- Error reading schema: ${err.message}`);
  }
});
