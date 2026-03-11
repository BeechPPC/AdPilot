import React from 'react';
import {
  Drawer, Box, Typography, IconButton, Paper, Tooltip,
} from '@mui/material';
import { Close, PushPin } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PinnedInsight } from '../services/storage';

interface PinsPanelProps {
  open: boolean;
  onClose: () => void;
  pins: PinnedInsight[];
  onUnpin: (id: string) => void;
}

const PinsPanel: React.FC<PinsPanelProps> = ({ open, onClose, pins, onUnpin }) => {
  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 340 } }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PushPin sx={{ fontSize: 18 }} color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Pinned Insights
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
        {pins.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No pinned insights yet. Hover over an AI message and click the pin icon to save it.
            </Typography>
          </Box>
        )}
        {pins.map(pin => (
          <Paper
            key={pin.id}
            variant="outlined"
            sx={{ p: 2, mb: 1.5, borderRadius: 2, '&:hover .unpin-btn': { opacity: 1 } }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {pin.conversationTitle} &middot; {new Date(pin.timestamp).toLocaleDateString()}
              </Typography>
              <Tooltip title="Unpin">
                <IconButton
                  className="unpin-btn"
                  size="small"
                  onClick={() => onUnpin(pin.id)}
                  sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.25, mt: -0.5 }}
                >
                  <PushPin sx={{ fontSize: 14 }} color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{
              '& p:first-of-type': { mt: 0 }, '& p:last-of-type': { mb: 0 },
              fontSize: '0.85rem', lineHeight: 1.5,
              '& table': { borderCollapse: 'collapse', width: '100%', my: 1 },
              '& th, & td': { border: 1, borderColor: 'divider', px: 1, py: 0.5, textAlign: 'left' },
              maxHeight: 200, overflow: 'auto',
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {pin.content.length > 500 ? pin.content.slice(0, 500) + '...' : pin.content}
              </ReactMarkdown>
            </Box>
          </Paper>
        ))}
      </Box>
    </Drawer>
  );
};

export default PinsPanel;
