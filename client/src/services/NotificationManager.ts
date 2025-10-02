export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'warning' | 'error' | 'info' | 'success';
  trigger: {
    condition: string; // e.g., 'total_waste > threshold' or 'recycling_rate < threshold'
    threshold: number;
    timeframe?: 'daily' | 'weekly' | 'monthly';
    comparison: '>' | '<' | '>=' | '<=' | '==' | '!=';
  };
  message: {
    template: string; // Template with placeholders like {value}, {threshold}, {category}
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  actions?: {
    autoResolve: boolean;
    cooldownMinutes: number; // Prevent spam
    sendEmail?: boolean;
    playSound?: boolean;
  };
}

export interface AlertConfiguration {
  globalSettings: {
    enabledAlerts: boolean;
    soundEnabled: boolean;
    emailNotifications: boolean;
    maxAlertsDisplayed: number;
    autoResolveAfterMinutes: number;
  };
  rules: AlertRule[];
}

export class NotificationManager {
  private static STORAGE_KEY = 'notification-config';
  private static alertHistory: Map<string, Date> = new Map();

  static getDefaultConfiguration(): AlertConfiguration {
    return {
      globalSettings: {
        enabledAlerts: true,
        soundEnabled: false,
        emailNotifications: false,
        maxAlertsDisplayed: 5,
        autoResolveAfterMinutes: 30
      },
      rules: [
        // High Waste Volume Alert
        {
          id: 'high-waste-volume',
          name: 'High Waste Volume',
          description: 'Triggers when daily waste exceeds threshold',
          enabled: true,
          type: 'warning',
          trigger: {
            condition: 'daily_total_waste',
            threshold: 100,
            timeframe: 'daily',
            comparison: '>'
          },
          message: {
            template: 'High waste volume detected: {value}kg exceeds daily limit of {threshold}kg',
            severity: 'medium'
          },
          actions: {
            autoResolve: false,
            cooldownMinutes: 60,
            sendEmail: false,
            playSound: false
          }
        },

        // Low Recycling Rate Alert
        {
          id: 'low-recycling-rate',
          name: 'Low Recycling Rate',
          description: 'Triggers when recycling rate falls below threshold',
          enabled: true,
          type: 'warning',
          trigger: {
            condition: 'recycling_rate',
            threshold: 50,
            timeframe: 'daily',
            comparison: '<'
          },
          message: {
            template: 'Recycling rate is low: {value}% is below target of {threshold}%',
            severity: 'medium'
          },
          actions: {
            autoResolve: true,
            cooldownMinutes: 30,
            sendEmail: false,
            playSound: false
          }
        },

        // Container Full Alert
        {
          id: 'container-full',
          name: 'Container Nearly Full',
          description: 'Triggers when category containers are nearly full',
          enabled: true,
          type: 'info',
          trigger: {
            condition: 'category_weight',
            threshold: 80,
            timeframe: 'daily',
            comparison: '>='
          },
          message: {
            template: '{category} container is {value}% full - consider emptying soon',
            severity: 'low'
          },
          actions: {
            autoResolve: true,
            cooldownMinutes: 120,
            sendEmail: false,
            playSound: false
          }
        },

        // Recycling Goal Achievement
        {
          id: 'recycling-goal-met',
          name: 'Recycling Goal Achieved',
          description: 'Positive feedback when recycling goals are met',
          enabled: true,
          type: 'success',
          trigger: {
            condition: 'recycling_rate',
            threshold: 80,
            timeframe: 'daily',
            comparison: '>='
          },
          message: {
            template: 'Excellent! Daily recycling rate of {value}% exceeds target of {threshold}%',
            severity: 'low'
          },
          actions: {
            autoResolve: true,
            cooldownMinutes: 480, // Once per day
            sendEmail: false,
            playSound: false
          }
        },

        // Critical Waste Level
        {
          id: 'critical-waste-level',
          name: 'Critical Waste Level',
          description: 'Critical alert for extremely high waste levels',
          enabled: true,
          type: 'error',
          trigger: {
            condition: 'daily_total_waste',
            threshold: 200,
            timeframe: 'daily',
            comparison: '>'
          },
          message: {
            template: 'CRITICAL: Waste level of {value}kg far exceeds safe limit of {threshold}kg',
            severity: 'critical'
          },
          actions: {
            autoResolve: false,
            cooldownMinutes: 15,
            sendEmail: true,
            playSound: true
          }
        },

        // No Activity Alert
        {
          id: 'no-recent-activity',
          name: 'No Recent Activity',
          description: 'Alert when no waste entries recorded recently',
          enabled: false, // Disabled by default
          type: 'info',
          trigger: {
            condition: 'hours_since_last_entry',
            threshold: 24,
            timeframe: 'daily',
            comparison: '>'
          },
          message: {
            template: 'No waste entries recorded in the last {value} hours',
            severity: 'low'
          },
          actions: {
            autoResolve: true,
            cooldownMinutes: 360, // Every 6 hours
            sendEmail: false,
            playSound: false
          }
        },

        // Monthly Target Alert
        {
          id: 'monthly-target-behind',
          name: 'Behind Monthly Target',
          description: 'Alert when monthly recycling target is not being met',
          enabled: true,
          type: 'warning',
          trigger: {
            condition: 'monthly_recycling_progress',
            threshold: 75, // 75% of expected progress
            timeframe: 'monthly',
            comparison: '<'
          },
          message: {
            template: 'Monthly recycling progress at {value}% - behind target pace of {threshold}%',
            severity: 'medium'
          },
          actions: {
            autoResolve: true,
            cooldownMinutes: 1440, // Once per day
            sendEmail: false,
            playSound: false
          }
        }
      ]
    };
  }

  static getConfiguration(): AlertConfiguration {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Merge with defaults to ensure new rules are included
        const defaults = this.getDefaultConfiguration();
        return {
          ...defaults,
          ...config,
          rules: [
            ...defaults.rules.filter(rule => 
              !config.rules?.find((r: AlertRule) => r.id === rule.id)
            ),
            ...(config.rules || [])
          ]
        };
      }
    } catch (error) {
      console.error('Error loading notification configuration:', error);
    }
    return this.getDefaultConfiguration();
  }

  static saveConfiguration(config: AlertConfiguration): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving notification configuration:', error);
    }
  }

  static evaluateAlerts(data: any): Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    timestamp: Date;
    category?: string;
  }> {
    const config = this.getConfiguration();
    const alerts: Array<any> = [];

    if (!config.globalSettings.enabledAlerts) {
      return alerts;
    }

    const now = new Date();

    for (const rule of config.rules) {
      if (!rule.enabled) continue;

      // Check cooldown
      const lastAlert = this.alertHistory.get(rule.id);
      if (lastAlert && (now.getTime() - lastAlert.getTime()) < (rule.actions?.cooldownMinutes || 0) * 60000) {
        continue;
      }

      let shouldTrigger = false;
      let actualValue = 0;
      let category: string | undefined;

      // Evaluate conditions
      switch (rule.trigger.condition) {
        case 'daily_total_waste':
          actualValue = (data.realTimeMetrics?.todayRecycled || 0) + (data.realTimeMetrics?.todayWaste || 0);
          shouldTrigger = this.compareValues(actualValue, rule.trigger.threshold, rule.trigger.comparison);
          break;

        case 'recycling_rate':
          actualValue = data.realTimeMetrics?.currentRate || 0;
          shouldTrigger = this.compareValues(actualValue, rule.trigger.threshold, rule.trigger.comparison);
          break;

        case 'category_weight':
          // Check each category
          for (const [cat, weight] of Object.entries(data.categoryTotals || {})) {
            const percentage = ((weight as number) / rule.trigger.threshold) * 100;
            if (this.compareValues(percentage, 80, rule.trigger.comparison)) {
              shouldTrigger = true;
              actualValue = percentage;
              category = cat;
              break;
            }
          }
          break;

        case 'monthly_recycling_progress':
          // Calculate expected progress vs actual
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const currentDay = now.getDate();
          const expectedProgress = (currentDay / daysInMonth) * 100;
          const monthlyTotal = data.realTimeMetrics?.monthlyRecyclingTotal || 0;
          const monthlyTarget = 300; // Default target, should be configurable
          const actualProgress = (monthlyTotal / monthlyTarget) * 100;
          actualValue = actualProgress;
          shouldTrigger = this.compareValues(actualProgress, expectedProgress * (rule.trigger.threshold / 100), rule.trigger.comparison);
          break;

        case 'hours_since_last_entry':
          // This would require tracking last entry time
          const lastEntryTime = this.getLastEntryTime();
          if (lastEntryTime) {
            actualValue = (now.getTime() - lastEntryTime.getTime()) / (1000 * 60 * 60);
            shouldTrigger = this.compareValues(actualValue, rule.trigger.threshold, rule.trigger.comparison);
          }
          break;
      }

      if (shouldTrigger) {
        const message = this.formatMessage(rule.message.template, {
          value: Math.round(actualValue * 10) / 10,
          threshold: rule.trigger.threshold,
          category: category || rule.trigger.condition
        });

        alerts.push({
          id: rule.id + '_' + Date.now(),
          type: rule.type,
          message,
          timestamp: now,
          category
        });

        this.alertHistory.set(rule.id, now);

        // Limit number of alerts
        if (alerts.length >= config.globalSettings.maxAlertsDisplayed) {
          break;
        }
      }
    }

    return alerts;
  }

  private static compareValues(actual: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case '>': return actual > threshold;
      case '<': return actual < threshold;
      case '>=': return actual >= threshold;
      case '<=': return actual <= threshold;
      case '==': return actual === threshold;
      case '!=': return actual !== threshold;
      default: return false;
    }
  }

  private static formatMessage(template: string, values: Record<string, any>): string {
    let message = template;
    for (const [key, value] of Object.entries(values)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return message;
  }

  private static getLastEntryTime(): Date | null {
    // This should integrate with your data manager to get actual last entry time
    try {
      const entries = JSON.parse(localStorage.getItem('waste-entries') || '[]');
      if (entries.length > 0) {
        return new Date(entries[entries.length - 1].timestamp);
      }
    } catch (error) {
      console.error('Error getting last entry time:', error);
    }
    return null;
  }
}