import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Typography,
} from '@mui/material';
import { CAMPAIGN_STATUS, METRIC_INFO } from '../utils/friendlyNames';
import MetricTooltip from './MetricTooltip';

interface Campaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

interface CampaignsTableProps {
  campaigns?: Campaign[];
}

const CampaignsTable: React.FC<CampaignsTableProps> = ({ campaigns }) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary" align="center">
          No campaign data yet. Connect your Google Ads account to see your campaigns.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Campaign</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">{METRIC_INFO.spend.label}</TableCell>
            <TableCell align="right">{METRIC_INFO.clicks.label} <MetricTooltip metricKey="clicks" /></TableCell>
            <TableCell align="right">{METRIC_INFO.conversions.label} <MetricTooltip metricKey="conversions" /></TableCell>
            <TableCell align="right">{METRIC_INFO.ctr.label} <MetricTooltip metricKey="ctr" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell><Typography fontWeight={500}>{c.name}</Typography></TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CampaignsTable;
