import React from 'react';
import {
  Paper, Typography, List, ListItem, ListItemIcon, ListItemText,
  Chip, Divider, Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getFriendlyRecommendation } from '../utils/friendlyNames';

interface Recommendation {
  resourceName: string;
  type: string;
  campaign: string;
  impactImpressions: number;
  impactClicks: number;
  impactCost: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info';
  label: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface AlertsPanelProps {
  recommendations?: Recommendation[];
}

const fallbackAlerts: Alert[] = [
  { id: '1', type: 'info', label: 'Get Started', message: 'Connect your Google Ads account to see suggestions here.', priority: 'low' },
];

function recsToAlerts(recs: Recommendation[]): Alert[] {
  return recs.slice(0, 5).map((r, i) => {
    const friendly = getFriendlyRecommendation(r.type);
    return {
      id: String(i),
      type: r.impactCost > 100 ? 'warning' as const : 'info' as const,
      label: friendly.label,
      message: friendly.description,
      priority: r.impactCost > 500 ? 'high' as const : r.impactCost > 100 ? 'medium' as const : 'low' as const,
    };
  });
}

const getPriorityColor = (priority: Alert['priority']) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ recommendations }) => {
  const alerts = recommendations && recommendations.length > 0
    ? recsToAlerts(recommendations)
    : fallbackAlerts;

  return (
    <Paper sx={{ p: 2 }}>
      <List>
        {alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            {index > 0 && <Divider />}
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                {alert.type === 'warning' ? <WarningIcon color="warning" /> : <InfoIcon color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={alert.label} size="small" color="primary" variant="outlined" />
                    <Typography variant="body1">{alert.message}</Typography>
                    <Chip label={alert.priority} size="small" color={getPriorityColor(alert.priority)} />
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default AlertsPanel;
