import { DashboardData, WasteCategory } from '../types';
import { DataManager } from './dataManager';

// Declare environment variables for TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL?: string;
    }
  }
}

class DashboardService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  async getDashboardData(): Promise<DashboardData> {
    try {
      // First try to get local stored data
      const localData = DataManager.getDashboardData();
      if (localData) {
        console.log('Using local dashboard data');
        return localData;
      }

      // If no local data, try API
      const response = await fetch(`${this.baseUrl}/dashboard`);
      if (!response.ok) {
        console.warn('API request failed, using mock data');
        return this.getMockDashboardData();
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // Check if the response has the expected structure
      if (result.success && result.data) {
        return result.data;
      } else {
        console.warn('Unexpected API response structure, using mock data');
        return this.getMockDashboardData();
      }
    } catch (error) {
      console.warn('Error fetching from API, using local or mock data:', error);
      // Return local data or mock data for development
      return DataManager.getDashboardData() || this.getMockDashboardData();
    }
  }

  async addWasteEntry(category: WasteCategory, weight: number, notes?: string) {
    const entry = {
      category,
      weight,
      notes,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${this.baseUrl}/waste-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error('Failed to add waste entry');
      }

      const result = await response.json();
      
      // Trigger refresh to update the UI after successful API call
      console.log('Waste entry added successfully, triggering refresh');
      // Note: triggerManualRefresh will be called from the form component instead
      
      return result;
    } catch (error) {
      console.error('Error adding waste entry:', error);
      throw error;
    }
  }

  private getMockDashboardData(): DashboardData {
    const now = new Date();
    
    return {
      realTimeMetrics: {
        todayRecycled: 15.6,
        todayWaste: 3.2,
        currentRate: 83.0,
        trend: 'up',
        monthlyLandfillTotal: 45.2,
        pendingLandfillWeight: 12.1,
        monthlyRecyclingTotal: 89.4,
        pendingRecyclingWeight: 22.3,
        allTimeLandfillTotal: 245.8,
        allTimeRecyclingTotal: 523.6
      },
      categoryTotals: {
        [WasteCategory.PET]: 3.4,
        [WasteCategory.HDPE]: 2.1,
        [WasteCategory.LDPE]: 1.8,
        [WasteCategory.PP]: 2.5,
        [WasteCategory.PS]: 0.9,
        [WasteCategory.CARDBOARD]: 4.2,
        [WasteCategory.GLASS]: 2.1,
        [WasteCategory.TIN]: 0.5,
        [WasteCategory.ALUMINUM]: 0.3,
        [WasteCategory.COPPER]: 0.1,
        [WasteCategory.NON_RECYCLABLE]: 3.2
      },
      historicalData: this.generateMockHistoricalData(),
      alerts: [
        {
          id: '1',
          type: 'success',
          message: 'Excellent! You\'ve exceeded your daily recycling goal by 15%',
          timestamp: now,
          category: undefined
        },
        {
          id: '2',
          type: 'info',
          message: 'Reminder: Glass recycling bin is 85% full',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000),
          category: WasteCategory.GLASS
        }
      ],
      wasteEntries: [],
      landfillEntries: [],
      recyclingEntries: []
    };
  }

  private generateMockHistoricalData() {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        recycled: Math.random() * 20 + 10,
        waste: Math.random() * 8 + 2
      });
    }
    
    return data;
  }
}

export const dashboardService = new DashboardService();