'use client';

import React, { useState } from 'react';
import LandingPage from '../components/views/LandingPage';
import { Language } from '../types';
import AnalyticsTracker from '../components/AnalyticsTracker';

export default function Home() {
  const [lang, setLang] = useState<Language>('mr');

  const handleGetStarted = () => {
    // Redirect to the client-only SPA app space with trailing slash for cleanUrl compatibility
    if (typeof window !== 'undefined') {
      window.location.href = '/app/';
    }
  };

  return (
    <>
      <AnalyticsTracker viewName="LANDING_PAGE" locationName="Landing Page" />
      <LandingPage
        onGetStarted={handleGetStarted}
        lang={lang}
        setLang={setLang}
      />
    </>
  );
}
