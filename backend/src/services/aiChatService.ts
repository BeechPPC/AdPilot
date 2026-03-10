import Anthropic from '@anthropic-ai/sdk';
import { getMetricsSummary, getCampaigns, getRecommendations, getHealthScore } from './googleAdsApi';
import { isAuthenticated } from './googleAdsAuth';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function buildAccountContext(): Promise<string> {
  if (!isAuthenticated()) {
    return 'The user has not connected their Google Ads account yet. Help them understand AdPilot and suggest they connect their account in Settings.';
  }

  try {
    const [metrics, campaigns, recommendations, health] = await Promise.all([
      getMetricsSummary().catch(() => null),
      getCampaigns().catch(() => null),
      getRecommendations().catch(() => null),
      getHealthScore().catch(() => null),
    ]);

    const parts: string[] = [];

    if (health) {
      parts.push(`ACCOUNT HEALTH: ${health.score}/100 — ${health.summary}`);
      if (health.issues.length > 0) {
        parts.push('Issues:');
        health.issues.forEach(i => parts.push(`  [${i.severity}] ${i.message}`));
      }
    }

    if (metrics) {
      parts.push(`\nMETRICS (Last 30 Days):`);
      parts.push(`  Spend: $${metrics.spend.toFixed(2)}`);
      parts.push(`  Conversions: ${metrics.conversions}`);
      parts.push(`  CPA: $${metrics.cpa.toFixed(2)}`);
      parts.push(`  ROAS: ${metrics.roas.toFixed(2)}x`);
      parts.push(`  CTR: ${metrics.ctr.toFixed(2)}%`);
      parts.push(`  Clicks: ${metrics.clicks}`);
      parts.push(`  Impressions: ${metrics.impressions}`);
    }

    if (campaigns && campaigns.length > 0) {
      parts.push(`\nCAMPAIGNS (${campaigns.length} total):`);
      campaigns.slice(0, 10).forEach(c => {
        parts.push(`  - ${c.name} [${c.status}] — $${c.spend.toFixed(2)} spend, ${c.conversions} conv, ${c.ctr.toFixed(1)}% CTR`);
      });
    }

    if (recommendations && recommendations.length > 0) {
      parts.push(`\nPENDING RECOMMENDATIONS: ${recommendations.length}`);
      const types = recommendations.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(types).forEach(([type, count]) => {
        parts.push(`  - ${type}: ${count}`);
      });
    }

    return parts.join('\n') || 'Account is connected but no data is available yet.';
  } catch (err) {
    return 'Account is connected but there was an error fetching data. The user may need to select an account first.';
  }
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const accountContext = await buildAccountContext();

  const systemPrompt = `You are AdPilot AI, a friendly Google Ads assistant for small business owners. You help users understand their ad performance and suggest improvements.

You have access to the user's current Google Ads data:

${accountContext}

Guidelines:
- Explain metrics in plain English (e.g., "CPA" → "cost per customer")
- Be concise and actionable
- When suggesting changes, explain the expected impact
- Never suggest users increase their budget unless they specifically ask about scaling
- Focus on efficiency improvements (reducing waste, improving targeting)
- If data seems concerning, be honest but encouraging
- Reference specific numbers from the account data when relevant`;

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock ? textBlock.text : 'Sorry, I could not generate a response.';
}
