// ─── Metric tooltips for non-expert users ───────────────────

export interface MetricInfo {
  label: string;
  tooltip: string;
  benchmark?: string;
}

export const METRIC_INFO: Record<string, MetricInfo> = {
  spend: {
    label: 'Ad Spend',
    tooltip: 'Total amount you\'ve spent on ads in this period.',
  },
  conversions: {
    label: 'Results',
    tooltip: 'Actions people took after clicking your ad — like a purchase, sign-up, or phone call.',
    benchmark: 'More is better. If this is 0, check your conversion tracking setup.',
  },
  cpa: {
    label: 'Cost per Result',
    tooltip: 'How much you pay on average to get one result (conversion). Lower is better.',
    benchmark: 'Varies by industry. Under $50 is generally good for most small businesses.',
  },
  roas: {
    label: 'Return on Spend',
    tooltip: 'For every $1 you spend on ads, how much revenue you get back. Higher is better.',
    benchmark: '2x means you double your money. 4x+ is great.',
  },
  impressions: {
    label: 'Times Shown',
    tooltip: 'How many times your ad appeared on someone\'s screen.',
  },
  clicks: {
    label: 'Clicks',
    tooltip: 'How many people clicked on your ad to visit your website.',
  },
  ctr: {
    label: 'Click Rate',
    tooltip: 'What percentage of people who saw your ad actually clicked it. Higher is better.',
    benchmark: '3-5% is average for search ads. Above 5% is great.',
  },
  cpc: {
    label: 'Cost per Click',
    tooltip: 'How much you pay each time someone clicks your ad. Lower is better.',
    benchmark: '$1-2 is typical, but varies by industry.',
  },
};

// ─── Campaign status ─────────────────────────────────────────

export const CAMPAIGN_STATUS: Record<string, string> = {
  enabled: 'Running',
  paused: 'Paused',
  removed: 'Deleted',
  ENABLED: 'Running',
  PAUSED: 'Paused',
  REMOVED: 'Deleted',
};

// ─── Campaign channel types ──────────────────────────────────

export const CHANNEL_TYPE: Record<string, string> = {
  SEARCH: 'Search Ads',
  DISPLAY: 'Display Ads',
  SHOPPING: 'Shopping Ads',
  VIDEO: 'Video Ads',
  PERFORMANCE_MAX: 'Performance Max',
  LOCAL: 'Local Ads',
  SMART: 'Smart Campaign',
  DISCOVERY: 'Discovery Ads',
  DEMAND_GEN: 'Demand Gen',
};

// ─── Recommendation types ────────────────────────────────────

export const RECOMMENDATION_TYPE: Record<string, { label: string; description: string }> = {
  KEYWORD: {
    label: 'Add Keywords',
    description: 'Google suggests new keywords that could bring more customers.',
  },
  TEXT_AD: {
    label: 'Improve Ads',
    description: 'Your ad text could be more compelling to attract clicks.',
  },
  RESPONSIVE_SEARCH_AD: {
    label: 'Improve Ads',
    description: 'Add more headline and description options so Google can find what works best.',
  },
  TARGET_CPA_OPT_IN: {
    label: 'Automate Bidding',
    description: 'Let Google automatically set bids to get you more results at your target cost.',
  },
  MAXIMIZE_CONVERSIONS_OPT_IN: {
    label: 'Automate Bidding',
    description: 'Let Google maximize the number of results within your budget.',
  },
  ENHANCED_CPC_OPT_IN: {
    label: 'Smart Bidding',
    description: 'Let Google adjust your bids in real-time to get more conversions.',
  },
  CAMPAIGN_BUDGET: {
    label: 'Increase Budget',
    description: 'Your campaigns are limited by budget — you could get more results by spending more.',
  },
  KEYWORD_MATCH_TYPE: {
    label: 'Broaden Keywords',
    description: 'Relax keyword matching to show your ads to more relevant searches.',
  },
  MOVE_UNUSED_BUDGET: {
    label: 'Reallocate Budget',
    description: 'Some campaigns have unspent budget that could be used by better-performing ones.',
  },
  SITELINK_EXTENSION: {
    label: 'Add Links',
    description: 'Add extra links below your ad to help people find specific pages on your site.',
  },
  CALL_EXTENSION: {
    label: 'Add Phone Number',
    description: 'Show your phone number in ads so customers can call you directly.',
  },
  CALLOUT_EXTENSION: {
    label: 'Add Highlights',
    description: 'Add short text highlights (like "Free Shipping") to make your ads stand out.',
  },
  PERFORMANCE_MAX_OPT_IN: {
    label: 'Try Performance Max',
    description: 'A campaign type that automatically shows your ads across all Google channels.',
  },
  FORECASTING_CAMPAIGN_BUDGET: {
    label: 'Budget Alert',
    description: 'Your budget may run out before the end of the period.',
  },
};

export function getFriendlyRecommendation(type: string): { label: string; description: string } {
  return RECOMMENDATION_TYPE[type] ?? {
    label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    description: 'A suggestion from Google to improve your ad performance.',
  };
}

// ─── Search term status ──────────────────────────────────────

export const SEARCH_TERM_STATUS: Record<string, string> = {
  UNSPECIFIED: 'Active',
  UNKNOWN: 'Active',
  ADDED: 'Added as keyword',
  EXCLUDED: 'Blocked',
  ADDED_EXCLUDED: 'Added & Blocked',
  NONE: 'Active',
};

// ─── Asset types ─────────────────────────────────────────────

export const ASSET_TYPE: Record<string, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  VIDEO: 'Video',
  MEDIA_BUNDLE: 'Media Bundle',
  LEAD_FORM: 'Lead Form',
  BOOK_ON_GOOGLE: 'Book on Google',
  PROMOTION: 'Promotion',
  CALLOUT: 'Callout',
  STRUCTURED_SNIPPET: 'Snippet',
  SITELINK: 'Site Link',
  PAGE_FEED: 'Page Feed',
  DYNAMIC_EDUCATION: 'Education',
  MOBILE_APP: 'Mobile App',
  HOTEL_CALLOUT: 'Hotel Callout',
  CALL: 'Phone Number',
  PRICE: 'Price',
  CALL_TO_ACTION: 'Call to Action',
  LOCATION: 'Location',
};

// ─── Budget delivery ─────────────────────────────────────────

export const DELIVERY_METHOD: Record<string, string> = {
  STANDARD: 'Spread evenly',
  ACCELERATED: 'Spend quickly',
};

// ─── Date range labels ───────────────────────────────────────

export const DATE_RANGE_OPTIONS = [
  { value: 'LAST_7_DAYS', label: 'Last 7 days' },
  { value: 'LAST_14_DAYS', label: 'Last 2 weeks' },
  { value: 'LAST_30_DAYS', label: 'Last 30 days' },
  { value: 'LAST_90_DAYS', label: 'Last 3 months' },
  { value: 'THIS_MONTH', label: 'This month' },
  { value: 'LAST_MONTH', label: 'Last month' },
  { value: 'CUSTOM', label: 'Custom range' },
];
