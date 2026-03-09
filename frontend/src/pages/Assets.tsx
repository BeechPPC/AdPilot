import React from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { ASSET_TYPE } from '../utils/friendlyNames';

const Assets: React.FC = () => {
  const { connected, activeAccountId } = useGoogleAds();
  const { data, loading, error } = useApi(
    () => googleAdsApi.assets(),
    [activeAccountId],
  );

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to view your ad assets.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Ad Assets</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Ad Assets</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Images, text, and other creative elements used in your ads
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Links To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell><Typography fontWeight={500}>{asset.name || `Asset ${asset.id}`}</Typography></TableCell>
                  <TableCell>
                    <Chip label={ASSET_TYPE[asset.type] || asset.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{asset.finalUrls.join(', ') || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No ad assets found.</Alert>
      )}
    </Box>
  );
};

export default Assets;
