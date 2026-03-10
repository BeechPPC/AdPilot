import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';

interface GoogleAdsConnectProps {
  /** If true, redirect to onboarding after successful callback */
  onboardAfterConnect?: boolean;
}

const GoogleAdsConnect: React.FC<GoogleAdsConnectProps> = ({ onboardAfterConnect }) => {
  const navigate = useNavigate();
  const { connected, loading: ctxLoading, refresh, disconnect } = useGoogleAds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackHandled = useRef(false);

  useEffect(() => {
    if (callbackHandled.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const oauthError = urlParams.get('error');

    if (oauthError) {
      setError(`Google authorization failed: ${oauthError}`);
      return;
    }

    if (code) {
      callbackHandled.current = true;
      // Remove code from URL immediately to prevent reuse on re-renders
      window.history.replaceState({}, document.title, window.location.pathname);
      handleOAuthCallback(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      await authApi.callback(code);
      await refresh();
      if (onboardAfterConnect) {
        navigate('/welcome');
      } else {
        window.history.replaceState({}, document.title, '/');
      }
    } catch {
      setError('Failed to connect to Google Ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    try {
      const { url } = await authApi.getUrl();
      window.location.href = url;
    } catch {
      setError('Failed to start Google Ads authorization. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch {
      setError('Failed to disconnect. Please try again.');
    }
  };

  if (ctxLoading || loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>{loading ? 'Connecting...' : 'Checking connection...'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Google Ads Connection</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {connected ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>Connected to Google Ads</Alert>
          <Button variant="outlined" color="error" onClick={handleDisconnect}>
            Disconnect Account
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your Google Ads account to see your campaigns, performance data, and get suggestions to improve your results.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleConnect} size="large">
            Connect Google Ads Account
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GoogleAdsConnect;
