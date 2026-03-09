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
}

const MetricCard: React.FC<MetricCardProps> = ({ id, title, value, change, trend, period }) => {
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
      {change !== '-' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend === 'positive' ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          <Typography variant="body2" color={trend === 'positive' ? 'success.main' : 'error.main'}>
            {change}
          </Typography>
          <Typography variant="caption" color="text.secondary">{period}</Typography>
        </Box>
      )}
      {change === '-' && (
        <Typography variant="caption" color="text.secondary">{period}</Typography>
      )}
    </Paper>
  );
};

export default MetricCard;
