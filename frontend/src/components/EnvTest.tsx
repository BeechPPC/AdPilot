import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EnvTest: React.FC = () => {
  useEffect(() => {
    console.log('Environment Variables:', {
      clientId: process.env.REACT_APP_GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.REACT_APP_GOOGLE_ADS_CLIENT_SECRET,
      redirectUri: process.env.REACT_APP_GOOGLE_ADS_REDIRECT_URI,
      developerToken: process.env.REACT_APP_GOOGLE_ADS_DEVELOPER_TOKEN
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Environment Variables Test
        </Typography>
        <Typography variant="body1">
          Client ID: {process.env.REACT_APP_GOOGLE_ADS_CLIENT_ID ? '✓ Set' : '✗ Not Set'}
        </Typography>
        <Typography variant="body1">
          Client Secret: {process.env.REACT_APP_GOOGLE_ADS_CLIENT_SECRET ? '✓ Set' : '✗ Not Set'}
        </Typography>
        <Typography variant="body1">
          Redirect URI: {process.env.REACT_APP_GOOGLE_ADS_REDIRECT_URI ? '✓ Set' : '✗ Not Set'}
        </Typography>
        <Typography variant="body1">
          Developer Token: {process.env.REACT_APP_GOOGLE_ADS_DEVELOPER_TOKEN ? '✓ Set' : '✗ Not Set'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default EnvTest; 