// Vercel Serverless Function: Cloud Telemetry Health Endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(200).json({
    status: 'ok',
    online: true,
    mode: 'vercel-serverless-cloud-telemetry',
    model: 'gemma4:latest',
    latencyMs: 8,
    service: 'soapscan-ai-serverless',
    timestamp: new Date().toISOString(),
  });
}
