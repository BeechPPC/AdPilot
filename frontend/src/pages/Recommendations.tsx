import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  List, ListItem, ListItemText, Divider, Button, Snackbar, Chip,
} from '@mui/material';
import { CheckCircle as ApplyIcon, Close as DismissIcon } from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { googleAdsApi } from '../services/api';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { getFriendlyRecommendation } from '../utils/friendlyNames';

const Recommendations: React.FC = () => {
  const { connected, activeAccountId } = useGoogleAds();
  const { data, loading, error, refetch } = useApi(
    () => googleAdsApi.recommendations(),
    [activeAccountId],
  );
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApply = async (resourceName: string) => {
    setProcessing(resourceName);
    try {
      await googleAdsApi.applyRecommendation(resourceName);
      setActionMsg('Suggestion applied successfully!');
      refetch();
    } catch {
      setActionMsg('Failed to apply suggestion. Try again later.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDismiss = async (resourceName: string) => {
    setProcessing(resourceName);
    try {
      await googleAdsApi.dismissRecommendation(resourceName);
      setActionMsg('Suggestion dismissed.');
      refetch();
    } catch {
      setActionMsg('Failed to dismiss suggestion.');
    } finally {
      setProcessing(null);
    }
  };

  if (!connected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Connect your Google Ads account to see suggestions.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Suggestions</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>Suggestions</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Google has analyzed your account and recommends these improvements. Apply the ones that make sense for your business.
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && data.length > 0 && (
        <Paper>
          <List>
            {data.map((rec, i) => {
              const friendly = getFriendlyRecommendation(rec.type);
              const isProcessing = processing === rec.resourceName;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <Divider />}
                  <ListItem
                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, width: '100%' }}>
                      <Chip label={friendly.label} size="small" color="primary" />
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                        {rec.campaign.split('/').pop()}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={friendly.description}
                      secondary={
                        rec.impactClicks > 0 || rec.impactImpressions > 0
                          ? `Potential uplift: +${rec.impactClicks} clicks, +${rec.impactImpressions.toLocaleString()} views`
                          : undefined
                      }
                      primaryTypographyProps={{ variant: 'body1' }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ApplyIcon />}
                        onClick={() => handleApply(rec.resourceName)}
                        disabled={isProcessing}
                      >
                        Apply
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<DismissIcon />}
                        onClick={() => handleDismiss(rec.resourceName)}
                        disabled={isProcessing}
                      >
                        Dismiss
                      </Button>
                    </Box>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {data && data.length === 0 && (
        <Alert severity="success">
          No suggestions right now — your account looks well-optimized!
        </Alert>
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

export default Recommendations;
