import React from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { DELIVERY_METHOD } from '../utils/friendlyNames';

const BudgetIntelligence: React.FC = () => {
  const { connected, activeAccountId } = useGoogleAds();
  const { data, loading, error } = useApi(
    () => googleAdsApi.budgets(),
    [activeAccountId],
  );

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to view budget data.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Budgets</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Budgets</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        How much you're spending daily on each campaign budget
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Budget Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Spending Style</TableCell>
                <TableCell align="right">Daily Limit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell><Typography fontWeight={500}>{budget.name || `Budget ${budget.id}`}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={budget.status === 'ENABLED' ? 'Active' : budget.status}
                      color={budget.status === 'ENABLED' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{DELIVERY_METHOD[budget.deliveryMethod] || budget.deliveryMethod}</TableCell>
                  <TableCell align="right">${budget.amount.toFixed(2)}/day</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No budget data available.</Alert>
      )}
    </Box>
  );
};

export default BudgetIntelligence;
