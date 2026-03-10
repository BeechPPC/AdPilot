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

export const RECOMMENDATION_TYPE: Record<string, { label: string; description: string; tooltip: string }> = {
  KEYWORD: {
    label: 'Add Keywords',
    description: 'Google suggests new keywords that could bring more customers.',
    tooltip: 'Keywords are the words or phrases people search for. Adding more keywords means your ad can show up for more searches relevant to your business.',
  },
  TEXT_AD: {
    label: 'Improve Ads',
    description: 'Your ad text could be more compelling to attract clicks.',
    tooltip: 'Your ad copy is the headline and description people see in search results. Better copy means more people click through to your site.',
  },
  RESPONSIVE_SEARCH_AD: {
    label: 'Improve Ads',
    description: 'Add more headline and description options so Google can find what works best.',
    tooltip: 'Responsive ads let you provide multiple headlines and descriptions. Google then tests different combinations to find what gets the most clicks.',
  },
  TARGET_CPA_OPT_IN: {
    label: 'Automate Bidding',
    description: 'Let Google automatically set bids to get you more results at your target cost.',
    tooltip: 'Instead of manually choosing how much to bid, you set a target cost-per-result and Google adjusts bids automatically to hit that target.',
  },
  MAXIMIZE_CONVERSIONS_OPT_IN: {
    label: 'Automate Bidding',
    description: 'Let Google maximize the number of results within your budget.',
    tooltip: 'Google automatically sets your bids to get the most conversions (sales, sign-ups, etc.) possible within your daily budget.',
  },
  ENHANCED_CPC_OPT_IN: {
    label: 'Smart Bidding',
    description: 'Let Google adjust your bids in real-time to get more conversions.',
    tooltip: 'Enhanced CPC keeps your manual bids but lets Google raise or lower them in real time when it thinks a click is more or less likely to convert.',
  },
  CAMPAIGN_BUDGET: {
    label: 'Increase Budget',
    description: 'Your campaigns are limited by budget — you could get more results by spending more.',
    tooltip: 'Your daily budget caps how much you spend each day. If your ads are performing well but hitting the cap early, increasing the budget lets them keep running.',
  },
  KEYWORD_MATCH_TYPE: {
    label: 'Broaden Keywords',
    description: 'Relax keyword matching to show your ads to more relevant searches.',
    tooltip: 'Keywords control when your ad shows. "Broad match" lets Google show your ad for related searches, not just exact phrases — so you reach more people.',
  },
  MOVE_UNUSED_BUDGET: {
    label: 'Reallocate Budget',
    description: 'Some campaigns have unspent budget that could be used by better-performing ones.',
    tooltip: 'If one campaign isn\'t spending its full budget, that money could be moved to another campaign that\'s performing better and needs more budget.',
  },
  SITELINK_EXTENSION: {
    label: 'Add Links',
    description: 'Add extra links below your ad to help people find specific pages on your site.',
    tooltip: 'Sitelinks are extra clickable links that appear below your main ad. They let people jump straight to specific pages like "Pricing" or "Contact Us".',
  },
  CALL_EXTENSION: {
    label: 'Add Phone Number',
    description: 'Show your phone number in ads so customers can call you directly.',
    tooltip: 'A call extension adds your phone number to your ad. On mobile, people can tap to call you directly without visiting your website first.',
  },
  CALLOUT_EXTENSION: {
    label: 'Add Highlights',
    description: 'Add short text highlights (like "Free Shipping") to make your ads stand out.',
    tooltip: 'Callouts are short phrases (e.g. "Free Shipping", "24/7 Support") shown below your ad that highlight key selling points of your business.',
  },
  PERFORMANCE_MAX_OPT_IN: {
    label: 'Try Performance Max',
    description: 'A campaign type that automatically shows your ads across all Google channels.',
    tooltip: 'Performance Max runs your ads across Search, YouTube, Display, Gmail, and Maps all at once. Google\'s AI decides where and when to show them.',
  },
  FORECASTING_CAMPAIGN_BUDGET: {
    label: 'Budget Alert',
    description: 'Your budget may run out before the end of the period.',
    tooltip: 'Based on current spending trends, Google predicts your budget will run out before the end of the month, which means missed opportunities.',
  },
  FORECASTING_SET_TARGET_CPA: {
    label: 'Set Target CPA',
    description: 'Google recommends setting a target cost-per-acquisition for this campaign.',
    tooltip: 'Based on forecasted performance, setting a target CPA could help you get more conversions at a predictable cost.',
  },
  SET_TARGET_CPA: {
    label: 'Set Target CPA',
    description: 'Set a target cost-per-acquisition to optimize your bidding automatically.',
    tooltip: 'A target CPA tells Google the average amount you want to pay per conversion. Google will adjust bids automatically to hit this target.',
  },
  FORECASTING_SET_TARGET_ROAS: {
    label: 'Set Target ROAS',
    description: 'Google recommends setting a target return-on-ad-spend for this campaign.',
    tooltip: 'Based on forecasted performance, setting a target ROAS could help you maximize conversion value while meeting your return goals.',
  },
  SET_TARGET_ROAS: {
    label: 'Set Target ROAS',
    description: 'Set a target return-on-ad-spend to optimize your bidding for value.',
    tooltip: 'A target ROAS tells Google the return you want for every dollar spent. Google will adjust bids to maximize conversion value at your target.',
  },
  TARGET_ROAS_OPT_IN: {
    label: 'Automate Bidding',
    description: 'Let Google automatically set bids to hit your target return on ad spend.',
    tooltip: 'Instead of manual bids, you set a target return and Google adjusts bids to maximize conversion value at that return level.',
  },
  MAXIMIZE_CLICKS_OPT_IN: {
    label: 'Maximize Clicks',
    description: 'Let Google automatically set bids to get the most clicks within your budget.',
    tooltip: 'Google automatically sets your bids to get as many clicks as possible within your daily budget.',
  },
  MAXIMIZE_CONVERSION_VALUE_OPT_IN: {
    label: 'Maximize Value',
    description: 'Let Google maximize the total conversion value within your budget.',
    tooltip: 'Google automatically sets bids to get the highest total conversion value possible within your daily budget.',
  },
  RESPONSIVE_SEARCH_AD_IMPROVE_AD_STRENGTH: {
    label: 'Improve Ad Strength',
    description: 'Improve your responsive search ad strength by updating headlines and descriptions.',
    tooltip: 'Ad strength measures how relevant and diverse your ad copy is. Stronger ads get shown more often and perform better.',
  },
  RESPONSIVE_SEARCH_AD_ASSET: {
    label: 'Add Ad Assets',
    description: 'Add more headlines or descriptions to your responsive search ads.',
    tooltip: 'More headline and description options give Google more combinations to test, helping find what resonates best with your audience.',
  },
  USE_BROAD_MATCH_KEYWORD: {
    label: 'Use Broad Match',
    description: 'Switch keywords to broad match to reach more relevant searches.',
    tooltip: 'Broad match lets Google show your ad for searches related to your keyword, not just exact matches — reaching more potential customers.',
  },
  RAISE_TARGET_CPA_BID_TOO_LOW: {
    label: 'Raise Target CPA',
    description: 'Your target CPA is too low — you may be missing conversions.',
    tooltip: 'When your target CPA is set below what the market requires, your ads may rarely win auctions. Raising it helps you compete.',
  },
  RAISE_TARGET_CPA: {
    label: 'Raise Target CPA',
    description: 'Increase your target CPA to get more conversions.',
    tooltip: 'A slightly higher target CPA can significantly increase your conversion volume while keeping costs reasonable.',
  },
  LOWER_TARGET_ROAS: {
    label: 'Lower Target ROAS',
    description: 'Lower your target ROAS to get more conversions.',
    tooltip: 'A slightly lower ROAS target allows Google to bid more aggressively, which can increase your total conversion volume and value.',
  },
  MARGINAL_ROI_CAMPAIGN_BUDGET: {
    label: 'Increase Budget',
    description: 'Increasing this budget would provide a good return on investment.',
    tooltip: 'Google estimates that spending more on this campaign would generate proportionally more results, giving you a good marginal ROI.',
  },
  SITELINK_ASSET: {
    label: 'Add Links',
    description: 'Add extra links below your ad to help people find specific pages on your site.',
    tooltip: 'Sitelinks are extra clickable links that appear below your main ad. They let people jump straight to specific pages like "Pricing" or "Contact Us".',
  },
  CALLOUT_ASSET: {
    label: 'Add Highlights',
    description: 'Add short text highlights (like "Free Shipping") to make your ads stand out.',
    tooltip: 'Callouts are short phrases (e.g. "Free Shipping", "24/7 Support") shown below your ad that highlight key selling points of your business.',
  },
  CALL_ASSET: {
    label: 'Add Phone Number',
    description: 'Show your phone number in ads so customers can call you directly.',
    tooltip: 'A call asset adds your phone number to your ad. On mobile, people can tap to call you directly without visiting your website first.',
  },
};

export function getFriendlyRecommendation(type: string): { label: string; description: string; tooltip: string } {
  return RECOMMENDATION_TYPE[type] ?? {
    label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    description: 'A suggestion from Google to improve your ad performance.',
    tooltip: 'This is a recommendation from Google Ads to help improve your account performance.',
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
