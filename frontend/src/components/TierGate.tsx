import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useTier } from '../context/TierContext';

interface TierGateProps {
  requiredTier: 'advanced';
  children: React.ReactNode;
  featureName?: string;
}

const TierGate: React.FC<TierGateProps> = ({ requiredTier, children, featureName }) => {
  const { isAdvanced, setTier } = useTier();

  if (requiredTier === 'advanced' && !isAdvanced) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', mt: 2 }}>
        <LockIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {featureName || 'This feature'} requires Advanced
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
          Upgrade to AdPilot Advanced to unlock AI-powered features including chat assistance
          and autonomous account optimization.
        </Typography>
        <Button variant="contained" onClick={() => setTier('advanced')}>
          Upgrade to Advanced (Demo)
        </Button>
      </Paper>
    );
  }

  return <>{children}</>;
};

export default TierGate;
