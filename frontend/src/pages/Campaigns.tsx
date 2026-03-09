import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Snackbar,
} from '@mui/material';
import { Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { CAMPAIGN_STATUS, CHANNEL_TYPE, METRIC_INFO } from '../utils/friendlyNames';
import MetricTooltip from '../components/MetricTooltip';

const Campaigns: React.FC = () => {
  const { connected, activeAccountId, dateRange } = useGoogleAds();
  const { data, loading, error, refetch } = useApi(
    () => googleAdsApi.campaigns(dateRange),
    [activeAccountId, dateRange],
  );
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'PAUSED' : 'ENABLED';
    try {
      await googleAdsApi.setCampaignStatus(campaignId, newStatus);
      setActionMsg(newStatus === 'PAUSED' ? 'Campaign paused' : 'Campaign resumed');
      refetch();
    } catch {
      setActionMsg('Failed to update campaign');
    }
  };

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to manage campaigns.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Campaigns</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Campaigns</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        See how your campaigns are performing and pause or resume them
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">
                  {METRIC_INFO.spend.label} <MetricTooltip metricKey="spend" />
                </TableCell>
                <TableCell align="right">
                  {METRIC_INFO.clicks.label} <MetricTooltip metricKey="clicks" />
                </TableCell>
                <TableCell align="right">
                  {METRIC_INFO.conversions.label} <MetricTooltip metricKey="conversions" />
                </TableCell>
                <TableCell align="right">
                  {METRIC_INFO.ctr.label} <MetricTooltip metricKey="ctr" />
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Typography fontWeight={500}>{c.name}</Typography></TableCell>
                  <TableCell>
                    <Chip label={CHANNEL_TYPE[c.channelType] || c.channelType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={CAMPAIGN_STATUS[c.status] || c.status}
                      color={c.status === 'enabled' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">${c.spend.toFixed(2)}</TableCell>
                  <TableCell align="right">{c.clicks.toLocaleString()}</TableCell>
                  <TableCell align="right">{c.conversions}</TableCell>
                  <TableCell align="right">{c.ctr.toFixed(1)}%</TableCell>
                  <TableCell align="center">
                    <Tooltip title={c.status === 'enabled' ? 'Pause this campaign' : 'Resume this campaign'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        color={c.status === 'enabled' ? 'warning' : 'success'}
                      >
                        {c.status === 'enabled' ? <PauseIcon /> : <PlayIcon />}
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
        <Alert severity="info">No campaigns found in your account.</Alert>
      )}

      <Snackbar
        open={!!actionMsg}
        autoHideDuration={3000}
        onClose={() => setActionMsg(null)}
        message={actionMsg}
      />
    </Box>
  );
};

export default Campaigns;
