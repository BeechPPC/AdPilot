import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
  Paper,
  Button,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  StorefrontOutlined,
  TrackChangesOutlined,
  LabelOutlined,
  ShoppingCartOutlined,
  AttachMoneyOutlined,
  LinkOutlined,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { settingsApi, authApi, AccountSettings } from '../services/api';
import SettingsSkeleton from '../components/SettingsSkeleton';

const CONVERSION_OPTIONS = ['Purchases', 'Form submissions', 'Phone calls', 'Bookings'];

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  tooltip: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, tooltip, children }) => (
  <Tooltip title={tooltip} arrow placement="top" enterDelay={400}>
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}20, 0 4px 12px ${theme.palette.primary.main}10`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 1.5,
          bgcolor: 'primary.main',
          color: 'white',
          flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</Typography>
      </Box>
      {children}
    </Paper>
  </Tooltip>
);

const Settings: React.FC = () => {
  const { connected, accounts, activeAccountId, disconnect } = useGoogleAds();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<AccountSettings>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch {
      // Settings not yet saved
    } finally {
      setLoading(false);
      loaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (connected) loadSettings();
  }, [connected, loadSettings]);

  useEffect(() => {
    if (!loaded.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await settingsApi.save(settings);
        setSnackbar({ open: true, message: 'Saved', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Failed to save', severity: 'error' });
      }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [settings]);

  const handleConversionToggle = (type: string) => {
    const current = settings.conversionTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setSettings({ ...settings, conversionTypes: updated });
  };

  const handleConnect = async () => {
    try {
      const { url } = await authApi.getUrl();
      window.location.href = url;
    } catch { /* */ }
  };

  const handleDisconnect = async () => {
    try { await disconnect(); } catch { /* */ }
  };

  const valueLabel = settings.businessType === 'ecommerce' ? 'Average order value' : 'Lead value';
  const valueField = settings.businessType === 'ecommerce' ? 'averageOrderValue' : 'leadValue';
  const activeAccount = accounts.find((a) => a.id === activeAccountId);

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 1000,
      mx: 'auto',
      px: { xs: 2, sm: 3 },
      py: 2,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <IconButton
          onClick={() => navigate('/')}
          size="small"
          sx={{
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
      </Box>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          flex: 1,
          alignContent: 'start',
        }}>
          {/* Business Type */}
          <SectionCard icon={<StorefrontOutlined sx={{ fontSize: 16 }} />} title="Business Type" tooltip="Tells the AI whether to focus on ROAS, CPA, or local metrics">
            <FormControl fullWidth size="small">
              <InputLabel>Select type</InputLabel>
              <Select
                value={settings.businessType || ''}
                label="Select type"
                onChange={(e) => setSettings({ ...settings, businessType: e.target.value as AccountSettings['businessType'] })}
              >
                <MenuItem value="ecommerce">E-commerce</MenuItem>
                <MenuItem value="lead_generation">Lead Generation</MenuItem>
                <MenuItem value="local_services">Local Services</MenuItem>
              </Select>
            </FormControl>
          </SectionCard>

          {/* Performance Goal */}
          <SectionCard icon={<TrackChangesOutlined sx={{ fontSize: 16 }} />} title="Performance Goal" tooltip="The AI will compare your actual CPA or ROAS against this target and flag when you're off track">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ToggleButtonGroup
                value={settings.goalType || ''}
                exclusive
                onChange={(_, val) => { if (val) setSettings({ ...settings, goalType: val }); }}
                size="small"
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 500, py: 0.5 },
                  '& .Mui-selected': {
                    bgcolor: 'primary.main', color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ToggleButton value="cpa">CPA</ToggleButton>
                <ToggleButton value="roas">ROAS</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                size="small"
                type="number"
                label={settings.goalType === 'roas' ? 'Target ROAS' : 'Target CPA'}
                placeholder={settings.goalType === 'roas' ? 'e.g. 4' : 'e.g. 30'}
                value={settings.goalTarget ?? ''}
                onChange={(e) => setSettings({ ...settings, goalTarget: e.target.value ? Number(e.target.value) : undefined })}
                InputProps={{
                  startAdornment: settings.goalType !== 'roas' ? <InputAdornment position="start">$</InputAdornment> : undefined,
                  endAdornment: settings.goalType === 'roas' ? <InputAdornment position="end">x</InputAdornment> : undefined,
                }}
                fullWidth
              />
            </Box>
          </SectionCard>

          {/* Brand & Industry */}
          <SectionCard icon={<LabelOutlined sx={{ fontSize: 16 }} />} title="Brand & Industry" tooltip="Brand name helps identify branded vs non-branded search terms. Industry gives benchmark context.">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                size="small"
                label="Brand name"
                placeholder="e.g. Acme Widgets"
                value={settings.brandName || ''}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                label="Industry"
                placeholder="e.g. SaaS, Dental, HVAC"
                value={settings.industry || ''}
                onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                fullWidth
              />
            </Box>
          </SectionCard>

          {/* Conversion Types */}
          <SectionCard icon={<ShoppingCartOutlined sx={{ fontSize: 16 }} />} title="Conversions" tooltip="What counts as a conversion — helps the AI understand which actions matter to your business">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {CONVERSION_OPTIONS.map((type) => {
                const selected = (settings.conversionTypes || []).includes(type);
                return (
                  <Chip
                    key={type}
                    label={type}
                    size="small"
                    onClick={() => handleConversionToggle(type)}
                    variant={selected ? 'filled' : 'outlined'}
                    color={selected ? 'primary' : 'default'}
                    sx={{ fontWeight: selected ? 600 : 400, borderRadius: 1.5 }}
                  />
                );
              })}
            </Box>
          </SectionCard>

          {/* Financial Details */}
          <SectionCard icon={<AttachMoneyOutlined sx={{ fontSize: 16 }} />} title="Financials" tooltip="Helps calculate true ROI, breakeven ROAS, and identify wasted spend relative to your margins">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                size="small"
                label={valueLabel}
                type="number"
                placeholder="e.g. 150"
                value={settings[valueField as keyof AccountSettings] ?? ''}
                onChange={(e) => setSettings({ ...settings, [valueField]: e.target.value ? Number(e.target.value) : undefined })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="Margin"
                  type="number"
                  placeholder="40"
                  value={settings.profitMargin ?? ''}
                  onChange={(e) => setSettings({ ...settings, profitMargin: e.target.value ? Number(e.target.value) : undefined })}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Monthly budget"
                  type="number"
                  placeholder="5000"
                  value={settings.monthlyBudget ?? ''}
                  onChange={(e) => setSettings({ ...settings, monthlyBudget: e.target.value ? Number(e.target.value) : undefined })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </SectionCard>

          {/* Google Ads Connection */}
          <SectionCard icon={<LinkOutlined sx={{ fontSize: 16 }} />} title="Google Ads" tooltip="Connect your Google Ads account so the AI can access your live campaign data">
            {connected ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {activeAccount && (
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <CheckCircle color="success" sx={{ fontSize: 18 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {activeAccount.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Button size="small" variant="outlined" color="error" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Connect to see campaigns and get AI advice.
                </Typography>
                <Button variant="contained" size="small" onClick={handleConnect}>
                  Connect Google Ads
                </Button>
              </Box>
            )}
          </SectionCard>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
