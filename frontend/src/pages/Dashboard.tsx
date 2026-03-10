import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Breadcrumbs, Link, CircularProgress, Alert } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import MetricCard from '../components/MetricCard';
import PerformanceChart from '../components/PerformanceChart';
import AlertsPanel from '../components/AlertsPanel';
import CampaignsTable from '../components/CampaignsTable';
import HealthScore from '../components/HealthScore';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { googleAdsApi, HealthScore as HealthScoreData, PerformancePoint, Campaign, Recommendation, MetricsSummary } from '../services/api';
import { METRIC_INFO } from '../utils/friendlyNames';

interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative';
  period: string;
  currentValue?: number;
  previousValue?: number;
}

function getRawValue(id: string, m: MetricsSummary): number {
  const map: Record<string, number> = {
    spend: m.spend, conversions: m.conversions, cpa: m.cpa, roas: m.roas,
    impressions: m.impressions, clicks: m.clicks, ctr: m.ctr, cpc: m.cpc,
  };
  return map[id] ?? 0;
}

function formatMetrics(
  health: HealthScoreData,
  dateLabel: string,
  prevMetrics?: MetricsSummary | null,
): Metric[] {
  const d = health.metrics;
  const ids = ['spend', 'conversions', 'cpa', 'roas', 'impressions', 'clicks', 'ctr', 'cpc'] as const;
  const formatValue: Record<string, string> = {
    spend: `$${d.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    conversions: d.conversions.toLocaleString(),
    cpa: `$${d.cpa.toFixed(2)}`,
    roas: `${d.roas.toFixed(1)}x`,
    impressions: d.impressions.toLocaleString(),
    clicks: d.clicks.toLocaleString(),
    ctr: `${d.ctr.toFixed(2)}%`,
    cpc: `$${d.cpc.toFixed(2)}`,
  };

  return ids.map((id) => ({
    id,
    title: METRIC_INFO[id].label,
    value: formatValue[id],
    change: '-',
    trend: 'positive' as const,
    period: dateLabel,
    currentValue: prevMetrics ? getRawValue(id, d) : undefined,
    previousValue: prevMetrics ? getRawValue(id, prevMetrics) : undefined,
  }));
}

const emptyMetrics: Metric[] = Object.entries(METRIC_INFO).map(([id, info]) => ({
  id, title: info.label, value: '-', change: '-', trend: 'positive' as const, period: 'No data',
}));

const Dashboard: React.FC = () => {
  const {
    connected, activeAccountId, dateRange,
    customStartDate, customEndDate, dateParam,
    compareEnabled, comparisonDateRange,
  } = useGoogleAds();
  const [metrics, setMetrics] = useState<Metric[]>(emptyMetrics);
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null);
  const [perfData, setPerfData] = useState<PerformancePoint[]>([]);
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [recsData, setRecsData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = dateRange === 'CUSTOM' && customStartDate && customEndDate
    ? `${customStartDate} – ${customEndDate}`
    : { LAST_7_DAYS: 'Last 7 days', LAST_14_DAYS: 'Last 2 weeks', LAST_30_DAYS: 'Last 30 days', LAST_90_DAYS: 'Last 3 months', THIS_MONTH: 'This month', LAST_MONTH: 'Last month' }[dateRange] || dateRange;

  useEffect(() => {
    if (!connected || !activeAccountId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetches: Promise<unknown>[] = [
      googleAdsApi.health(dateParam).catch(() => null),
      googleAdsApi.performance(dateParam).catch(() => null),
      googleAdsApi.campaigns(dateParam).catch(() => null),
      googleAdsApi.recommendations().catch(() => null),
    ];

    // Comparison fetch
    const compParam = compareEnabled && comparisonDateRange
      ? { startDate: comparisonDateRange.startDate, endDate: comparisonDateRange.endDate }
      : null;
    if (compParam) {
      fetches.push(googleAdsApi.health(compParam).catch(() => null));
    }

    Promise.all(fetches).then((results) => {
      if (cancelled) return;
      const [h, p, c, r, prevH] = results as [
        HealthScoreData | null, PerformancePoint[] | null,
        Campaign[] | null, Recommendation[] | null,
        HealthScoreData | null | undefined,
      ];
      if (h) {
        setHealthData(h);
        setMetrics(formatMetrics(h, dateLabel, prevH?.metrics ? prevH.metrics as MetricsSummary : null));
      }
      if (p) setPerfData(p);
      if (c) setCampaignData(c);
      if (r) setRecsData(r);
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, activeAccountId, dateRange, customStartDate, customEndDate, compareEnabled, comparisonDateRange?.startDate, comparisonDateRange?.endDate]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(metrics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMetrics(items);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">Dashboard</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>Dashboard</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your Google Ads performance at a glance
        </Typography>
      </Box>

      {!connected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connect your Google Ads account from Settings to see your data here.
        </Alert>
      )}

      {connected && !activeAccountId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Select your Google Ads account from the dropdown above to get started.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

      {/* Health Score */}
      {healthData && (
        <Box sx={{ mb: 4 }}>
          <HealthScore data={healthData} />
        </Box>
      )}

      {/* Metrics Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="metrics" direction="horizontal">
          {(provided: DroppableProvided) => (
            <Grid container spacing={3} sx={{ mb: 4 }} ref={provided.innerRef} {...provided.droppableProps}>
              {metrics.map((metric, index) => (
                <Draggable key={metric.id} draggableId={metric.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <Grid item xs={12} sm={6} md={3} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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

      {/* Performance Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <PerformanceChart data={perfData} />
      </Paper>

      {/* Alerts / Recommendations */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>Things to Review</Typography>
        <AlertsPanel recommendations={recsData} />
      </Box>

      {/* Top Campaigns */}
      {campaignData.length > 0 && (
        <Box>
          <Typography variant="h2" sx={{ mb: 2 }}>Your Campaigns</Typography>
          <CampaignsTable campaigns={campaignData.slice(0, 5)} />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
