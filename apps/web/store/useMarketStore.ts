import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '../services/geminiService';

// ═══════════════════════════════════════════════════════════════
// MARKET STORE — Live prices, comparisons, and price alert rules
// ═══════════════════════════════════════════════════════════════

interface PriceAlert {
  id: string;
  crop: string;
  threshold: number;
  direction: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}

interface MarketState {
  // Price feeds
  latestPrices: Record<string, any>;
  priceHistory: Record<string, any[]>;
  compareList: string[]; // List of market codes or crop names to compare
  
  // Alert rules
  alerts: PriceAlert[];
  
  // Loading & error
  isLoadingPrices: boolean;
  priceError: string | null;

  // Actions
  setLatestPrices: (prices: Record<string, any>) => void;
  setPriceHistory: (crop: string, history: any[]) => void;
  toggleCompare: (item: string) => void;
  clearCompare: () => void;
  
  // Alert actions
  addAlert: (crop: string, threshold: number, direction: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  toggleAlertActive: (id: string) => void;
  
  // Remote sync
  fetchPrices: (state: string, district: string, crop?: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      latestPrices: {},
      priceHistory: {},
      compareList: [],
      alerts: [],
      isLoadingPrices: false,
      priceError: null,

      setLatestPrices: (latestPrices) => set({ latestPrices, priceError: null }),
      
      setPriceHistory: (crop, history) => set((state) => ({
        priceHistory: { ...state.priceHistory, [crop]: history }
      })),

      toggleCompare: (item) => set((state) => {
        const exists = state.compareList.includes(item);
        const newList = exists
          ? state.compareList.filter((i) => i !== item)
          : [...state.compareList, item];
        return { compareList: newList };
      }),

      clearCompare: () => set({ compareList: [] }),

      addAlert: (crop, threshold, direction) => set((state) => {
        const newAlert: PriceAlert = {
          id: `alert_${Date.now()}`,
          crop,
          threshold,
          direction,
          isActive: true,
          createdAt: Date.now()
        };
        return { alerts: [...state.alerts, newAlert] };
      }),

      removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id)
      })),

      toggleAlertActive: (id) => set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, isActive: !a.isActive } : a
        )
      })),

      fetchPrices: async (state, district, crop) => {
        set({ isLoadingPrices: true, priceError: null });
        try {
          // Make API call to weather/prices proxy
          const url = `/api/v1/market?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}${crop ? `&crop=${encodeURIComponent(crop)}` : ''}`;
          const response = await fetch(getApiUrl(url));
          if (!response.ok) throw new Error('Failed to retrieve price indexes');
          const data = await response.json();
          set({ latestPrices: data, isLoadingPrices: false });
        } catch (err: any) {
          set({ priceError: err.message || 'Error fetching prices', isLoadingPrices: false });
        }
      }
    }),
    {
      name: 'akm-market-store',
      partialize: (state) => ({
        alerts: state.alerts,
        compareList: state.compareList
      })
    }
  )
);
