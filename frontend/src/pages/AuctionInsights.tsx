import React from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';

const ColumnHelp: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip title={text} arrow>
    <HelpIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.5, verticalAlign: 'middle' }} />
  </Tooltip>
);

const AuctionInsights: React.FC = () => {
  const { connected, activeAccountId, dateParam } = useGoogleAds();
  const { data, loading, error } = useApi(
    () => googleAdsApi.auctionInsights(dateParam),
    [activeAccountId, dateParam],
  );

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to see competitor data.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Competitors</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Competitor Overview</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        How often your ads appear compared to competitors. Higher percentages mean you're showing up more.
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell align="right">
                  Visibility
                  <ColumnHelp text="How often your ad shows up compared to competitors (search impression share). 100% means you appeared for every relevant search." />
                </TableCell>
                <TableCell align="right">
                  Top Position
                  <ColumnHelp text="How often your ad appears in the top positions above organic results." />
                </TableCell>
                <TableCell align="right">
                  #1 Position
                  <ColumnHelp text="How often your ad is the very first result on the page." />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell><Typography fontWeight={500}>{row.campaign}</Typography></TableCell>
                  <TableCell align="right">{(row.searchImpressionShare * 100).toFixed(0)}%</TableCell>
                  <TableCell align="right">{(row.topImpressionPct * 100).toFixed(0)}%</TableCell>
                  <TableCell align="right">{(row.absoluteTopImpressionPct * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No competitor data available for the selected period.</Alert>
      )}
    </Box>
  );
};

export default AuctionInsights;
