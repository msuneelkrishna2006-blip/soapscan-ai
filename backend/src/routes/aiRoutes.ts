import { Router, Request, Response } from 'express';
import {
  checkOllamaStatus,
  scanSoapPackaging,
  generateMonthlyInsights,
} from '../services/ollamaService';
import { getDatabase } from '../services/dbService';
import { InventoryItem, UsageEvent } from '../types';

export const aiRouter = Router();

// GET /api/ai/status
aiRouter.get('/status', async (_req: Request, res: Response) => {
  const status = await checkOllamaStatus();
  return res.json(status);
});

// POST /api/ai/scan-soap
aiRouter.post('/scan-soap', async (req: Request, res: Response) => {
  const { imageBase64, ocrText, barcode } = req.body;
  const result = await scanSoapPackaging({ imageBase64, ocrText, barcode });
  return res.json(result);
});

// POST /api/ai/monthly-insights
aiRouter.post('/monthly-insights', async (req: Request, res: Response) => {
  const { inventory, usageEvents, currentMonth } = req.body as {
    inventory?: InventoryItem[];
    usageEvents?: UsageEvent[];
    currentMonth?: string;
  };

  const db = getDatabase();
  const inv = inventory || db.inventoryItems;
  const evts = usageEvents || db.usageEvents;
  const month = currentMonth || new Date().toISOString().substring(0, 7);

  const insights = await generateMonthlyInsights(inv, evts, month);
  return res.json({ insights });
});
