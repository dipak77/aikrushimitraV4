import React, { useEffect, useCallback } from 'react';
import { ViewState, Language, UserProfile } from './types';
import { logActivity } from './services/analyticsService';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useUserStore } from './store/useUserStore';
import { useAppStore } from './store/useAppStore';

// Layout
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import NotificationSystem from './components/NotificationSystem';

// Views
import Dashboard from './components/views/Dashboard';
import VoiceAssistant from './components/views/VoiceAssistant';
import DiseaseDetector from './components/views/DiseaseDetector';
import SoilAnalysis from './components/views/SoilAnalysis';
import YieldPredictor from './components/views/YieldPredictor';
import AreaCalculator from './components/views/AreaCalculator';
import SchemesView from './components/views/SchemesView';
import SchemeDetailView from './components/views/SchemeDetailView';
import MarketView from './components/views/MarketView';
import WeatherView from './components/views/WeatherView';
import ProfileView from './components/views/ProfileView';
import CropCalendarView from './components/views/CropCalendarView';
import AdminDashboard from './components/views/AdminDashboard';
import SplashScreen from './components/views/SplashScreen';
import LandingPage from './components/views/LandingPage';
import SabjiMandiView from './components/views/SabjiMandiView';
import LoginView from './components/views/LoginView';
import AgriKnowledgeView from './components/views/AgriKnowledgeView';
import KnowledgeDetailView from './components/views/KnowledgeDetailView';
import OnboardingView from './components/views/OnboardingView';
import ChatView from './components/views/ChatView';
import CommunityForumView from './components/views/CommunityForumView';
import PremiumServicesView from './components/views/PremiumServicesView';
import InnovationHubView from './components/views/InnovationHubView';
import { OfflineDB } from './utils/offlineDb';
import { analyzeCropDisease } from './services/geminiService';

const App = () => {
  const { user, login, logout, language: lang, setLanguage: setLang, updateProfile, setUser } = useUserStore();
  const { currentView: view, navigate: setView, selectedScheme, setSelectedScheme, selectedKnowledgeItem, setSelectedKnowledgeItem } = useAppStore();
  
  // --- GOOGLE CLIENT ID ---
  const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "";

  // --- ANALYTICS TRACKING ---
  useEffect(() => {
    if (view !== 'SPLASH') {
       const location = user ? (localStorage.getItem('last_known_loc') || user.village) : 'Landing Page';
       logActivity(view, location, user || undefined);
     }
  }, [view, user]);

  // --- OFFLINE SYNC PROCESSING ---
  const processOfflineQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const queue = await OfflineDB.getQueuedDiagnostics();
      if (queue.length === 0) return;

      console.log(`📡 Offline Sync: Processing ${queue.length} queued diagnostics...`);
      for (const item of queue) {
        try {
          await analyzeCropDisease(item.imageBase64, item.lang as Language);
          await OfflineDB.removeQueuedDiagnostic(item.id!);
          console.log(`✅ Background Sync complete for ${item.id}`);
        } catch (syncErr) {
          console.warn(`Failed to sync diagnostic ${item.id}:`, syncErr);
        }
      }
    } catch (err) {
      console.error("Offline Queue processing failed:", err);
    }
  }, []);

  useEffect(() => {
    processOfflineQueue();
    window.addEventListener('online', processOfflineQueue);
    return () => {
      window.removeEventListener('online', processOfflineQueue);
    };
  }, [processOfflineQueue]);

  // --- AUTH CHECK ---
  const handleSplashComplete = useCallback(() => {
      let hasSession = false;
      try {
          // Check for existing session
          const savedSession = localStorage.getItem('user_session');
          if (savedSession) {
              const parsedUser = JSON.parse(savedSession);
              login(parsedUser, parsedUser.provider || 'unknown');
              hasSession = true;
          }
      } catch (e) {
          console.error("Session load error:", e);
      } finally {
          // Route authenticated users to Dashboard, and guests to Login
          setView(hasSession ? 'DASHBOARD' : 'LOGIN');
      }
  }, [setView, login]);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
      login(loggedInUser, 'google');
      setView('DASHBOARD');
  };

  const needsOnboarding = user && (!user.crop || user.crop === 'Not Selected' || user.crop === 'Select Crop' || user.village === 'Maharashtra');

  const getView = () => {
    // If no user is set (and not on Splash or Landing), force Login View
    if (!user && view !== 'SPLASH' && view !== 'LANDING') {
        return <LoginView onLoginSuccess={handleLoginSuccess} lang={lang} />;
    }

    // Force onboarding if details are incomplete
    if (user && needsOnboarding && view !== 'SPLASH' && view !== 'LANDING' && view !== 'PROFILE') {
        return <OnboardingView lang={lang} user={user} onComplete={(updatedUser) => {
            updateProfile(updatedUser);
            setView('DASHBOARD');
        }} />;
    }

    switch(view) {
       case 'SPLASH': return <SplashScreen onComplete={handleSplashComplete} />;
       case 'LANDING': return <LandingPage onGetStarted={() => user ? setView('DASHBOARD') : setView('LOGIN')} lang={lang} setLang={setLang} />;
       case 'LOGIN': return <LoginView onLoginSuccess={handleLoginSuccess} lang={lang} />;
       case 'DASHBOARD': return user ? <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} /> : null;
       case 'VOICE_ASSISTANT': return user ? <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SOIL': return <SoilAnalysis lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'YIELD': return <YieldPredictor lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'AREA_CALCULATOR': return <AreaCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'CALENDAR': return <CropCalendarView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'ADMIN': return <AdminDashboard lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'SABJI_MANDI': return user ? <SabjiMandiView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'SCHEMES': 
          if(selectedScheme) {
             return <SchemeDetailView scheme={selectedScheme} lang={lang} onBack={() => setSelectedScheme(null)} />;
          }
          return <SchemesView lang={lang} onBack={() => setView('DASHBOARD')} onSelect={(s) => setSelectedScheme(s)} />;
       case 'AGRI_KNOWLEDGE':
          if (selectedKnowledgeItem) {
             return <KnowledgeDetailView item={selectedKnowledgeItem} lang={lang} onBack={() => setSelectedKnowledgeItem(null)} />;
          }
          return <AgriKnowledgeView lang={lang} onBack={() => setView('DASHBOARD')} onSelect={(item) => setSelectedKnowledgeItem(item)} />;
       case 'MARKET': 
         return <MarketView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'WEATHER':
         return <WeatherView lang={lang} onBack={() => setView('DASHBOARD')} />;
       case 'PROFILE':
         return user ? <ProfileView lang={lang} currentUser={user} onSave={(u) => { setUser(u); localStorage.setItem('user_session', JSON.stringify(u)); setView('DASHBOARD'); }} onBack={() => setView('DASHBOARD')} /> : null;
       case 'CHAT':
         return user ? <ChatView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'COMMUNITY':
         return user ? <CommunityForumView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'PREMIUM':
         return user ? <PremiumServicesView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       case 'INNOVATION':
         return user ? <InnovationHubView lang={lang} user={user} onBack={() => setView('DASHBOARD')} /> : null;
       default: return user ? <Dashboard lang={lang} setLang={setLang} user={user} onNavigate={setView} /> : null;
    }
  };

  const isFullScreen = view === 'VOICE_ASSISTANT' || view === 'AREA_CALCULATOR' || view === 'SPLASH' || view === 'LANDING' || view === 'ADMIN' || view === 'LOGIN';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className={`relative w-full ${view === 'LANDING' ? 'min-h-screen' : 'h-[100dvh]'} bg-transparent ${view === 'LANDING' ? '' : 'overflow-hidden'} text-slate-100 font-jakarta`}>
        
        {/* 1. Global Background Layers */}
        <div className="premium-bg">
            <div className="planet-orb-main"></div>
            <div className="planet-ring"></div>
            <div className="planet-orb-secondary"></div>
            <div className="star-field"></div>
        </div>

        {/* 2. Notification System */}
        {!isFullScreen && <NotificationSystem lang={lang} onNavigate={setView} />}

        {/* 3. Navigation Sidebar */}
        {!isFullScreen && <Sidebar view={view} setView={setView} lang={lang} />}

        {/* 4. Main Content Area */}
        <main className={`relative w-full ${view === 'LANDING' ? '' : 'h-full'} z-10`}>
            {getView()}
        </main>

        {/* 5. Mobile Navigation */}
        {!isFullScreen && <MobileNav view={view} setView={setView} />}
        </div>
    </GoogleOAuthProvider>
  );
};

export default App;