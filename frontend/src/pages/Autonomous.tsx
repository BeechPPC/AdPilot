import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, Button } from '@mui/material';
import { Bolt as BoltIcon } from '@mui/icons-material';

const Autonomous: React.FC = () => {
  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Autonomous</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Autonomous Optimization</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Let AI manage your campaigns automatically
      </Typography>

      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <BoltIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Coming Soon — AdPilot Pro
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          Enable AI-driven bid adjustments, budget reallocation, keyword management,
          and ad copy optimization — all running autonomously with your approval guardrails.
        </Typography>
        <Button variant="contained" disabled>
          Upgrade to Pro
        </Button>
      </Paper>
    </Box>
  );
};

export default Autonomous;
