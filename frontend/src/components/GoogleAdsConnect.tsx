import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { googleAdsAuth } from '../services/googleAdsAuth';

const GoogleAdsConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleOAuthCallback(code);
    } else {
      // Check if we have a stored refresh token
      const refreshToken = localStorage.getItem('googleAdsRefreshToken');
      if (refreshToken) {
        setIsConnected(true);
      }
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      await googleAdsAuth.handleCallback(code);
      setIsConnected(true);
      // Remove the code from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError('Failed to connect to Google Ads. Please try again.');
    }
  };

  const handleConnect = () => {
    setError(null);
    googleAdsAuth.initiateAuth();
  };

  const handleDisconnect = () => {
    googleAdsAuth.logout();
    setIsConnected(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Google Ads Connection
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isConnected ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Connected to Google Ads
          </Alert>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDisconnect}
          >
            Disconnect Account
          </Button>
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
        >
          Connect Google Ads Account
        </Button>
      )}
    </Box>
  );
};

export default GoogleAdsConnect; 