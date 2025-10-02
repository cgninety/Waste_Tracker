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
  SelectChangeEvent
} from '@mui/material';
import { 
  RecyclingOutlined,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { DashboardData, WasteCategory, HistoricalDataPoint, Alert as AlertType } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { DataManager, TimeRange } from '../services/dataManager';
import { formatWeight } from '../utils/weightConverter';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import WasteSentToLandfillCard from './WasteSentToLandfillCard';
import WasteRecycledCard from './WasteRecycledCard';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [timeRange, setTimeRange] = useState<'today' | '3days' | 'week'>('week');
  const [filteredData, setFilteredData] = useState<DashboardData | null>(null);
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
      {displayData?.alerts && displayData.alerts.length > 0 && (
        <Box mb={3}>
          {displayData.alerts.map((alert: AlertType) => (
            <Alert 
              key={alert.id} 
              severity={alert.type} 
              sx={{ mb: 1 }}
              icon={alert.type === 'warning' ? <Warning /> : undefined}
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
                {formatWeight(displayData?.realTimeMetrics?.monthlyLandfillTotal || 0, units)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2">
                  environmental impact
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
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="time-range-select-label">Time Period</InputLabel>
          <Select
            labelId="time-range-select-label"
            id="time-range-select"
            value={timeRange}
            label="Time Period"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
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
              Historical Trends ({timeRange})
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
                width={Math.max(800, (displayData?.historicalData?.length || 10) * 40)}
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
                  data: displayData?.historicalData?.map((d: HistoricalDataPoint) => d.date.split('-').slice(1).join('/')) || []
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
                      console.log('SCADA Pie Chart Debug - categoryTotals:', displayData.categoryTotals);
                      
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
                        
                        if (plasticCategories.includes(category)) {
                          groupedData['Plastics'] += weightNum;
                        } else if (metalCategories.includes(category)) {
                          groupedData['Metals'] += weightNum;
                        } else if (paperCategories.includes(category)) {
                          groupedData['Paper'] += weightNum;
                        } else if (glassCategories.includes(category)) {
                          groupedData['Glass'] += weightNum;
                        } else if (nonRecyclableCategories.includes(category)) {
                          groupedData['Non-Recyclables'] += weightNum;
                        }
                      });

                      const colors = {
                        'Plastics': '#2196F3',
                        'Metals': '#9C27B0', 
                        'Paper': '#FF9800',
                        'Glass': '#4CAF50',
                        'Non-Recyclables': '#F44336'
                      };

                      return Object.entries(groupedData)
                        .filter(([_, weight]) => weight > 0)
                        .map(([group, weight], index) => ({
                          id: index,
                          value: weight,
                          label: group,
                          color: colors[group as keyof typeof colors]
                        }));
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
          </Paper>
        </Grid>

        {/* Real-time Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Real-time Processing
            </Typography>
            <BarChart
              series={[
                {
                  data: [data.realTimeMetrics?.todayRecycled || 0],
                  label: 'Recycled',
                  color: '#4CAF50'
                },
                {
                  data: [displayData?.realTimeMetrics?.allTimeRecyclingTotal || 0],
                  label: 'Total Recycled',
                  color: '#F44336'
                }
              ]}
              width={400}
              height={220}
              xAxis={[{
                scaleType: 'band',
                data: ['Today\'s Progress']
              }]}
            />
          </Paper>
        </Grid>

        {/* Category Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Category Details
            </Typography>
            <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
              {displayData?.categoryTotals && Object.entries(displayData.categoryTotals).map(([category, weight]: [string, any]) => (
                <Box key={category} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Box display="flex" alignItems="center">
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        bgcolor: categoryColors[category as WasteCategory],
                        borderRadius: 1,
                        mr: 2 
                      }} 
                    />
                    <Typography variant="body1">
                      {category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {formatWeight((weight as number) || 0, units)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;