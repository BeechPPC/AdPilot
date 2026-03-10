import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';

const Performance: React.FC = () => {
  const { connected, activeAccountId, dateParam } = useGoogleAds();
  const { data, loading, error } = useApi(
    () => googleAdsApi.performance(dateParam),
    [activeAccountId, dateParam],
  );

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to view performance data.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Performance</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Performance</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        See how your ad spend and results change over time
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Ad Spend & Results</Typography>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#8884d8" name="Ad Spend ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#82ca9d" name="Results" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Clicks & Views</Typography>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#ffc658" name="Clicks" />
                  <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#ff7300" name="Times Shown" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No performance data available for the selected period.</Alert>
      )}
    </Box>
  );
};

export default Performance;
