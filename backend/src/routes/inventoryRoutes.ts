import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getUserState,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  logUsageEvent,
  addFamilyMember,
} from '../services/dbService.js';
import { requireAuth, AuthenticatedRequest } from '../services/authService.js';
import { broadcastToUser } from './realtimeRoutes.js';
import { InventoryItem, UsageEvent, FamilyMember } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const inventoryRouter = Router();

// Apply authentication middleware to all inventory & usage endpoints
inventoryRouter.use(requireAuth);

// GET /api/state - Return current user's isolated state
inventoryRouter.get('/state', (req: AuthenticatedRequest, res: Response) => {
  const state = getUserState(req.userId!);
  return res.json(state);
});

// POST /api/inventory - Add a real soap to the authenticated user's inventory
inventoryRouter.post('/inventory', (req: AuthenticatedRequest, res: Response) => {
  const newItem = addInventoryItem(req.userId!, req.body as Partial<InventoryItem>);

  // Broadcast real-time update to user's clients
  broadcastToUser(req.userId!, 'item_added', {
    item: newItem,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json(newItem);
});

// PATCH /api/inventory/:id - Update real soap
inventoryRouter.patch('/inventory/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const updated = updateInventoryItem(req.userId!, id, req.body as Partial<InventoryItem>);

  if (!updated) {
    return res.status(404).json({ error: 'Soap item not found in your inventory.' });
  }

  broadcastToUser(req.userId!, 'item_updated', {
    item: updated,
    timestamp: new Date().toISOString(),
  });

  return res.json(updated);
});

// DELETE /api/inventory/:id - Delete real soap
inventoryRouter.delete('/inventory/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const success = deleteInventoryItem(req.userId!, id);

  if (!success) {
    return res.status(404).json({ error: 'Soap item not found in your inventory.' });
  }

  broadcastToUser(req.userId!, 'item_deleted', {
    deletedId: id,
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, deletedId: id });
});

// POST /api/usage - Log real weight measurement or pump dispense
inventoryRouter.post('/usage', (req: AuthenticatedRequest, res: Response) => {
  const result = logUsageEvent(req.userId!, req.body as Partial<UsageEvent>);

  if (!result) {
    return res.status(404).json({ error: 'Associated soap product not found in your inventory.' });
  }

  broadcastToUser(req.userId!, 'usage_logged', {
    event: result.event,
    updatedProduct: result.updatedProduct,
    timestamp: new Date().toISOString(),
  });
  broadcastToUser(req.userId!, 'STATE_UPDATED', {
    action: 'usage_logged',
    item: result.updatedProduct,
    event: result.event,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json(result);
});

// POST /api/usage/quick - Instant 1-click micro-dosing (pump, bar_wash, custom_delta, restock)
inventoryRouter.post('/usage/quick', (req: AuthenticatedRequest, res: Response) => {
  const { itemId, action, amount, newQuantity } = req.body as {
    itemId: string;
    action: 'pump' | 'bar_wash' | 'custom_delta' | 'restock';
    amount?: number;
    newQuantity?: number;
  };

  const state = getUserState(req.userId!);
  const product = state.inventoryItems.find(i => i.id === itemId);
  if (!product) {
    return res.status(404).json({ error: 'Soap item not found in your inventory.' });
  }

  let consumed = 0;
  let targetQuantity = product.remainingQuantity;

  if (action === 'pump') {
    consumed = typeof amount === 'number' && amount > 0 ? amount : 1.5;
    targetQuantity = Math.max(0, +(product.remainingQuantity - consumed).toFixed(1));
  } else if (action === 'bar_wash') {
    consumed = typeof amount === 'number' && amount > 0 ? amount : 4.0;
    targetQuantity = Math.max(0, +(product.remainingQuantity - consumed).toFixed(1));
  } else if (action === 'restock') {
    targetQuantity = product.initialQuantity;
    consumed = 0;
  } else if (action === 'custom_delta') {
    if (typeof newQuantity === 'number') {
      targetQuantity = Math.max(0, Math.min(product.initialQuantity, +newQuantity.toFixed(1)));
      consumed = +(product.remainingQuantity - targetQuantity).toFixed(1);
    } else if (typeof amount === 'number') {
      consumed = amount;
      targetQuantity = Math.max(0, +(product.remainingQuantity - amount).toFixed(1));
    }
  }

  if (action === 'restock') {
    const updated = updateInventoryItem(req.userId!, itemId, {
      remainingQuantity: targetQuantity,
      status: 'active',
      finishedAt: undefined,
    });
    if (!updated) {
      return res.status(500).json({ error: 'Failed to restock item' });
    }
    broadcastToUser(req.userId!, 'STATE_UPDATED', {
      type: 'STATE_UPDATED',
      action: 'restock',
      item: updated,
      timestamp: new Date().toISOString(),
    });
    return res.json({ updatedProduct: updated });
  } else {
    const result = logUsageEvent(req.userId!, {
      productId: itemId,
      consumedQuantity: Math.abs(consumed),
      newQuantity: targetQuantity,
      unit: product.unit === 'ml' ? 'ml' : 'g',
      method: action === 'pump' ? 'PUMP_ESTIMATE' : 'SCALE',
      notes: `Quick ${action.replace('_', ' ')}: ${Math.abs(consumed)}${product.unit}`,
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to record usage' });
    }

    broadcastToUser(req.userId!, 'USAGE_LOGGED', {
      type: 'USAGE_LOGGED',
      event: result.event,
      updatedProduct: result.updatedProduct,
      timestamp: new Date().toISOString(),
    });
    broadcastToUser(req.userId!, 'STATE_UPDATED', {
      type: 'STATE_UPDATED',
      action,
      item: result.updatedProduct,
      event: result.event,
      timestamp: new Date().toISOString(),
    });

    return res.json(result);
  }
});

// POST /api/members - Add real family member
inventoryRouter.post('/members', (req: AuthenticatedRequest, res: Response) => {
  const member = addFamilyMember(req.userId!, req.body as Partial<FamilyMember>);
  return res.status(201).json(member);
});

// GET /api/schema - Database schema reference
inventoryRouter.get('/schema', (_req: AuthenticatedRequest, res: Response) => {
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
