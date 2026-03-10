import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Snackbar,
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { SEARCH_TERM_STATUS } from '../utils/friendlyNames';
import MetricTooltip from '../components/MetricTooltip';

const SearchTerms: React.FC = () => {
  const { connected, activeAccountId, dateParam } = useGoogleAds();
  const { data, loading, error, refetch } = useApi(
    () => googleAdsApi.searchTerms(dateParam),
    [activeAccountId, dateParam],
  );
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleExclude = async (keyword: string) => {
    try {
      await googleAdsApi.excludeKeyword(keyword);
      setActionMsg(`"${keyword}" blocked — your ads won't show for this search anymore.`);
      refetch();
    } catch {
      setActionMsg('Failed to block keyword. Try again later.');
    }
  };

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to see what people are searching.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Keywords</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Keywords</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        These are the actual words people typed into Google when your ads appeared.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        If you see irrelevant searches that waste your budget, click the block button to stop your ads from showing for those terms.
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Search Term</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Views</TableCell>
                <TableCell align="right">
                  Clicks <MetricTooltip metricKey="clicks" />
                </TableCell>
                <TableCell align="right">
                  Click Rate <MetricTooltip metricKey="ctr" />
                </TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell align="right">
                  Results <MetricTooltip metricKey="conversions" />
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((term, i) => (
                <TableRow
                  key={i}
                  sx={{
                    backgroundColor: term.clicks > 0 && term.conversions === 0 && term.cost > 5
                      ? 'rgba(239, 68, 68, 0.04)'
                      : undefined,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{term.searchTerm}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={SEARCH_TERM_STATUS[term.status] || term.status} size="small" />
                  </TableCell>
                  <TableCell align="right">{term.impressions.toLocaleString()}</TableCell>
                  <TableCell align="right">{term.clicks.toLocaleString()}</TableCell>
                  <TableCell align="right">{term.ctr.toFixed(1)}%</TableCell>
                  <TableCell align="right">${term.cost.toFixed(2)}</TableCell>
                  <TableCell align="right">{term.conversions}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Block this search term — your ads won't show for it anymore">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleExclude(term.searchTerm)}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No search term data available yet.</Alert>
      )}

      <Snackbar
        open={!!actionMsg}
        autoHideDuration={4000}
        onClose={() => setActionMsg(null)}
        message={actionMsg}
      />
    </Box>
  );
};

export default SearchTerms;
