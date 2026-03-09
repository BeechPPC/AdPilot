import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Divider, Paper, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import GoogleAdsConnect from '../components/GoogleAdsConnect';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { useTier } from '../context/TierContext';

const Settings: React.FC = () => {
  const { connected, accounts, activeAccountId } = useGoogleAds();
  const { tier, setTier } = useTier();

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Settings</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Settings</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your Google Ads connection
      </Typography>

      {/* Tier Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6">Plan</Typography>
          <Chip
            label={tier === 'advanced' ? 'Advanced' : 'Pro'}
            color={tier === 'advanced' ? 'primary' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Switch between tiers for demo purposes. In production this would be gated by payment.
        </Typography>
        <ToggleButtonGroup
          value={tier}
          exclusive
          onChange={(_, value) => value && setTier(value)}
          size="small"
        >
          <ToggleButton value="pro">Pro</ToggleButton>
          <ToggleButton value="advanced">Advanced</ToggleButton>
        </ToggleButtonGroup>
        {tier === 'advanced' && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            AI Chat and AutoPilot are unlocked.
          </Typography>
        )}
      </Paper>

      <GoogleAdsConnect />

      {connected && accounts.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>Connected Account</Typography>
            <Typography variant="body2" color="text.secondary">
              Active account: {accounts.find((a) => a.id === activeAccountId)?.name || 'None selected'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} accessible
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Settings;
