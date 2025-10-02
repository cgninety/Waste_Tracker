export enum WasteCategory {
  PET = 'pet',
  HDPE = 'hdpe', 
  LDPE = 'ldpe',
  PP = 'pp',
  PS = 'ps',
  CARDBOARD = 'cardboard',
  GLASS = 'glass',
  TIN = 'tin',
  ALUMINUM = 'aluminum',
  COPPER = 'copper',
  NON_RECYCLABLE = 'non-recyclable'
}

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

export interface LandfillEntry {
  id: string;
  userId: string;
  weight: number;
  timestamp: Date;
  notes?: string;
  collectionDate: Date; // When it was actually taken to landfill
}

export interface RecyclingEntry {
  id: string;
  userId: string;
  weight: number;
  timestamp: Date;
  notes?: string;
  processingDate: Date; // When it was actually sent for recycling
}

export interface UserStats {
  totalRecycled: number;
  totalWaste: number;
  recyclingRate: number;
  categoryCounts: Record<WasteCategory, number>;
  achievements: Achievement[];
  level: number;
  points: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
  category: 'recycling' | 'weight' | 'consistency' | 'education';
}

export interface HistoricalDataPoint {
  date: string;
  recycled: number;
  waste: number;
}

export interface DashboardData {
  realTimeMetrics: {
    todayRecycled: number;
    todayWaste: number;
    currentRate: number;
    trend: 'up' | 'down' | 'stable';
    monthlyLandfillTotal: number;
    pendingLandfillWeight: number;
    monthlyRecyclingTotal: number;
    pendingRecyclingWeight: number;
    allTimeLandfillTotal: number;
    allTimeRecyclingTotal: number;
  };
  categoryTotals: Record<WasteCategory, number>;
  historicalData: HistoricalDataPoint[];
  alerts: Alert[];
  wasteEntries: WasteEntry[];
  landfillEntries: LandfillEntry[];
  recyclingEntries: RecyclingEntry[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: Date;
  category?: WasteCategory;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  preferences: {
    units: 'kg' | 'lbs';
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  recyclingRate: number;
  totalRecycled: number;
  points: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
}