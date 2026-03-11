import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatHeader from '../components/ChatHeader';
import ConversationDrawer from '../components/ConversationDrawer';
import PinsPanel from '../components/PinsPanel';
import { loadPins, savePins, PinnedInsight } from '../services/storage';

interface ChatLayoutProps {
  children: React.ReactNode;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, onThemeToggle, isDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinsOpen, setPinsOpen] = useState(false);
  const [pins, setPins] = useState<PinnedInsight[]>(() => loadPins());

  const handleUnpin = (id: string) => {
    const updated = pins.filter(p => p.id !== id);
    setPins(updated);
    savePins(updated);
  };

  // Refresh pins when panel opens (in case Chat.tsx added new ones)
  const handlePinsOpen = () => {
    setPins(loadPins());
    setPinsOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <ChatHeader
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onDrawerOpen={() => setDrawerOpen(true)}
        pinCount={pins.length}
        onPinsOpen={handlePinsOpen}
      />
      <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
      <ConversationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PinsPanel open={pinsOpen} onClose={() => setPinsOpen(false)} pins={pins} onUnpin={handleUnpin} />
    </Box>
  );
};

export default ChatLayout;
