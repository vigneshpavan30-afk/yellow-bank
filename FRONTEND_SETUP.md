# Frontend Setup Guide

## Overview

A beautiful, modern web frontend has been created for the Yellow Bank AI Banking Agent. The frontend provides an interactive chat interface with support for loan account cards and details display.

## Features

✅ **Modern Chat Interface**
- Clean, responsive design
- Real-time message display
- Smooth animations

✅ **Loan Account Cards**
- Interactive card display
- Click to select account
- Beautiful gradient design

✅ **Loan Details Display**
- Organized detail cards
- CSAT survey button
- Professional layout

✅ **User Experience**
- Welcome message
- Quick action buttons
- Loading indicators
- Error handling

## Quick Start

### Step 1: Start All Servers

**Option A: Start individually (3 terminals)**

**Terminal 1 - Mock API Server:**
```powershell
npm start
```

**Terminal 2 - Frontend Server:**
```powershell
npm run frontend
```

**Terminal 3 - (Optional) CLI Test:**
```powershell
npm test
```

**Option B: Start with concurrently (if installed)**
```powershell
npm install -g concurrently
npm run dev:all
```

### Step 2: Open Browser

Navigate to:
```
http://localhost:3002
```

### Step 3: Start Chatting

Try these messages:
- "I want to check my loan details"
- Follow the prompts
- Select a loan account
- View loan details

## Project Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js              # Frontend JavaScript
└── server.js           # Node.js server (serves frontend + API)
```

## Architecture

```
Browser (Frontend)
    ↓
Frontend Server (port 3002)
    ↓
Banking Agent (agent/banking-agent.js)
    ↓
Mock API Server (port 3001)
```

## API Endpoints

### POST /chat
Send a message to the agent.

**Request:**
```json
{
  "message": "I want to check my loan details"
}
```

**Response:**
```json
{
  "message": "To access your loan details...",
  "action": "collect_phone",
  "state": { ... }
}
```

### POST /select-account
Select a loan account.

**Request:**
```json
{
  "accountId": "LA123456"
}
```

**Response:**
```json
{
  "message": "Your Loan Account Details:",
  "details": { ... },
  "state": { ... }
}
```

### POST /reset
Reset the agent state.

## Customization

### Change Colors

Edit `frontend/styles.css`:
```css
:root {
    --primary-color: #FFD700;    /* Change this */
    --secondary-color: #1a1a1a;  /* Change this */
    --accent-color: #4CAF50;      /* Change this */
}
```

### Modify Layout

Edit `frontend/index.html` for structure changes.

### Add Features

Edit `frontend/app.js` to add new functionality.

## Testing

1. **Start all servers:**
   ```powershell
   # Terminal 1
   npm start
   
   # Terminal 2
   npm run frontend
   ```

2. **Open browser:** http://localhost:3002

3. **Test flow:**
   - Type: "I want to check my loan details"
   - Enter phone: 9876543210
   - Enter DOB: 15/01/1990
   - Enter OTP: 1234
   - Click on a loan account card
   - View loan details
   - Click "Rate our chat"

## Troubleshooting

### Port Already in Use
If port 3002 is in use:
- Change PORT in `frontend/server.js`
- Or kill the process: `Get-NetTCPConnection -LocalPort 3002 | Stop-Process`

### CORS Issues
CORS is enabled by default. If you see issues:
- Check server is running
- Verify API endpoints are correct

### Agent Not Responding
- Check mock API server is running (port 3001)
- Check frontend server is running (port 3002)
- Check browser console for errors

## Production Deployment

### Option 1: Static Hosting
1. Build static files
2. Deploy to Netlify, Vercel, or similar
3. Update API URLs to production endpoints

### Option 2: Full Stack
1. Deploy frontend server to cloud
2. Deploy agent to Yellow.ai
3. Deploy APIs to production
4. Update API URLs

## Screenshots

The frontend includes:
- 🎨 Modern gradient design
- 💬 Chat interface
- 🃏 Interactive loan account cards
- 📊 Loan details display
- 🎯 Quick action buttons

## Next Steps

1. ✅ Start servers
2. ✅ Open browser
3. ✅ Test the complete flow
4. ✅ Customize as needed
5. ✅ Deploy to production

---

**Frontend is ready to use!** 🚀

Open http://localhost:3002 in your browser after starting the servers.
