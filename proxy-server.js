const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// Enable CORS for iOS Simulator
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy all /api requests to the production backend
app.use('/api', createProxyMiddleware({
  target: 'http://185.193.19.244:8000',
  changeOrigin: true,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url} -> http://185.193.19.244:8000${req.url}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Proxy server running', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔄 Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 iOS Simulator can access via: http://localhost:${PORT}/api`);
  console.log(`🌐 External access via: http://192.168.1.29:${PORT}/api`);
  console.log(`🎯 Proxying to: http://185.193.19.244:8000/api`);
});
