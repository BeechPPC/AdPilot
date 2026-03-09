import { GOOGLE_ADS_CONFIG } from '../config/googleAds';
import { getValidAccessToken, getCustomerId } from './googleAdsAuth';

interface SearchStreamResponse {
  results: Record<string, unknown>[];
}

export async function executeGaql(query: string, customerId?: string): Promise<Record<string, unknown>[]> {
  const cid = customerId ?? getCustomerId();
  if (!cid) throw new Error('No customer ID selected');

  const accessToken = await getValidAccessToken();

  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Ads API error: ${err}`);
  }

  const batches: SearchStreamResponse[] = await response.json();
  return batches.flatMap((b) => b.results ?? []);
}

export async function listAccessibleCustomers(): Promise<{ id: string; name: string }[]> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(
    'https://googleads.googleapis.com/v23.1/customers:listAccessibleCustomers',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
      },
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list customers: ${err}`);
  }

  const data = await response.json();
  const resourceNames: string[] = data.resourceNames ?? [];

  // Fetch descriptive names for each customer
  const customers: { id: string; name: string }[] = [];
  for (const rn of resourceNames) {
    const id = rn.replace('customers/', '');
    try {
      const detail = await fetch(
        `https://googleads.googleapis.com/v23.1/${rn}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': GOOGLE_ADS_CONFIG.developerToken,
          },
        },
      );
      if (detail.ok) {
        const info = await detail.json();
        customers.push({ id, name: info.descriptiveName || id });
      } else {
        customers.push({ id, name: id });
      }
    } catch {
      customers.push({ id, name: id });
    }
  }

  return customers;
}

export async function getMetricsSummary(dateRange: string = 'LAST_30_DAYS') {
  const results = await executeGaql(`
    SELECT
      metrics.cost_micros,
      metrics.conversions,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_per_conversion,
      metrics.conversions_value
    FROM customer
    WHERE segments.date DURING ${dateRange}
  `);

  let totalCost = 0, totalConversions = 0, totalImpressions = 0, totalClicks = 0, totalValue = 0;

  for (const row of results) {
    const m = row.metrics as Record<string, unknown> | undefined;
    if (!m) continue;
    totalCost += Number(m.costMicros ?? 0) / 1_000_000;
    totalConversions += Number(m.conversions ?? 0);
    totalImpressions += Number(m.impressions ?? 0);
    totalClicks += Number(m.clicks ?? 0);
    totalValue += Number(m.conversionsValue ?? 0);
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const cpa = totalConversions > 0 ? totalCost / totalConversions : 0;
  const roas = totalCost > 0 ? totalValue / totalCost : 0;

  return {
    spend: totalCost,
    conversions: totalConversions,
    impressions: totalImpressions,
    clicks: totalClicks,
    ctr,
    cpc,
    cpa,
    roas,
  };
}

export async function getPerformanceTimeSeries(dateRange: string = 'LAST_30_DAYS') {
  const results = await executeGaql(`
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.conversions,
      metrics.impressions,
      metrics.clicks
    FROM customer
    WHERE segments.date DURING ${dateRange}
    ORDER BY segments.date ASC
  `);

  return results.map((row) => {
    const seg = row.segments as Record<string, unknown> | undefined;
    const m = row.metrics as Record<string, unknown> | undefined;
    return {
      date: seg?.date ?? '',
      spend: Number(m?.costMicros ?? 0) / 1_000_000,
      conversions: Number(m?.conversions ?? 0),
      impressions: Number(m?.impressions ?? 0),
      clicks: Number(m?.clicks ?? 0),
    };
  });
}

export async function getCampaigns(dateRange: string = 'LAST_30_DAYS') {
  const results = await executeGaql(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      metrics.cost_micros,
      metrics.conversions,
      metrics.impressions,
      metrics.clicks
    FROM campaign
    WHERE segments.date DURING ${dateRange}
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map((row) => {
    const c = row.campaign as Record<string, unknown> | undefined;
    const m = row.metrics as Record<string, unknown> | undefined;
    const cost = Number(m?.costMicros ?? 0) / 1_000_000;
    const clicks = Number(m?.clicks ?? 0);
    const impressions = Number(m?.impressions ?? 0);
    const conversions = Number(m?.conversions ?? 0);
    return {
      id: String(c?.id ?? ''),
      name: String(c?.name ?? ''),
      status: String(c?.status ?? '').toLowerCase(),
      channelType: String(c?.advertisingChannelType ?? ''),
      spend: cost,
      impressions,
      clicks,
      conversions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? cost / clicks : 0,
    };
  });
}

export async function getSearchTerms(dateRange: string = 'LAST_30_DAYS') {
  const results = await executeGaql(`
    SELECT
      search_term_view.search_term,
      search_term_view.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE segments.date DURING ${dateRange}
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `);

  return results.map((row) => {
    const s = row.searchTermView as Record<string, unknown> | undefined;
    const m = row.metrics as Record<string, unknown> | undefined;
    const cost = Number(m?.costMicros ?? 0) / 1_000_000;
    const clicks = Number(m?.clicks ?? 0);
    const impressions = Number(m?.impressions ?? 0);
    return {
      searchTerm: String(s?.searchTerm ?? ''),
      status: String(s?.status ?? ''),
      impressions,
      clicks,
      cost,
      conversions: Number(m?.conversions ?? 0),
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  });
}

export async function getRecommendations() {
  const results = await executeGaql(`
    SELECT
      recommendation.resource_name,
      recommendation.type,
      recommendation.impact.base_metrics.impressions,
      recommendation.impact.base_metrics.clicks,
      recommendation.impact.base_metrics.cost_micros,
      recommendation.campaign
    FROM recommendation
  `);

  return results.map((row) => {
    const r = row.recommendation as Record<string, unknown> | undefined;
    const impact = r?.impact as Record<string, unknown> | undefined;
    const baseMetrics = impact?.baseMetrics as Record<string, unknown> | undefined;
    return {
      resourceName: String(r?.resourceName ?? ''),
      type: String(r?.type ?? ''),
      campaign: String(r?.campaign ?? ''),
      impactImpressions: Number(baseMetrics?.impressions ?? 0),
      impactClicks: Number(baseMetrics?.clicks ?? 0),
      impactCost: Number(baseMetrics?.costMicros ?? 0) / 1_000_000,
    };
  });
}

export async function getAssets() {
  const results = await executeGaql(`
    SELECT
      asset.id,
      asset.name,
      asset.type,
      asset.final_urls
    FROM asset
    ORDER BY asset.id DESC
    LIMIT 100
  `);

  return results.map((row) => {
    const a = row.asset as Record<string, unknown> | undefined;
    return {
      id: String(a?.id ?? ''),
      name: String(a?.name ?? ''),
      type: String(a?.type ?? ''),
      finalUrls: (a?.finalUrls as string[]) ?? [],
    };
  });
}

export async function getBudgets() {
  const results = await executeGaql(`
    SELECT
      campaign_budget.id,
      campaign_budget.name,
      campaign_budget.amount_micros,
      campaign_budget.total_amount_micros,
      campaign_budget.status,
      campaign_budget.delivery_method
    FROM campaign_budget
    WHERE campaign_budget.status != 'REMOVED'
  `);

  return results.map((row) => {
    const b = row.campaignBudget as Record<string, unknown> | undefined;
    return {
      id: String(b?.id ?? ''),
      name: String(b?.name ?? ''),
      amountMicros: Number(b?.amountMicros ?? 0),
      amount: Number(b?.amountMicros ?? 0) / 1_000_000,
      totalAmount: Number(b?.totalAmountMicros ?? 0) / 1_000_000,
      status: String(b?.status ?? ''),
      deliveryMethod: String(b?.deliveryMethod ?? ''),
    };
  });
}

// ─── Mutations ──────────────────────────────────────────────

export async function applyRecommendation(resourceName: string): Promise<void> {
  const cid = getCustomerId();
  if (!cid) throw new Error('No customer ID selected');
  const accessToken = await getValidAccessToken();

  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/recommendations:apply`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{ resourceName }],
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to apply recommendation: ${err}`);
  }
}

export async function dismissRecommendation(resourceName: string): Promise<void> {
  const cid = getCustomerId();
  if (!cid) throw new Error('No customer ID selected');
  const accessToken = await getValidAccessToken();

  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/recommendations:dismiss`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{ resourceName }],
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to dismiss recommendation: ${err}`);
  }
}

export async function setCampaignStatus(campaignId: string, status: 'ENABLED' | 'PAUSED'): Promise<void> {
  const cid = getCustomerId();
  if (!cid) throw new Error('No customer ID selected');
  const accessToken = await getValidAccessToken();

  const resourceName = `customers/${cid}/campaigns/${campaignId}`;
  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/campaigns:mutate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{
          updateMask: 'status',
          update: { resourceName, status },
        }],
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to update campaign status: ${err}`);
  }
}

export async function addNegativeKeyword(keyword: string, campaignId?: string): Promise<void> {
  const cid = getCustomerId();
  if (!cid) throw new Error('No customer ID selected');
  const accessToken = await getValidAccessToken();

  if (campaignId) {
    // Campaign-level negative keyword
    const response = await fetch(
      `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/campaignCriteria:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': GOOGLE_ADS_CONFIG.developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: [{
            create: {
              campaign: `customers/${cid}/campaigns/${campaignId}`,
              negative: true,
              keyword: { text: keyword, matchType: 'BROAD' },
            },
          }],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to add negative keyword: ${err}`);
    }
  } else {
    // Account-level negative keyword
    const response = await fetch(
      `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/customerNegativeCriteria:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': GOOGLE_ADS_CONFIG.developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: [{
            create: {
              keyword: { text: keyword, matchType: 'BROAD' },
            },
          }],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to add negative keyword: ${err}`);
    }
  }
}

// ─── Health Score ────────────────────────────────────────────

export async function getHealthScore(dateRange: string = 'LAST_30_DAYS') {
  const [metricsSummary, recs] = await Promise.all([
    getMetricsSummary(dateRange),
    getRecommendations(),
  ]);

  let score = 100;
  const issues: { severity: 'critical' | 'warning' | 'tip'; message: string }[] = [];

  // CTR assessment
  if (metricsSummary.impressions > 0) {
    if (metricsSummary.ctr < 2) {
      score -= 15;
      issues.push({ severity: 'critical', message: 'Your ads are shown but rarely clicked. Your ad text may need improvement.' });
    } else if (metricsSummary.ctr < 3) {
      score -= 10;
      issues.push({ severity: 'warning', message: 'Your click rate is below average. Consider testing new ad headlines.' });
    } else if (metricsSummary.ctr < 4) {
      score -= 5;
      issues.push({ severity: 'tip', message: 'Your click rate is decent but could be improved with better ad copy.' });
    }
  }

  // Conversion assessment
  if (metricsSummary.clicks > 0) {
    const convRate = (metricsSummary.conversions / metricsSummary.clicks) * 100;
    if (convRate < 1) {
      score -= 15;
      issues.push({ severity: 'critical', message: 'Very few clicks turn into customers. Your landing page or targeting may need work.' });
    } else if (convRate < 2) {
      score -= 10;
      issues.push({ severity: 'warning', message: 'Your conversion rate is below average. Review your landing page experience.' });
    } else if (convRate < 3) {
      score -= 5;
      issues.push({ severity: 'tip', message: 'Conversion rate is okay but there\'s room to improve your landing pages.' });
    }
  } else if (metricsSummary.impressions > 100) {
    score -= 20;
    issues.push({ severity: 'critical', message: 'Your ads are showing but getting no clicks. Review your ad copy and targeting.' });
  }

  // Wasted spend (clicks without conversions)
  if (metricsSummary.clicks > 0 && metricsSummary.conversions === 0) {
    score -= 20;
    issues.push({ severity: 'critical', message: 'You\'re spending money on clicks but getting zero conversions. Review your keywords and landing page.' });
  } else if (metricsSummary.spend > 0 && metricsSummary.conversions > 0) {
    const costPerConversion = metricsSummary.cpa;
    if (costPerConversion > 100) {
      score -= 10;
      issues.push({ severity: 'warning', message: `Each conversion costs $${costPerConversion.toFixed(0)} on average. Look for ways to reduce costs.` });
    }
  }

  // Pending recommendations
  const recCount = recs.length;
  if (recCount > 10) {
    score -= 15;
    issues.push({ severity: 'warning', message: `You have ${recCount} unreviewed suggestions from Google. Reviewing them could improve performance.` });
  } else if (recCount > 5) {
    score -= 8;
    issues.push({ severity: 'tip', message: `You have ${recCount} suggestions to review. Check the Recommendations page.` });
  } else if (recCount > 0) {
    score -= 3;
    issues.push({ severity: 'tip', message: `${recCount} suggestion${recCount === 1 ? '' : 's'} available to improve your account.` });
  }

  // No data
  if (metricsSummary.impressions === 0 && metricsSummary.spend === 0) {
    score = 50;
    issues.length = 0;
    issues.push({ severity: 'warning', message: 'No ad activity detected in this period. Make sure your campaigns are running.' });
  }

  score = Math.max(0, Math.min(100, score));

  let summary: string;
  if (score >= 80) summary = 'Your account is in good shape. Keep it up!';
  else if (score >= 60) summary = 'Your account is doing okay but has room for improvement.';
  else if (score >= 40) summary = 'Your account needs attention. Review the issues below.';
  else summary = 'Your account needs significant work. Let\'s fix the critical issues first.';

  return { score, summary, issues, metrics: metricsSummary, recommendationCount: recCount };
}

export async function getAuctionInsights(dateRange: string = 'LAST_30_DAYS') {
  // Auction insights require a specific campaign or ad group resource
  // Return a summary at the campaign level
  const results = await executeGaql(`
    SELECT
      campaign.name,
      metrics.absolute_top_impression_percentage,
      metrics.top_impression_percentage,
      metrics.search_impression_share
    FROM campaign
    WHERE segments.date DURING ${dateRange}
      AND campaign.status = 'ENABLED'
      AND campaign.advertising_channel_type = 'SEARCH'
    ORDER BY metrics.cost_micros DESC
    LIMIT 20
  `);

  return results.map((row) => {
    const c = row.campaign as Record<string, unknown> | undefined;
    const m = row.metrics as Record<string, unknown> | undefined;
    return {
      campaign: String(c?.name ?? ''),
      absoluteTopImpressionPct: Number(m?.absoluteTopImpressionPercentage ?? 0),
      topImpressionPct: Number(m?.topImpressionPercentage ?? 0),
      searchImpressionShare: Number(m?.searchImpressionShare ?? 0),
    };
  });
}
