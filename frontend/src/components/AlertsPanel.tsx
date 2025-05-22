import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

// Sample data - replace with real data from API
const alerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'Campaign "Summer Sale" is approaching its daily budget limit',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'error',
    message: 'Ad group "Shoes" has low quality score',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'info',
    message: 'New optimization opportunities available',
    timestamp: '1 day ago',
  },
];

const AlertsPanel: React.FC = () => {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
        return <InfoIcon color="info" />;
    }
  };

  return (
    <List>
      {alerts.map((alert) => (
        <ListItem
          key={alert.id}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>{getIcon(alert.type)}</ListItemIcon>
          <ListItemText
            primary={alert.message}
            secondary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {alert.timestamp}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AlertsPanel; 