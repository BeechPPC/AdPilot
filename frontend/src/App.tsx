import React, { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createAppTheme } from './styles/theme';
import ChatLayout from './layouts/ChatLayout';
import { GoogleAdsProvider } from './context/GoogleAdsContext';
import { ChatProvider } from './context/ChatContext';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { hasToken } from './services/api';
import { loadTheme, saveTheme } from './services/storage';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  if (!hasToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(loadTheme);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const toggleTheme = () => setMode(prev => {
    const next = prev === 'light' ? 'dark' : 'light';
    saveTheme(next);
    return next;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <GoogleAdsProvider>
                <ChatProvider>
                  <ChatLayout onThemeToggle={toggleTheme} isDarkMode={mode === 'dark'}>
                    <Routes>
                      <Route path="/" element={<Chat />} />
                      <Route path="/oauth2callback" element={<Chat />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </ChatLayout>
                </ChatProvider>
              </GoogleAdsProvider>
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
