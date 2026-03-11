import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Check, PushPin, PushPinOutlined } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DisplayMessage } from '../services/storage';

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface MessageBubbleProps {
  message: DisplayMessage;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isPinned, onTogglePin }) => {
  const [copied, setCopied] = useState(false);
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(message.timestamp));
  const isUser = message.role === 'user';

  useEffect(() => {
    setRelativeTime(formatRelativeTime(message.timestamp));
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(message.timestamp));
    }, 60000);
    return () => clearInterval(interval);
  }, [message.timestamp]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        '&:hover .msg-actions': { opacity: 1 },
      }}
    >
      <Box sx={{ maxWidth: isUser ? '75%' : '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'transparent',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            border: isUser ? 'none' : 0,
            borderRadius: isUser ? 3 : 0,
          }}
        >
          {!isUser ? (
            <Box sx={{ '& p:first-of-type': { mt: 0 }, '& p:last-of-type': { mb: 0 }, '& table': { borderCollapse: 'collapse', width: '100%', my: 1 }, '& th, & td': { border: 1, borderColor: 'divider', px: 1, py: 0.5, textAlign: 'left' }, '& code': { bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: '0.875em' }, '& pre': { bgcolor: 'action.hover', p: 1.5, borderRadius: 1, overflow: 'auto' } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || '\u200B'}
              </ReactMarkdown>
            </Box>
          ) : (
            <Typography variant="body1">{message.content}</Typography>
          )}
          {message.toolsUsed && message.toolsUsed.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {Array.from(new Set(message.toolsUsed)).map(t => (
                <Chip
                  key={t}
                  label={t.replace('get_', '').replace(/_/g, ' ')}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
            </Box>
          )}
        </Paper>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, px: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {relativeTime}
          </Typography>
          {!isUser && (
            <Box
              className="msg-actions"
              sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: 0.25, ml: 'auto' }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
                  {copied ? <Check sx={{ fontSize: 14 }} /> : <ContentCopy sx={{ fontSize: 14 }} />}
                </IconButton>
              </Tooltip>
              {onTogglePin && (
                <Tooltip title={isPinned ? 'Unpin' : 'Pin insight'}>
                  <IconButton size="small" onClick={onTogglePin} sx={{ p: 0.25 }}>
                    {isPinned ? <PushPin sx={{ fontSize: 14 }} color="primary" /> : <PushPinOutlined sx={{ fontSize: 14 }} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBubble;
