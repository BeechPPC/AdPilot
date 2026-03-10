import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress, Alert,
  Button, Snackbar, Chip, Tooltip, IconButton, Grid,
} from '@mui/material';
import { CheckCircle as ApplyIcon, Close as DismissIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
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
        <Grid container spacing={3}>
          {data.map((rec, i) => {
            const friendly = getFriendlyRecommendation(rec.type);
            const isProcessing = processing === rec.resourceName;
            const impactParts: string[] = [];
            if (rec.impactClicks > 0 || rec.impactImpressions > 0) {
              impactParts.push(`+${rec.impactClicks} clicks`);
              impactParts.push(`+${rec.impactImpressions.toLocaleString()} views`);
            }
            if (rec.impactCost > 0) {
              impactParts.push(`+$${rec.impactCost.toFixed(2)} cost`);
            }

            return (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  {/* Header: chip + help icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Chip label={friendly.label} size="small" color="primary" />
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5, maxWidth: 250 }}>
                          <Typography variant="body2">{friendly.tooltip}</Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <IconButton size="small" sx={{ p: 0.25, opacity: 0.5 }}>
                        <HelpIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Description */}
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {friendly.description}
                  </Typography>

                  {/* Type-specific details */}
                  {rec.details && (
                    <Box sx={{ mb: 1.5, px: 1.5, py: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      {rec.details.split('\n').map((line, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {line}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Spacer pushes footer to bottom */}
                  <Box sx={{ flex: 1 }} />

                  {/* Impact metrics */}
                  {impactParts.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                      Potential uplift: {impactParts.join(' · ')}
                    </Typography>
                  )}

                  {/* Campaign ID */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', opacity: 0.7 }}>
                    Campaign {rec.campaign.split('/').pop()}
                  </Typography>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<ApplyIcon />}
                      onClick={() => handleApply(rec.resourceName)}
                      disabled={isProcessing}
                      sx={{ flex: 1 }}
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
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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
