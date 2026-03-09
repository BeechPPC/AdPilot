import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tierApi } from '../services/api';

type Tier = 'pro' | 'advanced';

interface TierState {
  tier: Tier;
  isAdvanced: boolean;
  loading: boolean;
  setTier: (tier: Tier) => Promise<void>;
}

const TierContext = createContext<TierState>({
  tier: 'pro',
  isAdvanced: false,
  loading: true,
  setTier: async () => {},
});

export const useTier = () => useContext(TierContext);

export const TierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<Tier>('pro');
  const [loading, setLoading] = useState(true);

  const fetchTier = useCallback(async () => {
    try {
      const data = await tierApi.get();
      setTierState(data.tier);
    } catch {
      setTierState('pro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  const setTier = async (newTier: Tier) => {
    await tierApi.set(newTier);
    setTierState(newTier);
  };

  return (
    <TierContext.Provider value={{ tier, isAdvanced: tier === 'advanced', loading, setTier }}>
      {children}
    </TierContext.Provider>
  );
};
