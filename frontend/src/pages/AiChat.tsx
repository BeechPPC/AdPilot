import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, TextField, IconButton, CircularProgress,
  Chip, Stack,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import TierGate from '../components/TierGate';
import { aiChatApi, ChatMessage } from '../services/api';

const STARTERS = [
  'How is my account performing?',
  'Where am I wasting money?',
  'What should I improve first?',
];

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { response } = await aiChatApi.chat(updated);
      setMessages([...updated, { role: 'assistant', content: response }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages([...updated, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">Home</Link>
        <Typography color="text.primary">AI Chat</Typography>
      </Breadcrumbs>

      <Typography variant="h1" gutterBottom>AI Chat</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Ask questions about your Google Ads account in plain English
      </Typography>

      <TierGate requiredTier="advanced" featureName="AI Chat">
        <Paper sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: 400 }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ask me anything about your ads
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                  {STARTERS.map(q => (
                    <Chip
                      key={q}
                      label={q}
                      onClick={() => sendMessage(q)}
                      clickable
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    maxWidth: '75%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Paper elevation={0} sx={{ px: 2, py: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <CircularProgress size={18} />
                </Paper>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask about your ads..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
              disabled={loading}
            />
            <IconButton color="primary" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </TierGate>
    </Box>
  );
};

export default AiChat;
