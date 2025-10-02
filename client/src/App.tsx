import React from 'react';
import { CssBaseline, Container, Grid, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import WasteEntryForm from './components/WasteEntryForm';
import SettingsPanel from './components/SettingsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { DataRefreshProvider } from './contexts/DataRefreshContext';

function App() {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <DataRefreshProvider>
          <CssBaseline />
          <Container maxWidth={false} sx={{ px: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={9}>
                <Dashboard />
              </Grid>
              <Grid item xs={12} lg={3}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  <SettingsPanel />
                  <WasteEntryForm />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </DataRefreshProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;