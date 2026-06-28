import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewState } from '../types';

// ═══════════════════════════════════════════════════════════════
// APP STORE — Navigation, UI state, and global controls
// ADR-004: Zustand with persist middleware for localStorage
// ═══════════════════════════════════════════════════════════════

interface AppState {
  // Navigation
  currentView: ViewState;
  previousView: ViewState | null;
  navigationHistory: ViewState[];

  // UI State
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isMobile: boolean;

  // Selected items (detail views)
  selectedScheme: any | null;
  selectedKnowledgeItem: any | null;
  selectedBlogPost: any | null;

  // Global UI
  isOnline: boolean;
  showOfflineBanner: boolean;

  // Actions — Navigation
  navigate: (view: ViewState) => void;
  goBack: () => void;

  // Actions — UI
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;

  // Actions — Selections
  setSelectedScheme: (scheme: any | null) => void;
  setSelectedKnowledgeItem: (item: any | null) => void;
  setSelectedBlogPost: (post: any | null) => void;

  // Actions — Connectivity
  setOnline: (online: boolean) => void;
}

// Views that should not show the sidebar/navbar
const FULLSCREEN_VIEWS: ViewState[] = [
  'VOICE_ASSISTANT',
  'AREA_CALCULATOR',
  'SPLASH',
  'LANDING',
  'ADMIN',
  'LOGIN',
];

export const useAppStore = create<AppState>()(persist((set, get) => ({
  // Initial state
  currentView: 'SPLASH',
  previousView: null,
  navigationHistory: [],
  sidebarOpen: false,
  sidebarCollapsed: false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : true,
  selectedScheme: null,
  selectedKnowledgeItem: null,
  selectedBlogPost: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  showOfflineBanner: false,

  // Navigation
  navigate: (view) => {
    const current = get().currentView;
    set({
      currentView: view,
      previousView: current,
      navigationHistory: [...get().navigationHistory.slice(-19), current],
      // Clear detail selections when navigating away
      ...(view !== 'SCHEMES' ? { selectedScheme: null } : {}),
      ...(view !== 'AGRI_KNOWLEDGE' && view !== 'KNOWLEDGE_DETAIL'
        ? { selectedKnowledgeItem: null } : {}),
    });
  },

  goBack: () => {
    const { previousView, navigationHistory } = get();
    if (previousView) {
      const newHistory = [...navigationHistory];
      const lastView = newHistory.pop() || 'DASHBOARD';
      set({
        currentView: previousView,
        previousView: lastView as ViewState,
        navigationHistory: newHistory,
      });
    } else {
      set({ currentView: 'DASHBOARD' });
    }
  },

  // UI
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setIsMobile: (isMobile) => set({ isMobile }),

  // Selections
  setSelectedScheme: (selectedScheme) => set({ selectedScheme }),
  setSelectedKnowledgeItem: (selectedKnowledgeItem) => set({ selectedKnowledgeItem }),
  setSelectedBlogPost: (selectedBlogPost) => set({ selectedBlogPost }),

  // Connectivity
  setOnline: (isOnline) => set({
    isOnline,
    showOfflineBanner: !isOnline,
  }),
}), {
  name: 'akm-app-store',
  storage: createJSONStorage(() => localStorage),
  // Only persist navigation state — transient UI state resets on reload
  partialize: (state) => ({
    currentView: state.currentView,
    previousView: state.previousView,
    navigationHistory: state.navigationHistory,
    sidebarCollapsed: state.sidebarCollapsed,
  }),
}));

// Selectors (for performance — avoid re-renders)
export const selectIsFullscreen = (state: AppState) =>
  FULLSCREEN_VIEWS.includes(state.currentView);

export const selectShowNav = (state: AppState) =>
  !FULLSCREEN_VIEWS.includes(state.currentView);
