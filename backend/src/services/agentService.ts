import fs from 'fs';
import path from 'path';
import {
  getMetricsSummary, getCampaigns, getSearchTerms, getRecommendations,
  addNegativeKeyword, setCampaignStatus, dismissRecommendation, applyRecommendation,
} from './googleAdsApi';

const DATA_DIR = path.join(__dirname, '../../data');
const TASKS_FILE = path.join(DATA_DIR, 'agent-tasks.json');

export interface AgentTask {
  id: string;
  type: 'add_negative_keyword' | 'pause_zero_conversion_campaign' | 'dismiss_low_impact_recommendation' | 'apply_sitelink_extension';
  title: string;
  description: string;
  impact: string;
  status: 'proposed' | 'approved' | 'rejected' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

function generateId(): string {
  // Simple unique ID without external dependency
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readTasks(): AgentTask[] {
  ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, '[]');
    return [];
  }
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
}

function writeTasks(tasks: AgentTask[]): void {
  ensureDataDir();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export function getTasks(): AgentTask[] {
  return readTasks();
}

export async function analyzeAccount(): Promise<AgentTask[]> {
  const [metrics, campaigns, searchTerms, recommendations] = await Promise.all([
    getMetricsSummary().catch(() => null),
    getCampaigns().catch(() => null),
    getSearchTerms().catch(() => null),
    getRecommendations().catch(() => null),
  ]);

  const existingTasks = readTasks();
  const newTasks: AgentTask[] = [];

  // 1. Find wasteful search terms → propose negative keywords
  if (searchTerms) {
    const wasteful = searchTerms.filter(
      st => st.cost > 5 && st.conversions === 0 && st.clicks >= 3
    );
    for (const st of wasteful.slice(0, 5)) {
      // Skip if we already proposed this
      const alreadyProposed = existingTasks.some(
        t => t.type === 'add_negative_keyword' &&
          t.metadata.keyword === st.searchTerm &&
          (t.status === 'proposed' || t.status === 'completed')
      );
      if (alreadyProposed) continue;

      newTasks.push({
        id: generateId(),
        type: 'add_negative_keyword',
        title: `Block "${st.searchTerm}"`,
        description: `This search term has cost $${st.cost.toFixed(2)} with ${st.clicks} clicks but zero conversions. Adding it as a negative keyword will prevent your ads from showing for this irrelevant search.`,
        impact: `Save ~$${st.cost.toFixed(0)}/month`,
        status: 'proposed',
        metadata: { keyword: st.searchTerm },
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 2. Find zero-conversion campaigns with significant spend → propose pausing
  if (campaigns) {
    const wastefulCampaigns = campaigns.filter(
      c => c.status === 'enabled' && c.spend > 50 && c.conversions === 0
    );
    for (const c of wastefulCampaigns.slice(0, 3)) {
      const alreadyProposed = existingTasks.some(
        t => t.type === 'pause_zero_conversion_campaign' &&
          t.metadata.campaignId === c.id &&
          (t.status === 'proposed' || t.status === 'completed')
      );
      if (alreadyProposed) continue;

      newTasks.push({
        id: generateId(),
        type: 'pause_zero_conversion_campaign',
        title: `Pause "${c.name}"`,
        description: `This campaign has spent $${c.spend.toFixed(2)} over the last 30 days with zero conversions. Pausing it will stop the waste. You can re-enable it anytime.`,
        impact: `Save ~$${c.spend.toFixed(0)}/month`,
        status: 'proposed',
        metadata: { campaignId: c.id, campaignName: c.name },
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. Low-impact recommendations → propose dismissing
  if (recommendations) {
    const lowImpact = recommendations.filter(
      r => r.impactClicks < 5 && r.impactCost < 10
    );
    for (const r of lowImpact.slice(0, 3)) {
      const alreadyProposed = existingTasks.some(
        t => t.type === 'dismiss_low_impact_recommendation' &&
          t.metadata.resourceName === r.resourceName &&
          (t.status === 'proposed' || t.status === 'completed')
      );
      if (alreadyProposed) continue;

      newTasks.push({
        id: generateId(),
        type: 'dismiss_low_impact_recommendation',
        title: `Dismiss "${r.type}" recommendation`,
        description: `This ${r.type} recommendation from Google would have minimal impact (< 5 clicks). Dismissing it declutters your account without any negative effects.`,
        impact: 'Cleaner recommendations list',
        status: 'proposed',
        metadata: { resourceName: r.resourceName, type: r.type },
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Sitelink extension recommendations → propose applying
    const sitelinks = recommendations.filter(
      r => r.type.includes('SITELINK') || r.type.includes('CALLOUT') || r.type.includes('STRUCTURED_SNIPPET')
    );
    for (const r of sitelinks.slice(0, 2)) {
      const alreadyProposed = existingTasks.some(
        t => t.type === 'apply_sitelink_extension' &&
          t.metadata.resourceName === r.resourceName &&
          (t.status === 'proposed' || t.status === 'completed')
      );
      if (alreadyProposed) continue;

      newTasks.push({
        id: generateId(),
        type: 'apply_sitelink_extension',
        title: `Apply ${r.type.replace(/_/g, ' ').toLowerCase()} extension`,
        description: `Google suggests adding this extension to your ads. Extensions make your ads bigger and more clickable without increasing your cost per click.`,
        impact: `Potentially +${Math.max(r.impactClicks, 5)} clicks`,
        status: 'proposed',
        metadata: { resourceName: r.resourceName, type: r.type },
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Save new tasks
  if (newTasks.length > 0) {
    const allTasks = [...existingTasks, ...newTasks];
    writeTasks(allTasks);
  }

  return newTasks;
}

export async function executeTask(taskId: string): Promise<AgentTask> {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'approved') throw new Error('Task must be approved before execution');

  try {
    switch (task.type) {
      case 'add_negative_keyword':
        await addNegativeKeyword(task.metadata.keyword as string);
        break;
      case 'pause_zero_conversion_campaign':
        await setCampaignStatus(task.metadata.campaignId as string, 'PAUSED');
        break;
      case 'dismiss_low_impact_recommendation':
        await dismissRecommendation(task.metadata.resourceName as string);
        break;
      case 'apply_sitelink_extension':
        await applyRecommendation(task.metadata.resourceName as string);
        break;
    }
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
  } catch (err: unknown) {
    task.status = 'failed';
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    task.metadata.error = errMsg;
  }

  writeTasks(tasks);
  return task;
}

export function approveTask(taskId: string): AgentTask {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'proposed') throw new Error('Only proposed tasks can be approved');
  task.status = 'approved';
  writeTasks(tasks);
  return task;
}

export function rejectTask(taskId: string): AgentTask {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'proposed') throw new Error('Only proposed tasks can be rejected');
  task.status = 'rejected';
  writeTasks(tasks);
  return task;
}
