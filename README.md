# 🗂️ Waste Management System

A comprehensive waste tracking and recycling management system with real-time monitoring, analytics, and reporting capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-4.9.5-blue.svg)

## ✨ Features

### 📊 **Core Functionality**
- **Real-time Waste Tracking** - Log and categorize waste entries instantly
- **Recycling Rate Monitoring** - Track recycling performance and goals
- **Category-based Sorting** - Support for 11 different waste categories
- **Historical Trend Analysis** - Comprehensive data visualization over time
- **Interactive Dashboard** - Multiple dashboard views (Standard & SCADA)

### 🎯 **Smart Analytics**
- **Automated Alerts** - Notifications for recycling goals and milestones
- **Weight Conversion** - Seamless kg ↔ lb unit conversion
- **Time Range Filtering** - View data by day, 3-day, or weekly periods
- **Category Breakdown** - Detailed pie charts for waste composition
- **Progress Tracking** - Visual progress indicators and trend analysis

### 🌐 **Technical Features**
- **LAN Access** - Network-accessible for multi-user environments
- **Data Persistence** - Local storage with backup capabilities
- **Theme Support** - Light/dark mode toggle
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Live data synchronization across components

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.0.0 or higher
- **npm** (comes with Node.js)
- **Windows 10/11** (for batch scripts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/waste-management-system.git
   cd waste-management-system
   ```

2. **Quick Start** (Recommended)
   ```bash
   # Run the main launcher
   launcher.bat
   
   # Or start directly
   start-system.bat
   ```

3. **Manual Installation**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies  
   cd ../client
   npm install
   ```

### 🖥️ Usage

The system runs on:
- **Client**: http://localhost:3003
- **Server API**: http://localhost:3004/api
- **LAN Access**: http://[your-ip]:3003 (if firewall allows)

#### Available Commands
- `launcher.bat` - Interactive menu system
- `start-system.bat` - Direct system startup
- `stop-all.bat` - Complete shutdown
- `system-status.bat` - Check system status

## 📁 Project Structure

```
waste-management-system/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services and data management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Server utilities
│   └── logs/               # Application logs
├── config/                 # Configuration files
├── *.bat                   # Windows batch scripts
└── *.md                    # Documentation files
```

## 🎮 User Guide

### Adding Waste Entries
1. Use the **Waste Entry Form** on the dashboard
2. Select category (PET, HDPE, Glass, Aluminum, etc.)
3. Enter weight in kg or lb
4. Add optional notes
5. Submit to see real-time updates

### Monitoring Progress
- **Dashboard Cards** show today's totals and recycling rates
- **Charts** display historical trends and category breakdowns
- **Time Range Selector** filters data by period
- **Progress Indicators** show recycling goals and achievements

### Data Management
- **Entry Lists** show recent activities with edit/delete options
- **Backup System** preserves data integrity
- **Export Options** for data analysis
- **Settings Panel** for customization

## 🛠️ Development

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI, MUI X-Charts
- **Backend**: Node.js, Express, TypeScript
- **Storage**: Local storage with file-based persistence
- **Build Tools**: React Scripts, TypeScript Compiler
- **Process Management**: Windows batch scripts

### Key Components
- **Dashboard.tsx** - Main analytics dashboard
- **SCADADashboard.tsx** - Industrial-style monitoring view  
- **WasteEntryForm.tsx** - Data input interface
- **DataManager.ts** - Core data management service
- **ThemeContext.tsx** - Theme and settings management

### Development Commands
```bash
# Start development servers
cd server && npm run dev     # Server with hot reload
cd client && npm start       # Client development server

# Build for production
cd server && npm run build   # Compile TypeScript
cd client && npm run build   # Create production build
```

## 🌟 Recent Updates

- **Recycling Focus**: Dashboard now highlights recycling achievements
- **Unit Conversion**: Enhanced kg/lb conversion with edit dialog support
- **Chart Improvements**: Fixed data representation across all graphs
- **Port Consolidation**: Standardized on ports 3003/3004
- **Process Management**: Automatic cleanup for fresh starts

## 📋 Configuration

### Environment Variables
- **Server** (server/.env):
  ```properties
  PORT=3004
  HOST=0.0.0.0
  ```

- **Client** (client/.env):
  ```properties  
  PORT=3003
  REACT_APP_API_URL=http://localhost:3004/api
  ```

### Waste Categories Supported
- **Plastics**: PET, HDPE, LDPE, PP, PS
- **Metals**: Tin, Aluminum, Copper
- **Paper**: Cardboard/Paper products
- **Glass**: All glass containers
- **Non-Recyclable**: General waste

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts**: Run `stop-all.bat` before starting
- **Dependencies missing**: Run `npm install` in root, server, and client folders
- **Build errors**: Ensure Node.js 16+ is installed
- **Network access**: Check Windows Firewall settings for ports 3003/3004

### Support Files
- `system-status.bat` - Check current system state
- `server/logs/` - Application logs for debugging
- Documentation files - Detailed guides and troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Material-UI for modern interface design
- Chart visualization powered by MUI X-Charts
- TypeScript for enhanced development experience
- Express.js for robust backend API

---

**Made with ♻️ for a sustainable future**