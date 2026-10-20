import { Router, Request, Response } from 'express';
import {
  checkOllamaStatus,
  scanSoapPackaging,
  generateMonthlyInsights,
  resolveSoapBarcode,
  autoDetectSoapFromFrame,
} from '../services/ollamaService';
import { getUserState } from '../services/dbService';
import { requireAuth, AuthenticatedRequest } from '../services/authService';
import { InventoryItem, UsageEvent } from '../types';
import { loadVisualMemory, teachVisualSample } from '../services/visualMemoryService';

export const aiRouter = Router();

// GET /api/ai/status (public health check)
aiRouter.get('/status', async (_req: Request, res: Response) => {
  const status = await checkOllamaStatus();
  return res.json(status);
});

// GET /api/ai/barcode/:code
aiRouter.get('/barcode/:code', async (req: Request, res: Response) => {
  try {
    const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
    const spec = await resolveSoapBarcode(code);
    return res.json(spec);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/ai/barcode-resolve (Tier 1-3 barcode resolution)
aiRouter.post('/barcode-resolve', async (req: Request, res: Response) => {
  const { barcode, frameBase64 } = req.body;
  try {
    const spec = await resolveSoapBarcode(barcode, frameBase64);
    return res.json(spec);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/ai/auto-detect (Continuous Hands-Free Soap & Barcode Auto-Detection)
aiRouter.post('/auto-detect', async (req: Request, res: Response) => {
  const { imageBase64 } = req.body;
  try {
    const result = await autoDetectSoapFromFrame(imageBase64);
    return res.json(result);
  } catch (err: any) {
    return res.json({ detected: false, confidence: 0, error: err.message });
  }
});

// POST /api/ai/scan-soap (packaging multimodal scanner)
aiRouter.post('/scan-soap', async (req: Request, res: Response) => {
  const { imageBase64, ocrText, barcode } = req.body;
  const result = await scanSoapPackaging({ imageBase64, ocrText, barcode });
  return res.json(result);
});

// POST /api/ai/monthly-insights (user-scoped consumption reasoning)
aiRouter.post('/monthly-insights', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { inventory, usageEvents, currentMonth } = req.body as {
    inventory?: InventoryItem[];
    usageEvents?: UsageEvent[];
    currentMonth?: string;
  };

  const userState = getUserState(req.userId!);
  const inv = inventory || userState.inventoryItems;
  const evts = usageEvents || userState.usageEvents;
  const month = currentMonth || new Date().toISOString().substring(0, 7);

  const insights = await generateMonthlyInsights(inv, evts, month);
  return res.json({ insights });
});

// GET /api/ai/visual-memory (inspect active visual memory samples)
aiRouter.get('/visual-memory', (_req: Request, res: Response) => {
  const memory = loadVisualMemory();
  return res.json(memory);
});

// POST /api/ai/teach-sample (1-click train visual memory)
aiRouter.post('/teach-sample', (req: Request, res: Response) => {
  try {
    const sample = teachVisualSample(req.body);
    return res.json({ success: true, sample });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});
