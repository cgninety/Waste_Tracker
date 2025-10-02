import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  DialogContentText
} from '@mui/material';
import { 
  RecyclingOutlined,
  TrendingUp,
  Warning,
  AccessTime,
  StickyNote2,
  Delete,
  Recycling,
  Category,
  Storage,
  Edit,
  DeleteOutline
} from '@mui/icons-material';
import { LineChart, PieChart } from '@mui/x-charts';
import { DashboardData, WasteCategory, HistoricalDataPoint, Alert as AlertType } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { DataManager } from '../services/dataManager';
import { formatWeight, convertWeight, convertWeightToKg } from '../utils/weightConverter';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import WasteSentToLandfillCard from './WasteSentToLandfillCard';
import WasteRecycledCard from './WasteRecycledCard';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  const [timeRange, setTimeRange] = useState<'today' | '3days' | 'week'>('week');
  const [filteredData, setFilteredData] = useState<DashboardData | null>(null);
  
  // Edit/Delete dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [entryType, setEntryType] = useState<'waste' | 'landfill' | 'recycling'>('waste');
  const [editForm, setEditForm] = useState<any>({});
  
  // Dismissed alerts state
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('dismissed-alerts');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  const theme = useTheme();
  const { units } = useCustomTheme();

  // Get filtered dashboard data based on selected time range
  useEffect(() => {
    if (data) {
      const filtered = DataManager.getDashboardDataFiltered({ timeRange });
      setFilteredData(filtered || data);
    }
  }, [data, timeRange]);

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value as 'today' | '3days' | 'week');
  };

  // Handle alert dismissal
  const handleDismissAlert = (alertId: string) => {
    const newDismissedAlerts = new Set(dismissedAlerts);
    newDismissedAlerts.add(alertId);
    setDismissedAlerts(newDismissedAlerts);
    localStorage.setItem('dismissed-alerts', JSON.stringify(Array.from(newDismissedAlerts)));
  };

  const displayData = filteredData || data;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '300px' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        Failed to load dashboard data. Please try again. Error: {error}
      </Alert>
    );
  }

  const categoryColors = {
    [WasteCategory.PET]: '#2196F3',
    [WasteCategory.HDPE]: '#1976D2',
    [WasteCategory.LDPE]: '#0D47A1',
    [WasteCategory.PP]: '#42A5F5',
    [WasteCategory.PS]: '#64B5F6',
    [WasteCategory.CARDBOARD]: '#FF9800',
    [WasteCategory.GLASS]: '#4CAF50',
    [WasteCategory.TIN]: '#9C27B0',
    [WasteCategory.ALUMINUM]: '#673AB7',
    [WasteCategory.COPPER]: '#795548',
    [WasteCategory.NON_RECYCLABLE]: '#F44336'
  };

  // Helper function to truncate and display notes with tooltip
  const renderTruncatedNote = (note: string) => {
    const maxLength = 100;
    const truncated = note.length > maxLength ? note.substring(0, maxLength) + '...' : note;
    
    if (note.length <= maxLength) {
      return (
        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
          {note}
        </Typography>
      );
    }
    
    return (
      <Tooltip title={note} arrow placement="top">
        <Typography variant="caption" sx={{ fontStyle: 'italic', cursor: 'help' }}>
          {truncated}
        </Typography>
      </Tooltip>
    );
  };

  // Helper function to format chart labels based on time range
  const formatChartLabels = (data: HistoricalDataPoint[], timeRange: string) => {
    if (!data || data.length === 0) return [];
    
    return data.map((d: HistoricalDataPoint) => {
      switch (timeRange) {
        case 'today':
          // For hourly data, show time (already formatted as HH:MM)
          return d.date;
        case '3days':
          // For 3-day view, show day abbreviation with date (e.g., "Mon 9/30", "Tue 10/01")
          const date3d = new Date(d.date + 'T00:00:00');
          const dayName = date3d.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = date3d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
          return `${dayName} ${monthDay}`;
        case 'week':
          // For weekly view, show month/day (e.g., "10/01", "10/02")
          const dateWeek = new Date(d.date + 'T00:00:00');
          return dateWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        default:
          return d.date;
      }
    });
  };

  // Edit/Delete handlers
  const handleEditEntry = (entry: any, type: 'waste' | 'landfill' | 'recycling') => {
    setSelectedEntry(entry);
    setEntryType(type);
    
    // Convert weight from kg (stored format) to user's selected units for display
    const convertedWeight = convertWeight(entry.weight, units);
    
    if (type === 'waste') {
      setEditForm({
        category: entry.category,
        weight: convertedWeight.toFixed(1),
        notes: entry.notes || '',
        isRecyclable: entry.isRecyclable
      });
    } else if (type === 'landfill') {
      setEditForm({
        weight: convertedWeight.toFixed(1),
        notes: entry.notes || '',
        collectionDate: new Date(entry.collectionDate).toISOString().slice(0, 16)
      });
    } else if (type === 'recycling') {
      setEditForm({
        weight: convertedWeight.toFixed(1),
        notes: entry.notes || '',
        processingDate: new Date(entry.processingDate).toISOString().slice(0, 16)
      });
    }
    
    setEditDialogOpen(true);
  };

  const handleDeleteEntry = (entry: any, type: 'waste' | 'landfill' | 'recycling') => {
    setSelectedEntry(entry);
    setEntryType(type);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEntry) return;

    // Convert weight from user's selected units back to kg for storage
    const weightInKg = convertWeightToKg(parseFloat(editForm.weight), units);

    if (entryType === 'waste') {
      // For waste entries, we need to recreate since there's no direct update method
      const updatedEntry = {
        userId: selectedEntry.userId,
        category: editForm.category,
        weight: weightInKg,
        timestamp: selectedEntry.timestamp,
        notes: editForm.notes,
        isRecyclable: editForm.isRecyclable,
        location: selectedEntry.location,
        subCategory: selectedEntry.subCategory
      };

      // First delete the old entry, then add the updated one
      DataManager.deleteEntry(selectedEntry.id);
      DataManager.saveWasteEntry(updatedEntry);

    } else if (entryType === 'landfill') {
      // For landfill entries
      DataManager.updateLandfillEntry(selectedEntry.id, {
        weight: weightInKg,
        notes: editForm.notes,
        collectionDate: new Date(editForm.collectionDate)
      });
      
    } else if (entryType === 'recycling') {
      // For recycling entries
      DataManager.updateRecyclingEntry(selectedEntry.id, {
        weight: weightInKg,
        notes: editForm.notes,
        processingDate: new Date(editForm.processingDate)
      });
    }

    setEditDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedEntry) return;

    if (entryType === 'waste') {
      DataManager.deleteEntry(selectedEntry.id);
    } else if (entryType === 'landfill') {
      DataManager.deleteLandfillEntry(selectedEntry.id);
    } else if (entryType === 'recycling') {
      DataManager.deleteRecyclingEntry(selectedEntry.id);
    }

    setDeleteDialogOpen(false);
    setSelectedEntry(null);
  };

  const recyclingRate = displayData?.realTimeMetrics?.currentRate || 0;
  const trendIcon = displayData?.realTimeMetrics?.trend === 'up' ? <TrendingUp color="success" /> : 
                    displayData?.realTimeMetrics?.trend === 'down' ? <TrendingUp color="error" sx={{ transform: 'rotate(180deg)' }} /> : 
                    null;

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', p: 2 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <RecyclingOutlined sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1, verticalAlign: 'middle' }} />
          Waste Dashboard
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Real-time waste tracking and recycling analytics
        </Typography>
      </Box>

      {/* Alerts */}
      {displayData?.alerts && displayData.alerts.filter(alert => !dismissedAlerts.has(alert.id)).length > 0 && (
        <Box mb={3}>
          {displayData.alerts
            .filter(alert => !dismissedAlerts.has(alert.id))
            .map((alert: AlertType) => (
            <Alert 
              key={alert.id} 
              severity={alert.type} 
              sx={{ mb: 1 }}
              icon={alert.type === 'warning' ? <Warning /> : undefined}
              onClose={() => handleDismissAlert(alert.id)}
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} lg={2.4}>
          <Card sx={{ bgcolor: '#3776A9', color: 'white', height: '100%', minHeight: { xs: '140px', sm: '160px' } }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Today's Recycled
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {formatWeight(displayData?.realTimeMetrics?.todayRecycled || 0, units)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {trendIcon}
                <Typography variant="body2" ml={1}>
                  vs yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.4}>
          <Card sx={{ bgcolor: '#05C793', color: 'white', height: '100%', minHeight: { xs: '140px', sm: '160px' } }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Total Recycled
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {formatWeight(displayData?.realTimeMetrics?.allTimeRecyclingTotal || 0, units)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  all-time total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.4}>
          <Card sx={{ bgcolor: '#087E8B', color: 'white', height: '100%', minHeight: { xs: '140px', sm: '160px' } }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recycling Rate
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {recyclingRate.toFixed(1)}%
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  vs yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.4}>
          <Card sx={{ bgcolor: '#3776A9', color: 'white', height: '100%', minHeight: { xs: '140px', sm: '160px' } }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Total Processed
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {formatWeight((displayData?.realTimeMetrics?.todayRecycled || 0) + (displayData?.realTimeMetrics?.todayWaste || 0), units)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  vs yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={2.4}>
          <Card sx={{ bgcolor: '#F8121D', color: 'white', height: '100%', minHeight: { xs: '140px', sm: '160px' } }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Total Waste
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {formatWeight(displayData?.realTimeMetrics?.allTimeLandfillTotal || 0, units)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  all-time total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Data Analytics
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {(!displayData?.wasteEntries || displayData.wasteEntries.length === 0) && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                DataManager.createSampleData();
                // Force refresh after creating sample data
                window.location.reload();
              }}
            >
              Create Sample Data
            </Button>
          )}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="time-range-select-label">Time Period</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRange}
              label="Time Period"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="today">24 Hours</MenuItem>
              <MenuItem value="3days">3 Days</MenuItem>
              <MenuItem value="week">7 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Waste Processing Actions Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <WasteSentToLandfillCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <WasteRecycledCard />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Historical Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Historical Trends ({timeRange === 'today' ? 'Last 24 Hours' : timeRange === '3days' ? 'Last 3 Days' : 'Last 7 Days'})
            </Typography>
            <Box sx={{ 
              height: 420, 
              width: '100%', 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}>
              <LineChart
                width={Math.max(600, (displayData?.historicalData?.length || 10) * (timeRange === 'today' ? 25 : timeRange === '3days' ? 80 : 60))}
                height={400}
                series={[
                  {
                    data: displayData?.historicalData?.map((d: HistoricalDataPoint) => d.recycled) || [],
                    label: `Recyclable Materials (${units})`,
                    color: '#4CAF50'
                  },
                  {
                    data: displayData?.historicalData?.map((d: HistoricalDataPoint) => d.waste) || [],
                    label: `Non-Recyclable Waste (${units})`,
                    color: '#FF7043'
                  }
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: formatChartLabels(displayData?.historicalData || [], timeRange)
                }]}
                margin={{ left: 60, right: 30, top: 40, bottom: 60 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 500, overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <Box sx={{ height: 420, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <PieChart
                series={[
                  {
                    data: displayData?.categoryTotals ? (() => {
                      console.log('Pie Chart Debug - displayData exists:', !!displayData);
                      console.log('Pie Chart Debug - categoryTotals:', displayData.categoryTotals);
                      console.log('Pie Chart Debug - wasteEntries length:', displayData.wasteEntries?.length || 0);
                      
                      const groupedData = {
                        'Plastics': 0,
                        'Metals': 0,
                        'Paper': 0,
                        'Glass': 0,
                        'Non-Recyclables': 0
                      };

                      const plasticCategories = ['pet', 'hdpe', 'ldpe', 'pp', 'ps'];
                      const metalCategories = ['tin', 'aluminum', 'copper'];
                      const paperCategories = ['cardboard'];
                      const glassCategories = ['glass'];
                      const nonRecyclableCategories = ['non-recyclable'];
                      
                      Object.entries(displayData.categoryTotals).forEach(([category, weight]) => {
                        const weightNum = weight as number;
                        console.log(`Processing category: ${category}, weight: ${weightNum}`);
                        
                        if (plasticCategories.includes(category)) {
                          groupedData['Plastics'] += weightNum;
                          console.log(`Added ${weightNum} to Plastics, total now: ${groupedData['Plastics']}`);
                        } else if (metalCategories.includes(category)) {
                          groupedData['Metals'] += weightNum;
                          console.log(`Added ${weightNum} to Metals, total now: ${groupedData['Metals']}`);
                        } else if (paperCategories.includes(category)) {
                          groupedData['Paper'] += weightNum;
                          console.log(`Added ${weightNum} to Paper, total now: ${groupedData['Paper']}`);
                        } else if (glassCategories.includes(category)) {
                          groupedData['Glass'] += weightNum;
                          console.log(`Added ${weightNum} to Glass, total now: ${groupedData['Glass']}`);
                        } else if (nonRecyclableCategories.includes(category)) {
                          groupedData['Non-Recyclables'] += weightNum;
                          console.log(`Added ${weightNum} to Non-Recyclables, total now: ${groupedData['Non-Recyclables']}`);
                        }
                      });

                      console.log('Final groupedData:', groupedData);

                      const colors = {
                        'Plastics': '#2196F3',
                        'Metals': '#9C27B0', 
                        'Paper': '#FF9800',
                        'Glass': '#4CAF50',
                        'Non-Recyclables': '#F44336'
                      };

                      const chartData = Object.entries(groupedData)
                        .filter(([_, weight]) => weight > 0)
                        .map(([group, weight], index) => ({
                          id: index,
                          value: weight,
                          label: group,
                          color: colors[group as keyof typeof colors]
                        }));
                      
                      console.log('Pie chart data being returned:', chartData);
                      return chartData;
                    })() : []
                  }
                ]}
                width={320}
                height={400}
                margin={{ top: 20, bottom: 60, left: 20, right: 20 }}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'bottom', horizontal: 'middle' },
                    padding: 0,
                  },
                }}
              />
            </Box>
            
            {/* Category Details */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                Waste Categories Guide:
              </Typography>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
                <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: 'bold', color: 'primary.main' }}>
                  Plastics:
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.3, ml: 1 }}>
                  <strong>PET:</strong> Water bottles, food containers, textiles
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.3, ml: 1 }}>
                  <strong>HDPE:</strong> Milk jugs, detergent bottles, grocery bags
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.3, ml: 1 }}>
                  <strong>LDPE:</strong> Plastic bags, food wraps, squeeze bottles
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.5, ml: 1 }}>
                  <strong>PP:</strong> Yogurt containers, straws, bottle caps
                </Typography>
                
                <Typography variant="caption" display="block" sx={{ mb: 0.3, fontWeight: 'bold', color: 'primary.main' }}>
                  <strong>Other Materials:</strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.2, ml: 1 }}>
                  <strong>Glass:</strong> Bottles, jars, containers
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.2, ml: 1 }}>
                  <strong>Metals:</strong> Aluminum cans, tin containers, copper items
                </Typography>
                <Typography variant="caption" display="block" sx={{ ml: 1 }}>
                  <strong>Paper:</strong> Cardboard boxes, paper packaging
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Data Manager */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Storage sx={{ mr: 1 }} />
              Data Manager
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Recent entries with timestamps and notes
            </Typography>
            
            <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
              <List dense>
                {/* Waste Entries */}
                {displayData?.wasteEntries?.slice(-3).reverse().map((entry) => (
                  <ListItem key={`waste-${entry.id}`} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: entry.isRecyclable ? '#4CAF50' : '#F44336', width: 32, height: 32 }}>
                        <Category sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="bold">
                            {entry.category.toUpperCase()} - {formatWeight(entry.weight, units)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              label={entry.isRecyclable ? 'Recyclable' : 'Non-Recyclable'} 
                              size="small" 
                              color={entry.isRecyclable ? 'success' : 'error'}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleEditEntry(entry, 'waste')}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEntry(entry, 'waste')}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">
                              {new Date(entry.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                          {entry.notes && (
                            <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                              <StickyNote2 sx={{ fontSize: 14, mr: 0.5 }} />
                              {renderTruncatedNote(entry.notes)}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {/* Landfill Entries */}
                {displayData?.landfillEntries?.slice(-2).reverse().map((entry) => (
                  <ListItem key={`landfill-${entry.id}`} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#FF5722', width: 32, height: 32 }}>
                        <Delete sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="bold">
                            Landfill Disposal - {formatWeight(entry.weight, units)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="Landfill" size="small" color="error" />
                            <IconButton
                              size="small"
                              onClick={() => handleEditEntry(entry, 'landfill')}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEntry(entry, 'landfill')}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">
                              {new Date(entry.collectionDate).toLocaleString()}
                            </Typography>
                          </Box>
                          {entry.notes && (
                            <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                              <StickyNote2 sx={{ fontSize: 14, mr: 0.5 }} />
                              {renderTruncatedNote(entry.notes)}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {/* Recycling Entries */}
                {displayData?.recyclingEntries?.slice(-2).reverse().map((entry) => (
                  <ListItem key={`recycling-${entry.id}`} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32 }}>
                        <Recycling sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="bold">
                            Recycled - {formatWeight(entry.weight, units)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="Processed" size="small" color="success" />
                            <IconButton
                              size="small"
                              onClick={() => handleEditEntry(entry, 'recycling')}
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEntry(entry, 'recycling')}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">
                              {new Date(entry.processingDate).toLocaleString()}
                            </Typography>
                          </Box>
                          {entry.notes && (
                            <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                              <StickyNote2 sx={{ fontSize: 14, mr: 0.5 }} />
                              {renderTruncatedNote(entry.notes)}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}

                {(!displayData?.wasteEntries?.length && !displayData?.landfillEntries?.length && !displayData?.recyclingEntries?.length) && (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" color="textSecondary" textAlign="center">
                          No entries found. Start adding waste data to see activity here.
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Category Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Category Details
            </Typography>
            <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
              {displayData?.categoryTotals && Object.entries(displayData.categoryTotals).map(([category, weight]: [string, any]) => {
                const getCategoryDescription = (cat: string) => {
                  const descriptions: { [key: string]: string } = {
                    'pet': 'Water bottles, food containers, textiles',
                    'hdpe': 'Milk jugs, detergent bottles, grocery bags',
                    'ldpe': 'Plastic bags, food wraps, squeeze bottles',
                    'pp': 'Yogurt containers, straws, bottle caps',
                    'ps': 'Disposable cups, takeout containers, foam packaging',
                    'cardboard': 'Boxes, paper packaging, corrugated materials',
                    'glass': 'Bottles, jars, containers',
                    'tin': 'Canned goods, food containers',
                    'aluminum': 'Beverage cans, food packaging',
                    'copper': 'Wiring, pipes, electrical components',
                    'non_recyclable': 'Mixed materials, contaminated items'
                  };
                  return descriptions[cat] || '';
                };

                return (
                  <Box key={category} display="flex" justifyContent="space-between" alignItems="flex-start" py={1}>
                    <Box display="flex" alignItems="flex-start" flex={1}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          bgcolor: categoryColors[category as WasteCategory],
                          borderRadius: 1,
                          mr: 2,
                          mt: 0.2
                        }} 
                      />
                      <Box flex={1}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.2 }}>
                          {(() => {
                            const plasticAcronyms = ['pet', 'hdpe', 'ldpe', 'pp', 'ps'];
                            const categoryName = category.replace('_', ' ');
                            return plasticAcronyms.includes(category) 
                              ? categoryName.toUpperCase() 
                              : categoryName.replace(/\b\w/g, (l: string) => l.toUpperCase());
                          })()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                          {getCategoryDescription(category)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight="bold" sx={{ ml: 2, minWidth: 'fit-content' }}>
                      {formatWeight((weight as number) || 0, units)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {entryType === 'waste' ? 'Waste' : entryType === 'landfill' ? 'Landfill' : 'Recycling'} Entry
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {entryType === 'waste' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    label="Category"
                  >
                    {Object.values(WasteCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.isRecyclable || false}
                      onChange={(e) => setEditForm({ ...editForm, isRecyclable: e.target.checked })}
                    />
                  }
                  label="Recyclable"
                />
              </>
            )}
            
            {(entryType === 'landfill' || entryType === 'recycling') && (
              <TextField
                label={entryType === 'landfill' ? 'Collection Date' : 'Processing Date'}
                type="datetime-local"
                value={entryType === 'landfill' ? editForm.collectionDate || '' : editForm.processingDate || ''}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  [entryType === 'landfill' ? 'collectionDate' : 'processingDate']: e.target.value 
                })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}

            <TextField
              label="Weight"
              type="number"
              value={editForm.weight || ''}
              onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
              fullWidth
              inputProps={{ step: 0.1, min: 0 }}
              helperText={`Weight in ${units}`}
            />
            
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              fullWidth
              placeholder="Optional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Entry</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {entryType} entry? This action cannot be undone.
            {selectedEntry && (
              <>
                <br /><br />
                <strong>Entry Details:</strong>
                <br />Weight: {formatWeight(selectedEntry.weight || 0, units)}
                {selectedEntry.notes && <><br />Notes: {selectedEntry.notes}</>}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;