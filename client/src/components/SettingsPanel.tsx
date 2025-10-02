import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode,
  LightMode,
  DeleteForever,
  Refresh,
  Delete,
  DateRange,
  Category,
  Notifications,
  Tune,
  ExpandMore,
  Save,
  RestoreFromTrash,
  Info,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useDataRefresh } from '../contexts/DataRefreshContext';
import { DataManager, DataFilter } from '../services/dataManager';
import { WasteCategory } from '../types';
import NotificationConfigPanel from './NotificationConfigPanel';

const SettingsPanel: React.FC = () => {
  const { mode, toggleTheme, units, toggleUnits } = useTheme();
  const { triggerRefresh } = useDataRefresh();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Notification settings state
  const [notificationConfig, setNotificationConfig] = useState(() => {
    const stored = localStorage.getItem('notification-config');
    return stored ? JSON.parse(stored) : {
      globalSettings: {
        enabledAlerts: true,
        soundEnabled: false,
        emailNotifications: false,
        maxAlertsDisplayed: 5,
        autoResolveAfterMinutes: 30
      },
      rules: [
        {
          id: 'high_waste_volume',
          name: 'High Waste Volume Alert',
          description: 'Triggers when daily total waste exceeds threshold',
          enabled: true,
          type: 'warning',
          trigger: { condition: 'daily_total_waste', threshold: 1000, comparison: '>' },
          message: { template: 'High waste volume detected: {value}kg (threshold: {threshold}kg)', severity: 'medium' }
        },
        {
          id: 'low_recycling_rate',
          name: 'Low Recycling Rate Alert',
          description: 'Triggers when recycling rate falls below target',
          enabled: true,
          type: 'error',
          trigger: { condition: 'recycling_rate', threshold: 30, comparison: '<' },
          message: { template: 'Recycling rate is {value}% (target: >{threshold}%)', severity: 'high' }
        },
        {
          id: 'container_capacity',
          name: 'Container Capacity Alert',
          description: 'Triggers when any category exceeds capacity limit',
          enabled: true,
          type: 'warning',
          trigger: { condition: 'category_weight', threshold: 80, comparison: '>' },
          message: { template: '{category} container at {value}% capacity', severity: 'medium' }
        }
      ]
    };
  });
  const [expandedRule, setExpandedRule] = useState<string | false>(false);
  const [clearType, setClearType] = useState<'all'>('all');

  const handleClearAllData = () => {
    DataManager.clearAllData();
    setClearDialogOpen(false);
  };

  const handleRefreshData = () => {
    DataManager.updateDashboardData();
  };

  const openClearDialog = (type: 'all') => {
    setClearType(type);
    setClearDialogOpen(true);
  };

  // Notification settings handlers
  const handleGlobalSettingChange = (setting: string, value: any) => {
    const newConfig = {
      ...notificationConfig,
      globalSettings: {
        ...notificationConfig.globalSettings,
        [setting]: value
      }
    };
    setNotificationConfig(newConfig);
    localStorage.setItem('notification-config', JSON.stringify(newConfig));
  };

  const handleRuleChange = (ruleId: string, field: string, value: any) => {
    const newConfig = {
      ...notificationConfig,
      rules: notificationConfig.rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, [field]: value }
          : rule
      )
    };
    setNotificationConfig(newConfig);
    localStorage.setItem('notification-config', JSON.stringify(newConfig));
  };

  const handleRuleTriggerChange = (ruleId: string, field: string, value: any) => {
    const newConfig = {
      ...notificationConfig,
      rules: notificationConfig.rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, trigger: { ...rule.trigger, [field]: value } }
          : rule
      )
    };
    setNotificationConfig(newConfig);
    localStorage.setItem('notification-config', JSON.stringify(newConfig));
  };

  const resetNotificationSettings = () => {
    const defaultConfig = {
      globalSettings: {
        enabledAlerts: true,
        soundEnabled: false,
        emailNotifications: false,
        maxAlertsDisplayed: 5,
        autoResolveAfterMinutes: 30
      },
      rules: notificationConfig.rules.map(rule => ({
        ...rule,
        enabled: true,
        trigger: { ...rule.trigger, threshold: rule.id === 'high_waste_volume' ? 1000 : rule.id === 'low_recycling_rate' ? 30 : 80 }
      }))
    };
    setNotificationConfig(defaultConfig);
    localStorage.setItem('notification-config', JSON.stringify(defaultConfig));
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Settings
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab icon={<Tune />} label="General" />
              <Tab icon={<Notifications />} label="Notifications" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <>
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleTheme}
                      icon={<LightMode sx={{ color: '#FFD700' }} />}
                      checkedIcon={<DarkMode sx={{ color: '#FFFFFF' }} />}
                    />
                  }
                  label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
                />
              </Box>

              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={units === 'lb'}
                      onChange={toggleUnits}
                    />
                  }
                  label={`Units: ${units.toUpperCase()}`}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Toggle between kilograms and pounds
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Data Management
              </Typography>

              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  startIcon={<Refresh />}
                  onClick={handleRefreshData}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  Refresh Dashboard
                </Button>

                <Button
                  startIcon={<DeleteForever />}
                  onClick={() => openClearDialog('all')}
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                >
                  Clear All Data
                </Button>
              </Box>

              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                Dashboard updates every hour automatically
              </Typography>
            </>
          )}

          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Notification Settings
                </Typography>
                <Button
                  startIcon={<RestoreFromTrash />}
                  onClick={resetNotificationSettings}
                  size="small"
                  variant="outlined"
                >
                  Reset to Defaults
                </Button>
              </Box>

              {/* Global Settings */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Global Settings
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationConfig.globalSettings.enabledAlerts}
                            onChange={(e) => handleGlobalSettingChange('enabledAlerts', e.target.checked)}
                          />
                        }
                        label="Enable Notifications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationConfig.globalSettings.soundEnabled}
                            onChange={(e) => handleGlobalSettingChange('soundEnabled', e.target.checked)}
                          />
                        }
                        label="Sound Alerts"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationConfig.globalSettings.emailNotifications}
                            onChange={(e) => handleGlobalSettingChange('emailNotifications', e.target.checked)}
                          />
                        }
                        label="Email Notifications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Max Alerts Displayed: {notificationConfig.globalSettings.maxAlertsDisplayed}
                        </Typography>
                        <Slider
                          value={notificationConfig.globalSettings.maxAlertsDisplayed}
                          onChange={(_, value) => handleGlobalSettingChange('maxAlertsDisplayed', value)}
                          min={1}
                          max={20}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Alert Rules */}
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ mr: 1 }} />
                Alert Rules
              </Typography>
              
              {notificationConfig.rules.map((rule) => (
                <Accordion
                  key={rule.id}
                  expanded={expandedRule === rule.id}
                  onChange={(_, isExpanded) => setExpandedRule(isExpanded ? rule.id : false)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRuleChange(rule.id, 'enabled', e.target.checked);
                        }}
                        size="small"
                      />
                      <Typography sx={{ ml: 1, flex: 1 }}>
                        {rule.name}
                      </Typography>
                      <Chip
                        label={rule.type}
                        size="small"
                        color={rule.type === 'error' ? 'error' : rule.type === 'warning' ? 'warning' : 'info'}
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {rule.description}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Threshold"
                          type="number"
                          fullWidth
                          value={rule.trigger.threshold}
                          onChange={(e) => handleRuleTriggerChange(rule.id, 'threshold', Number(e.target.value))}
                          size="small"
                          helperText={`Current: ${rule.trigger.comparison} ${rule.trigger.threshold}`}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Comparison</InputLabel>
                          <Select
                            value={rule.trigger.comparison}
                            onChange={(e) => handleRuleTriggerChange(rule.id, 'comparison', e.target.value)}
                            label="Comparison"
                          >
                            <MenuItem value=">">Greater than (&gt;)</MenuItem>
                            <MenuItem value="<">Less than (&lt;)</MenuItem>
                            <MenuItem value=">=">Greater or equal (&gt;=)</MenuItem>
                            <MenuItem value="<=">Less or equal (&lt;=)</MenuItem>
                            <MenuItem value="==">Equal (==)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Alert Message Template"
                          fullWidth
                          value={rule.message.template}
                          onChange={(e) => handleRuleChange(rule.id, 'message', { ...rule.message, template: e.target.value })}
                          size="small"
                          helperText="Use {value}, {threshold}, {category} as placeholders"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Alert severity={rule.type as any} sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Preview:</strong> {rule.message.template.replace('{value}', '42').replace('{threshold}', rule.trigger.threshold.toString()).replace('{category}', 'Plastic')}
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Notification settings are saved automatically. Changes take effect immediately.
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        aria-labelledby="clear-dialog-title"
      >
        <DialogTitle id="clear-dialog-title">
          Clear All Waste Data
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear ALL waste tracking data? This will remove:
            <br />• All waste entries
            <br />• Historical data
            <br />• Statistics and progress
            <br />• Dashboard metrics
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearAllData}
            color="error" 
            variant="contained"
          >
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsPanel;