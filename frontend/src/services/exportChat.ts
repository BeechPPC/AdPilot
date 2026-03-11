import { Conversation } from './storage';

export function exportAsMarkdown(conversation: Conversation): void {
  const lines: string[] = [];
  lines.push(`# ${conversation.title}`);
  lines.push(`*Exported from AdPilot on ${new Date().toLocaleDateString()}*`);
  lines.push('');

  for (const msg of conversation.messages) {
    const time = new Date(msg.timestamp).toLocaleString();
    if (msg.role === 'user') {
      lines.push(`## You (${time})`);
    } else {
      lines.push(`## AdPilot AI (${time})`);
    }
    lines.push('');
    lines.push(msg.content);
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'chat'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
