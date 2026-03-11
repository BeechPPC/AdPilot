import React from 'react';
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemText,
  IconButton, Button, Tooltip,
} from '@mui/material';
import { Add, Delete, ChatBubbleOutline } from '@mui/icons-material';
import { useChat } from '../context/ChatContext';

interface ConversationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ConversationDrawer: React.FC<ConversationDrawerProps> = ({ open, onClose }) => {
  const { conversations, activeConversation, createConversation, switchConversation, deleteConversation } = useChat();

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleNew = () => {
    createConversation();
    onClose();
  };

  const handleSelect = (id: string) => {
    switchConversation(id);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 280 } }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Conversations
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={handleNew}
          sx={{ textTransform: 'none' }}
        >
          New Chat
        </Button>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {sorted.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <ChatBubbleOutline sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
          </Box>
        )}
        {sorted.map(conv => (
          <ListItemButton
            key={conv.id}
            selected={activeConversation?.id === conv.id}
            onClick={() => handleSelect(conv.id)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              pr: 1,
              '&:hover .delete-btn': { opacity: 1 },
            }}
          >
            <ListItemText
              primary={conv.title}
              secondary={`${conv.messages.length} messages`}
              primaryTypographyProps={{ noWrap: true, fontSize: '0.875rem', fontWeight: 500 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
            <Tooltip title="Delete">
              <IconButton
                className="delete-btn"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.5 }}
              >
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default ConversationDrawer;
