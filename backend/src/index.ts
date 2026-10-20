import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { aiRouter } from './routes/aiRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { realtimeRouter } from './routes/realtimeRoutes';
import { OLLAMA_HOST, OLLAMA_MODEL, prewarmOllama } from './services/ollamaService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'soapscan-backend', port: PORT });
});

// Dedicated Public Soap Barcode Endpoint
app.get('/api/soaps/barcode/:code', async (req, res) => {
  try {
    const { resolveSoapBarcode } = await import('./services/ollamaService');
    const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
    const spec = await resolveSoapBarcode(code);
    return res.json(spec);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api', inventoryRouter);
app.use('/api', realtimeRouter);

app.listen(PORT, () => {
  console.log(`[SoapScan Backend] Listening on http://localhost:${PORT}`);
  console.log(`[SoapScan Backend] Ollama connected to ${OLLAMA_HOST} (model: ${OLLAMA_MODEL})`);
  // Background turbo pre-warm ping on server start (keep_alive: 30m, zero cold start delay)
  prewarmOllama().catch(err => {
    console.warn('[SoapScan Backend] Initial model pre-warm error:', err.message);
  });
});
