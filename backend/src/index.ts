import express, { Request, Response } from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { inventoryRouter } from './routes/inventoryRoutes.js';
import { realtimeRouter } from './routes/realtimeRoutes.js';
import { OLLAMA_HOST, OLLAMA_MODEL, prewarmOllama } from './services/ollamaService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Production-grade permissive CORS configuration for Vercel, Render, and local frontend
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl, health probes)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment, Render deployment, localhost, or configured origin
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('soapscan') ||
      (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.split(',').includes(origin))
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root health check (prevents cold start 404s and allows Render/uptime pings)
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SoapScan AI Telemetry & Consumption Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Health check (public)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'soapscan-backend', port: PORT, timestamp: new Date().toISOString() });
});

// Dedicated Public Soap Barcode Endpoint
app.get('/api/soaps/barcode/:code', async (req: Request, res: Response) => {
  try {
    const { resolveSoapBarcode } = await import('./services/ollamaService.js');
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
