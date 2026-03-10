import React, { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createAppTheme } from './styles/theme';
import MainLayout from './layouts/MainLayout';
import { GoogleAdsProvider } from './context/GoogleAdsContext';
import { TierProvider } from './context/TierContext';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Performance from './pages/Performance';
import SearchTerms from './pages/SearchTerms';
import Assets from './pages/Assets';
import Recommendations from './pages/Recommendations';
import AuctionInsights from './pages/AuctionInsights';
import BudgetIntelligence from './pages/BudgetIntelligence';
import AiChat from './pages/AiChat';
import AutoPilot from './pages/AutoPilot';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import GoogleAdsConnect from './components/GoogleAdsConnect';
import Login from './pages/Login';
import { hasToken } from './services/api';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();

  if (!hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <TierProvider>
                <GoogleAdsProvider>
                  <MainLayout onThemeToggle={toggleTheme} isDarkMode={mode === 'dark'}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/oauth2callback" element={<GoogleAdsConnect onboardAfterConnect />} />
                      <Route path="/welcome" element={<Onboarding />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/performance" element={<Performance />} />
                      <Route path="/search-terms" element={<SearchTerms />} />
                      <Route path="/assets" element={<Assets />} />
                      <Route path="/recommendations" element={<Recommendations />} />
                      <Route path="/auction-insights" element={<AuctionInsights />} />
                      <Route path="/budget" element={<BudgetIntelligence />} />
                      <Route path="/ai-chat" element={<AiChat />} />
                      <Route path="/autopilot" element={<AutoPilot />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </MainLayout>
                </GoogleAdsProvider>
              </TierProvider>
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
