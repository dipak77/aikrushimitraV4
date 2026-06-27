import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Language } from '../types';

// ═══════════════════════════════════════════════════════════════
// USER STORE — Authentication, profile, and preferences
// Replaces: useState<UserProfile | null> in App.tsx
// Persistence: localStorage (survives page reload)
// ═══════════════════════════════════════════════════════════════

interface UserState {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  authProvider: 'google' | 'phone' | 'guest' | null;
  isLoading: boolean;

  // Preferences
  language: Language;
  notifications: boolean;
  voiceEnabled: boolean;
  offlineMode: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  login: (user: UserProfile, provider: 'google' | 'phone' | 'guest') => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  setNotifications: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      authProvider: null,
      isLoading: true,
      language: 'mr' as Language,
      notifications: true,
      voiceEnabled: true,
      offlineMode: false,

      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      login: (user, provider) => {
        const now = Date.now();
        const profileWithTimestamp = {
          ...user,
          lastLogin: now,
          joinedAt: user.joinedAt || now,
        };
        set({
          user: profileWithTimestamp,
          isAuthenticated: true,
          authProvider: provider,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          authProvider: null,
        });
        // Clear localStorage session
        try {
          localStorage.removeItem('user_session');
        } catch (e) {
          // Ignore localStorage errors in SSR
        }
      },

      updateProfile: (updates) => {
        const current = get().user;
        if (current) {
          const updated = { ...current, ...updates };
          set({ user: updated });
          // Sync to localStorage for backward compatibility
          try {
            localStorage.setItem('user_session', JSON.stringify(updated));
          } catch (e) {
            // Ignore
          }
        }
      },

      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setOfflineMode: (offlineMode) => set({ offlineMode }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'akm-user-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
        language: state.language,
        notifications: state.notifications,
        voiceEnabled: state.voiceEnabled,
        offlineMode: state.offlineMode,
      }),
    }
  )
);
