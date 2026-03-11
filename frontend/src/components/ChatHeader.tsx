import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Badge, Tooltip } from '@mui/material';
import {
  Settings as SettingsIcon, Brightness4, Brightness7, Logout,
  Menu as MenuIcon, Add, Download, PushPin,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../services/api';
import { useChat } from '../context/ChatContext';
import { exportAsMarkdown } from '../services/exportChat';

interface ChatHeaderProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onDrawerOpen: () => void;
  pinCount: number;
  onPinsOpen: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onThemeToggle, isDarkMode, onDrawerOpen, pinCount, onPinsOpen }) => {
  const navigate = useNavigate();
  const { activeConversation, createConversation } = useChat();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const handleNewChat = () => {
    createConversation();
  };

  const handleExport = () => {
    if (activeConversation && activeConversation.messages.length > 0) {
      exportAsMarkdown(activeConversation);
    }
  };

  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  return (
    <AppBar position="static" elevation={0} color="default">
      <Toolbar variant="dense" sx={{ minHeight: 36 }}>
        <Tooltip title="Conversations">
          <IconButton size="small" onClick={onDrawerOpen} sx={{ mr: 0.5 }}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          AdPilot
        </Typography>
        <Tooltip title="New chat">
          <IconButton size="small" onClick={handleNewChat} sx={{ ml: 1 }}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        {hasMessages && (
          <Tooltip title="Export chat">
            <IconButton size="small" onClick={handleExport} sx={{ mr: 0.5 }}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Pinned insights">
          <IconButton size="small" onClick={onPinsOpen} sx={{ mr: 0.5 }}>
            <Badge badgeContent={pinCount} color="primary" max={99}>
              <PushPin fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onThemeToggle} sx={{ mr: 0.5 }}>
          {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
        </IconButton>
        <IconButton size="small" onClick={() => navigate('/settings')} sx={{ mr: 0.5 }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleLogout}>
          <Logout fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
