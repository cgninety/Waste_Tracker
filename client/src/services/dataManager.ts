import { WasteCategory, DashboardData, HistoricalDataPoint, Alert, LandfillEntry, RecyclingEntry } from '../types';
import { NotificationManager } from './NotificationManager';

export interface WasteEntry {
  id: string;
  userId: string;
  category: WasteCategory;
  subCategory?: string;
  weight: number;
  timestamp: Date;
  location?: string;
  notes?: string;
  isRecyclable: boolean;
}

export interface DataFilter {
  startDate?: Date;
  endDate?: Date;
  category?: WasteCategory;
  timeRange?: 'today' | '3days' | 'week';
}

export interface TimeRange {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

export class DataManager {
  private static STORAGE_KEYS = {
    WASTE_ENTRIES: 'waste-entries',
    LANDFILL_ENTRIES: 'landfill-entries',
    RECYCLING_ENTRIES: 'recycling-entries',
    DASHBOARD_DATA: 'dashboard-data',
    USER_STATS: 'user-stats',
    HISTORICAL_DATA: 'historical-data'
  };

  // Callback for triggering UI updates
  private static refreshCallback: (() => void) | null = null;
  private static lastDataHash: string = '';

  static setRefreshCallback(callback: () => void) {
    this.refreshCallback = callback;
    // Initialize the data hash
    this.lastDataHash = this.calculateDataHash();
  }

  private static calculateDataHash(): string {
    const wasteEntries = localStorage.getItem(this.STORAGE_KEYS.WASTE_ENTRIES) || '';
    const landfillEntries = localStorage.getItem(this.STORAGE_KEYS.LANDFILL_ENTRIES) || '';
    const recyclingEntries = localStorage.getItem(this.STORAGE_KEYS.RECYCLING_ENTRIES) || '';
    const combinedData = wasteEntries + landfillEntries + recyclingEntries;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combinedData.length; i++) {
      const char = combinedData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static triggerRefresh() {
    const currentHash = this.calculateDataHash();
    if (currentHash !== this.lastDataHash) {
      this.lastDataHash = currentHash;
      if (this.refreshCallback) {
        this.refreshCallback();
      }
    }
  }

  static saveWasteEntry(entry: Omit<WasteEntry, 'id'>): WasteEntry {
    console.log('SaveWasteEntry called');
    const entries = this.getAllEntries();
    const newEntry: WasteEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(entry.timestamp)
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.STORAGE_KEYS.WASTE_ENTRIES, JSON.stringify(entries));
    console.log('Calling updateDashboardData');
    this.updateDashboardData();
    return newEntry;
  }

  static getAllEntries(): WasteEntry[] {
    try {
      const entries = localStorage.getItem(this.STORAGE_KEYS.WASTE_ENTRIES);
      if (!entries) return [];
      
      return JSON.parse(entries).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  }

  static getFilteredEntries(filter: DataFilter): WasteEntry[] {
    const entries = this.getAllEntries();
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      
      // Date range filter
      if (filter.startDate && entryDate < filter.startDate) return false;
      if (filter.endDate && entryDate > filter.endDate) return false;
      
      // Category filter
      if (filter.category && entry.category !== filter.category) return false;
      
      // Time range filter
      if (filter.timeRange) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filter.timeRange) {
          case 'today':
            return entryDate >= today;
          case '3days':
            const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
            return entryDate >= threeDaysAgo;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return entryDate >= weekAgo;
        }
      }
      
      return true;
    });
  }

  static deleteEntry(entryId: string): boolean {
    const entries = this.getAllEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    
    if (filteredEntries.length !== entries.length) {
      localStorage.setItem(this.STORAGE_KEYS.WASTE_ENTRIES, JSON.stringify(filteredEntries));
      this.updateDashboardData();
      return true;
    }
    return false;
  }

  static deleteEntriesByFilter(filter: DataFilter): number {
    const allEntries = this.getAllEntries();
    const entriesToDelete = this.getFilteredEntries(filter);
    const entriesToKeep = allEntries.filter(entry => 
      !entriesToDelete.find(deleteEntry => deleteEntry.id === entry.id)
    );
    
    localStorage.setItem(this.STORAGE_KEYS.WASTE_ENTRIES, JSON.stringify(entriesToKeep));
    this.updateDashboardData();
    return entriesToDelete.length;
  }

  // Landfill Entry Management
  static saveLandfillEntry(entry: Omit<LandfillEntry, 'id'>): LandfillEntry {
    const entries = this.getAllLandfillEntries();
    const newEntry: LandfillEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(entry.timestamp),
      collectionDate: new Date(entry.collectionDate)
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.STORAGE_KEYS.LANDFILL_ENTRIES, JSON.stringify(entries));
    this.updateDashboardData();
    return newEntry;
  }

  static getAllLandfillEntries(): LandfillEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.LANDFILL_ENTRIES);
      if (stored) {
        const entries = JSON.parse(stored);
        return entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          collectionDate: new Date(entry.collectionDate)
        }));
      }
    } catch (error) {
      console.error('Error loading landfill entries:', error);
    }
    return [];
  }

  static getMonthlyLandfillTotal(): number {
    const entries = this.getAllLandfillEntries();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return entries
      .filter(entry => entry.collectionDate >= monthStart)
      .reduce((total, entry) => total + entry.weight, 0);
  }

  static getPendingLandfillWeight(): number {
    const wasteEntries = this.getAllEntries();
    const landfillEntries = this.getAllLandfillEntries();
    
    // Calculate total non-recyclable waste
    const totalNonRecyclable = wasteEntries
      .filter(entry => !entry.isRecyclable)
      .reduce((total, entry) => total + entry.weight, 0);
    
    // Calculate total already sent to landfill
    const totalSentToLandfill = landfillEntries
      .reduce((total, entry) => total + entry.weight, 0);
    
    // Return pending amount (should not be negative)
    return Math.max(0, totalNonRecyclable - totalSentToLandfill);
  }

  // Recycling Entry Methods
  static saveRecyclingEntry(entry: Omit<RecyclingEntry, 'id'>): RecyclingEntry {
    const entries = this.getAllRecyclingEntries();
    const newEntry: RecyclingEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(entry.timestamp),
      processingDate: new Date(entry.processingDate)
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.STORAGE_KEYS.RECYCLING_ENTRIES, JSON.stringify(entries));
    this.updateDashboardData();
    return newEntry;
  }

  static getAllRecyclingEntries(): RecyclingEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.RECYCLING_ENTRIES);
      if (!stored) return [];
      
      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        processingDate: new Date(entry.processingDate)
      }));
    } catch (error) {
      console.error('Error loading recycling entries:', error);
      return [];
    }
  }

  static getMonthlyRecyclingTotal(): number {
    const entries = this.getAllRecyclingEntries();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.processingDate);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((total, entry) => total + entry.weight, 0);
  }

  static getAllTimeLandfillTotal(): number {
    const entries = this.getAllLandfillEntries();
    return entries.reduce((total, entry) => total + entry.weight, 0);
  }

  static getAllTimeRecyclingTotal(): number {
    const entries = this.getAllRecyclingEntries();
    return entries.reduce((total, entry) => total + entry.weight, 0);
  }

  static getPendingRecyclingWeight(): number {
    const wasteEntries = this.getAllEntries();
    const recyclingEntries = this.getAllRecyclingEntries();
    
    // Calculate total recyclable waste
    const totalRecyclable = wasteEntries
      .filter(entry => entry.isRecyclable)
      .reduce((total, entry) => total + entry.weight, 0);
    
    // Calculate total already sent for recycling
    const totalSentForRecycling = recyclingEntries
      .reduce((total, entry) => total + entry.weight, 0);
    
    // Return pending amount (should not be negative)
    return Math.max(0, totalRecyclable - totalSentForRecycling);
  }

  // Delete Entry Methods
  static deleteLandfillEntry(entryId: string): boolean {
    const entries = this.getAllLandfillEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    
    if (filteredEntries.length !== entries.length) {
      localStorage.setItem(this.STORAGE_KEYS.LANDFILL_ENTRIES, JSON.stringify(filteredEntries));
      this.updateDashboardData();
      return true;
    }
    return false;
  }

  static deleteRecyclingEntry(entryId: string): boolean {
    const entries = this.getAllRecyclingEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    
    if (filteredEntries.length !== entries.length) {
      localStorage.setItem(this.STORAGE_KEYS.RECYCLING_ENTRIES, JSON.stringify(filteredEntries));
      this.updateDashboardData();
      return true;
    }
    return false;
  }

  // Update Entry Methods  
  static updateLandfillEntry(entryId: string, updatedEntry: Partial<Omit<LandfillEntry, 'id'>>): boolean {
    const entries = this.getAllLandfillEntries();
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex !== -1) {
      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updatedEntry,
        timestamp: updatedEntry.timestamp ? new Date(updatedEntry.timestamp) : entries[entryIndex].timestamp,
        collectionDate: updatedEntry.collectionDate ? new Date(updatedEntry.collectionDate) : entries[entryIndex].collectionDate
      };
      
      localStorage.setItem(this.STORAGE_KEYS.LANDFILL_ENTRIES, JSON.stringify(entries));
      this.updateDashboardData();
      return true;
    }
    return false;
  }

  static updateRecyclingEntry(entryId: string, updatedEntry: Partial<Omit<RecyclingEntry, 'id'>>): boolean {
    const entries = this.getAllRecyclingEntries();
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex !== -1) {
      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updatedEntry,
        timestamp: updatedEntry.timestamp ? new Date(updatedEntry.timestamp) : entries[entryIndex].timestamp,
        processingDate: updatedEntry.processingDate ? new Date(updatedEntry.processingDate) : entries[entryIndex].processingDate
      };
      
      localStorage.setItem(this.STORAGE_KEYS.RECYCLING_ENTRIES, JSON.stringify(entries));
      this.updateDashboardData();
      return true;
    }
    return false;
  }

  static clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear any other related data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('waste-') || key.includes('dashboard') || key.includes('recycling')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reinitialize dashboard with empty data and trigger refresh
    this.updateDashboardData();
  }

  static getAvailableTimeRanges(): TimeRange[] {
    const entries = this.getAllEntries();
    if (entries.length === 0) return [];

    const dates = entries.map(entry => new Date(entry.timestamp)).sort();
    const oldestDate = dates[0];
    const now = new Date();
    
    const ranges: TimeRange[] = [];
    
    // Current month
    ranges.push({
      label: `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (Current)`,
      value: `${now.getFullYear()}-${now.getMonth()}`,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    });

    // Previous months
    let checkDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    while (checkDate >= new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1)) {
      ranges.push({
        label: checkDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: `${checkDate.getFullYear()}-${checkDate.getMonth()}`,
        startDate: new Date(checkDate.getFullYear(), checkDate.getMonth(), 1),
        endDate: new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0)
      });
      
      checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth() - 1, 1);
    }

    return ranges;
  }

  static generateHistoricalData(entries: WasteEntry[], timeRange: 'today' | '3days' | 'week'): HistoricalDataPoint[] {
    const now = new Date();
    const historicalData: HistoricalDataPoint[] = [];
    
    if (timeRange === 'today') {
      // For 24-hour view, show only current day's hourly data
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(todayStart.getTime() + hour * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        
        const hourEntries = entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= hourStart && entryDate < hourEnd;
        });
        
        const recycled = hourEntries
          .filter(entry => entry.isRecyclable)
          .reduce((sum, entry) => sum + entry.weight, 0);
        const waste = hourEntries
          .filter(entry => !entry.isRecyclable)
          .reduce((sum, entry) => sum + entry.weight, 0);

        // Format as HH:MM
        const timeLabel = hourStart.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        });

        historicalData.push({
          date: timeLabel,
          recycled,
          waste
        });
      }
    } else {
      // For multi-day views, show past days from current day
      const days = timeRange === '3days' ? 3 : 7;
      
      for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= dayStart && entryDate < dayEnd;
        });
        
        const recycled = dayEntries
          .filter(entry => entry.isRecyclable)
          .reduce((sum, entry) => sum + entry.weight, 0);
        const waste = dayEntries
          .filter(entry => !entry.isRecyclable)
          .reduce((sum, entry) => sum + entry.weight, 0);

        historicalData.push({
          date: dayStart.toISOString().split('T')[0], // YYYY-MM-DD format
          recycled,
          waste
        });
      }
    }
    
    return historicalData;
  }

  static updateDashboardData(): void {
    const entries = this.getAllEntries();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Calculate today's stats
    const todayEntries = entries.filter(entry => new Date(entry.timestamp) >= todayStart);
    const todayRecycled = todayEntries
      .filter(entry => entry.isRecyclable)
      .reduce((sum, entry) => sum + entry.weight, 0);
    const todayWaste = todayEntries
      .filter(entry => !entry.isRecyclable)
      .reduce((sum, entry) => sum + entry.weight, 0);
    
    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    Object.values(WasteCategory).forEach((category: WasteCategory) => {
      categoryTotals[category] = entries
        .filter(entry => entry.category === category)
        .reduce((sum, entry) => sum + entry.weight, 0);
    });

    // Generate historical data for the last 7 days (default view)
    const historicalData = this.generateHistoricalData(entries, 'week');

    const dashboardData = {
      realTimeMetrics: {
        todayRecycled,
        todayWaste,
        currentRate: todayRecycled + todayWaste > 0 ? (todayRecycled / (todayRecycled + todayWaste)) * 100 : 0,
        trend: 'stable' as const,
        monthlyLandfillTotal: this.getMonthlyLandfillTotal(),
        pendingLandfillWeight: this.getPendingLandfillWeight(),
        monthlyRecyclingTotal: this.getMonthlyRecyclingTotal(),
        pendingRecyclingWeight: this.getPendingRecyclingWeight(),
        allTimeLandfillTotal: this.getAllTimeLandfillTotal(),
        allTimeRecyclingTotal: this.getAllTimeRecyclingTotal()
      },
      categoryTotals,
      historicalData,
      alerts: [],
      wasteEntries: this.getAllEntries(),
      landfillEntries: this.getAllLandfillEntries(),
      recyclingEntries: this.getAllRecyclingEntries()
    };

    localStorage.setItem(this.STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(dashboardData));
    
    console.log('UpdateDashboardData: Data saved to localStorage, calling forceRefresh');
    // Force UI refresh for data updates (bypass hash check)
    this.forceRefresh();
  }

  // Force refresh without hash checking for known data changes
  private static forceRefresh() {
    console.log('ForceRefresh called - callback exists:', !!this.refreshCallback);
    if (this.refreshCallback) {
      this.refreshCallback();
      // Update hash after triggering refresh to sync state
      setTimeout(() => {
        this.lastDataHash = this.calculateDataHash();
      }, 100);
    }
  }

  // Public method to trigger manual refresh (for API calls)
  static triggerManualRefresh() {
    console.log('Manual refresh triggered');
    this.forceRefresh();
  }

  static getDashboardData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DASHBOARD_DATA);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    return null;
  }

  // Get filtered dashboard data
  static getDashboardDataFiltered(filter: DataFilter): DashboardData | null {
    // Always use all entries for historical data to show proper time ranges
    const allEntries = this.getAllEntries();
    
    // Generate dashboard data with all entries but apply time range for chart
    const dashboardData = this.convertEntriesToDashboardData(allEntries, filter.timeRange || 'week');
    
    return dashboardData;
  }

  // Add a new entry using existing saveWasteEntry method
  static addEntry(entry: WasteEntry): void {
    // Use the existing saveWasteEntry method which handles ID generation
    const entryWithoutId = {
      userId: entry.userId,
      category: entry.category,
      subCategory: entry.subCategory,
      weight: entry.weight,
      timestamp: entry.timestamp,
      location: entry.location,
      notes: entry.notes,
      isRecyclable: entry.isRecyclable
    };
    
    this.saveWasteEntry(entryWithoutId);
    // The saveWasteEntry method should handle updating dashboard data
  }

  // Method to create sample data for testing
  static createSampleData(): void {
    console.log('Creating sample data...');
    const sampleEntries = [
      {
        userId: 'user_1',
        category: WasteCategory.PET,
        weight: 2.5,
        timestamp: new Date(),
        notes: 'Sample PET bottle',
        isRecyclable: true
      },
      {
        userId: 'user_1',
        category: WasteCategory.ALUMINUM,
        weight: 0.8,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        notes: 'Sample aluminum can',
        isRecyclable: true
      },
      {
        userId: 'user_1',
        category: WasteCategory.CARDBOARD,
        weight: 1.2,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        notes: 'Sample cardboard box',
        isRecyclable: true
      },
      {
        userId: 'user_1',
        category: WasteCategory.GLASS,
        weight: 3.0,
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        notes: 'Sample glass jar',
        isRecyclable: true
      },
      {
        userId: 'user_1',
        category: WasteCategory.NON_RECYCLABLE,
        weight: 1.5,
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        notes: 'Sample non-recyclable waste',
        isRecyclable: false
      }
    ];

    sampleEntries.forEach(entry => {
      this.saveWasteEntry(entry);
    });
    
    console.log('Sample data created successfully');
  }

  // Convert waste entries to dashboard data format
  private static convertEntriesToDashboardData(entries: WasteEntry[], timeRange: 'today' | '3days' | 'week' = 'week'): DashboardData {
    console.log('Converting entries to dashboard data:', entries);
    console.log('Entries by recyclability:', {
      recyclable: entries.filter(entry => entry.isRecyclable),
      nonRecyclable: entries.filter(entry => !entry.isRecyclable)
    });
    
    // Calculate today's specific values (not total values)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEntries = entries.filter(entry => new Date(entry.timestamp) >= todayStart);
    
    const todayRecycled = todayEntries
      .filter(entry => entry.isRecyclable)
      .reduce((sum, entry) => sum + entry.weight, 0);
    const todayWaste = todayEntries
      .filter(entry => !entry.isRecyclable)
      .reduce((sum, entry) => sum + entry.weight, 0);
      
    // Calculate total values for recycling rate
    const totalWaste = entries.reduce((sum, entry) => sum + entry.weight, 0);
    const totalRecycled = entries.filter(entry => entry.isRecyclable).reduce((sum, entry) => sum + entry.weight, 0);
    
    // Group by category
    const categoryTotals: Record<WasteCategory, number> = {
      [WasteCategory.PET]: 0,
      [WasteCategory.HDPE]: 0,
      [WasteCategory.LDPE]: 0,
      [WasteCategory.PP]: 0,
      [WasteCategory.PS]: 0,
      [WasteCategory.CARDBOARD]: 0,
      [WasteCategory.GLASS]: 0,
      [WasteCategory.TIN]: 0,
      [WasteCategory.ALUMINUM]: 0,
      [WasteCategory.COPPER]: 0,
      [WasteCategory.NON_RECYCLABLE]: 0
    };

    entries.forEach(entry => {
      categoryTotals[entry.category] += entry.weight;
      console.log(`DataManager - Adding entry: category=${entry.category}, weight=${entry.weight}, isRecyclable=${entry.isRecyclable}`);
    });
    
    console.log('DataManager - Final categoryTotals:', categoryTotals);

    // Generate historical data based on selected time range
    const historicalData = this.generateHistoricalData(entries, timeRange);

    // Create alerts using NotificationManager
    const dashboardData = {
      realTimeMetrics: {
        todayRecycled: todayRecycled,
        todayWaste: todayWaste,
        currentRate: totalWaste > 0 ? (totalRecycled / totalWaste) * 100 : 0,
        monthlyLandfillTotal: this.getMonthlyLandfillTotal(),
        pendingLandfillWeight: this.getPendingLandfillWeight(),
        monthlyRecyclingTotal: this.getMonthlyRecyclingTotal(),
        pendingRecyclingWeight: this.getPendingRecyclingWeight(),
        allTimeLandfillTotal: this.getAllTimeLandfillTotal(),
        allTimeRecyclingTotal: this.getAllTimeRecyclingTotal()
      },
      categoryTotals
    };
    
    const alertsData = NotificationManager.evaluateAlerts(dashboardData);
    const alerts: Alert[] = alertsData.map(alert => ({
      ...alert,
      category: alert.category as WasteCategory | undefined
    }));

    const currentRate = totalWaste > 0 ? (totalRecycled / totalWaste) * 100 : 0;
    const trend: 'up' | 'down' | 'stable' = currentRate > 75 ? 'up' : currentRate < 50 ? 'down' : 'stable';

    return {
      realTimeMetrics: {
        todayRecycled: todayRecycled,
        todayWaste: todayWaste, // Only non-recyclable waste
        currentRate,
        trend,
        monthlyLandfillTotal: this.getMonthlyLandfillTotal(),
        pendingLandfillWeight: this.getPendingLandfillWeight(),
        monthlyRecyclingTotal: this.getMonthlyRecyclingTotal(),
        pendingRecyclingWeight: this.getPendingRecyclingWeight(),
        allTimeLandfillTotal: this.getAllTimeLandfillTotal(),
        allTimeRecyclingTotal: this.getAllTimeRecyclingTotal()
      },
      categoryTotals,
      historicalData,
      alerts,
      wasteEntries: this.getAllEntries(),
      landfillEntries: this.getAllLandfillEntries(),
      recyclingEntries: this.getAllRecyclingEntries()
    };
  }
}