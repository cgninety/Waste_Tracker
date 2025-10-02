import { useState, useEffect } from 'react';
import { DashboardData, WasteCategory } from '../types';
import { dashboardService } from '../services/dashboardService';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const initialData: DashboardData = {
  realTimeMetrics: {
    todayRecycled: 0,
    todayWaste: 0,
    currentRate: 0,
    trend: 'stable',
    monthlyLandfillTotal: 0,
    pendingLandfillWeight: 0,
    monthlyRecyclingTotal: 0,
    pendingRecyclingWeight: 0,
    allTimeLandfillTotal: 0,
    allTimeRecyclingTotal: 0
  },
  categoryTotals: {
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
  },
  historicalData: [],
  alerts: [],
  wasteEntries: [],
  landfillEntries: [],
  recyclingEntries: []
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('useDashboardData: Fetching dashboard data... refreshTrigger =', refreshTrigger);
        const dashboardData = await dashboardService.getDashboardData();
        console.log('useDashboardData: Dashboard data received:', dashboardData);
        
        if (dashboardData && dashboardData.realTimeMetrics && dashboardData.categoryTotals) {
          setData(dashboardData);
          setError(null);
        } else {
          console.error('Invalid dashboard data structure:', dashboardData);
          setData(initialData);
          setError('Invalid data structure received from server');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setData(initialData);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic updates (still keep hourly updates as backup)
    const interval = setInterval(fetchData, 3600000); // Update every hour (3600000 ms)

    return () => clearInterval(interval);
  }, [refreshTrigger]); // Listen for refresh triggers

  return { data, loading, error };
};