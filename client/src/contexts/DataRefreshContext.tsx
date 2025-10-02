import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DataManager } from '../services/dataManager';

interface DataRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

interface DataRefreshProviderProps {
  children: ReactNode;
}

export const DataRefreshProvider: React.FC<DataRefreshProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    console.log('DataRefreshContext triggerRefresh called');
    setRefreshTrigger(prev => {
      console.log('Updating refreshTrigger from', prev, 'to', prev + 1);
      return prev + 1;
    });
  }, []);

  // Set up auto-refresh when data changes
  useEffect(() => {
    DataManager.setRefreshCallback(triggerRefresh);
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && (event.key.includes('waste-') || event.key.includes('dashboard-data'))) {
        console.log('Data changed in another tab, triggering refresh');
        triggerRefresh();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup callback and event listener on unmount
    return () => {
      DataManager.setRefreshCallback(() => {});
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [triggerRefresh]);

  const value = {
    refreshTrigger,
    triggerRefresh,
  };

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
};