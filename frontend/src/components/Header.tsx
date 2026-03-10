import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box,
  Menu, MenuItem, Avatar, FormControl, Select, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useGoogleAds } from '../context/GoogleAdsContext';
import DateRangePicker from './DateRangePicker';

interface HeaderProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onThemeToggle, isDarkMode }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { connected, accounts, activeAccountId, selectAccount } = useGoogleAds();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 700, mr: 3 }}>
          AdPilot
        </Typography>

        {connected && accounts.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 180, mr: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'background.default' } }}>
            <Select
              value={activeAccountId || ''}
              displayEmpty
              sx={{ height: 36 }}
              onChange={(e) => selectAccount(e.target.value as string)}
            >
              <MenuItem value="" disabled>Select Account</MenuItem>
              {accounts.map((acct) => (
                <MenuItem key={acct.id} value={acct.id}>{acct.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <DateRangePicker />

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton onClick={onThemeToggle} color="inherit">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{ ml: 2 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>JD</Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
