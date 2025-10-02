# Network Access Configuration

## Application URLs

### Local Access
- **Client (React App):** http://localhost:3000
- **Server API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

### Network Access (LAN)
- **Client (React App):** http://192.168.1.182:3000
- **Server API:** http://192.168.1.182:3001  
- **Health Check:** http://192.168.1.182:3001/health

## Network Configuration Details

### Server Configuration
- Binds to `0.0.0.0:3001` (all network interfaces)
- CORS configured to allow connections from:
  - `http://localhost:3000` (local development)
  - `http://192.168.1.182:3000` (network access)
- Socket.IO configured with same CORS settings

### Client Configuration  
- Binds to `192.168.1.182:3000`
- Environment variables configured in `.env`:
  - `REACT_APP_API_URL=http://192.168.1.182:3001/api`
  - `REACT_APP_SOCKET_URL=http://192.168.1.182:3001`
  - `HOST=192.168.1.182`

## Accessing from Other Devices

### On the Same Network
Other devices on your local network (192.168.1.x) can access the application by navigating to:
**http://192.168.1.182:3000**

### Supported Devices
- ✅ Desktop computers
- ✅ Laptops  
- ✅ Tablets
- ✅ Smartphones
- ✅ Any device with a modern web browser

### Requirements
1. Device must be connected to the same WiFi network/LAN
2. Windows Firewall may need to allow Node.js connections (usually prompted automatically)
3. Modern web browser with JavaScript enabled

## Firewall Notes
If other devices can't connect, you may need to:
1. Allow Node.js through Windows Firewall
2. Check if your router blocks internal communication
3. Ensure ports 3000 and 3001 are not blocked

## Testing Network Access
```bash
# Test server health from another device
curl http://192.168.1.182:3001/health

# Or visit in browser
http://192.168.1.182:3000
```