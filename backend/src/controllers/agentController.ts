import { Request, Response } from 'express';
import { analyzeAccount, getTasks, approveTask, rejectTask, executeTask } from '../services/agentService';

export async function analyzeHandler(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await analyzeAccount();
    res.json({ tasks });
  } catch (err: unknown) {
    console.error('Agent analyze error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
}

export function listTasksHandler(req: Request, res: Response): void {
  const tasks = getTasks();
  res.json({ tasks });
}

export async function approveTaskHandler(req: Request, res: Response): Promise<void> {
  try {
    const task = approveTask(req.params.id);
    const result = await executeTask(task.id);
    res.json({ task: result });
  } catch (err: unknown) {
    console.error('Approve task error:', err);
    res.status(400).json({ error: 'Failed to approve task' });
  }
}

export function rejectTaskHandler(req: Request, res: Response): void {
  try {
    const task = rejectTask(req.params.id);
    res.json({ task });
  } catch (err: unknown) {
    console.error('Reject task error:', err);
    res.status(400).json({ error: 'Failed to reject task' });
  }
}
