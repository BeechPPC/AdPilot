import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MetricTooltip from './MetricTooltip';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative';
  period: string;
  previousValue?: number;
  currentValue?: number;
}

function formatPctChange(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) {
    return current > 0 ? { text: 'New', positive: true } : { text: '-', positive: true };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return { text: `${sign}${pct.toFixed(1)}%`, positive: pct >= 0 };
}

const MetricCard: React.FC<MetricCardProps> = ({ id, title, value, change, trend, period, previousValue, currentValue }) => {
  // Use comparison data if available
  const hasComparison = previousValue !== undefined && currentValue !== undefined;
  let displayChange = change;
  let displayTrend = trend;

  if (hasComparison) {
    const { text, positive } = formatPctChange(currentValue!, previousValue!);
    displayChange = text;
    // For cost metrics, down is good
    const invertedMetrics = ['cpa', 'cpc', 'spend'];
    const isInverted = invertedMetrics.includes(id ?? '');
    displayTrend = isInverted ? (positive ? 'negative' : 'positive') : (positive ? 'positive' : 'negative');
  }

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 0 }}>
          {title}
        </Typography>
        {id && <MetricTooltip metricKey={id} />}
      </Box>
      <Typography variant="h4" component="div" gutterBottom sx={{ mt: 1 }}>
        {value}
      </Typography>
      {displayChange !== '-' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {displayTrend === 'positive' ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography variant="body2" color={displayTrend === 'positive' ? 'success.main' : 'error.main'}>
            {displayChange}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasComparison ? 'vs prev. period' : period}
          </Typography>
        </Box>
      )}
      {displayChange === '-' && (
        <Typography variant="caption" color="text.secondary">{period}</Typography>
      )}
    </Paper>
  );
};

export default MetricCard;
