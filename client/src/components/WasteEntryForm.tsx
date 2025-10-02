import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { WasteCategory } from '../types';
import { dashboardService } from '../services/dashboardService';
import { DataManager } from '../services/dataManager';
import { useTheme } from '../contexts/ThemeContext';
import { convertWeightToKg } from '../utils/weightConverter';
import { useDataRefresh } from '../contexts/DataRefreshContext';

const WasteEntryForm: React.FC = () => {
  const { units } = useTheme();
  const { triggerRefresh } = useDataRefresh();
  const [category, setCategory] = useState<WasteCategory | ''>('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !weight) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Convert weight to kg for storage (always store in kg internally)
      const weightInKg = convertWeightToKg(parseFloat(weight), units);
      
      // Add entry to local storage via DataManager
      const entry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'user_1', // Default user for now
        category: category as WasteCategory,
        weight: weightInKg,
        timestamp: new Date(),
        notes,
        isRecyclable: category !== WasteCategory.NON_RECYCLABLE
      };
      
      DataManager.addEntry(entry);
      
      console.log('Added entry:', entry);
      console.log('Entry is recyclable:', entry.isRecyclable);
      
      // Also try to sync with API (fallback if API fails)
      // try {
      //   await dashboardService.addWasteEntry(category as WasteCategory, parseFloat(weight), notes);
      // } catch (apiError) {
      //   console.log('API sync failed, data saved locally:', apiError);
      // }
      
      // Force manual refresh for testing
      console.log('Forcing manual refresh after localStorage save');
      triggerRefresh();
      
      // Reset form
      setCategory('');
      setWeight('');
      setNotes('');
      
      setSnackbar({
        open: true,
        message: 'Waste entry added successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add waste entry',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels = {
    [WasteCategory.PET]: 'PET (Polyethylene Terephthalate)',
    [WasteCategory.HDPE]: 'HDPE (High-Density Polyethylene)', 
    [WasteCategory.LDPE]: 'LDPE (Low-Density Polyethylene)',
    [WasteCategory.PP]: 'PP (Polypropylene)',
    [WasteCategory.PS]: 'PS (Polystyrene)',
    [WasteCategory.CARDBOARD]: 'Cardboard/Paper',
    [WasteCategory.GLASS]: 'Glass',
    [WasteCategory.TIN]: 'Tin',
    [WasteCategory.ALUMINUM]: 'Aluminum',
    [WasteCategory.COPPER]: 'Copper',
    [WasteCategory.NON_RECYCLABLE]: 'Non-Recyclable'
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Waste Entry
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as WasteCategory)}
                label="Category"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label={`Weight (${units})`}
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              inputProps={{ min: 0, step: 0.1 }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Notes (optional)"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WasteEntryForm;