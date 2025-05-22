import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Chat as ChatIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  isPro?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { title: 'Performance', icon: <TrendingUpIcon />, path: '/performance' },
    { title: 'Search Terms', icon: <SearchIcon />, path: '/search-terms' },
    { title: 'Assets', icon: <ImageIcon />, path: '/assets' },
    { title: 'Performance Max', icon: <SpeedIcon />, path: '/performance-max' },
    { title: 'Recommendations', icon: <StarIcon />, path: '/recommendations' },
    { title: 'Auction Insights', icon: <PeopleIcon />, path: '/auction-insights' },
    { title: 'Budget Intelligence', icon: <AttachMoneyIcon />, path: '/budget' },
  ];

  const proItems: NavItem[] = [
    { title: 'AI Chat', icon: <ChatIcon />, path: '/ai-chat', isPro: true },
    { title: 'Autonomous', icon: <BoltIcon />, path: '/autonomous', isPro: true },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
          AdPilot
        </Typography>
      </Box>
      <Divider />
      
      <List>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Overview
        </Typography>
        {navItems.slice(0, 2).map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#eff6ff',
                borderRight: '3px solid #1e40af',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1e40af' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <List>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Analysis
        </Typography>
        {navItems.slice(2).map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#eff6ff',
                borderRight: '3px solid #1e40af',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1e40af' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <List>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          AI Assistant
        </Typography>
        {proItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#eff6ff',
                borderRight: '3px solid #1e40af',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#1e40af' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
            {item.isPro && (
              <Box
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                PRO
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid #d1d5db',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar; 