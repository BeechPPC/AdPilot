import React, { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import { createAppTheme } from './styles/theme';
import MainLayout from './layouts/MainLayout';
import GoogleAdsConnect from './components/GoogleAdsConnect';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout onThemeToggle={toggleTheme} isDarkMode={mode === 'dark'}>
          <GoogleAdsConnect />
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
