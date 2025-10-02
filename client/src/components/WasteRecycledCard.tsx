import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Recycling } from '@mui/icons-material';
import { DataManager } from '../services/dataManager';
import { formatWeight } from '../utils/weightConverter';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const WasteRecycledCard: React.FC = () => {
  const { units } = useCustomTheme();
  const { triggerRefresh } = useDataRefresh();

  const pendingWeight = DataManager.getPendingRecyclingWeight();
  const allTimeTotal = DataManager.getAllTimeRecyclingTotal();

  const handleSendToRecycling = () => {
    if (pendingWeight > 0) {
      // Send all pending recyclable waste to recycling
      DataManager.saveRecyclingEntry({
        userId: 'user1',
        weight: pendingWeight,
        timestamp: new Date(),
        processingDate: new Date(),
        notes: 'Automatic processing of all recyclable waste'
      });
      
      // Trigger refresh to update UI
      triggerRefresh();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Recycling sx={{ fontSize: 40, mr: 1, opacity: 0.9 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Waste Recycled
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              All-Time Total Recycled
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {formatWeight(allTimeTotal, units)}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Pending Recyclable Waste
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {formatWeight(pendingWeight, units)}
            </Typography>
          </Box>

          <Box>
            {pendingWeight > 0 ? (
              <Button
                variant="contained"
                onClick={handleSendToRecycling}
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  fontWeight: 'bold'
                }}
              >
                Record Waste Recycled
              </Button>
            ) : (
              <Alert severity="success" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: 'white' }}>
                <Typography variant="body2">
                  No recyclable waste pending processing
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WasteRecycledCard;