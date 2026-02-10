/**
 * Frontend API Server
 * Acts as a bridge between frontend and banking agent
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const BankingAgent = require('../agent/banking-agent');

const PORT = 3002;
const API_KEY = process.env.YB_API_KEY || 'AIzaSyC-nRiKZIbOa8iNoPfkePqiSnE8mAlChiY';

// Set environment variables BEFORE creating agent
process.env.YB_API_KEY = API_KEY;
process.env.API_BASE_URL = 'http://localhost:3001';

// Initialize agent
const agent = new BankingAgent();
agent.apiBaseUrl = 'http://localhost:3001';

// Agent ready
console.log('✅ Agent initialized');

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

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Routes
    if (pathname === '/chat' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const response = await agent.processMessage(data.message);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ...response,
                    state: agent.getState()
                }));
            } catch (error) {
                console.error('Chat error:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Internal server error',
                    error: error.message
                }));
            }
        });
        return;
    }

    if (pathname === '/select-account' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const response = await agent.processMessage(data.accountId);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ...response,
                    state: agent.getState()
                }));
            } catch (error) {
                console.error('Select account error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Internal server error',
                    error: error.message
                }));
            }
        });
        return;
    }

    if (pathname === '/reset' && method === 'POST') {
        agent.reset();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Agent reset successfully' }));
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🌐 Frontend Server running on http://localhost:${PORT}`);
    console.log(`\n📱 Open your browser and navigate to:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n✅ Frontend is ready!\n`);
});

module.exports = server;
