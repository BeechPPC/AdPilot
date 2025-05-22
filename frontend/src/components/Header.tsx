import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle
} from '@mui/icons-material';

interface HeaderProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onThemeToggle, isDarkMode }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ color: 'primary.main', fontWeight: 700, mr: 4 }}
        >
          AdPilot
        </Typography>

        <FormControl
          size="small"
          sx={{
            minWidth: 120,
            mr: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
            },
          }}
        >
          <Select
            value="30"
            displayEmpty
            sx={{ height: 40 }}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="14">Last 14 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            mr: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
            },
          }}
        >
          <Select
            value="all"
            displayEmpty
            sx={{ height: 40 }}
          >
            <MenuItem value="all">All Campaigns</MenuItem>
            <MenuItem value="active">Active Campaigns</MenuItem>
            <MenuItem value="paused">Paused Campaigns</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <MuiIconButton onClick={onThemeToggle} color="inherit">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </MuiIconButton>
        </Tooltip>

        <IconButton
          onClick={handleMenuClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>JD</Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
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