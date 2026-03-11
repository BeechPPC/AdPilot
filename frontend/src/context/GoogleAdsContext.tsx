import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, googleAdsApi, Account } from '../services/api';

interface GoogleAdsState {
  connected: boolean;
  accounts: Account[];
  activeAccountId: string | null;
  loading: boolean;
  selectAccount: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const GoogleAdsContext = createContext<GoogleAdsState>({
  connected: false,
  accounts: [],
  activeAccountId: null,
  loading: true,
  selectAccount: async () => {},
  refresh: async () => {},
  disconnect: async () => {},
});

export const useGoogleAds = () => useContext(GoogleAdsContext);

export const GoogleAdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = await authApi.status();
      setConnected(status.connected);
      if (status.connected) {
        try {
          const accts = await googleAdsApi.accounts();
          setAccounts(accts.customers);
          setActiveAccountId(accts.activeCustomerId);
        } catch {
          // May not have accounts yet
        }
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectAccount = async (id: string) => {
    await googleAdsApi.selectAccount(id);
    setActiveAccountId(id);
  };

  const disconnect = async () => {
    await authApi.disconnect();
    setConnected(false);
    setAccounts([]);
    setActiveAccountId(null);
  };

  return (
    <GoogleAdsContext.Provider value={{
      connected, accounts, activeAccountId, loading,
      selectAccount, refresh, disconnect,
    }}>
      {children}
    </GoogleAdsContext.Provider>
  );
};
