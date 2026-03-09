import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileNavigation from '../components/MobileNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onThemeToggle, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={toggleSidebar} onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: isSidebarOpen ? '240px' : 0 },
          mt: '60px',
          mb: isMobile ? '56px' : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
      <MobileNavigation />
    </Box>
  );
};

export default MainLayout; 