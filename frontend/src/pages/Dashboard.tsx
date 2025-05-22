import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Breadcrumbs, Link } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import MetricCard from '../components/MetricCard';
import PerformanceChart from '../components/PerformanceChart';
import AlertsPanel from '../components/AlertsPanel';
import CampaignsTable from '../components/CampaignsTable';

interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative';
  period: string;
}

const initialMetrics: Metric[] = [
  {
    id: 'spend',
    title: 'Total Spend',
    value: '$2,347',
    change: '+12%',
    trend: 'positive',
    period: 'vs. last month',
  },
  {
    id: 'conversions',
    title: 'Conversions',
    value: '156',
    change: '-3%',
    trend: 'negative',
    period: 'vs. last month',
  },
  {
    id: 'cpa',
    title: 'CPA',
    value: '$15.04',
    change: '+5%',
    trend: 'negative',
    period: 'vs. last month',
  },
  {
    id: 'roas',
    title: 'ROAS',
    value: '4.2x',
    change: '+8%',
    trend: 'positive',
    period: 'vs. last month',
  },
  {
    id: 'impressions',
    title: 'Impressions',
    value: '45.2K',
    change: '+15%',
    trend: 'positive',
    period: 'vs. last month',
  },
  {
    id: 'clicks',
    title: 'Clicks',
    value: '2.1K',
    change: '+10%',
    trend: 'positive',
    period: 'vs. last month',
  },
  {
    id: 'ctr',
    title: 'Click-Through Rate',
    value: '5.2%',
    change: '+15%',
    trend: 'positive',
    period: 'vs. last month',
  },
  {
    id: 'cpc',
    title: 'Avg. CPC',
    value: '$1.12',
    change: '-2%',
    trend: 'positive',
    period: 'vs. last month',
  },
];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMetrics(items);
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Home
        </Link>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Account performance overview and key insights
        </Typography>
      </Box>

      {/* Metrics Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="metrics" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Grid
              container
              spacing={3}
              sx={{ mb: 4 }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {metrics.map((metric, index) => (
                <Draggable key={metric.id} draggableId={metric.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <MetricCard {...metric} />
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <PerformanceChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" gutterBottom>
                AI Insights
              </Typography>
              <Typography variant="body2" paragraph>
                🧠 AI-powered insights and predictions
              </Typography>
              <Typography variant="body2" paragraph>
                Upgrade to AdPilot Pro for:
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>✨ Predictive analytics</Box>
                <Box component="li" sx={{ mb: 1 }}>🎯 Smart recommendations</Box>
                <Box component="li" sx={{ mb: 1 }}>🤖 Autonomous optimization</Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Action Items & Alerts
        </Typography>
        <AlertsPanel />
      </Box>

      {/* Campaigns Table */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h2">
            Top Performing Campaigns
          </Typography>
        </Box>
        <CampaignsTable />
      </Box>
    </Box>
  );
};

export default Dashboard; 