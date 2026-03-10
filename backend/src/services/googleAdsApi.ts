import { GOOGLE_ADS_CONFIG } from '../config/googleAds';
import {
  getValidAccessToken, getCustomerId, getLoginCustomerId, setLoginCustomerId,
  getManagerIds, setManagerIds,
} from './googleAdsAuth';

interface SearchStreamResponse {
  results: Record<string, unknown>[];
}

/** Build headers including login-customer-id when needed */
function apiHeaders(accessToken: string, loginCid: string | null, cid: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': GOOGLE_ADS_CONFIG.developerToken,
    'Content-Type': 'application/json',
  };
  if (loginCid && loginCid !== cid) {
    headers['login-customer-id'] = loginCid;
  }
  return headers;
}

export async function executeGaql(query: string, customerId?: string): Promise<Record<string, unknown>[]> {
  const cid = customerId ?? getCustomerId();
  if (!cid) throw new Error('No customer ID selected');

  const accessToken = await getValidAccessToken();
  const loginCid = getLoginCustomerId();

  // Try with stored loginCustomerId first
  const url = `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/googleAds:searchStream`;
  let response = await fetch(url, {
    method: 'POST',
    headers: apiHeaders(accessToken, loginCid, cid),
    body: JSON.stringify({ query }),
  });

  // If PERMISSION_DENIED, try each known MCC until one works
  if (response.status === 403) {
    const managerIds = getManagerIds().filter((id) => id !== loginCid);
    for (const mccId of managerIds) {
      response = await fetch(url, {
        method: 'POST',
        headers: apiHeaders(accessToken, mccId, cid),
        body: JSON.stringify({ query }),
      });
      if (response.status !== 403) {
        // Found the right MCC — cache it for future calls
        setLoginCustomerId(mccId);
        break;
      }
    }
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Ads API error: ${err}`);
  }

  const batches: SearchStreamResponse[] = await response.json();
  return batches.flatMap((b) => b.results ?? []);
}

async function fetchCustomerDetail(
  accessToken: string,
  customerId: string,
  loginCustomerId?: string,
): Promise<{ id: string; name: string; manager: boolean } | null> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': GOOGLE_ADS_CONFIG.developerToken,
    'Content-Type': 'application/json',
  };
  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId;
  }

  const res = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: 'SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1',
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[fetchCustomerDetail] ${customerId} failed: ${res.status} ${errBody}`);
    return null;
  }

  const batches: { results?: Record<string, unknown>[] }[] = await res.json();
  const results = batches.flatMap((b) => b.results ?? []);
  if (results.length === 0) return null;

  const customer = results[0].customer as Record<string, unknown> | undefined;
  return {
    id: customerId,
    name: String(customer?.descriptiveName || customerId),
    manager: !!customer?.manager,
  };
}

export async function listAccessibleCustomers(): Promise<{ id: string; name: string }[]> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(
    'https://googleads.googleapis.com/v23/customers:listAccessibleCustomers',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': GOOGLE_ADS_CONFIG.developerToken,
      },
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('[listAccessibleCustomers] API error:', response.status, err);
    throw new Error(`Failed to list customers: ${err}`);
  }

  const data = await response.json();
  const resourceNames: string[] = data.resourceNames ?? [];
  const customerIds = resourceNames.map((rn: string) => rn.replace('customers/', ''));
  console.log('[listAccessibleCustomers] found IDs:', customerIds);

  // Pass 1: fetch details for all accounts to identify managers vs regular
  const managerIds: string[] = [];
  const regularAccounts: { id: string; name: string }[] = [];
  const failedIds: string[] = [];

  for (const id of customerIds) {
    try {
      const detail = await fetchCustomerDetail(accessToken, id);
      if (detail) {
        console.log(`[listAccessibleCustomers] ${id}: name="${detail.name}" manager=${detail.manager}`);
        if (detail.manager) {
          managerIds.push(id);
        } else {
          regularAccounts.push({ id: detail.id, name: detail.name });
        }
      } else {
        console.log(`[listAccessibleCustomers] ${id}: detail fetch failed (pass 1)`);
        failedIds.push(id);
      }
    } catch (err) {
      console.log(`[listAccessibleCustomers] ${id}: error in pass 1:`, err);
      failedIds.push(id);
    }
  }

  // Pass 2: retry failed accounts using discovered MCC IDs as login-customer-id
  for (const id of failedIds) {
    for (const mccId of managerIds) {
      try {
        const detail = await fetchCustomerDetail(accessToken, id, mccId);
        if (detail) {
          console.log(`[listAccessibleCustomers] ${id} via MCC ${mccId}: name="${detail.name}" manager=${detail.manager}`);
          if (!detail.manager) {
            regularAccounts.push({ id: detail.id, name: detail.name });
          }
        }
        break;
      } catch {
        // try next MCC
      }
    }
  }

  // Persist all MCC IDs so subsequent API calls can resolve the right one
  if (managerIds.length > 0) {
    setManagerIds(managerIds);
    setLoginCustomerId(managerIds[0]);
  }

  console.log(`[listAccessibleCustomers] result: ${managerIds.length} MCCs filtered, ${regularAccounts.length} accounts returned`);
  return regularAccounts;
}

/** Build the WHERE date clause — supports both DURING presets and BETWEEN custom ranges */
function dateClause(dateRange: string): string {
  return dateRange.startsWith('BETWEEN')
    ? `segments.date ${dateRange}`
    : `segments.date DURING ${dateRange}`;
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
    WHERE ${dateClause(dateRange)}
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
    WHERE ${dateClause(dateRange)}
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
    WHERE ${dateClause(dateRange)}
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
    WHERE ${dateClause(dateRange)}
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

/** Convert micros (e.g. 1500000) to a dollar string ("1.50") */
function formatMicros(micros: number | undefined | null): string {
  return (Number(micros ?? 0) / 1_000_000).toFixed(2);
}

/** Helper: join non-empty strings */
function joinParts(parts: string[], sep = ' | '): string {
  return parts.filter(Boolean).join(sep);
}

/** Helper: extract headlines/descriptions text list from an Ad sub-object */
function adTextList(ad: Record<string, unknown> | undefined, field: 'headlines' | 'descriptions'): string[] {
  const rsa = ad?.responsiveSearchAd as Record<string, unknown> | undefined;
  const items = (rsa?.[field] ?? ad?.[field]) as { text?: string }[] | undefined;
  return items?.map((h) => String(h.text ?? '')).filter(Boolean) ?? [];
}

/** Extract a human-readable detail string from the type-specific sub-object */
function extractRecommendationDetails(type: string, r: Record<string, unknown>): string {
  try {
    switch (type) {
      case 'KEYWORD': {
        const kw = r.keywordRecommendation as Record<string, unknown> | undefined;
        const keyword = kw?.keyword as Record<string, unknown> | undefined;
        if (keyword?.text) return `Suggested keyword: '${keyword.text}' (${String(keyword.matchType ?? 'BROAD').replace(/_/g, ' ').toLowerCase()})`;
        return '';
      }
      case 'TEXT_AD': {
        const ta = r.textAdRecommendation as Record<string, unknown> | undefined;
        const ad = ta?.ad as Record<string, unknown> | undefined;
        const parts: string[] = [];
        if (ad?.headline) parts.push(`Headline: '${ad.headline}'`);
        if (ad?.description1) parts.push(`Desc: '${ad.description1}'`);
        return joinParts(parts, ' · ') || '';
      }
      case 'RESPONSIVE_SEARCH_AD': {
        const rsa = r.responsiveSearchAdRecommendation as Record<string, unknown> | undefined;
        const ad = rsa?.ad as Record<string, unknown> | undefined;
        const headlines = adTextList(ad, 'headlines');
        const descriptions = adTextList(ad, 'descriptions');
        const parts: string[] = [];
        if (headlines.length > 0) parts.push(`Headlines: ${headlines.map((h) => `'${h}'`).join(', ')}`);
        if (descriptions.length > 0) parts.push(`Descriptions: ${descriptions.map((d) => `'${d}'`).join(', ')}`);
        return joinParts(parts, '\n') || 'Add more ad variations';
      }
      case 'RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH': {
        const rsa = r.responsiveSearchAdImproveAdStrengthRecommendation as Record<string, unknown> | undefined;
        const currentAd = rsa?.currentAd as Record<string, unknown> | undefined;
        const recommendedAd = rsa?.recommendedAd as Record<string, unknown> | undefined;
        const newHeadlines = adTextList(recommendedAd, 'headlines');
        const newDescs = adTextList(recommendedAd, 'descriptions');
        const currentHeadlines = adTextList(currentAd, 'headlines');
        const parts: string[] = [];
        if (newHeadlines.length > 0) {
          const added = newHeadlines.filter((h) => !currentHeadlines.includes(h));
          if (added.length > 0) parts.push(`Suggested headlines: ${added.map((h) => `'${h}'`).join(', ')}`);
          else parts.push(`Headlines: ${newHeadlines.map((h) => `'${h}'`).join(', ')}`);
        }
        if (newDescs.length > 0) parts.push(`Descriptions: ${newDescs.map((d) => `'${d}'`).join(', ')}`);
        return joinParts(parts, '\n') || '';
      }
      case 'RESPONSIVE_SEARCH_AD_ASSET': {
        const rsa = r.responsiveSearchAdAssetRecommendation as Record<string, unknown> | undefined;
        const recommended = rsa?.recommendedAssets as Record<string, unknown> | undefined;
        const headlines = adTextList(recommended, 'headlines');
        const descs = adTextList(recommended, 'descriptions');
        const parts: string[] = [];
        if (headlines.length > 0) parts.push(`Add headlines: ${headlines.map((h) => `'${h}'`).join(', ')}`);
        if (descs.length > 0) parts.push(`Add descriptions: ${descs.map((d) => `'${d}'`).join(', ')}`);
        return joinParts(parts, '\n') || '';
      }
      case 'TARGET_CPA_OPT_IN': {
        const tc = r.targetCpaOptInRecommendation as Record<string, unknown> | undefined;
        if (tc?.recommendedTargetCpaMicros) return `Recommended target CPA: $${formatMicros(tc.recommendedTargetCpaMicros as number)} per conversion`;
        const options = tc?.options as { targetCpaMicros?: number; requiredCampaignBudgetAmountMicros?: number }[] | undefined;
        if (options?.[0]?.targetCpaMicros) {
          const parts = [`Target CPA: $${formatMicros(options[0].targetCpaMicros)}`];
          if (options[0].requiredCampaignBudgetAmountMicros) parts.push(`Required budget: $${formatMicros(options[0].requiredCampaignBudgetAmountMicros)}/day`);
          return joinParts(parts, ' · ');
        }
        return '';
      }
      case 'FORECASTING_SET_TARGET_CPA':
      case 'SET_TARGET_CPA': {
        const fc = (r.forecastingSetTargetCpaRecommendation ?? r.setTargetCpaRecommendation) as Record<string, unknown> | undefined;
        if (fc?.recommendedTargetCpaMicros) return `Recommended target CPA: $${formatMicros(fc.recommendedTargetCpaMicros as number)} per conversion`;
        return '';
      }
      case 'TARGET_ROAS_OPT_IN': {
        const tr = r.targetRoasOptInRecommendation as Record<string, unknown> | undefined;
        if (tr?.recommendedTargetRoas) return `Recommended target ROAS: ${Number(tr.recommendedTargetRoas).toFixed(1)}x`;
        return '';
      }
      case 'FORECASTING_SET_TARGET_ROAS':
      case 'SET_TARGET_ROAS': {
        const fr = (r.forecastingSetTargetRoasRecommendation ?? r.setTargetRoasRecommendation) as Record<string, unknown> | undefined;
        if (fr?.recommendedTargetRoas) return `Recommended target ROAS: ${Number(fr.recommendedTargetRoas).toFixed(1)}x`;
        return '';
      }
      case 'MAXIMIZE_CONVERSIONS_OPT_IN': {
        const mc = r.maximizeConversionsOptInRecommendation as Record<string, unknown> | undefined;
        if (mc?.recommendedBudgetAmountMicros) return `Recommended budget: $${formatMicros(mc.recommendedBudgetAmountMicros as number)}/day`;
        return '';
      }
      case 'MAXIMIZE_CLICKS_OPT_IN': {
        const mc = r.maximizeClicksOptInRecommendation as Record<string, unknown> | undefined;
        if (mc?.recommendedBudgetAmountMicros) return `Recommended budget: $${formatMicros(mc.recommendedBudgetAmountMicros as number)}/day`;
        return '';
      }
      case 'MAXIMIZE_CONVERSION_VALUE_OPT_IN': {
        const mc = r.maximizeConversionValueOptInRecommendation as Record<string, unknown> | undefined;
        if (mc?.recommendedBudgetAmountMicros) return `Recommended budget: $${formatMicros(mc.recommendedBudgetAmountMicros as number)}/day`;
        return '';
      }
      case 'RAISE_TARGET_CPA_BID_TOO_LOW': {
        const rt = r.raiseTargetCpaBidTooLowRecommendation as Record<string, unknown> | undefined;
        if (rt?.recommendedTargetMultiplier) return `Increase target CPA by ${Number(rt.recommendedTargetMultiplier).toFixed(1)}x to win more auctions`;
        return '';
      }
      case 'RAISE_TARGET_CPA': {
        const rt = r.raiseTargetCpaRecommendation as Record<string, unknown> | undefined;
        const rtAdj = rt?.targetAdjustment as Record<string, unknown> | undefined;
        if (rtAdj?.targetCpaMicros) return `Raise target CPA to $${formatMicros(rtAdj.targetCpaMicros as number)} per conversion`;
        return '';
      }
      case 'LOWER_TARGET_ROAS': {
        const lr = r.lowerTargetRoasRecommendation as Record<string, unknown> | undefined;
        const lrAdj = lr?.targetAdjustment as Record<string, unknown> | undefined;
        if (lrAdj?.targetRoas) return `Lower target ROAS to ${Number(lrAdj.targetRoas).toFixed(1)}x`;
        return '';
      }
      case 'ENHANCED_CPC_OPT_IN':
        return '';
      case 'CAMPAIGN_BUDGET': {
        const cb = r.campaignBudgetRecommendation as Record<string, unknown> | undefined;
        const current = cb?.currentBudgetAmountMicros as number | undefined;
        const recommended = cb?.recommendedBudgetAmountMicros as number | undefined;
        if (current && recommended) return `Current: $${formatMicros(current)}/day → Recommended: $${formatMicros(recommended)}/day`;
        return '';
      }
      case 'FORECASTING_CAMPAIGN_BUDGET':
      case 'MARGINAL_ROI_CAMPAIGN_BUDGET': {
        const fb = (r.forecastingCampaignBudgetRecommendation ?? r.marginalRoiCampaignBudgetRecommendation) as Record<string, unknown> | undefined;
        const current = fb?.currentBudgetAmountMicros as number | undefined;
        const recommended = fb?.recommendedBudgetAmountMicros as number | undefined;
        if (current && recommended) return `Current: $${formatMicros(current)}/day → Recommended: $${formatMicros(recommended)}/day`;
        return '';
      }
      case 'KEYWORD_MATCH_TYPE': {
        const km = r.keywordMatchTypeRecommendation as Record<string, unknown> | undefined;
        const keyword = km?.keyword as Record<string, unknown> | undefined;
        if (keyword?.text && km?.recommendedMatchType) return `Change '${keyword.text}' from ${String(keyword.matchType ?? 'EXACT').toLowerCase()} to ${String(km.recommendedMatchType).toLowerCase()} match`;
        return '';
      }
      case 'USE_BROAD_MATCH_KEYWORD': {
        const bm = r.useBroadMatchKeywordRecommendation as Record<string, unknown> | undefined;
        const keyword = bm?.keyword as Record<string, unknown> | undefined;
        if (keyword?.text) return `Switch '${keyword.text}' to broad match`;
        return '';
      }
      case 'MOVE_UNUSED_BUDGET': {
        const mu = r.moveUnusedBudgetRecommendation as Record<string, unknown> | undefined;
        if (mu?.excessCampaignBudgetMicros) return `Reallocate $${formatMicros(mu.excessCampaignBudgetMicros as number)} from underperforming campaign`;
        return '';
      }
      case 'SITELINK_ASSET': {
        const sl = r.sitelinkAssetRecommendation as Record<string, unknown> | undefined;
        const recs = sl?.recommendedExtensions as { sitelinkText?: string; linkText?: string }[] | undefined;
        if (recs?.[0]) return `Suggested sitelink: '${recs[0].sitelinkText ?? recs[0].linkText ?? ''}'`;
        return '';
      }
      case 'SITELINK_EXTENSION': {
        const sl = r.sitelinkExtensionRecommendation as Record<string, unknown> | undefined;
        const recs = sl?.recommendedExtensions as { sitelinkText?: string }[] | undefined;
        if (recs?.[0]?.sitelinkText) return `Suggested sitelink: '${recs[0].sitelinkText}'`;
        return '';
      }
      case 'CALLOUT_ASSET': {
        const co = r.calloutAssetRecommendation as Record<string, unknown> | undefined;
        const recs = co?.recommendedExtensions as { calloutText?: string }[] | undefined;
        if (recs?.length) return `Callouts: ${recs.map((c) => `'${c.calloutText}'`).join(', ')}`;
        return '';
      }
      case 'CALLOUT_EXTENSION': {
        const co = r.calloutExtensionRecommendation as Record<string, unknown> | undefined;
        const recs = co?.recommendedExtensions as { calloutText?: string }[] | undefined;
        if (recs?.length) return `Callouts: ${recs.map((c) => `'${c.calloutText}'`).join(', ')}`;
        return '';
      }
      case 'CALL_ASSET':
      case 'CALL_EXTENSION':
      case 'PERFORMANCE_MAX_OPT_IN':
      case 'SEARCH_PARTNERS_OPT_IN':
      case 'OPTIMIZE_AD_ROTATION':
      case 'DISPLAY_EXPANSION_OPT_IN':
        return '';
      default:
        return '';
    }
  } catch {
    return '';
  }
}

export async function getRecommendations() {
  const results = await executeGaql(`
    SELECT
      recommendation.resource_name,
      recommendation.type,
      recommendation.impact,
      recommendation.campaign,
      recommendation.campaign_budget_recommendation,
      recommendation.keyword_recommendation,
      recommendation.text_ad_recommendation,
      recommendation.responsive_search_ad_recommendation,
      recommendation.responsive_search_ad_improve_ad_strength_recommendation,
      recommendation.responsive_search_ad_asset_recommendation,
      recommendation.target_cpa_opt_in_recommendation,
      recommendation.forecasting_set_target_cpa_recommendation,
      recommendation.set_target_cpa_recommendation,
      recommendation.target_roas_opt_in_recommendation,
      recommendation.forecasting_set_target_roas_recommendation,
      recommendation.set_target_roas_recommendation,
      recommendation.maximize_conversions_opt_in_recommendation,
      recommendation.maximize_clicks_opt_in_recommendation,
      recommendation.maximize_conversion_value_opt_in_recommendation,
      recommendation.enhanced_cpc_opt_in_recommendation,
      recommendation.keyword_match_type_recommendation,
      recommendation.use_broad_match_keyword_recommendation,
      recommendation.move_unused_budget_recommendation,
      recommendation.forecasting_campaign_budget_recommendation,
      recommendation.marginal_roi_campaign_budget_recommendation,
      recommendation.sitelink_asset_recommendation,
      recommendation.callout_asset_recommendation,
      recommendation.call_asset_recommendation,
      recommendation.raise_target_cpa_bid_too_low_recommendation,
      recommendation.raise_target_cpa_recommendation,
      recommendation.lower_target_roas_recommendation
    FROM recommendation
  `);

  return results.map((row) => {
    const r = row.recommendation as Record<string, unknown> | undefined;
    const impact = r?.impact as Record<string, unknown> | undefined;
    const baseMetrics = impact?.baseMetrics as Record<string, unknown> | undefined;
    const potentialMetrics = impact?.potentialMetrics as Record<string, unknown> | undefined;
    const type = String(r?.type ?? '');
    return {
      resourceName: String(r?.resourceName ?? ''),
      type,
      campaign: String(r?.campaign ?? ''),
      impactImpressions: Number(potentialMetrics?.impressions ?? baseMetrics?.impressions ?? 0),
      impactClicks: Number(potentialMetrics?.clicks ?? baseMetrics?.clicks ?? 0),
      impactCost: Number(potentialMetrics?.costMicros ?? baseMetrics?.costMicros ?? 0) / 1_000_000,
      details: r ? extractRecommendationDetails(type, r) : '',
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

async function mutationHeaders(): Promise<Record<string, string>> {
  const accessToken = await getValidAccessToken();
  const loginCid = getLoginCustomerId();
  const cid = getCustomerId();
  return apiHeaders(accessToken, loginCid, cid);
}

export async function applyRecommendation(resourceName: string): Promise<void> {
  const cid = getCustomerId();
  if (!cid) throw new Error('No customer ID selected');

  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/recommendations:apply`,
    {
      method: 'POST',
      headers: await mutationHeaders(),
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

  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/recommendations:dismiss`,
    {
      method: 'POST',
      headers: await mutationHeaders(),
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

  const resourceName = `customers/${cid}/campaigns/${campaignId}`;
  const response = await fetch(
    `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/campaigns:mutate`,
    {
      method: 'POST',
      headers: await mutationHeaders(),
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

  const headers = await mutationHeaders();

  if (campaignId) {
    const response = await fetch(
      `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/campaignCriteria:mutate`,
      {
        method: 'POST',
        headers,
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
    const response = await fetch(
      `${GOOGLE_ADS_CONFIG.endpoints.ads}/${cid}/customerNegativeCriteria:mutate`,
      {
        method: 'POST',
        headers,
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
    WHERE ${dateClause(dateRange)}
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
