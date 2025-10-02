# Server Shutdown Guide

This guide explains how to safely stop the Waste Dashboard server while preserving all your data.

## ✅ Safe Shutdown Methods

### Method 1: Use the Shutdown Script (Recommended)
**Windows Batch File:**
```bash
# Double-click or run from command line
shutdown-server.bat
```

**PowerShell Script:**
```powershell
# Run from PowerShell
.\shutdown-server.ps1
```

### Method 2: Use NPM Command
```bash
# From the project root directory
npm run shutdown
# or
npm run stop
```

### Method 3: API Endpoint
```bash
# Send shutdown request directly
curl -X POST http://localhost:3001/admin/shutdown
```

### Method 4: Keyboard Shortcut (Terminal)
1. Go to the terminal running `npm run dev`
2. Press `Ctrl + C`
3. The server will shutdown gracefully

### Method 5: Close Terminal
Simply close the terminal window running the development server. The graceful shutdown handlers will preserve your data.

## Data Safety

**All methods preserve your data:**
- ✅ Waste entries are saved
- ✅ User preferences maintained  
- ✅ Dashboard configurations kept
- ✅ Database remains intact

## What Happens During Shutdown

1. **Shutdown signal received**
2. **Active connections closed gracefully**
3. **Database connections properly closed**
4. **All data automatically saved**
5. **Server stops cleanly**

## 🚨 What NOT to Do

❌ **Don't kill the process forcefully** (Task Manager → End Process)
- This may cause data corruption
- Use graceful methods instead

❌ **Don't delete server files while running**
- Stop the server first
- Then modify files if needed

## Restarting the Server

After shutdown, restart with:
```bash
npm run dev
```

Your data will be automatically loaded when the server starts.

## Troubleshooting

### Server Won't Stop
If the server appears stuck:
1. Wait 10 seconds (automatic timeout)
2. Try Ctrl+C again
3. Close terminal as last resort

### Can't Connect to Shutdown Endpoint
- Server may already be stopped ✅
- Check if process is still running
- Use Ctrl+C method instead

### Data Concerns
- All data is stored in `server/database.db`
- This file is preserved during all shutdown methods
- Backup this file if you want extra safety

## Network Access
After shutdown:
- Local access stops: `http://localhost:3000`
- Network access stops: `http://192.168.1.182:3000`
- Restart to restore both local and network access