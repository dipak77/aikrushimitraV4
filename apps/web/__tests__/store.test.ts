import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    useUserStore.getState().logout();
  });

  it('initializes with default states', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.language).toBe('mr');
  });

  it('successfully logs in a user', () => {
    const mockUser = {
      name: 'Ramesh Patel',
      village: 'Yavatmal',
      district: 'Yavatmal',
      landSize: '3',
      crop: 'cotton',
    };

    useUserStore.getState().login(mockUser, 'google');

    const state = useUserStore.getState();
    expect(state.user?.name).toBe('Ramesh Patel');
    expect(state.isAuthenticated).toBe(true);
    expect(state.authProvider).toBe('google');
  });

  it('updates profile settings correctly', () => {
    const mockUser = {
      name: 'Ramesh Patel',
      village: 'Yavatmal',
      district: 'Yavatmal',
      landSize: '3',
      crop: 'cotton',
    };

    useUserStore.getState().login(mockUser, 'google');
    useUserStore.getState().updateProfile({ landSize: '5' });

    const state = useUserStore.getState();
    expect(state.user?.landSize).toBe('5');
  });
});

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentView: 'SPLASH',
      previousView: null,
      navigationHistory: [],
    });
  });

  it('initializes with SPLASH view', () => {
    const state = useAppStore.getState();
    expect(state.currentView).toBe('SPLASH');
  });

  it('navigates to new views and updates history', () => {
    useAppStore.getState().navigate('DASHBOARD');
    
    let state = useAppStore.getState();
    expect(state.currentView).toBe('DASHBOARD');
    expect(state.previousView).toBe('SPLASH');
    expect(state.navigationHistory).toContain('SPLASH');
    
    useAppStore.getState().navigate('PROFILE');
    state = useAppStore.getState();
    expect(state.currentView).toBe('PROFILE');
    expect(state.previousView).toBe('DASHBOARD');
  });
});
