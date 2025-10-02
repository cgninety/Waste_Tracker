import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  clearData: () => void;
  units: 'kg' | 'lb';
  toggleUnits: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return (savedMode as PaletteMode) || 'light';
  });

  const [units, setUnits] = useState<'kg' | 'lb'>(() => {
    const savedUnits = localStorage.getItem('units-preference');
    return (savedUnits as 'kg' | 'lb') || 'kg';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('units-preference', units);
  }, [units]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const toggleUnits = () => {
    setUnits(prevUnits => prevUnits === 'kg' ? 'lb' : 'kg');
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all waste data? This action cannot be undone.')) {
      // Clear localStorage data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('waste-') || key.includes('dashboard')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload the page to refresh the data
      window.location.reload();
    }
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#4caf50' : '#66bb6a',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
    clearData,
    units,
    toggleUnits,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};