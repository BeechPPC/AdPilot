import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Stepper, Step, StepLabel,
  CircularProgress, Alert, FormControl, Select, MenuItem,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGoogleAds } from '../context/GoogleAdsContext';
import HealthScore from '../components/HealthScore';
import { googleAdsApi, HealthScore as HealthScoreData } from '../services/api';

const steps = ['Connect Account', 'Select Account', 'See Your Score'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { connected, accounts, activeAccountId, selectAccount, loading: ctxLoading } = useGoogleAds();
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Determine current step
  let activeStep = 0;
  if (connected) activeStep = 1;
  if (connected && activeAccountId) activeStep = 2;

  // Load health score when account is selected
  useEffect(() => {
    if (!activeAccountId) return;
    setLoadingHealth(true);
    googleAdsApi.health()
      .then(setHealthData)
      .catch(() => {})
      .finally(() => setLoadingHealth(false));
  }, [activeAccountId]);

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700 }}>
        Welcome to AdPilot
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Let's get your Google Ads account set up in a few quick steps.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Already connected (they came from OAuth callback) */}
      {activeStep >= 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckIcon color="success" />
            <Typography variant="h6">Google Ads Connected</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your Google Ads account is linked. Your data is private and secure.
          </Typography>
        </Paper>
      )}

      {/* Step 2: Select account */}
      {activeStep === 1 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Which account do you want to manage?</Typography>
          {accounts.length === 0 ? (
            <Alert severity="warning">
              No Google Ads accounts found. Make sure you have an active Google Ads account.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {accounts.length === 1
                  ? 'We found your Google Ads account:'
                  : `We found ${accounts.length} accounts. Pick the one you'd like to manage:`}
              </Typography>
              <FormControl fullWidth>
                <Select
                  value=""
                  displayEmpty
                  onChange={(e) => selectAccount(e.target.value as string)}
                >
                  <MenuItem value="" disabled>Choose an account...</MenuItem>
                  {accounts.map((acct) => (
                    <MenuItem key={acct.id} value={acct.id}>{acct.name} ({acct.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Paper>
      )}

      {/* Step 3: Health score */}
      {activeStep === 2 && (
        <>
          {loadingHealth ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Analyzing your account...</Typography>
              </Box>
            </Box>
          ) : healthData ? (
            <>
              <HealthScore data={healthData} />
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {healthData.issues.length > 0
                    ? "We found some things to improve. Let's take a look at your dashboard."
                    : "Your account looks great! Head to the dashboard to explore."}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/')}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Your account is connected and ready to go.
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Onboarding;
