import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Delete, DeleteForever } from '@mui/icons-material';
import { DataManager } from '../services/dataManager';
import { formatWeight } from '../utils/weightConverter';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const WasteSentToLandfillCard: React.FC = () => {
  const { units } = useCustomTheme();
  const { triggerRefresh } = useDataRefresh();

  const pendingWeight = DataManager.getPendingLandfillWeight();
  const allTimeTotal = DataManager.getAllTimeLandfillTotal();

  const handleSendToLandfill = () => {
    if (pendingWeight > 0) {
      // Send all pending non-recyclable waste to landfill
      DataManager.saveLandfillEntry({
        userId: 'user1',
        weight: pendingWeight,
        timestamp: new Date(),
        collectionDate: new Date(),
        notes: 'Automatic disposal of all non-recyclable waste'
      });
      
      // Trigger refresh to update UI
      triggerRefresh();
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DeleteForever sx={{ fontSize: 40, mr: 1, opacity: 0.9 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Waste Sent to Landfill
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              All-Time Total Sent
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              {formatWeight(allTimeTotal, units)}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Pending Non-Recyclable Waste
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {formatWeight(pendingWeight, units)}
            </Typography>
          </Box>

          <Box>
            {pendingWeight > 0 ? (
              <Button
                variant="contained"
                onClick={handleSendToLandfill}
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
                Record Landfill Disposal
              </Button>
            ) : (
              <Alert severity="success" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: 'white' }}>
                <Typography variant="body2">
                  No non-recyclable waste pending disposal
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WasteSentToLandfillCard;