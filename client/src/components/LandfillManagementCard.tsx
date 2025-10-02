import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  TextField,
  Alert
} from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import { useDataRefresh } from '../contexts/DataRefreshContext';
import { DataManager } from '../services/dataManager';
import { formatWeight } from '../utils/weightConverter';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const LandfillManagementCard: React.FC = () => {
  const { triggerRefresh } = useDataRefresh();
  const { units } = useCustomTheme();
  const [landfillDialogOpen, setLandfillDialogOpen] = useState(false);
  const [landfillWeight, setLandfillWeight] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const pendingWeight = DataManager.getPendingLandfillWeight();
  const allTimeTotal = DataManager.getAllTimeLandfillTotal();

  const handleSendToLandfill = () => {
    const weight = parseFloat(landfillWeight);
    if (weight > 0 && weight <= pendingWeight) {
      DataManager.saveLandfillEntry({
        userId: 'user1',
        weight: weight,
        timestamp: new Date(),
        collectionDate: new Date(collectionDate),
        notes: notes.trim() || undefined
      });
      
      // Reset form
      setLandfillWeight('');
      setNotes('');
      setCollectionDate(new Date().toISOString().split('T')[0]);
      setLandfillDialogOpen(false);
    }
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <DeleteForever color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Landfill Management
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              All-Time Total to Landfill
            </Typography>
            <Typography variant="h4" color="error.main">
              {formatWeight(allTimeTotal, units)}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Pending for Landfill
            </Typography>
            <Typography variant="h5" color="warning.main">
              {formatWeight(pendingWeight, units)}
            </Typography>
          </Box>

          {pendingWeight > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You have {formatWeight(pendingWeight, units)} of non-recyclable waste ready for landfill disposal.
            </Alert>
          )}

          <Button
            startIcon={<DeleteForever />}
            onClick={() => setLandfillDialogOpen(true)}
            variant="contained"
            color="error"
            size="small"
            fullWidth
            disabled={pendingWeight === 0}
          >
            Record Landfill Disposal
          </Button>

          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Track when non-recyclable waste is taken to landfill
          </Typography>
        </CardContent>
      </Card>

      {/* Landfill Entry Dialog */}
      <Dialog
        open={landfillDialogOpen}
        onClose={() => setLandfillDialogOpen(false)}
        aria-labelledby="landfill-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="landfill-dialog-title">
          Record Landfill Disposal
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Record the amount of non-recyclable waste being sent to the landfill.
            <br />
            Maximum available: {formatWeight(pendingWeight, units)}
          </DialogContentText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label={`Weight (${units})`}
              value={landfillWeight}
              onChange={(e) => setLandfillWeight(e.target.value)}
              inputProps={{
                max: pendingWeight,
                min: 0.1,
                step: 0.1
              }}
              helperText={`Enter amount between 0.1 and ${pendingWeight.toFixed(1)} ${units}`}
            />

            <TextField
              fullWidth
              type="date"
              label="Collection Date"
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="When was this waste collected for landfill disposal?"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Regular garbage collection, contaminated materials..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLandfillDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendToLandfill}
            color="error"
            variant="contained"
            disabled={
              !landfillWeight || 
              parseFloat(landfillWeight) <= 0 || 
              parseFloat(landfillWeight) > pendingWeight ||
              isNaN(parseFloat(landfillWeight))
            }
          >
            Record Disposal
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LandfillManagementCard;