import * as fs from 'fs';
import * as path from 'path';

interface SystemConfig {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  defaultUnits: string;
  alertThreshold: number;
  wasteLimit: number;
  dataRetention: number;
}

interface NetworkConfig {
  serverPort: number;
  clientPort: number;
  networkInterface: string;
  corsOrigins: string[];
  sslEnabled: boolean;
  rateLimitMax: number;
}

interface UIConfig {
  defaultTheme: string;
  colorRecycled: string;
  colorWaste: string;
  colorRate: string;
  colorProcessed: string;
  colorTotal: string;
  companyLogo: string;
}

interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  storageLocation: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configDir = path.join(process.cwd(), 'config');
  
  private systemConfig!: SystemConfig;
  private networkConfig!: NetworkConfig;
  private uiConfig!: UIConfig;
  private databaseConfig!: DatabaseConfig;

  private constructor() {
    this.loadConfigurations();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfigurations(): void {
    this.systemConfig = this.loadSystemConfig();
    this.networkConfig = this.loadNetworkConfig();
    this.uiConfig = this.loadUIConfig();
    this.databaseConfig = this.loadDatabaseConfig();
  }

  private parseEnvFile(filename: string): Record<string, string> {
    const filePath = path.join(this.configDir, filename);
    const config: Record<string, string> = {};

    if (!fs.existsSync(filePath)) {
      return config;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return config;
  }

  private loadSystemConfig(): SystemConfig {
    const config = this.parseEnvFile('system.env');
    return {
      organizationName: config.ORGANIZATION_NAME || 'Waste Management System',
      adminName: config.ADMIN_NAME || 'System Administrator',
      adminEmail: config.ADMIN_EMAIL || 'admin@example.com',
      defaultUnits: config.DEFAULT_UNITS || 'kg',
      alertThreshold: parseInt(config.ALERT_THRESHOLD) || 60,
      wasteLimit: parseInt(config.WASTE_LIMIT) || 100,
      dataRetention: parseInt(config.DATA_RETENTION) || 365
    };
  }

  private loadNetworkConfig(): NetworkConfig {
    const config = this.parseEnvFile('network.env');
    return {
      serverPort: parseInt(config.SERVER_PORT) || 3001,
      clientPort: parseInt(config.CLIENT_PORT) || 3000,
      networkInterface: config.NETWORK_INTERFACE || '0.0.0.0',
      corsOrigins: config.CORS_ORIGINS ? config.CORS_ORIGINS.split(',') : ['*'],
      sslEnabled: config.SSL_ENABLED === 'true',
      rateLimitMax: parseInt(config.RATE_LIMIT_MAX) || 100
    };
  }

  private loadUIConfig(): UIConfig {
    const config = this.parseEnvFile('ui.env');
    return {
      defaultTheme: config.DEFAULT_THEME || 'light',
      colorRecycled: config.COLOR_RECYCLED || '#3776A9',
      colorWaste: config.COLOR_WASTE || '#05C793',
      colorRate: config.COLOR_RATE || '#087E8B',
      colorProcessed: config.COLOR_PROCESSED || '#3776A9',
      colorTotal: config.COLOR_TOTAL || '#F8121D',
      companyLogo: config.COMPANY_LOGO || ''
    };
  }

  private loadDatabaseConfig(): DatabaseConfig {
    const config = this.parseEnvFile('database.env');
    return {
      type: config.DB_TYPE || 'sqlite',
      host: config.DB_HOST || 'localhost',
      port: parseInt(config.DB_PORT) || 5432,
      database: config.DB_NAME || 'waste_management',
      username: config.DB_USERNAME || '',
      password: config.DB_PASSWORD || '',
      storageLocation: config.STORAGE_LOCATION || './data'
    };
  }

  // Getter methods
  getSystemConfig(): SystemConfig {
    return this.systemConfig;
  }

  getNetworkConfig(): NetworkConfig {
    return this.networkConfig;
  }

  getUIConfig(): UIConfig {
    return this.uiConfig;
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.databaseConfig;
  }

  // Method to reload configurations
  reloadConfigurations(): void {
    this.loadConfigurations();
  }

  // Method to get configuration as environment variables for client
  getClientEnvVars(): Record<string, string> {
    return {
      REACT_APP_ORGANIZATION_NAME: this.systemConfig.organizationName,
      REACT_APP_DEFAULT_UNITS: this.systemConfig.defaultUnits,
      REACT_APP_THEME: this.uiConfig.defaultTheme,
      REACT_APP_COLOR_RECYCLED: this.uiConfig.colorRecycled,
      REACT_APP_COLOR_WASTE: this.uiConfig.colorWaste,
      REACT_APP_COLOR_RATE: this.uiConfig.colorRate,
      REACT_APP_COLOR_PROCESSED: this.uiConfig.colorProcessed,
      REACT_APP_COLOR_TOTAL: this.uiConfig.colorTotal,
      REACT_APP_SERVER_URL: `http://${this.networkConfig.networkInterface}:${this.networkConfig.serverPort}`
    };
  }
}