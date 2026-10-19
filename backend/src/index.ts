import express from 'express';
import cors from 'cors';
import { aiRouter } from './routes/aiRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { OLLAMA_HOST, OLLAMA_MODEL } from './services/ollamaService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mount routers
app.use('/api/ai', aiRouter);
app.use('/api', inventoryRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'soapscan-backend', port: PORT });
});

app.listen(PORT, () => {
  console.log(`[SoapScan Backend] Listening on http://localhost:${PORT}`);
  console.log(`[SoapScan Backend] Ollama connected to ${OLLAMA_HOST} (model: ${OLLAMA_MODEL})`);
});
