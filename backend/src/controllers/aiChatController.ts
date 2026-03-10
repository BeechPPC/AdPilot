import { Request, Response } from 'express';
import { chat } from '../services/aiChatService';

export async function chatHandler(req: Request, res: Response): Promise<void> {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !msg.content || !['user', 'assistant'].includes(msg.role)) {
      res.status(400).json({ error: 'Each message must have a valid role ("user" or "assistant") and content' });
      return;
    }
  }

  try {
    const response = await chat(messages);
    res.json({ response });
  } catch (err: unknown) {
    console.error('AI Chat error:', err);
    res.status(500).json({ error: 'AI Chat failed' });
  }
}
