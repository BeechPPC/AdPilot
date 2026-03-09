import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import type { HealthScore as HealthScoreData } from '../services/api';

interface HealthScoreProps {
  data: HealthScoreData;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

const severityIcon = {
  critical: <ErrorIcon color="error" />,
  warning: <WarningIcon color="warning" />,
  tip: <TipIcon color="info" />,
};

const HealthScore: React.FC<HealthScoreProps> = ({ data }) => {
  const color = getScoreColor(data.score);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Account Health</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        {/* Circular score */}
        <Box sx={{ position: 'relative', width: 100, height: 100 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(data.score / 100) * 264} 264`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color, lineHeight: 1 }}>{data.score}</Typography>
            <Typography variant="caption" color="text.secondary">{getScoreLabel(data.score)}</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>{data.summary}</Typography>
          {data.issues.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
              <CheckIcon fontSize="small" />
              <Typography variant="body2">No issues found</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {data.issues.length > 0 && (
        <List dense disablePadding>
          {data.issues.map((issue, i) => (
            <ListItem key={i} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{severityIcon[issue.severity]}</ListItemIcon>
              <ListItemText primary={issue.message} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default HealthScore;
