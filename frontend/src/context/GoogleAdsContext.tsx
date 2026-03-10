import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { authApi, googleAdsApi, Account } from '../services/api';

/** The value pages should pass to API calls — either a preset string or custom date object */
export type DateParam = string | { startDate: string; endDate: string };

interface GoogleAdsState {
  connected: boolean;
  accounts: Account[];
  activeAccountId: string | null;
  loading: boolean;
  dateRange: string;
  setDateRange: (range: string) => void;
  customStartDate: string | null;
  customEndDate: string | null;
  setCustomStartDate: (d: string | null) => void;
  setCustomEndDate: (d: string | null) => void;
  /** Ready-to-use param for API calls — handles CUSTOM automatically */
  dateParam: DateParam;
  compareEnabled: boolean;
  setCompareEnabled: (v: boolean) => void;
  comparisonDateRange: { startDate: string; endDate: string } | null;
  selectAccount: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const GoogleAdsContext = createContext<GoogleAdsState>({
  connected: false,
  accounts: [],
  activeAccountId: null,
  loading: true,
  dateRange: 'LAST_30_DAYS',
  setDateRange: () => {},
  customStartDate: null,
  customEndDate: null,
  setCustomStartDate: () => {},
  setCustomEndDate: () => {},
  dateParam: 'LAST_30_DAYS',
  compareEnabled: false,
  setCompareEnabled: () => {},
  comparisonDateRange: null,
  selectAccount: async () => {},
  refresh: async () => {},
  disconnect: async () => {},
});

export const useGoogleAds = () => useContext(GoogleAdsContext);

/** Compute the previous-period date range for comparison */
function computeComparisonRange(
  dateRange: string,
  customStart: string | null,
  customEnd: string | null,
): { startDate: string; endDate: string } | null {
  const today = dayjs();

  if (dateRange === 'CUSTOM') {
    if (!customStart || !customEnd) return null;
    const start = dayjs(customStart);
    const end = dayjs(customEnd);
    const days = end.diff(start, 'day') + 1;
    return {
      startDate: start.subtract(days, 'day').format('YYYY-MM-DD'),
      endDate: start.subtract(1, 'day').format('YYYY-MM-DD'),
    };
  }

  const presetDays: Record<string, number> = {
    LAST_7_DAYS: 7,
    LAST_14_DAYS: 14,
    LAST_30_DAYS: 30,
    LAST_90_DAYS: 90,
  };

  if (presetDays[dateRange]) {
    const days = presetDays[dateRange];
    // "Last N days" means today-N+1 through yesterday (Google Ads excludes today)
    const end = today.subtract(1, 'day');
    const start = end.subtract(days - 1, 'day');
    const prevEnd = start.subtract(1, 'day');
    const prevStart = prevEnd.subtract(days - 1, 'day');
    return {
      startDate: prevStart.format('YYYY-MM-DD'),
      endDate: prevEnd.format('YYYY-MM-DD'),
    };
  }

  if (dateRange === 'THIS_MONTH') {
    const monthStart = today.startOf('month');
    const daysInPeriod = today.diff(monthStart, 'day') + 1;
    const prevEnd = monthStart.subtract(1, 'day');
    const prevStart = prevEnd.subtract(daysInPeriod - 1, 'day');
    return {
      startDate: prevStart.format('YYYY-MM-DD'),
      endDate: prevEnd.format('YYYY-MM-DD'),
    };
  }

  if (dateRange === 'LAST_MONTH') {
    const lastMonthStart = today.subtract(1, 'month').startOf('month');
    const lastMonthEnd = today.subtract(1, 'month').endOf('month');
    const days = lastMonthEnd.diff(lastMonthStart, 'day') + 1;
    const prevEnd = lastMonthStart.subtract(1, 'day');
    const prevStart = prevEnd.subtract(days - 1, 'day');
    return {
      startDate: prevStart.format('YYYY-MM-DD'),
      endDate: prevEnd.format('YYYY-MM-DD'),
    };
  }

  return null;
}

export const GoogleAdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [compareEnabled, setCompareEnabled] = useState(false);

  const dateParam: DateParam = useMemo(
    () => dateRange === 'CUSTOM' && customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : dateRange,
    [dateRange, customStartDate, customEndDate],
  );

  const comparisonDateRange = useMemo(
    () => compareEnabled ? computeComparisonRange(dateRange, customStartDate, customEndDate) : null,
    [compareEnabled, dateRange, customStartDate, customEndDate],
  );

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
      dateRange, setDateRange,
      customStartDate, customEndDate, setCustomStartDate, setCustomEndDate,
      dateParam,
      compareEnabled, setCompareEnabled, comparisonDateRange,
      selectAccount, refresh, disconnect,
    }}>
      {children}
    </GoogleAdsContext.Provider>
  );
};
