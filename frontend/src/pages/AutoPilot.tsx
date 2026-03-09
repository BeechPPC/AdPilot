import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, Button, Chip, Divider,
  CircularProgress, Alert,
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import TierGate from '../components/TierGate';
import { agentApi, AgentTask } from '../services/api';

const AutoPilot: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const { tasks: fetched } = await agentApi.tasks();
      setTasks(fetched);
    } catch {
      // Ignore — might not have tasks yet
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const { tasks: newTasks } = await agentApi.analyze();
      await fetchTasks();
      if (newTasks.length === 0) {
        setError('No new optimizations found. Your account is looking good!');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    setActioning(taskId);
    try {
      await agentApi.approve(taskId);
      await fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (taskId: string) => {
    setActioning(taskId);
    try {
      await agentApi.reject(taskId);
      await fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActioning(null);
    }
  };

  const proposed = tasks.filter(t => t.status === 'proposed');
  const completed = tasks.filter(t => t.status === 'completed');
  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">AutoPilot</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>AutoPilot</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        AI scans your account and proposes safe optimizations — you approve before anything changes
      </Typography>

      <TierGate requiredTier="advanced" featureName="AutoPilot">
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={scanning ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan My Account'}
          </Button>
        </Box>

        {error && (
          <Alert severity={error.includes('looking good') ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Proposed Tasks */}
        {proposed.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Proposed Actions ({proposed.length})
            </Typography>
            {proposed.map(task => (
              <Paper key={task.id} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                  <Chip label={task.impact} size="small" color="primary" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={actioning === task.id ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                    onClick={() => handleApprove(task.id)}
                    disabled={actioning !== null}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={() => handleReject(task.id)}
                    disabled={actioning !== null}
                  >
                    Reject
                  </Button>
                </Box>
              </Paper>
            ))}
          </>
        )}

        {/* Completed Tasks */}
        {completed.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Completed ({completed.length})
            </Typography>
            {completed.map(task => (
              <Paper key={task.id} sx={{ p: 2, mb: 1, bgcolor: 'success.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                  <Chip label="Done" size="small" color="success" />
                  {task.completedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {new Date(task.completedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </>
        )}

        {/* Empty state */}
        {!loadingTasks && tasks.length === 0 && !scanning && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <SmartToyIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Scan My Account" to let AI find safe optimizations for your Google Ads.
            </Typography>
          </Paper>
        )}

        {loadingTasks && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </TierGate>
    </Box>
  );
};

export default AutoPilot;
