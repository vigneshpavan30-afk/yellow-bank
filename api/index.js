/**
 * Vercel Serverless Function
 * Entry point for Yellow Bank Frontend
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const BankingAgent = require('../agent/banking-agent');

const API_KEY = process.env.YB_API_KEY || 'AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY';
const API_BASE_URL = process.env.API_BASE_URL || 'https://yellow-bank-api.free.beeceptor.com';

// Set environment variables BEFORE creating agent
process.env.YB_API_KEY = API_KEY;
process.env.API_BASE_URL = API_BASE_URL;

// Initialize agent (singleton)
let agent;
if (!agent) {
  agent = new BankingAgent();
  agent.apiBaseUrl = API_BASE_URL;
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

module.exports = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // API Routes
  if ((pathname === '/api/chat' || pathname === '/chat') && method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
      }
      const data = JSON.parse(body);
      const response = await agent.processMessage(data.message);
      
      res.status(200).json({
        ...response,
        state: agent.getState()
      });
    } catch (error) {
      console.error('Chat error:', error.message);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
    return;
  }

  if ((pathname === '/api/select-account' || pathname === '/select-account') && method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
      }
      const data = JSON.parse(body);
      const response = await agent.processMessage(data.accountId);
      
      res.status(200).json({
        ...response,
        state: agent.getState()
      });
    } catch (error) {
      console.error('Select account error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
    return;
  }

  if ((pathname === '/api/reset' || pathname === '/reset') && method === 'POST') {
    agent.reset();
    res.status(200).json({ message: 'Agent reset successfully' });
    return;
  }

  // Serve static files from frontend directory
  let filePath = pathname === '/' || pathname === '' ? '/index.html' : pathname;
  
  // Remove leading slash for path.join
  if (filePath.startsWith('/')) {
    filePath = filePath.substring(1);
  }
  
  // Map root to frontend/index.html
  if (filePath === 'index.html' || filePath === '') {
    filePath = 'frontend/index.html';
  } else if (!filePath.startsWith('frontend/')) {
    filePath = `frontend/${filePath}`;
  }
  
  const fullPath = path.join(process.cwd(), filePath);

  // Security: prevent directory traversal
  const frontendDir = path.join(process.cwd(), 'frontend');
  if (!fullPath.startsWith(frontendDir)) {
    res.status(403).end('Forbidden');
    return;
  }

  try {
    const content = await fs.promises.readFile(fullPath);
    const ext = path.extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.status(200).end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).end('File not found');
    } else {
      res.status(500).end('Server error');
    }
  }
};
