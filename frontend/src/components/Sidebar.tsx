import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, Box, Typography, Toolbar, useTheme, useMediaQuery, Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  Image as ImageIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  SmartToy as SmartToyIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useTier } from '../context/TierContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const selectedStyle = {
  '&.Mui-selected': {
    backgroundColor: '#eff6ff',
    borderRight: '3px solid #1e40af',
    '&:hover': { backgroundColor: '#eff6ff' },
  },
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const { isAdvanced } = useTier();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isSelected = (path: string) => location.pathname === path;
  const iconColor = (path: string) => isSelected(path) ? '#1e40af' : 'inherit';

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Toolbar />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>AdPilot</Typography>
        <Typography variant="caption" color="text.secondary">Simple Google Ads Management</Typography>
      </Box>
      <Divider />

      {/* Core pages */}
      <List>
        <ListItem button onClick={() => handleNav('/')} selected={isSelected('/')} sx={selectedStyle}>
          <ListItemIcon sx={{ color: iconColor('/') }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => handleNav('/campaigns')} selected={isSelected('/campaigns')} sx={selectedStyle}>
          <ListItemIcon sx={{ color: iconColor('/campaigns') }}><CampaignIcon /></ListItemIcon>
          <ListItemText primary="Campaigns" />
        </ListItem>
        <ListItem button onClick={() => handleNav('/recommendations')} selected={isSelected('/recommendations')} sx={selectedStyle}>
          <ListItemIcon sx={{ color: iconColor('/recommendations') }}><StarIcon /></ListItemIcon>
          <ListItemText primary="Suggestions" secondary="Things to improve" />
        </ListItem>
        <ListItem button onClick={() => handleNav('/search-terms')} selected={isSelected('/search-terms')} sx={selectedStyle}>
          <ListItemIcon sx={{ color: iconColor('/search-terms') }}><SearchIcon /></ListItemIcon>
          <ListItemText primary="Keywords" secondary="What people searched" />
        </ListItem>
      </List>

      <Divider />

      {/* Advanced section (collapsed by default) */}
      <List>
        <ListItem button onClick={() => setAdvancedOpen(!advancedOpen)}>
          <ListItemText
            primary={
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
                Advanced
              </Typography>
            }
          />
          {advancedOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </ListItem>
        <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
          <ListItem button onClick={() => handleNav('/performance')} selected={isSelected('/performance')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/performance'), minWidth: 36 }}><TrendingUpIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Performance" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/assets')} selected={isSelected('/assets')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/assets'), minWidth: 36 }}><ImageIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ad Assets" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/budget')} selected={isSelected('/budget')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/budget'), minWidth: 36 }}><AttachMoneyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Budgets" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/auction-insights')} selected={isSelected('/auction-insights')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/auction-insights'), minWidth: 36 }}><PeopleIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Competitors" />
          </ListItem>
        </Collapse>
      </List>

      <Divider />

      {/* AI Features */}
      <List>
        <ListItem button onClick={() => setAiOpen(!aiOpen)}>
          <ListItemText
            primary={
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
                AI Features
              </Typography>
            }
          />
          {aiOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </ListItem>
        <Collapse in={aiOpen} timeout="auto" unmountOnExit>
          <ListItem button onClick={() => handleNav('/ai-chat')} selected={isSelected('/ai-chat')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/ai-chat'), minWidth: 36 }}><ChatIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="AI Chat" />
            {!isAdvanced && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          </ListItem>
          <ListItem button onClick={() => handleNav('/autopilot')} selected={isSelected('/autopilot')} sx={{ ...selectedStyle, pl: 3 }}>
            <ListItemIcon sx={{ color: iconColor('/autopilot'), minWidth: 36 }}><SmartToyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="AutoPilot" />
            {!isAdvanced && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          </ListItem>
        </Collapse>
      </List>

      <Divider />

      {/* Settings */}
      <List>
        <ListItem button onClick={() => handleNav('/settings')} selected={isSelected('/settings')} sx={selectedStyle}>
          <ListItemIcon sx={{ color: iconColor('/settings') }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', borderRight: '1px solid #d1d5db' },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
