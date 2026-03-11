import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, TextField, IconButton, Paper, Button,
  Alert, Select, MenuItem,
} from '@mui/material';
import {
  Send as SendIcon, TrendingUp, MoneyOff,
  ThumbsUpDown, Build,
} from '@mui/icons-material';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { useChat } from '../context/ChatContext';
import { authApi, streamChat, StreamEvent, ChatMessage } from '../services/api';
import { DisplayMessage, PinnedInsight, loadPins, savePins, generateId } from '../services/storage';
import MessageBubble from '../components/MessageBubble';
import FollowUpChips from '../components/FollowUpChips';
import ChatSkeleton from '../components/ChatSkeleton';

const TOOL_LABELS: Record<string, string> = {
  get_account_status: 'Checking account status...',
  get_metrics_summary: 'Pulling your metrics...',
  get_performance_time_series: 'Loading performance data...',
  get_campaigns: 'Checking your campaigns...',
  get_search_terms: 'Analyzing search terms...',
  get_recommendations: 'Fetching recommendations...',
  get_assets: 'Loading assets...',
  get_budgets: 'Checking budgets...',
  get_auction_insights: 'Getting auction insights...',
  get_health_score: 'Calculating health score...',
};

const STARTER_QUESTIONS: { question: string; subtitle: string; icon: React.ReactElement }[] = [
  { question: 'How is my account performing?', subtitle: 'Get an overview of key metrics', icon: <TrendingUp /> },
  { question: 'Where am I wasting money?', subtitle: 'Find irrelevant search terms & wasted spend', icon: <MoneyOff /> },
  { question: "Are Google's recommendations actually good for me?", subtitle: 'Honest assessment of Google\'s suggestions', icon: <ThumbsUpDown /> },
  { question: 'What should I fix first?', subtitle: 'Prioritized action items for your account', icon: <Build /> },
];

const FOLLOWUP_REGEX = /\[FOLLOWUP:\s*(.+?)\]/g;

function extractFollowUps(content: string): { cleaned: string; followUps: string[] } {
  const followUps: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(FOLLOWUP_REGEX.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    followUps.push(match[1].trim());
  }
  const cleaned = content.replace(FOLLOWUP_REGEX, '').trimEnd();
  return { cleaned, followUps };
}

const Chat: React.FC = () => {
  const { connected, loading: adsLoading, accounts, activeAccountId, selectAccount, refresh } = useGoogleAds();
  const { activeConversation, createConversation, updateMessages } = useChat();

  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation?.messages]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [pins, setPins] = useState<PinnedInsight[]>(() => loadPins());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTools, scrollToBottom]);

  // Reset follow-ups when conversation changes
  useEffect(() => {
    setFollowUps([]);
  }, [activeConversation?.id]);

  const getOrCreateConversation = useCallback(() => {
    if (activeConversation) return activeConversation;
    return createConversation();
  }, [activeConversation, createConversation]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;

    const conv = getOrCreateConversation();
    const userMsg: DisplayMessage = { role: 'user', content: text.trim(), timestamp: Date.now() };
    const newMessages = [...conv.messages, userMsg];
    updateMessages(conv.id, newMessages);
    setInput('');
    setIsStreaming(true);
    setActiveTools([]);
    setError(null);
    setFollowUps([]);

    const chatHistory: ChatMessage[] = newMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let assistantText = '';
    const toolsUsed: string[] = [];

    // Add placeholder assistant message
    const withPlaceholder = [...newMessages, { role: 'assistant' as const, content: '', timestamp: Date.now() }];
    updateMessages(conv.id, withPlaceholder);

    abortRef.current = streamChat(chatHistory, (event: StreamEvent) => {
      switch (event.type) {
        case 'text':
          assistantText += event.text || '';
          updateMessages(conv.id, [
            ...newMessages,
            { role: 'assistant', content: assistantText, toolsUsed, timestamp: Date.now() },
          ]);
          break;
        case 'tool_start':
          if (event.tool) {
            toolsUsed.push(event.tool);
            setActiveTools(prev => [...prev, event.tool!]);
          }
          break;
        case 'tool_end':
          if (event.tool) {
            setActiveTools(prev => prev.filter(t => t !== event.tool));
          }
          break;
        case 'done': {
          const { cleaned, followUps: fups } = extractFollowUps(assistantText);
          setFollowUps(fups);
          updateMessages(conv.id, [
            ...newMessages,
            { role: 'assistant', content: cleaned, toolsUsed: event.toolsUsed || toolsUsed, timestamp: Date.now() },
          ]);
          setIsStreaming(false);
          setActiveTools([]);
          break;
        }
        case 'error':
          setError(event.error || 'Something went wrong');
          setIsStreaming(false);
          setActiveTools([]);
          if (!assistantText) {
            updateMessages(conv.id, newMessages);
          }
          break;
      }
    });
  }, [isStreaming, getOrCreateConversation, updateMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleConnect = async () => {
    try {
      const { url } = await authApi.getUrl();
      window.location.href = url;
    } catch {
      setError('Failed to start Google Ads authorization.');
    }
  };

  const togglePin = (msg: DisplayMessage) => {
    const existing = pins.find(p => p.content === msg.content && p.timestamp === msg.timestamp);
    let updated: PinnedInsight[];
    if (existing) {
      updated = pins.filter(p => p.id !== existing.id);
    } else {
      const pin: PinnedInsight = {
        id: generateId(),
        content: msg.content,
        conversationId: activeConversation?.id || '',
        conversationTitle: activeConversation?.title || 'Chat',
        timestamp: msg.timestamp,
        pinnedAt: Date.now(),
      };
      updated = [pin, ...pins];
    }
    setPins(updated);
    savePins(updated);
  };

  const isPinned = (msg: DisplayMessage) =>
    pins.some(p => p.content === msg.content && p.timestamp === msg.timestamp);

  // OAuth callback handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, '/');
      authApi.callback(code).then(() => refresh()).catch(() => {
        setError('Failed to connect Google Ads.');
      });
    }
  }, [refresh]);

  if (adsLoading) {
    return <ChatSkeleton />;
  }

  if (!connected) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Connect Your Google Ads Account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            AdPilot gives you honest, plain-English insights into your Google Ads — the stuff Google doesn't make easy to find. Connect your account to get started.
          </Typography>
          <Button variant="contained" size="large" onClick={handleConnect}>
            Connect Google Ads
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!activeAccountId && accounts.length > 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Select an Account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choose which Google Ads account you'd like to work with.
          </Typography>
          <Select
            fullWidth
            value=""
            displayEmpty
            onChange={(e) => selectAccount(e.target.value as string)}
          >
            <MenuItem value="" disabled>Select an account</MenuItem>
            {accounts.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.name} ({a.id})</MenuItem>
            ))}
          </Select>
        </Paper>
      </Box>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages area */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ maxWidth: 680, width: '100%', mx: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!hasMessages && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 0.5 }}>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 11) return 'Good morning';
                  if (hour < 17) return 'Good afternoon';
                  return 'Good evening';
                })()}{activeAccountId ? `, ${accounts.find(a => a.id === activeAccountId)?.name || ''}` : ''}.
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                What can I do for you?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your ads advisor that works for you, not Google.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 480, mb: 4 }}>
                {STARTER_QUESTIONS.map(({ question, subtitle, icon }) => (
                  <Paper
                    key={question}
                    variant="outlined"
                    onClick={() => sendMessage(question)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 2.5,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}20`,
                      },
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25, textAlign: 'left' }}>
                      {question}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left', display: 'block' }}>
                      {subtitle}
                    </Typography>
                  </Paper>
                ))}
              </Box>
              {/* Centered input for empty state */}
              <Box sx={{ width: '100%', maxWidth: 680 }}>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      inputRef={inputRef}
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={6}
                      placeholder="Ask about your Google Ads..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                      disabled={isStreaming}
                      autoFocus
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '1rem' } }}
                    />
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={!input.trim() || isStreaming}
                      sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }, borderRadius: 3, px: 2 }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </form>
              </Box>
            </Box>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={`${activeConversation?.id}-${i}`}
              message={msg}
              isPinned={msg.role === 'assistant' ? isPinned(msg) : undefined}
              onTogglePin={msg.role === 'assistant' ? () => togglePin(msg) : undefined}
            />
          ))}

          {/* Follow-up chips after last message */}
          {!isStreaming && followUps.length > 0 && hasMessages && (
            <FollowUpChips questions={followUps} onSelect={sendMessage} />
          )}

          {/* Thinking / tool call indicators */}
          {isStreaming && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, ml: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'text.secondary',
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes pulse': {
                        '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                        '40%': { opacity: 1, transform: 'scale(1)' },
                      },
                    }}
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {activeTools.length > 0
                  ? TOOL_LABELS[activeTools[activeTools.length - 1]] || 'Working...'
                  : 'Thinking...'}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Bottom input area — only shown when conversation is active */}
      {hasMessages && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', px: 2, pt: 2, pb: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ maxWidth: 680, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  placeholder="Ask about your Google Ads..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                  disabled={isStreaming}
                  autoFocus
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '1rem' } }}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!input.trim() || isStreaming}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }, borderRadius: 3, px: 2 }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </form>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chat;
