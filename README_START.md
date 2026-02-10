# Quick Start Guide

## 🚀 Easiest Way to Start

### Option 1: Double-Click Script (Windows)

**Simply double-click:**
- `start-servers.bat` (for Command Prompt)
- OR `start-servers.ps1` (for PowerShell - right-click → Run with PowerShell)

This will:
- ✅ Check if Node.js is installed
- ✅ Clear any ports in use
- ✅ Start Mock API Server (Port 3001)
- ✅ Start Frontend Server (Port 3002)
- ✅ Open browser automatically

### Option 2: Manual Start

**Terminal 1:**
```powershell
npm start
```

**Terminal 2:**
```powershell
npm run frontend
```

**Then open:** http://localhost:3002

## 📋 Prerequisites

- Node.js installed (https://nodejs.org/)
- npm installed (comes with Node.js)

## 🧪 Test the Agent

Once the browser opens:
1. Type: "I want to check my loan details"
2. Enter phone: `9876543210`
3. Enter DOB: `15/01/1990`
4. Enter OTP: `1234` (shown in test mode)
5. Click on a loan account card
6. View loan details

## 🛑 Stop Servers

Simply close the two PowerShell/Command Prompt windows.

## ❓ Troubleshooting

**Port already in use:**
- The script will automatically clear ports
- Or manually: Close any running Node.js processes

**Node.js not found:**
- Install from: https://nodejs.org/
- Restart your terminal after installation

**Servers not starting:**
- Check if ports 3001 and 3002 are free
- Make sure you're in the project directory
- Run `npm install` if you haven't already

---

**That's it! Just double-click `start-servers.bat` and you're ready to go!** 🎉
