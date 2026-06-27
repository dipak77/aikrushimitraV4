'use client';

import React, { useState } from 'react';
import LandingPage from '../components/views/LandingPage';
import { Language } from '../types';

export default function Home() {
  const [lang, setLang] = useState<Language>('mr');

  const handleGetStarted = () => {
    // Redirect to the client-only SPA app space
    window.location.href = '/app';
  };

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      lang={lang}
      setLang={setLang}
    />
  );
}
