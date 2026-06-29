import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../../types';
import {
  Leaf, TrendingUp, CloudRain, Sprout, Map as MapIcon,
  ArrowRight, Languages, Users, Sparkles, Target, Eye,
  Cpu, Zap, Camera, CheckCircle2, Tractor,
  Factory, Coins, Clock, Mail, Phone, MapPin, ChevronDown,
  Menu, X, ShieldCheck, Heart, HelpCircle, Star, Award,
  Smartphone, Play, Send, ExternalLink,
  IndianRupee, Sun, Bug, MessageSquare, Headphones, UserCheck, Loader2
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { TRANSLATIONS, LANGUAGES } from '../../constants';
import { getAIFarmingAdvice } from '../../services/geminiService';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

/* ============================================================
   AI KRUSHI MITRA — Premium Landing Page (redesign)
   Same component name, props, i18n keys & section ids as the
   original, restyled to the "Verdant Intelligence" design system.
   ============================================================ */

// Optimized SEO Head Component
const SEOHead = ({ lang, t }: { lang: string; t: any }) => {
  useEffect(() => {
    document.title = `${t.app_name} — ${t.landing_tagline} | AI-Powered Smart Farming`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t.landing_desc);
    }
  }, [lang, t]);
  return null;
};

// Lightweight Intersection Observer Hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isInView };
};

// Animated Counter
const Counter = ({ end, duration = 1800, isInView }: { end: number; duration?: number; isInView: boolean }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, isInView]);
  return <>{count}</>;
};

// ---------- shared premium styling helpers ----------
const reveal = (isInView: boolean, delay = 0) =>
  `transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    isInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
  }${delay ? ` delay-${delay}` : ''}`;

const meshBg: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(at 20% 20%, rgba(16,185,129,0.18) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(245,158,11,0.10) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(6,182,212,0.12) 0px, transparent 50%), radial-gradient(at 10% 90%, rgba(132,204,22,0.10) 0px, transparent 50%)',
};

const gridPattern: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

// ============================================================
// HEADER
// ============================================================
const Header = ({
  scrolled, mobileMenuOpen, setMobileMenuOpen, langMenuOpen, setLangMenuOpen,
  lang, setLang, t, handleScrollTo, handleGetStarted
}: any) => {
  const navLinks = [
    { name: t.menu_dashboard, href: '#dashboard', isApp: true },
    { name: t.landing_nav_about, href: '#about' },
    { name: t.landing_btn_explore, href: '#features' },
    { name: t.landing_how_title, href: '#how-it-works' },
    { name: t.landing_nav_solutions, href: '#solutions' },
    { name: t.landing_benefits_title, href: '#benefits' },
    { name: t.menu_market, href: '#contact' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'top-9 py-2' : 'top-9 py-4'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between rounded-2xl h-14 px-4 sm:px-5 transition-all duration-500 ${
            scrolled
              ? 'bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
              : 'bg-transparent border border-transparent'
          }`}
        >
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleScrollTo(e, '#home')}
            className="flex items-center gap-2.5 group"
            aria-label={t.app_name}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-md group-hover:bg-emerald-500/60 transition-colors" />
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950 shadow-lg">
                <Sprout className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold text-white tracking-tight">{t.app_name}</span>
              <span className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-[0.18em]">{t.landing_tagline}</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav
            className="hidden xl:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link: any) => (
              <a
                key={link.name}
                href={link.isApp ? '/app/' : link.href}
                onClick={(e) => {
                  if (link.isApp) {
                    e.preventDefault();
                    handleGetStarted();
                  } else {
                    handleScrollTo(e, link.href);
                  }
                }}
                className="px-3.5 py-2 text-[13.5px] font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all flex items-center gap-1.5 text-[13px] font-medium"
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
              >
                <Languages size={15} className="text-emerald-400" />
                <span className="text-xs font-semibold uppercase">{LANGUAGES.find((l: any) => l.code === lang)?.code}</span>
                <ChevronDown size={12} className={`opacity-60 transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto scrollbar-premium">
                    {LANGUAGES.map((l: any) => (
                      <button
                        key={l.code}
                        role="option"
                        aria-selected={lang === l.code}
                        onClick={() => { setLang(l.code as Language); setLangMenuOpen(false); triggerHaptic(); }}
                        className={`flex flex-col items-start px-3 py-2.5 rounded-xl transition-all text-left ${
                          lang === l.code
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'hover:bg-white/5 text-slate-300 border border-transparent'
                        }`}
                      >
                        <span className="text-sm font-medium">{l.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleGetStarted}
              className="hidden md:inline-flex group items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <span>{t.landing_product_btn}</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden xl:hidden w-9 h-9 grid place-items-center rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Mobile Menu — premium slide-in
const MobileMenu = ({ mobileMenuOpen, setMobileMenuOpen, navLinks, handleScrollTo, setLang, lang, handleGetStarted, t }: any) => {
  if (!mobileMenuOpen) return null;
  return (
    <>
      <div
        className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
        onClick={() => setMobileMenuOpen(false)}
      />
      <nav
        className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950">
              <Sprout className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-white">{t.app_name}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-slate-300 hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-premium">
          {navLinks.map((link: any) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => { setMobileMenuOpen(false); handleScrollTo(e, link.href); }}
              className="block px-4 py-3 text-base font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-5 mt-3 border-t border-white/10">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-3 flex items-center gap-2">
              <Languages size={12} className="text-emerald-500" /> Language
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map((l: any) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code as Language); triggerHaptic(); }}
                  className={`py-2 px-2 rounded-lg transition-all flex flex-col items-center border ${
                    lang === l.code
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-medium">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 rounded-xl font-semibold"
          >
            <span>{t.landing_product_btn}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </nav>
    </>
  );
};

// ============================================================
// LIVE MANDI TICKER
// ============================================================
const MandiTicker = () => {
  const crops = [
    { n: 'Soyabean', e: '🫘', p: '₹6,840', c: '+4.2%', up: true },
    { n: 'Cotton', e: '☁️', p: '₹7,250', c: '+2.1%', up: true },
    { n: 'Onion', e: '🧅', p: '₹2,140', c: '-1.8%', up: false },
    { n: 'Wheat', e: '🌾', p: '₹2,450', c: '+0.9%', up: true },
    { n: 'Tomato', e: '🍅', p: '₹1,890', c: '+6.3%', up: true },
    { n: 'Sugarcane', e: '🎋', p: '₹3,150', c: '+1.2%', up: true },
    { n: 'Rice', e: '🍚', p: '₹2,890', c: '-0.4%', up: false },
    { n: 'Gram', e: '🫛', p: '₹5,420', c: '+3.7%', up: true },
  ];
  return (
    <div className="fixed top-0 left-0 right-0 z-[52] h-9 bg-slate-950/95 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center">
      <div className="flex items-center gap-4 w-full">
        <div className="flex shrink-0 items-center gap-1.5 ml-4 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          LIVE MANDI
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)' }}>
          <div className="flex gap-8 animate-marquee w-max">
            {[...crops, ...crops].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
                <span className="text-sm">{c.e}</span>
                <span className="text-xs font-semibold text-white">{c.n}</span>
                <span className="text-xs font-mono font-bold text-white">{c.p}</span>
                <span className={`text-[10px] font-semibold ${c.up ? 'text-emerald-400' : 'text-red-400'}`}>{c.c}</span>
                <span className="text-white/20 ml-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// HERO SECTION
// ============================================================
const HeroSection = ({ t, handleGetStarted, handleScrollTo }: any) => {
  const { ref: heroRef, isInView: heroInView } = useInView(0.1);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={meshBg} />
      <div className="absolute inset-0 pointer-events-none" style={gridPattern} />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-emerald-500/20 blur-[120px] opacity-60" />
      <div className="absolute top-20 -right-20 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[100px] opacity-50" />

      <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-medium px-3.5 py-1.5 transition-all duration-1000 ${
                heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="tracking-wide uppercase text-[11px]">{t.landing_tagline}</span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>

            <h1
              className={`mt-6 font-display font-extrabold tracking-[-0.03em] leading-[1.05] text-4xl sm:text-6xl lg:text-[4.2rem] transition-all duration-1000 delay-75 ${
                heroInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
              }`}
            >
              <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{t.landing_title_1}</span>
              <br className="hidden sm:block" />{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
              >
                {t.landing_title_2}
              </span>
            </h1>

            <p
              className={`mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed transition-all duration-1000 delay-150 ${
                heroInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
              }`}
            >
              {t.landing_desc}
            </p>

            <div
              className={`mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start transition-all duration-1000 delay-200 ${
                heroInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
              }`}
            >
              <button
                onClick={handleGetStarted}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-95"
              >
                <Sparkles size={18} />
                <span>{t.landing_product_btn}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                onClick={(e) => handleScrollTo(e, '#features')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Play size={16} className="text-emerald-400" />
                <span>{t.landing_btn_explore}</span>
              </a>
            </div>

            {/* Trust row */}
            <div
              className={`mt-10 flex items-center gap-5 justify-center lg:justify-start transition-all duration-1000 delay-300 ${
                heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex -space-x-2.5">
                {['from-emerald-400 to-green-600', 'from-amber-400 to-orange-600', 'from-lime-400 to-emerald-600', 'from-teal-400 to-cyan-600', 'from-yellow-400 to-amber-600'].map((g, i) => (
                  <div key={i} className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-slate-950 grid place-items-center text-slate-950 text-xs font-bold`}>
                    {['A', 'R', 'S', 'M', 'K'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-white">4.9</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Loved by 10,000+ farmers</p>
              </div>
            </div>
          </div>

          {/* Right: animated dashboard mockup */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              heroInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <HeroDashboard t={t} />
          </div>
        </div>

        {/* Stats panel */}
        <div
          className={`mt-20 transition-all duration-1000 delay-500 ${
            heroInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {[
              { label: t.landing_stat1_label || 'Active Farmers', value: '50K+' },
              { label: t.landing_stat2_label || 'AI Insights', value: '1M+' },
              { label: t.landing_stat3_label || 'Crop Coverage', value: '25+' },
              { label: t.landing_stat4_label || 'Languages', value: '12+' },
            ].map((stat, i) => (
              <div key={i} className={`text-center ${i !== 3 ? 'md:border-r border-white/10' : ''}`}>
                <div
                  className="text-3xl sm:text-4xl font-extrabold mb-1 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Hero dashboard mockup
const HeroDashboard = ({ t }: any) => {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 via-amber-500/15 to-cyan-500/20 blur-3xl rounded-[2rem] opacity-60" />

      <div className="relative bg-slate-950/70 backdrop-blur-2xl border border-white/10 rounded-[1.75rem] p-4 shadow-2xl shadow-black/40">
        {/* window chrome */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="text-[10px] font-mono text-slate-500 tracking-wider">krushi.os / dashboard</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2.5">
          {/* AI diagnosis */}
          <div className="col-span-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20">
                  <Bug className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{t.landing_feat2_title}</div>
                  <div className="text-[10px] text-slate-400">Cotton leaf detected</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Confidence</div>
                <div className="text-sm font-bold text-emerald-400">96.4%</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-emerald-500/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: '96%' }} />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">Healthy</span>
            </div>
          </div>

          {/* stat chips */}
          <HeroStatChip className="col-span-6 sm:col-span-3" icon={<TrendingUp className="h-3.5 w-3.5" />} label="Mandi" value="₹6,840" sub="Soyabean" trend="+4.2%" />
          <HeroStatChip className="col-span-6 sm:col-span-3" icon={<CloudRain className="h-3.5 w-3.5" />} label="Rain" value="12mm" sub="Tomorrow" trend="Likely" />
          <HeroStatChip className="col-span-6 sm:col-span-3" icon={<Cpu className="h-3.5 w-3.5" />} label="Soil NPK" value="Good" sub="N:42 P:18 K:30" trend="Optimal" />
          <HeroStatChip className="col-span-6 sm:col-span-3" icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Scheme" value="PM Kisan" sub="₹2,000" trend="Eligible" />

          {/* mini chart */}
          <div className="col-span-12 rounded-2xl bg-white/[0.03] border border-white/5 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-white">Yield forecast</div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> This season
              </div>
            </div>
            <MiniLineChart />
          </div>
        </div>
      </div>

      {/* floating chips */}
      <div className="absolute -left-6 top-24 hidden sm:block animate-float">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Today's profit</div>
            <div className="text-sm font-bold text-white">+₹14,250</div>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-20 hidden sm:block animate-float-slow">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20">
            <Leaf className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Crop health</div>
            <div className="text-sm font-bold text-emerald-400">Excellent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroStatChip = ({ className, icon, label, value, sub, trend }: any) => (
  <div className={`rounded-xl bg-white/[0.03] border border-white/5 p-2.5 ${className}`}>
    <div className="flex items-center gap-1.5 text-slate-400">
      <span className="text-emerald-400">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
    <div className="mt-1 text-sm font-bold text-white tracking-tight">{value}</div>
    <div className="flex items-center justify-between mt-0.5">
      <span className="text-[9px] text-slate-500 font-mono">{sub}</span>
      <span className="text-[9px] font-semibold text-emerald-400">{trend}</span>
    </div>
  </div>
);

const MiniLineChart = () => {
  const points = [20, 35, 28, 50, 42, 65, 58, 78, 72, 88, 82, 95];
  const w = 280, h = 56;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (p / 100) * h;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroArea)" />
      <path d={path} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(points.length - 1) / (points.length - 1) * w} cy={h - 95 / 100 * h} r="3" fill="#fbbf24" />
    </svg>
  );
};

// ============================================================
// SECTION TITLE (premium)
// ============================================================
const SectionTitle = ({ icon: Icon, label, title, highlight, desc }: any) => {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className="text-center mb-16 max-w-2xl mx-auto">
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase px-3 py-1 mb-4 transition-all duration-700 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <h2
        className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.1] mb-4 transition-all duration-700 delay-75 ${
          isInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
        }`}
      >
        {title}{' '}
        {highlight && (
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
          >
            {highlight}
          </span>
        )}
      </h2>
      {desc && (
        <p
          className={`text-slate-400 text-base sm:text-lg leading-relaxed transition-all duration-700 delay-150 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
};

// ============================================================
// ABOUT SECTION
// ============================================================
const AboutSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  return (
    <section id="about" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 15%, transparent 70%)',
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className={reveal(isInView)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Leaf className="w-3.5 h-3.5" /> {t.landing_about_title}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              {t.landing_title_1}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
              >
                AI
              </span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">{t.landing_about_desc}</p>
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="font-display text-3xl font-extrabold text-white">10+</span>
                <span className="text-sm text-slate-500">Years Impact</span>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="font-display text-3xl font-extrabold text-white">98%</span>
                <span className="text-sm text-slate-500">Accuracy Rate</span>
              </div>
            </div>
          </div>

          <div className={`relative ${reveal(isInView, 200)}`}>
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 z-10" />
              <img
                src="/images/farm-scan.png"
                alt="Farming"
                className="w-full h-full object-cover opacity-80"
                loading="lazy"
                decoding="async"
              />
              {/* overlay stat card */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Live farm scan</div>
                  <div className="text-sm font-bold text-white">7 plots · 42 acres</div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Monitoring
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: t.landing_mission_title, desc: t.landing_mission_desc, color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
            { icon: Eye, title: t.landing_vision_title, desc: t.landing_vision_desc, color: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
            { icon: Award, title: t.landing_values_title, desc: t.landing_values_desc, color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
          ].map((item, i) => (
            <article
              key={i}
              className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/15 hover:-translate-y-1 overflow-hidden ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150 + 300}ms` }}
            >
              <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full ${item.bg} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl ${item.bg} border ${item.border} grid place-items-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-6 h-6 ${item.text}`} />
              </div>
              <h3 className="relative font-display text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="relative text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// FEATURES SECTION
// ============================================================
const FeaturesSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const features = [
    { icon: Camera, title: t.landing_feat2_title, desc: t.landing_feat2_desc, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', large: true, badge: '96.4%', metric: 'accuracy' },
    { icon: CloudRain, title: t.landing_feat4_title, desc: t.landing_feat4_desc, bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', large: false, badge: '7-day', metric: 'forecast' },
    { icon: TrendingUp, title: t.landing_feat3_title, desc: t.landing_feat3_desc, bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', large: false, badge: '200+', metric: 'crops' },
    { icon: Cpu, title: t.soil_title, desc: t.soil_subtitle, bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', large: true, badge: 'NPK', metric: 'smart' },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={gridPattern} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle icon={Cpu} label={t.landing_features_title} title={t.landing_features_highlight} desc={t.landing_features_desc} />

        <div ref={ref} className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 transition-all duration-500 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)] overflow-hidden ${
                feature.large ? 'md:col-span-2' : ''
              } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${feature.bg} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-start gap-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.bg} border ${feature.border} grid place-items-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <div className="text-right shrink-0">
                      <div
                        className="font-display text-base font-extrabold bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
                      >
                        {feature.badge}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">{feature.metric}</div>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// HOW IT WORKS
// ============================================================
const HowItWorksSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const steps = [
    { step: '01', title: t.landing_step1_title, desc: t.landing_step1_desc, icon: '🌐', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { step: '02', title: t.landing_step2_title, desc: t.landing_step2_desc, icon: '📸', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { step: '03', title: t.landing_how_highlight, desc: t.landing_features_desc, icon: '⚡', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { step: '04', title: t.landing_step3_title, desc: t.landing_step3_desc, icon: '📋', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
      }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle icon={Clock} label={t.landing_how_title} title={t.landing_how_title} highlight={t.landing_how_highlight} desc={t.landing_how_desc} />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-violet-500/40 z-0" />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="relative inline-grid place-items-center">
                <div className={`absolute inset-0 rounded-3xl ${step.bg} blur-xl`} />
                <div className={`relative w-24 h-24 rounded-3xl bg-slate-950/80 backdrop-blur-md border ${step.border} grid place-items-center mb-6 text-4xl shadow-xl`}>
                  {step.icon}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border-2 ${step.border} ${step.text} grid place-items-center text-xs font-bold`}>
                    {step.step}
                  </div>
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// SOLUTIONS SECTION
// ============================================================
const SolutionsSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const solutions = [
    { icon: Sprout, title: t.landing_sol1_title, sub: t.landing_sol1_sub, desc: t.landing_sol1_desc, bg: 'from-emerald-500/20 to-emerald-500/0', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/30', stat: '+38%', statLabel: 'income lift' },
    { icon: Tractor, title: t.landing_sol2_title, sub: t.landing_sol2_sub, desc: t.landing_sol2_desc, bg: 'from-cyan-500/20 to-cyan-500/0', text: 'text-cyan-400', border: 'group-hover:border-cyan-500/30', stat: '−27%', statLabel: 'input cost' },
    { icon: Factory, title: t.landing_sol3_title, sub: t.landing_sol3_sub, desc: t.landing_sol3_desc, bg: 'from-violet-500/20 to-violet-500/0', text: 'text-violet-400', border: 'group-hover:border-violet-500/30', stat: '12×', statLabel: 'ROI season 1' },
  ];

  return (
    <section id="solutions" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 pointer-events-none" style={meshBg} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle icon={Users} label={t.landing_nav_solutions} title={t.landing_solutions_title} highlight={t.landing_sol3_sub} desc={t.landing_solutions_desc} />

        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {solutions.map((sol, i) => (
            <article
              key={i}
              className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl overflow-hidden transition-all duration-500 hover:bg-white/[0.05] ${sol.border} hover:-translate-y-1 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-b ${sol.bg}`}>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {/* floating stat in header */}
                <div className="absolute top-4 right-4 text-right">
                  <div
                    className="font-display text-2xl font-extrabold bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #fbbf24 100%)' }}
                  >
                    {sol.stat}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">{sol.statLabel}</div>
                </div>
              </div>
              <div className="p-7 -mt-12 relative z-20">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 grid place-items-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <sol.icon className={`${sol.text} w-6 h-6`} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">{sol.title}</h3>
                <p className={`text-sm ${sol.text} font-medium mb-3`}>{sol.sub}</p>
                <p className="text-slate-400 leading-relaxed text-sm">{sol.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// BENEFITS SECTION
// ============================================================
const BenefitsSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const benefits = [
    { icon: Zap, title: t.landing_ben1_title, desc: t.landing_ben1_desc, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: ShieldCheck, title: t.landing_ben2_title, desc: t.landing_ben2_desc, text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { icon: Coins, title: t.landing_ben3_title, desc: t.landing_ben3_desc, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: Heart, title: t.landing_ben4_title, desc: t.landing_ben4_desc, text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ];

  return (
    <section id="benefits" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle icon={TrendingUp} label={t.landing_benefits_title} title={t.landing_benefits_subtitle} desc={t.landing_benefits_desc} />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((ben, i) => (
            <article
              key={i}
              className={`group relative bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 transition-all duration-500 hover:border-white/20 hover:-translate-y-2 overflow-hidden ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`absolute -top-8 -right-8 h-20 w-20 rounded-full ${ben.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl ${ben.bg} border ${ben.border} grid place-items-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <ben.icon className={`${ben.text} w-6 h-6`} />
              </div>
              <h3 className="relative font-display text-base font-bold text-white mb-2">{ben.title}</h3>
              <p className="relative text-slate-400 leading-relaxed text-sm">{ben.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// TESTIMONIALS
// ============================================================
const TestimonialsSection = ({ lang, t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const testimonials = [
    { name: 'Rajesh Patil', location: 'Nashik, Maharashtra', text: 'AI Krushi Mitra instantly detected my crop disease and suggested the right treatment. Amazing app!', rating: 5, initials: 'RP', gradient: 'from-amber-400 to-orange-600' },
    { name: 'Sunita Devi', location: 'Lucknow, UP', text: 'I can speak in my language, send a photo and get instant advice. So easy for me!', rating: 5, initials: 'SD', gradient: 'from-emerald-400 to-green-600' },
    { name: 'Amit Sharma', location: 'Jaipur, Rajasthan', text: 'Market prices, weather info, everything in one place. A blessing for farmers!', rating: 5, initials: 'AS', gradient: 'from-rose-400 to-red-600' },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={gridPattern} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle icon={Star} label="Trusted by Farmers" title={lang === 'hi' ? 'किसानों की आवाज़' : lang === 'mr' ? 'शेतकऱ्यांचा आवाज' : 'Farmer Voices'} />

        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className={`relative bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/15 flex flex-col h-full overflow-hidden ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute -top-4 -right-4 text-8xl font-serif text-white/5 select-none leading-none">”</div>
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={15} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 leading-relaxed mb-8 flex-1 relative z-10 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-white/10 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.gradient} grid place-items-center text-lg font-bold text-slate-950 shadow-lg`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{testimonial.name}</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// FAQ
// ============================================================
const FAQSection = ({ t }: any) => {
  const { ref, isInView } = useInView(0.1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase px-3 py-1 mb-4">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <HelpCircle className="w-3.5 h-3.5" /> {t.landing_faq_title}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{t.landing_faq_subtitle}</h2>
        </div>

        <div ref={ref} className="space-y-3">
          {t.landing_faq_items?.map((item: { q: string; a: string }, i: number) => (
            <div
              key={i}
              className={`bg-white/[0.03] backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 ${
                openFaq === i ? 'bg-white/[0.05] border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'border-white/[0.06]'
              } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span className="font-display font-semibold text-white pr-4 text-[15px]">{item.q}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full grid place-items-center transition-all duration-300 ${openFaq === i ? 'bg-emerald-500 text-slate-950 rotate-180' : 'bg-white/5 text-slate-400'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-slate-400 leading-relaxed border-t border-white/5 pt-4 text-sm">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// CTA
// ============================================================
const CTASection = ({ t, lang, handleGetStarted }: any) => {
  const { ref, isInView } = useInView(0.1);
  const title = lang === 'hi' ? 'अभी शुरू करें' : lang === 'mr' ? 'आता सुरू करा' : 'Start Your Smart Farming Journey';
  const desc = lang === 'hi' ? 'AI कृषि मित्र के साथ अपनी खेती को स्मार्ट बनाएं। मुफ्त में शुरू करें!' : lang === 'mr' ? 'AI कृषी मित्रासह तुमची शेती स्मार्ट करा. मोफत सुरू करा!' : 'Transform your farming with AI Krushi Mitra. Start free today!';
  const callLabel = lang === 'hi' ? 'हमें कॉल करें' : lang === 'mr' ? 'आम्हाला कॉल करा' : 'Call Us';

  return (
    <section className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={ref}
          className={`relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950" />
          <div className="absolute inset-0 pointer-events-none" style={meshBg} />
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white">
              <Sprout className="h-3.5 w-3.5" /> Join 50,000+ farmers
            </div>
            <h2 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white leading-[1.05]">
              {title}
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-emerald-50/90 leading-relaxed">{desc}</p>

            <div className="mt-9 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                <span>{t.landing_product_btn}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="tel:+919999999999"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition-colors"
              >
                <Phone size={16} />
                {callLabel}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-emerald-50/70">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> 12+ languages</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Works offline</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// FOOTER
// ============================================================
const Footer = ({ t, navLinks, handleScrollTo }: any) => {
  return (
    <footer id="contact" className="bg-black/40 backdrop-blur-sm pt-20 pb-10 border-t border-white/5 relative">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={meshBg} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-slate-950">
                <Sprout className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[15px] font-bold text-white tracking-tight">{t.app_name}</span>
                <span className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-[0.18em]">{t.landing_tagline}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-xs">{t.landing_desc}</p>
            {/* Newsletter */}
            <form className="mt-2" onSubmit={(e) => e.preventDefault()}>
              <label className="text-xs font-semibold text-white/80">Get weekly mandi insights</label>
              <div className="mt-2 flex items-center gap-2 max-w-xs">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors" aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 uppercase tracking-widest opacity-60">Quick Links</h4>
            <ul className="space-y-3">
              {navLinks.slice(0, 4).map((link: any) => (
                <li key={link.name}>
                  <a href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 h-px bg-emerald-400 group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 uppercase tracking-widest opacity-60">Resources</h4>
            <ul className="space-y-3">
              {navLinks.slice(4).map((link: any) => (
                <li key={link.name}>
                  <a href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-0 h-px bg-emerald-400 group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-5 uppercase tracking-widest opacity-60">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Mail size={16} className="text-emerald-400 mt-0.5" />
                <a href="mailto:support@aikrushimitra.in" className="hover:text-emerald-400 transition-colors">support@aikrushimitra.in</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Phone size={16} className="text-emerald-400 mt-0.5" />
                <a href="tel:+919999999999" className="hover:text-emerald-400 transition-colors">+91 99999 99999</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={16} className="text-emerald-400 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </li>
            </ul>
            <div className="flex gap-2 mt-5">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <a key={social} href="#" aria-label={social} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-slate-400 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all duration-300">
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2025 {t.app_name}. {t.landing_footer_rights}</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// LIVE AI SUPPORT AGENT WIDGET
// ============================================================
const SupportAgentWidget = ({ lang }: { lang: Language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const isMarathi = lang === 'mr';

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !enquiry) return;

    setLoading(true);
    triggerHaptic();

    try {
      // 1. Log details for future communication via backend support API (safely handled on static hosting)
      let newTicketId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        const res = await fetch('/api/support/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, village, enquiry, lang })
        });
        const contentType = res.headers.get("content-type") || '';
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.id) newTicketId = data.id;
        }
      } catch (logErr) {
        console.warn("Backend logging skipped on static hosting platform:", logErr);
      }
      setTicketId(newTicketId);

      // 2. Initial agent greeting + AI response with client-side fallback support
      const initialUserText = enquiry;
      const agentGreeting = isMarathi 
        ? `नमस्कार ${name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. तुमचा सपोर्ट आयडी आहे: ${newTicketId}. आम्ही तुमची माहिती नोंदवली आहे.\n\nतुमच्या प्रश्नाचे उत्तर:`
        : `Hello ${name}! Welcome to AI Krushi Mitra Live Support (ID: ${newTicketId}). Your details have been registered for follow-up.\n\nHere is immediate guidance for your query:`;

      const aiAnswer = await getAIFarmingAdvice(enquiry, lang, 'Customer Support Enquiry');
      
      setMessages([
        { role: 'user', text: initialUserText },
        { role: 'agent', text: `${agentGreeting}\n\n${aiAnswer}` }
      ]);
      setStep('chat');
    } catch (err) {
      console.error("Support enquiry error:", err);
      setMessages([
        { role: 'user', text: enquiry },
        { role: 'agent', text: isMarathi ? 'तुमचा प्रश्न नोंदवला गेला आहे. आमचे प्रतिनिधी लवकरच संपर्क करतील.' : 'Your query has been registered. Our representative will contact you soon.' }
      ]);
      setStep('chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    triggerHaptic();

    try {
      const aiResponse = await getAIFarmingAdvice(userText, lang, 'Live Customer Support');
      setMessages(prev => [...prev, { role: 'agent', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: isMarathi ? 'क्षमस्व, संपर्क साधण्यात अडचण आली.' : 'Sorry, failed to connect to support assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Support Trigger Button */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 animate-bounce flex items-center gap-1.5 border border-white/20">
            <Sparkles size={12} /> {isMarathi ? '24/7 लाइव्ह सपोर्ट' : '24/7 Live Support'}
          </div>
        )}
        <button
          onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-2xl shadow-emerald-500/40 border-2 border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group"
          aria-label="Customer Support"
        >
          <Headphones size={26} className="drop-shadow-md" />
        </button>
      </div>

      {/* Support Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[80vh] bg-slate-950/95 backdrop-blur-2xl border border-emerald-500/30 rounded-[2.5rem] shadow-2xl z-[999] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-sm flex items-center gap-1.5">
                  AI Krushi Mitra Support <UserCheck size={14} className="text-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-400">{isMarathi ? 'ग्राहक सहाय्यता व थेट चौकशी' : 'Customer Support & Enquiry'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 overflow-y-auto max-h-[55vh] space-y-4">
            {step === 'form' ? (
              <form onSubmit={handleSubmitEnquiry} className="space-y-3">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-xs text-emerald-300">
                  {isMarathi ? 'कृपया आपली अचूक माहिती द्या जेणेकरून भविष्यातील संवादासाठी नोंद राहील.' : 'Please provide details so we can log your inquiry for future assistance.'}
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">{isMarathi ? 'तुमचे नाव *' : 'Full Name *'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={isMarathi ? 'उदा. रमेश पाटील' : 'e.g. Ramesh Patil'}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">{isMarathi ? 'मोबाईल / WhatsApp नंबर *' : 'Mobile / WhatsApp No. *'}</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="98221XXXXX"
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">{isMarathi ? 'गाव / जिल्हा' : 'Village / District'}</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder={isMarathi ? 'उदा. यवतमाळ' : 'e.g. Yavatmal'}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">{isMarathi ? 'तुमचा प्रश्न / अडचण *' : 'Your Query / Problem *'}</label>
                  <textarea
                    required
                    rows={3}
                    value={enquiry}
                    onChange={e => setEnquiry(e.target.value)}
                    placeholder={isMarathi ? 'शेतविषयक किंवा ॲपबाबत काय मदत हवी आहे?' : 'Describe your farming query or support request'}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isMarathi ? 'नोंदवा व संवाद सुरू करा' : 'Register & Start Live Chat'}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-white/5 text-[10px] text-slate-400">
                  <span>Customer: <strong className="text-white">{name}</strong></span>
                  <span>Ticket: <strong className="text-emerald-400">{ticketId}</strong></span>
                </div>
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> {isMarathi ? 'सपोर्ट एजंट उत्तर तयार करत आहे...' : 'Support agent typing...'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Input Footer */}
          {step === 'chat' && (
            <form onSubmit={handleSendFollowUp} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={isMarathi ? 'अजून काही विचारायचे आहे?' : 'Type follow-up query...'}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

// ============================================================
// MAIN
// ============================================================
export default function LandingPage({ onGetStarted, lang, setLang }: LandingPageProps) {
  const t = TRANSLATIONS[lang];
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = href.replace('#', '');
    if (!id) return;
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleGetStarted = useCallback(() => {
    triggerHaptic();
    onGetStarted();
  }, [onGetStarted]);

  const navLinks = [
    { name: t.menu_dashboard, href: '#dashboard', isApp: true },
    { name: t.landing_nav_about, href: '#about' },
    { name: t.landing_btn_explore, href: '#features' },
    { name: t.landing_how_title, href: '#how-it-works' },
    { name: t.landing_nav_solutions, href: '#solutions' },
    { name: t.landing_benefits_title, href: '#benefits' },
    { name: t.menu_market, href: '#contact' },
  ];

  return (
    <main className="w-full min-h-screen bg-[#050505] text-white relative z-20 scroll-smooth selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <SEOHead lang={lang} t={t} />

      {/* Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 z-[60] origin-left transform-gpu shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ transform: 'scaleX(0)' }}
        id="progress-bar"
      />

      <MandiTicker />

      <Header
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        langMenuOpen={langMenuOpen}
        setLangMenuOpen={setLangMenuOpen}
        lang={lang}
        setLang={setLang}
        t={t}
        handleScrollTo={handleScrollTo}
        handleGetStarted={handleGetStarted}
      />

      <MobileMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={navLinks}
        handleScrollTo={handleScrollTo}
        setLang={setLang}
        lang={lang}
        handleGetStarted={handleGetStarted}
        t={t}
      />

      <HeroSection t={t} handleGetStarted={handleGetStarted} handleScrollTo={handleScrollTo} />
      <AboutSection t={t} />
      <FeaturesSection t={t} />
      <HowItWorksSection t={t} />
      <SolutionsSection t={t} />
      <BenefitsSection t={t} />
      <TestimonialsSection lang={lang} t={t} />
      <FAQSection t={t} />
      <CTASection t={t} lang={lang} handleGetStarted={handleGetStarted} />
      <Footer t={t} navLinks={navLinks} handleScrollTo={handleScrollTo} />
      <SupportAgentWidget lang={lang} />

      {/* Progress Bar Update Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const progressBar = document.getElementById('progress-bar');
          if (!progressBar) return;
          window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;
            progressBar.style.transform = 'scaleX(' + scrollPercent + ')';
          }, { passive: true });
        })();
      `}} />

      {/* Global premium styles + animations polyfill */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        .font-display { font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #050505;
        }

        *:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 4px;
          border-radius: 4px;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.6); }

        ::selection { background: rgba(16,185,129,0.3); color: white; }

        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float 9s ease-in-out infinite; }

        .scrollbar-premium::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-premium::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-premium::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 9999px; }

        @keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slide-in-from-top { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-from-right; }
        .slide-in-from-top-2 { animation-name: slide-in-from-top; }
      `}} />
    </main>
  );
}
