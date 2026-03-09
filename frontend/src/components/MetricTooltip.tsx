import React from 'react';
import { Tooltip, IconButton, Box, Typography } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { METRIC_INFO } from '../utils/friendlyNames';

interface MetricTooltipProps {
  metricKey: string;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({ metricKey }) => {
  const info = METRIC_INFO[metricKey];
  if (!info) return null;

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5, maxWidth: 250 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{info.tooltip}</Typography>
          {info.benchmark && (
            <Typography variant="caption" sx={{ color: 'grey.300', fontStyle: 'italic' }}>
              {info.benchmark}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <IconButton size="small" sx={{ ml: 0.5, p: 0.25, opacity: 0.5 }}>
        <HelpIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

export default MetricTooltip;
