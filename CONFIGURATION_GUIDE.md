# Waste Management System - Configuration Guide

## Quick Start

### Option 1: Main Launcher (Recommended)
```bash
launcher.bat
```
This provides a complete graphical menu system for all operations.

### Option 2: Direct Quick Start  
```bash
start.bat
```
This will detect if it's your first time and guide you through setup.

## Configuration Tools

### Main Configuration Tool
```bash
configure-system.bat
```

**Features:**
- **System Configuration**: Organization name, admin settings, units, alerts
- **Network Settings**: Ports, interfaces, CORS, SSL configuration  
- **Database Setup**: Connection strings, backup schedules, storage locations
- **UI Customization**: Themes, colors, logos, chart settings
- **Performance Settings**: Memory limits, cache settings, optimization
- **Backup Configuration**: Automated backup schedules and locations

### System Management

#### Check System Status
```bash
system-status.bat
```
- Verifies all requirements are met
- Checks configuration files
- Tests network connectivity
- Shows current system state

#### Backup System
```bash
backup-system.bat
```
- Creates timestamped backups
- Includes configuration, data, and logs
- Supports compression (if 7-Zip installed)
- Automated backup verification

#### Install as Windows Service
```bash
install-service.bat
```
- Installs system as Windows service
- Enables automatic startup
- Provides service management commands
- Requires administrator privileges

## 📁 Configuration Files

All configuration is stored in the `config/` directory:

- `system.env` - System-wide settings
- `network.env` - Network and security settings  
- `ui.env` - Interface customization
- `database.env` - Database configuration
- `performance.env` - Performance tuning

### Example Configuration

**system.env:**
```env
ORGANIZATION_NAME=Green Corp Recycling
ADMIN_NAME=John Smith
ADMIN_EMAIL=admin@greencorp.com
DEFAULT_UNITS=kg
ALERT_THRESHOLD=60
WASTE_LIMIT=100
DATA_RETENTION=365
```

**network.env:**
```env
SERVER_PORT=3001
CLIENT_PORT=3000
NETWORK_INTERFACE=0.0.0.0
CORS_ORIGINS=*
SSL_ENABLED=false
RATE_LIMIT_MAX=100
```

**ui.env:**
```env
DEFAULT_THEME=light
COLOR_RECYCLED=#3776A9
COLOR_WASTE=#05C793
COLOR_RATE=#087E8B
COLOR_PROCESSED=#3776A9
COLOR_TOTAL=#F8121D
```

## 🌐 Network Configuration

### Port Settings
- **Server Port**: API backend (default: 3001)
- **Client Port**: Web interface (default: 3000)

### Interface Options
1. **Localhost Only** (`127.0.0.1`) - Local access only
2. **All Interfaces** (`0.0.0.0`) - Network accessible  
3. **Specific IP** - Custom network interface

### Security Features
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- SSL/HTTPS support (certificate required)

## UI Customization

### Theme Options
- **Light Theme** - Professional light interface
- **Dark Theme** - Modern dark interface  
- **Auto** - Follows system preference

### Color Customization
Each dashboard card can be customized with hex colors:
- Today's Recycled card
- Non-Recyclable waste card
- Recycling rate card
- Total processed card
- Total waste card

### Branding
- Custom organization name
- Company logo support
- Custom color schemes

## Database Configuration

### Supported Database Types
1. **SQLite** (Default) - File-based, no setup required
2. **PostgreSQL** - Enterprise-grade relational database
3. **MySQL** - Popular open-source database

### Storage Options
- Local file storage
- Network attached storage
- Cloud storage integration

## Backup & Recovery

### Automatic Backups
- Scheduled backups (daily/weekly/monthly)
- Retention policies (30/90/365 days)
- Compression and encryption options

### Manual Backups
```bash
backup-system.bat
```

### Backup Contents
- Configuration files
- Database files
- Log files  
- Custom assets and logos
- User data and reports

## Deployment Options

### Development Mode
```bash
npm run dev
```
- Hot reloading enabled
- Debug information available
- Development tools accessible

### Production Mode  
```bash
npm run build
npm run start
```
- Optimized build
- Production performance
- Error logging only

### Windows Service
```bash
install-service.bat
```
- Runs automatically on startup
- Managed by Windows Service Manager
- Background operation
- Automatic restart on failure

## Troubleshooting

### Common Issues

**"Node.js not found"**
- Install Node.js from https://nodejs.org
- Ensure Node.js is in your system PATH

**"Dependencies missing"**
```bash
npm install
```

**"Port already in use"**
- Check if system is already running
- Use configuration tool to change ports
- Stop conflicting applications

**"Permission denied" (Service installation)**
- Run batch file as administrator
- Ensure Windows Service permissions

### Log Files
- `logs/combined.log` - All system events
- `logs/error.log` - Error messages only
- `logs/access.log` - Network access logs

## 📞 Support

### Configuration Help
Run `system-status.bat` for automated diagnosis.

### Reset to Defaults
Use option [9] in `configure-system.bat` to reset all settings.

### Advanced Configuration
Edit configuration files in `config/` directory manually for advanced settings.

## Security Considerations

### Network Security
- Change default ports for production use
- Enable SSL/HTTPS for secure communication
- Configure firewall rules appropriately
- Use strong authentication if enabled

### Data Security  
- Regular backups to secure locations
- Database encryption (when supported)
- Access logging and monitoring
- Secure configuration file permissions

---

**System Version:** 1.0.0  
**Last Updated:** October 2025  
**Platform:** Windows 10/11 with Node.js