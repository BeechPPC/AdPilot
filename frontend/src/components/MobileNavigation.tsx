import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Star as StarIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  if (!isMobile) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
      >
        <BottomNavigationAction label="Dashboard" value="/" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Campaigns" value="/campaigns" icon={<CampaignIcon />} />
        <BottomNavigationAction label="Suggestions" value="/recommendations" icon={<StarIcon />} />
        <BottomNavigationAction label="Keywords" value="/search-terms" icon={<SearchIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation;
