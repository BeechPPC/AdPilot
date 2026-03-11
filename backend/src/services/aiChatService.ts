import Anthropic from '@anthropic-ai/sdk';
import { isAuthenticated, getCustomerId } from './googleAdsAuth';
import { getAccountSettings, AccountSettings } from './accountSettingsService';
import {
  getMetricsSummary,
  getPerformanceTimeSeries,
  getCampaigns,
  getSearchTerms,
  getRecommendations,
  getAssets,
  getBudgets,
  getAuctionInsights,
  getHealthScore,
} from './googleAdsApi';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_account_status',
    description: 'Check whether the user has connected their Google Ads account and which customer ID is active.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_metrics_summary',
    description: 'Get aggregate account metrics: spend, conversions, impressions, clicks, CTR, CPC, CPA, ROAS for a date range.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset (e.g. LAST_7_DAYS, LAST_30_DAYS, LAST_90_DAYS, THIS_MONTH, LAST_MONTH). Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_performance_time_series',
    description: 'Get daily performance data (spend, conversions, impressions, clicks) over a date range. Useful for trends.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset. Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_campaigns',
    description: 'List all campaigns with their status, channel type, spend, impressions, clicks, conversions, CTR, and CPC.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset. Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_search_terms',
    description: 'Get the top 100 search terms by impressions, including clicks, cost, conversions, and CTR. Useful for finding wasted spend or new keyword ideas.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset. Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_recommendations',
    description: 'Get pending Google Ads recommendations (keyword suggestions, budget changes, bidding strategies, ad improvements, etc.).',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_assets',
    description: 'List ad assets (headlines, descriptions, images, etc.) in the account.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_budgets',
    description: 'List campaign budgets with their daily amounts, status, and delivery method.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_auction_insights',
    description: 'Get auction insights for enabled Search campaigns: top impression %, absolute top impression %, and search impression share.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset. Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_health_score',
    description: 'Get a composite account health score (0-100) with specific issues and improvement suggestions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date_range: {
          type: 'string',
          description: 'Google Ads date range preset. Defaults to LAST_30_DAYS.',
        },
      },
      required: [],
    },
  },
];

async function executeToolCall(name: string, input: Record<string, unknown>): Promise<unknown> {
  const dateRange = (input.date_range as string) || 'LAST_30_DAYS';

  switch (name) {
    case 'get_account_status':
      return { connected: isAuthenticated(), customerId: getCustomerId() };
    case 'get_metrics_summary':
      return getMetricsSummary(dateRange);
    case 'get_performance_time_series':
      return getPerformanceTimeSeries(dateRange);
    case 'get_campaigns':
      return getCampaigns(dateRange);
    case 'get_search_terms':
      return getSearchTerms(dateRange);
    case 'get_recommendations':
      return getRecommendations();
    case 'get_assets':
      return getAssets();
    case 'get_budgets':
      return getBudgets();
    case 'get_auction_insights':
      return getAuctionInsights(dateRange);
    case 'get_health_score':
      return getHealthScore(dateRange);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const BASE_SYSTEM_PROMPT = `You are AdPilot AI — a Google Ads advisor that works for the business owner, not for Google.

Your user is a small business owner who may have little or no Google Ads experience. They're spending real money and need honest, plain-English guidance. Your job is to protect their budget, surface insights they can't easily find in Google Ads, and help them make smarter decisions.

You have tools to query their live Google Ads data. Use them to answer questions — never guess or make up numbers. If they haven't connected their Google Ads account yet, tell them to connect it in Settings.

## Core philosophy: work for the client, not Google

Google's platform is designed to get advertisers to spend more. Many of Google's built-in recommendations increase Google's revenue without proportionally helping the advertiser. You must be the counterbalance:

- **Scrutinize Google's recommendations.** When reviewing recommendations, evaluate each one honestly. Many "optimizations" Google suggests (broad match expansion, budget increases, auto-applied recommendations, audience expansion) primarily benefit Google. Tell the user which recommendations genuinely help them and which ones mostly help Google. Be specific about why.
- **Hunt for wasted spend.** Proactively look at search terms for irrelevant queries burning money. Calculate what percentage of their spend goes to search terms with zero conversions. This is the kind of insight Google buries — surface it clearly.
- **Question budget increases.** Never suggest spending more money unless the user specifically asks about scaling AND the data shows they've already optimized what they have. If CPA is high or conversion rate is low, more budget just means more waste.
- **Flag vanity metrics.** Impressions and clicks mean nothing if they don't convert. Don't celebrate high impression counts or click volumes — focus on what actually drives business results (conversions, cost per conversion, return on ad spend).
- **Be honest about poor performance.** If campaigns aren't working, say so directly. Don't sugarcoat it. But always pair honesty with a concrete suggestion for what to do about it.

## Unique insights to surface (things Google doesn't show clearly)

- **Wasted spend analysis**: What % of spend goes to search terms with 0 conversions? What's the $ amount?
- **Search term quality**: Are they paying for irrelevant searches? Brand terms competitors are bidding on?
- **True cost per customer**: Not just CPA, but factoring in wasted spend — what are they really paying per conversion?
- **Campaign cannibalization**: Are multiple campaigns competing against each other for the same searches?
- **Recommendation quality score**: Of Google's recommendations, how many genuinely help vs. just increase spend?
- **Budget efficiency**: Is the budget being spent evenly or is it front-loaded and running out? Are there campaigns with budget but no results?
- **Diminishing returns**: At what point does more spend stop producing proportional results?

## Communication style

- **No jargon without explanation.** First time you use a term like CPA, CTR, ROAS, impression share — explain it in parentheses. E.g., "Your CPA (cost per customer) is $45."
- **Lead with what matters.** Start with the most important insight, not a data summary.
- **Be specific and actionable.** Don't say "consider reviewing your keywords." Say "You have 23 search terms that spent $340 with zero conversions last month. Here are the worst offenders — consider adding these as negative keywords."
- **Use money, not percentages, when it hits harder.** "$230 wasted on irrelevant clicks" is more impactful than "12% of spend was wasted."
- **Keep it conversational.** Write like a smart friend who happens to know Google Ads, not like a marketing agency report.
- **When asked general questions** like "how's my account?", pull metrics and health score to give a focused overview — don't call every tool.

## Follow-up questions

At the end of every response, suggest exactly 3 follow-up questions the user might want to ask next. Format each one on its own line using this exact format:
[FOLLOWUP: Your suggested question here]

Make follow-ups specific to the data you just discussed — not generic. They should help the user dig deeper into the insights you just shared.`;

function buildSystemPrompt(): string {
  const settings = getAccountSettings();
  if (!settings) return BASE_SYSTEM_PROMPT;

  const lines: string[] = [];

  if (settings.businessType) {
    const labels: Record<string, string> = {
      ecommerce: 'E-commerce',
      lead_generation: 'Lead Generation',
      local_services: 'Local Services',
    };
    lines.push(`- **Business type:** ${labels[settings.businessType] || settings.businessType}`);
  }

  if (settings.goalType && settings.goalTarget != null) {
    const label = settings.goalType === 'cpa' ? 'CPA' : 'ROAS';
    const prefix = settings.goalType === 'cpa' ? '$' : '';
    const suffix = settings.goalType === 'roas' ? 'x' : '';
    lines.push(`- **Goal:** ${label} target of ${prefix}${settings.goalTarget}${suffix}. Compare actual performance against this target and flag when it's off track.`);
  }

  if (settings.brandName) {
    lines.push(`- **Brand name:** "${settings.brandName}". Use this to identify branded vs non-branded search terms. Search terms containing "${settings.brandName}" (case-insensitive) are branded.`);
  }

  if (settings.conversionTypes && settings.conversionTypes.length > 0) {
    lines.push(`- **Conversion types:** ${settings.conversionTypes.join(', ')}`);
  }

  if (settings.businessType === 'ecommerce' && settings.averageOrderValue != null) {
    lines.push(`- **Average order value:** $${settings.averageOrderValue}`);
  } else if (settings.leadValue != null) {
    lines.push(`- **Lead value:** $${settings.leadValue}`);
  }

  if (settings.profitMargin != null) {
    lines.push(`- **Profit margin:** ${settings.profitMargin}%. Use this to calculate true ROI — a ROAS of ${(100 / settings.profitMargin).toFixed(1)}x is roughly breakeven.`);
  }

  if (settings.monthlyBudget != null) {
    lines.push(`- **Monthly ad budget:** $${settings.monthlyBudget.toLocaleString()}`);
  }

  if (settings.industry) {
    lines.push(`- **Industry:** ${settings.industry}. Use this for benchmark context when evaluating performance.`);
  }

  if (lines.length === 0) return BASE_SYSTEM_PROMPT;

  return `${BASE_SYSTEM_PROMPT}

## Account context

This user has provided the following business context. Use it to give tailored, specific advice:

${lines.join('\n')}`;
}

export async function chatWithTools(messages: ChatMessage[]): Promise<{ response: string; toolsUsed: string[] }> {
  const toolsUsed: string[] = [];
  const maxIterations = 5;

  let apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  for (let i = 0; i < maxIterations; i++) {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages: apiMessages,
    });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text');
      return {
        response: textBlock ? textBlock.text : 'Sorry, I could not generate a response.',
        toolsUsed,
      };
    }

    if (response.stop_reason === 'tool_use') {
      const toolBlocks = response.content.filter(b => b.type === 'tool_use');

      apiMessages = [
        ...apiMessages,
        { role: 'assistant', content: response.content },
      ];

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolBlocks) {
        if (block.type !== 'tool_use') continue;
        toolsUsed.push(block.name);
        try {
          const result = await executeToolCall(block.name, block.input as Record<string, unknown>);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Tool execution failed';
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: message }),
            is_error: true,
          });
        }
      }

      apiMessages = [
        ...apiMessages,
        { role: 'user', content: toolResults },
      ];
      continue;
    }

    // Unexpected stop reason
    const textBlock = response.content.find(b => b.type === 'text');
    return {
      response: textBlock ? textBlock.text : 'Sorry, I could not generate a response.',
      toolsUsed,
    };
  }

  return { response: 'I ran into a problem processing your request. Please try again.', toolsUsed };
}

export async function chatWithToolsStreaming(
  messages: ChatMessage[],
  callbacks: {
    onText: (text: string) => void;
    onToolStart: (toolName: string) => void;
    onToolEnd: (toolName: string) => void;
    onDone: (toolsUsed: string[]) => void;
    onError: (error: string) => void;
  },
): Promise<void> {
  const toolsUsed: string[] = [];
  const maxIterations = 5;

  let apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  for (let i = 0; i < maxIterations; i++) {
    const contentBlocks: Anthropic.ContentBlock[] = [];

    const stream = getClient().messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages: apiMessages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          callbacks.onToolStart(event.content_block.name);
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          callbacks.onText(event.delta.text);
        }
      }
    }

    const finalMessage = await stream.finalMessage();
    contentBlocks.push(...finalMessage.content);
    const stopReason = finalMessage.stop_reason;

    if (stopReason === 'end_turn') {
      callbacks.onDone(toolsUsed);
      return;
    }

    if (stopReason === 'tool_use') {
      const toolBlocks = contentBlocks.filter(b => b.type === 'tool_use');

      apiMessages = [
        ...apiMessages,
        { role: 'assistant', content: contentBlocks },
      ];

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolBlocks) {
        if (block.type !== 'tool_use') continue;
        toolsUsed.push(block.name);
        try {
          const result = await executeToolCall(block.name, block.input as Record<string, unknown>);
          callbacks.onToolEnd(block.name);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Tool execution failed';
          callbacks.onToolEnd(block.name);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: message }),
            is_error: true,
          });
        }
      }

      apiMessages = [
        ...apiMessages,
        { role: 'user', content: toolResults },
      ];
      continue;
    }

    callbacks.onDone(toolsUsed);
    return;
  }

  callbacks.onError('Too many tool iterations');
  callbacks.onDone(toolsUsed);
}
