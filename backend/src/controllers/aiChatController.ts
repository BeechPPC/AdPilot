import { Request, Response } from 'express';
import { chatWithTools, chatWithToolsStreaming, ChatMessage } from '../services/aiChatService';

function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  return messages.every(
    (m: Record<string, unknown>) => m.role && m.content && ['user', 'assistant'].includes(m.role as string),
  );
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  const { messages } = req.body;

  if (!validateMessages(messages)) {
    res.status(400).json({ error: 'messages array is required, each with role ("user"|"assistant") and content' });
    return;
  }

  try {
    const { response, toolsUsed } = await chatWithTools(messages);
    res.json({ response, toolsUsed });
  } catch (err: unknown) {
    console.error('AI Chat error:', err);
    res.status(500).json({ error: 'AI Chat failed' });
  }
}

export async function chatStreamHandler(req: Request, res: Response): Promise<void> {
  const { messages } = req.body;

  if (!validateMessages(messages)) {
    res.status(400).json({ error: 'messages array is required, each with role ("user"|"assistant") and content' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    await chatWithToolsStreaming(messages, {
      onText: (text) => {
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      },
      onToolStart: (toolName) => {
        res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: toolName })}\n\n`);
      },
      onToolEnd: (toolName) => {
        res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: toolName })}\n\n`);
      },
      onDone: (toolsUsed) => {
        res.write(`data: ${JSON.stringify({ type: 'done', toolsUsed })}\n\n`);
        res.end();
      },
      onError: (error) => {
        res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
        res.end();
      },
    });
  } catch (err: unknown) {
    console.error('AI Chat stream error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'AI Chat failed' })}\n\n`);
    res.end();
  }
}
