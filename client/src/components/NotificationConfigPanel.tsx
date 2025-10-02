import React, { useState, useEffect } from 'react';
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
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert as MuiAlert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ExpandMore,
  Edit,
  Delete,
  Add,
  Save,
  Cancel,
  VolumeUp,
  Email,
  Warning,
  Info,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { NotificationManager, AlertRule, AlertConfiguration } from '../services/NotificationManager';

interface NotificationConfigProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationConfigPanel: React.FC<NotificationConfigProps> = ({ open, onClose }) => {
  const [config, setConfig] = useState<AlertConfiguration>(NotificationManager.getDefaultConfiguration());
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testAlert, setTestAlert] = useState<string>('');

  useEffect(() => {
    const loadedConfig = NotificationManager.getConfiguration();
    setConfig(loadedConfig);
  }, []);

  const handleSaveConfig = () => {
    NotificationManager.saveConfiguration(config);
    onClose();
  };

  const handleGlobalSettingChange = (setting: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        [setting]: value
      }
    }));
  };

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      )
    }));
  };

  const handleRuleEdit = (rule: AlertRule) => {
    setEditingRule({ ...rule });
  };

  const handleRuleSave = () => {
    if (!editingRule) return;
    
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === editingRule.id ? editingRule : rule
      )
    }));
    setEditingRule(null);
  };

  const handleRuleDelete = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this alert rule?')) {
      setConfig(prev => ({
        ...prev,
        rules: prev.rules.filter(rule => rule.id !== ruleId)
      }));
    }
  };

  const handleAddNewRule = () => {
    const newRule: AlertRule = {
      id: `custom-rule-${Date.now()}`,
      name: 'New Alert Rule',
      description: 'Custom alert rule',
      enabled: true,
      type: 'info',
      trigger: {
        condition: 'daily_total_waste',
        threshold: 50,
        timeframe: 'daily',
        comparison: '>'
      },
      message: {
        template: 'Custom alert: {value} exceeds {threshold}',
        severity: 'medium'
      },
      actions: {
        autoResolve: true,
        cooldownMinutes: 60,
        sendEmail: false,
        playSound: false
      }
    };
    
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    setEditingRule(newRule);
    setShowAddDialog(false);
  };

  const testAlertMessage = (rule: AlertRule) => {
    const sampleValues = {
      value: rule.trigger.threshold + 10,
      threshold: rule.trigger.threshold,
      category: 'plastics'
    };

    // Simple template replacement for preview
    let preview = rule.message.template;
    Object.entries(sampleValues).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });

    setTestAlert(preview);
    setTimeout(() => setTestAlert(''), 3000);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'success': return <CheckCircle color="success" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <NotificationsIcon sx={{ mr: 1 }} />
          Notification Configuration
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          {testAlert && (
            <MuiAlert severity="info" sx={{ mb: 2 }}>
              Preview: {testAlert}
            </MuiAlert>
          )}

          {/* Global Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Global Notification Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.globalSettings.enabledAlerts}
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
                        checked={config.globalSettings.soundEnabled}
                        onChange={(e) => handleGlobalSettingChange('soundEnabled', e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <VolumeUp sx={{ mr: 1, fontSize: 16 }} />
                        Sound Alerts
                      </Box>
                    }
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.globalSettings.emailNotifications}
                        onChange={(e) => handleGlobalSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Email sx={{ mr: 1, fontSize: 16 }} />
                        Email Notifications
                      </Box>
                    }
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Alerts Displayed"
                    type="number"
                    size="small"
                    value={config.globalSettings.maxAlertsDisplayed}
                    onChange={(e) => handleGlobalSettingChange('maxAlertsDisplayed', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 20 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Alert Rules */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Alert Rules ({config.rules.filter(r => r.enabled).length} of {config.rules.length} enabled)
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => setShowAddDialog(true)}
                  variant="outlined"
                  size="small"
                >
                  Add Rule
                </Button>
              </Box>

              {config.rules.map((rule, index) => (
                <Accordion key={rule.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={rule.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRuleToggle(rule.id, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label=""
                        sx={{ mr: 2 }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <Box display="flex" alignItems="center" flex={1}>
                        {getAlertIcon(rule.type)}
                        <Typography sx={{ ml: 1, fontWeight: rule.enabled ? 'bold' : 'normal' }}>
                          {rule.name}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={rule.message.severity} 
                          size="small" 
                          color={getSeverityColor(rule.message.severity) as any}
                        />
                        <Chip 
                          label={`${rule.trigger.comparison} ${rule.trigger.threshold}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {rule.description}
                      </Typography>
                      
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleRuleEdit(rule)}
                        >
                          Edit
                        </Button>
                        
                        <Button
                          size="small"
                          onClick={() => testAlertMessage(rule)}
                        >
                          Test
                        </Button>
                        
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleRuleDelete(rule.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                      
                      <Typography variant="caption" display="block" sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        Message: {rule.message.template}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          <Cancel sx={{ mr: 1 }} />
          Cancel
        </Button>
        <Button onClick={handleSaveConfig} variant="contained">
          <Save sx={{ mr: 1 }} />
          Save Configuration
        </Button>
      </DialogActions>

      {/* Edit Rule Dialog */}
      {editingRule && (
        <Dialog open={!!editingRule} onClose={() => setEditingRule(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Alert Rule</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rule Name"
                  fullWidth
                  value={editingRule.name}
                  onChange={(e) => setEditingRule(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Alert Type</InputLabel>
                  <Select
                    value={editingRule.type}
                    onChange={(e) => setEditingRule(prev => prev ? {...prev, type: e.target.value as any} : null)}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule(prev => prev ? {...prev, description: e.target.value} : null)}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={editingRule.trigger.condition}
                    onChange={(e) => setEditingRule(prev => prev ? {
                      ...prev, 
                      trigger: {...prev.trigger, condition: e.target.value}
                    } : null)}
                  >
                    <MenuItem value="daily_total_waste">Daily Total Waste</MenuItem>
                    <MenuItem value="recycling_rate">Recycling Rate</MenuItem>
                    <MenuItem value="category_weight">Category Weight</MenuItem>
                    <MenuItem value="monthly_recycling_progress">Monthly Progress</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Comparison</InputLabel>
                  <Select
                    value={editingRule.trigger.comparison}
                    onChange={(e) => setEditingRule(prev => prev ? {
                      ...prev,
                      trigger: {...prev.trigger, comparison: e.target.value as any}
                    } : null)}
                  >
                    <MenuItem value=">">Greater than (&gt;)</MenuItem>
                    <MenuItem value="<">Less than (&lt;)</MenuItem>
                    <MenuItem value=">=">Greater or equal (&gt;=)</MenuItem>
                    <MenuItem value="<=">Less or equal (&lt;=)</MenuItem>
                    <MenuItem value="==">Equal (==)</MenuItem>
                    <MenuItem value="!=">Not equal (!=)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Threshold"
                  type="number"
                  fullWidth
                  value={editingRule.trigger.threshold}
                  onChange={(e) => setEditingRule(prev => prev ? {
                    ...prev,
                    trigger: {...prev.trigger, threshold: parseFloat(e.target.value)}
                  } : null)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Message Template"
                  fullWidth
                  multiline
                  rows={2}
                  value={editingRule.message.template}
                  onChange={(e) => setEditingRule(prev => prev ? {
                    ...prev,
                    message: {...prev.message, template: e.target.value}
                  } : null)}
                  helperText="Use {value}, {threshold}, {category} as placeholders"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={editingRule.message.severity}
                    onChange={(e) => setEditingRule(prev => prev ? {
                      ...prev,
                      message: {...prev.message, severity: e.target.value as any}
                    } : null)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cooldown (minutes)"
                  type="number"
                  fullWidth
                  value={editingRule.actions?.cooldownMinutes || 60}
                  onChange={(e) => setEditingRule(prev => prev ? {
                    ...prev,
                    actions: {...prev.actions, cooldownMinutes: parseInt(e.target.value)}
                  } : null)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingRule(null)}>Cancel</Button>
            <Button onClick={handleRuleSave} variant="contained">Save Rule</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Rule Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Add New Alert Rule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Create a new custom alert rule with your specific conditions and thresholds.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNewRule} variant="contained">Create Rule</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default NotificationConfigPanel;