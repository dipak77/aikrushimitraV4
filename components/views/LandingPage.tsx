import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Language } from '../../types';
import {
  Leaf, Shield, TrendingUp, CloudRain, Sprout, Map as MapIcon,
  ArrowRight, Languages, Users, Globe, Sparkles, Target,
  Eye, Cpu, Zap, MessageSquare, Camera, CheckCircle2, Tractor,
  Factory, Coins, Clock, Wifi, Mail, Phone, MapPin, ChevronDown,
  Menu, X, Bell, ShieldCheck, Heart, HelpCircle, Facebook, Twitter,
  Instagram, Youtube, Star, Award, BarChart3, Smartphone, ArrowUp,
  Play, Headphones, BookOpen, Mic, Send, ExternalLink, ArrowUpRight, Bot, IndianRupee, Sun, Bug
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { TRANSLATIONS, LANGUAGES } from '../../constants';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

// SEO Head Component
const SEOHead = ({ lang, t }: { lang: string; t: any }) => {
  useEffect(() => {
    document.title = `${t.app_name} — ${t.landing_tagline} | AI-Powered Smart Farming`;
  }, [lang, t]);
  
  return null;
};

// Animated counter hook
const useCounter = (end: number, duration = 2000, startOnView = false) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, started]);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView]);

  return { count, ref };
};

// Floating particles for hero
const FloatingParticles = React.memo(() => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      color: ['#10b981', '#22d3ee', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.4,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
});
FloatingParticles.displayName = 'FloatingParticles';

// Back to Top Button
const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[200] w-12 h-12 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function LandingPage({ onGetStarted, lang, setLang }: LandingPageProps) {
  const t = TRANSLATIONS[lang];
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  const handleScrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = href.replace('#', '');
    if (!id) return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on escape
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

  const navLinks = useMemo(() => [
    { name: t.menu_dashboard, href: '#home' },
    { name: t.landing_nav_about, href: '#about' },
    { name: t.landing_btn_explore, href: '#features' },
    { name: t.landing_how_title, href: '#how-it-works' },
    { name: t.landing_nav_solutions, href: '#solutions' },
    { name: t.landing_benefits_title, href: '#benefits' },
    { name: t.menu_market, href: '#contact' },
  ], [t]);

  const handleGetStarted = useCallback(() => {
    triggerHaptic();
    onGetStarted();
  }, [onGetStarted]);

  // Animation Variants
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08 } }
  };

  return (
    <main 
      className="w-full min-h-screen bg-[#000000] text-white relative z-20 scroll-smooth selection:bg-emerald-500 selection:text-white mesh-bg"
      style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Bengali', 'Noto Sans Gujarati', 'Noto Sans Gurmukhi', 'Noto Sans Oriya', system-ui, sans-serif" }}
    >
      <SEOHead lang={lang} t={t} />
      <BackToTop />

      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02]" aria-hidden="true"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}
      />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 z-[150] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ==================== HEADER ==================== */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-[#000000]/60 backdrop-blur-3xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'py-5 bg-transparent'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" onClick={(e) => handleScrollTo(e, '#home')} className="flex items-center gap-3 group" aria-label={t.app_name}>
              <div className="relative flex items-center justify-center w-11 h-11">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md group-hover:bg-emerald-400/30 group-hover:blur-xl transition-all duration-500" />
                <div className="relative w-full h-full bg-[#0F172A]/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:border-emerald-400/50 transition-all duration-500">
                  <Sprout className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] group-hover:text-emerald-300 transition-colors duration-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-2xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-50 to-emerald-200"
                  style={{
                    WebkitTextStroke: '1px rgba(16, 185, 129, 0.8)',
                    filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))'
                  }}
                >
                  {t.app_name}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em] mt-1 opacity-80">
                  {t.landing_tagline}
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5 shadow-inner" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-emerald-400 transition-all duration-300 rounded-full hover:bg-white/10 relative group overflow-hidden"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`h-11 px-5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 group text-sm shadow-lg ${
                    langMenuOpen
                      ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-emerald-500/25'
                      : 'border-white/10 bg-[#0F172A]/60 backdrop-blur-md hover:bg-white/10 text-white hover:border-white/20'
                  }`}
                  aria-expanded={langMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Select language"
                >
                  <Languages size={18} className={langMenuOpen ? 'text-slate-900' : 'text-emerald-400'} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {LANGUAGES.find(l => l.code === lang)?.name}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 bg-[#0F172A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden z-[130] p-2"
                      role="listbox"
                      aria-label="Languages"
                    >
                      <div className="grid grid-cols-2 gap-1.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                        {LANGUAGES.map((l) => (
                          <button
                            key={l.code}
                            role="option"
                            aria-selected={lang === l.code}
                            onClick={() => {
                              setLang(l.code as Language);
                              setLangMenuOpen(false);
                              triggerHaptic();
                            }}
                            className={`flex flex-col items-start px-4 py-3 rounded-xl transition-all duration-200 ${
                              lang === l.code
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner'
                                : 'hover:bg-white/5 text-slate-300 border border-transparent hover:border-white/5'
                            }`}
                          >
                            <span className="text-sm font-bold">{l.name}</span>
                            <span className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleGetStarted}
                className="relative px-7 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group border border-emerald-400/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative z-10 tracking-wide">{t.landing_product_btn}</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-[#0F172A]/60 backdrop-blur-md border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 shadow-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ==================== MOBILE MENU ==================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-[#020810]/80 backdrop-blur-md z-[115]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0F172A]/95 backdrop-blur-3xl border-l border-white/10 z-[120] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3 group">
                  <div className="relative flex items-center justify-center w-10 h-10">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md group-hover:bg-emerald-400/30 group-hover:blur-lg transition-all duration-500" />
                    <div className="relative w-full h-full bg-[#020810]/80 backdrop-blur-md border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-500">
                      <Sprout className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    </div>
                  </div>
                  <span 
                    className="text-xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-50 to-emerald-200"
                    style={{
                      WebkitTextStroke: '0.5px rgba(16, 185, 129, 0.8)',
                      filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.5)) drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
                    }}
                  >
                    {t.app_name}
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleScrollTo(e, link.href);
                    }}
                    className="block px-5 py-4 text-lg font-bold text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"
                  >
                    {link.name}
                  </motion.a>
                ))}
                
                <div className="pt-6 mt-6 border-t border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] px-2 mb-4 flex items-center gap-2">
                    <Languages size={14} className="text-emerald-500" />
                    Language
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as Language);
                          triggerHaptic();
                        }}
                        className={`py-3 px-3 rounded-2xl transition-all flex flex-col items-center gap-1 border ${
                          lang === l.code
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-inner'
                            : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        <span className="text-sm font-bold">{l.name}</span>
                        <span className="text-[9px] opacity-60 uppercase tracking-widest">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => { handleGetStarted(); setMobileMenuOpen(false); }}
                  className="w-full relative px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all overflow-hidden group border border-emerald-400/50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <span className="relative z-10 tracking-wide">{t.landing_product_btn}</span>
                  <ArrowRight size={20} className="relative z-10" />
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ==================== HERO SECTION ==================== */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden" role="banner" aria-labelledby="hero-heading">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Light Streak Effect */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute -top-20 -right-20 w-[800px] h-[800px] border border-emerald-500/20 rounded-full animate-spin-slow" />
          
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.015] mix-blend-overlay" />
          <FloatingParticles />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card text-emerald-400 text-sm font-semibold mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide uppercase text-xs">{t.landing_tagline}</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display text-6xl sm:text-8xl lg:text-[110px] font-extrabold tracking-tighter mb-8 leading-[0.9]"
          >
            <span className="hero-gradient">{t.landing_title_1}</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 text-glow inline-block pb-4">
              {t.landing_title_2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            {t.landing_desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            <button
              onClick={handleGetStarted}
              className="relative w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles size={24} className="relative z-10 text-emerald-600" />
              <span className="relative z-10 tracking-wide">{t.landing_product_btn}</span>
              <ArrowRight size={24} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <a
              href="#features"
              onClick={(e) => handleScrollTo(e, '#features')}
              className="w-full sm:w-auto px-10 py-5 glass-card text-white rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 hover:bg-white/5"
            >
              <Play size={22} className="text-emerald-400" />
              <span className="tracking-wide">{t.landing_btn_explore}</span>
            </a>
          </motion.div>

          {/* App Mockup Preview in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mt-24 relative w-full max-w-5xl mx-auto"
            style={{ perspective: '1000px' }}
          >
            <div className="relative rounded-[40px] border border-white/10 bg-[#0a0a0a] shadow-[0_0_100px_rgba(16,185,129,0.2)] overflow-hidden transform-gpu hover:rotate-y-[-2deg] hover:rotate-x-[2deg] transition-transform duration-700">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <img 
                src="https://picsum.photos/seed/dashboard/800/600" 
                alt="App Dashboard" 
                className="w-full h-auto object-cover opacity-80"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="about-heading">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16 lg:mb-24">
            <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-5">
                <Leaf className="w-4 h-4" /> {t.landing_about_title}
              </span>
              <h2 id="about-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                {t.landing_title_1} <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
                {t.landing_about_desc}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-white/10 aspect-video lg:aspect-[4/3] group"
            >
              <div className="absolute inset-0 bg-emerald-500/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-700" />
              <img 
                src="https://picsum.photos/seed/crops/800/600" 
                alt="Ultra realistic Maharashtra farming" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020810] via-[#020810]/20 to-transparent z-10" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Target, title: t.landing_mission_title, desc: t.landing_mission_desc, color: "emerald", gradient: "from-emerald-500/20 to-emerald-500/5" },
              { icon: Eye, title: t.landing_vision_title, desc: t.landing_vision_desc, color: "cyan", gradient: "from-cyan-500/20 to-cyan-500/5" },
              { icon: Award, title: t.landing_values_title, desc: t.landing_values_desc, color: "amber", gradient: "from-amber-500/20 to-amber-500/5" },
            ].map((item, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 lg:p-10 group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient}`} />
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className={`w-7 h-7 text-${item.color}-400`} />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT PREVIEW ==================== */}
      <section className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="product-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
                <Smartphone className="w-4 h-4" /> {t.landing_product_title}
              </span>
              <h2 id="product-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white leading-tight">
                {t.landing_product_subtitle}
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                {t.landing_product_desc}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[t.landing_product_feat1, t.landing_product_feat2, t.landing_product_feat3, t.landing_product_feat4].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300 group">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleGetStarted}
                className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-2xl font-bold text-base flex items-center gap-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10">{t.landing_product_btn}</span>
                <ArrowRight size={18} className="relative z-10" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: 1 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-white/10 group"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://picsum.photos/seed/dashboard/800/600" 
                  alt="Farmer using smartphone" 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020810] via-[#020810]/60 to-[#020810]/80" />
              </div>
              
              <div className="relative z-10 bg-transparent p-6 sm:p-8">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 bg-[length:200%_auto] animate-gradient-shimmer" />
                
                {/* Browser chrome */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white/5 text-[9px] text-slate-500 font-mono tracking-wider">
                    aikrushimitra.in/agent
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-5 mb-6">
                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-slate-900 px-5 py-3 rounded-2xl rounded-tr-md text-sm font-semibold shadow-lg shadow-emerald-500/20 max-w-[85%]">
                      {lang === 'hi' ? 'मेरी टमाटर की पत्तियों पर पीले धब्बे 🍅' : lang === 'mr' ? 'माझ्या टोमॅटोच्या पानांवर पिवळे डाग 🍅' : 'My tomato leaves have yellow spots 🍅'}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/[0.05] text-slate-200 px-5 py-4 rounded-2xl rounded-tl-md text-sm max-w-[90%] leading-relaxed border border-white/[0.08] shadow-xl">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                        <Sparkles size={12} /> {t.landing_analysis_result}
                      </div>
                      <p className="mb-1 text-slate-300">{t.landing_analysis_disease}</p>
                      <p className="mb-3 text-slate-300">{t.landing_analysis_severity}</p>
                      <div className="p-3 bg-emerald-500/8 rounded-xl border border-emerald-500/15 text-xs">
                        <span className="font-bold text-emerald-400">✅ {t.landing_analysis_treatment}:</span>
                        <br />
                        <span className="text-slate-400">{t.landing_analysis_dose}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="flex items-center gap-2 bg-black/30 rounded-2xl p-2.5 border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
                    <Camera size={18} />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer">
                    <Mic size={18} />
                  </div>
                  <div className="flex-1 text-slate-500 text-xs font-medium px-2 truncate">{t.landing_input_placeholder}</div>
                  <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105 transition-transform">
                    <Send className="w-4 h-4 text-slate-900" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="features-heading">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-[#000000]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <Cpu className="w-4 h-4" /> {t.landing_features_title}
            </span>
            <h2 id="features-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {t.landing_features_highlight}
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
              {t.landing_features_desc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Large Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-2 glass-card rounded-[32px] p-8 lg:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-colors duration-700" />
              <div className="relative z-10 w-full md:w-1/2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8 shadow-lg">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">{t.landing_feat2_title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed">{t.landing_feat2_desc}</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-[80%] md:w-[60%] h-[80%] md:h-[120%] rounded-tl-3xl border-t border-l border-white/10 overflow-hidden transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 shadow-2xl">
                <img src="https://picsum.photos/seed/dashboard/800/600" alt="Feature" className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500" loading="lazy" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-[32px] p-8 lg:p-10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500 flex flex-col justify-between"
            >
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-8 shadow-lg">
                  <CloudRain className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{t.landing_feat4_title}</h3>
                <p className="text-slate-400 leading-relaxed">{t.landing_feat4_desc}</p>
              </div>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card rounded-[32px] p-8 lg:p-10 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-8 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{t.landing_feat3_title}</h3>
                <p className="text-slate-400 leading-relaxed">{t.landing_feat3_desc}</p>
              </div>
            </motion.div>

            {/* Large Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2 glass-card rounded-[32px] p-8 lg:p-12 relative overflow-hidden group hover:border-amber-500/30 transition-colors duration-500"
            >
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-colors duration-700" />
              <div className="relative z-10 w-full md:w-1/2 ml-auto text-right flex flex-col items-end">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-lg">
                  <Cpu className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">{t.soil_title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed">{t.soil_subtitle}</p>
              </div>
              <div className="absolute -bottom-10 -left-10 w-[80%] md:w-[55%] h-[80%] md:h-[120%] rounded-tr-3xl border-t border-r border-white/10 overflow-hidden transform group-hover:-translate-y-4 group-hover:translate-x-4 transition-transform duration-700 shadow-2xl">
                <img src="https://picsum.photos/seed/soil/800/600" alt="Feature" className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500" loading="lazy" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <Clock className="w-4 h-4" /> {t.landing_how_title}
            </span>
            <h2 id="how-it-works-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {t.landing_how_title}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t.landing_how_highlight}
              </span>
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
              {t.landing_how_desc}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-px bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-violet-500/30 z-0" aria-hidden="true" />

            {[
              { step: "01", title: t.landing_step1_title, desc: t.landing_step1_desc, icon: "🌐", gradient: "from-emerald-500 to-emerald-600", image: "https://picsum.photos/seed/agriculture/800/600" },
              { step: "02", title: t.landing_step2_title, desc: t.landing_step2_desc, icon: "📸", gradient: "from-cyan-500 to-blue-600", image: "https://picsum.photos/seed/tractor/800/600" },
              { step: "03", title: t.landing_how_highlight, desc: t.landing_features_desc, icon: "⚡", gradient: "from-amber-500 to-orange-600", image: "https://picsum.photos/seed/crops/800/600" },
              { step: "04", title: t.landing_step3_title, desc: t.landing_step3_desc, icon: "📋", gradient: "from-violet-500 to-purple-600", image: "https://picsum.photos/seed/field/1920/1080" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className={`relative w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br ${step.gradient} p-[2px] mb-8 group-hover:scale-105 transition-transform duration-500 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]`}>
                  <div className="w-full h-full rounded-full bg-[#000000] overflow-hidden relative">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center text-4xl lg:text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center text-base font-black shadow-xl border-4 border-[#000000] z-20 group-hover:scale-110 transition-transform duration-500">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                <p className="text-base text-slate-400 leading-relaxed max-w-[260px] font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SOLUTIONS ==================== */}
      <section id="solutions" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="solutions-heading">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <Users className="w-4 h-4" /> {t.landing_nav_solutions}
            </span>
            <h2 id="solutions-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {t.landing_solutions_title}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.landing_sol3_sub}</span>
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
              {t.landing_solutions_desc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Sprout, title: t.landing_sol1_title, sub: t.landing_sol1_sub, desc: t.landing_sol1_desc, color: "emerald", image: "https://picsum.photos/seed/dashboard/800/600" },
              { icon: Tractor, title: t.landing_sol2_title, sub: t.landing_sol2_sub, desc: t.landing_sol2_desc, color: "blue", image: "https://picsum.photos/seed/tractor2/800/600" },
              { icon: Factory, title: t.landing_sol3_title, sub: t.landing_sol3_sub, desc: t.landing_sol3_desc, color: "violet", image: "https://picsum.photos/seed/farm/1920/1080" },
            ].map((sol, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="group relative glass-card rounded-[32px] overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent z-10" />
                  <img src={sol.image} alt={sol.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-90" referrerPolicy="no-referrer" loading="lazy" />
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${sol.color}-500 to-transparent z-20 opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
                <div className="p-8 lg:p-10 pt-0 flex-1 flex flex-col relative z-20">
                  <div className={`w-16 h-16 rounded-2xl bg-${sol.color}-500/20 border border-${sol.color}-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 -mt-8 relative z-30 shadow-xl backdrop-blur-md`}>
                    <sol.icon className={`text-${sol.color}-400 w-8 h-8`} />
                  </div>
                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors duration-300">{sol.title}</h3>
                  <p className={`text-sm text-${sol.color}-400 font-bold uppercase tracking-widest mb-4`}>{sol.sub}</p>
                  <p className="text-base text-slate-400 leading-relaxed flex-1 font-medium">{sol.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BENEFITS ==================== */}
      <section id="benefits" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="benefits-heading">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-[#000000]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <TrendingUp className="w-4 h-4" /> {t.landing_benefits_title}
            </span>
            <h2 id="benefits-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {t.landing_benefits_subtitle}
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
              {t.landing_benefits_desc}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Zap, title: t.landing_ben1_title, desc: t.landing_ben1_desc, color: "emerald" },
              { icon: ShieldCheck, title: t.landing_ben2_title, desc: t.landing_ben2_desc, color: "blue" },
              { icon: Coins, title: t.landing_ben3_title, desc: t.landing_ben3_desc, color: "amber" },
              { icon: Heart, title: t.landing_ben4_title, desc: t.landing_ben4_desc, color: "rose" },
            ].map((ben, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="glass-card rounded-[32px] p-8 lg:p-10 group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
              >
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-${ben.color}-500/10 rounded-full blur-3xl group-hover:bg-${ben.color}-500/20 transition-colors duration-500`} />
                <div className={`w-16 h-16 rounded-2xl bg-${ben.color}-500/20 border border-${ben.color}-500/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-lg relative z-10`}>
                  <ben.icon className={`text-${ben.color}-400 w-8 h-8`} />
                </div>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-white mb-4 tracking-tight relative z-10 group-hover:text-emerald-400 transition-colors duration-300">{ben.title}</h3>
                <p className="text-base text-slate-400 leading-relaxed font-medium relative z-10">{ben.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS / TRUST ==================== */}
      <section className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="testimonials-heading">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <Star className="w-4 h-4" /> Trusted by Farmers
            </span>
            <h2 id="testimonials-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {lang === 'hi' ? 'किसानों की आवाज़' : lang === 'mr' ? 'शेतकऱ्यांचा आवाज' : 'Farmer Voices'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: lang === 'hi' ? 'राजेश पाटील' : lang === 'mr' ? 'राजेश पाटील' : 'Rajesh Patil',
                location: lang === 'hi' ? 'नासिक, महाराष्ट्र' : lang === 'mr' ? 'नासिक, महाराष्ट्र' : 'Nashik, Maharashtra',
                text: lang === 'hi' ? 'AI कृषि मित्र ने मेरी फसल की बीमारी को तुरंत पहचाना और सही इलाज बताया। बहुत उपयोगी ऐप!' : lang === 'mr' ? 'AI कृषी मित्राने माझ्या पिकाचा रोग लगेच ओळखला आणि योग्य उपचार सांगितले!' : 'AI Krushi Mitra instantly detected my crop disease and suggested the right treatment. Amazing app!',
                rating: 5,
                image: "https://picsum.photos/seed/farmer1/150/150"
              },
              {
                name: lang === 'hi' ? 'सुनीता देवी' : lang === 'mr' ? 'सुनीता देवी' : 'Sunita Devi',
                location: lang === 'hi' ? 'लखनऊ, उत्तर प्रदेश' : lang === 'mr' ? 'लखनौ, उत्तर प्रदेश' : 'Lucknow, UP',
                text: lang === 'hi' ? 'हिंदी में बात कर सकती हूं, फोटो भेजो तो तुरंत बताता है क्या करना है। मेरे लिए बहुत आसान!' : lang === 'mr' ? 'मराठीत बोलता येतं, फोटो पाठवला की लगेच सांगतो काय करायचं!' : 'I can speak in my language, send a photo and get instant advice. So easy for me!',
                rating: 5,
                image: "https://picsum.photos/seed/farmer2/150/150"
              },
              {
                name: lang === 'hi' ? 'अमित शर्मा' : lang === 'mr' ? 'अमित शर्मा' : 'Amit Sharma',
                location: lang === 'hi' ? 'जयपुर, राजस्थान' : lang === 'mr' ? 'जयपूर, राजस्थान' : 'Jaipur, Rajasthan',
                text: lang === 'hi' ? 'मंडी के भाव, मौसम की जानकारी, सब एक जगह मिल जाता है। किसानों के लिए वरदान है!' : lang === 'mr' ? 'मंडीचे भाव, हवामान माहिती, सगळं एका ठिकाणी मिळतं. शेतकऱ्यांसाठी वरदान!' : 'Market prices, weather info, everything in one place. A blessing for farmers!',
                rating: 5,
                image: "https://picsum.photos/seed/farmer3/150/150"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="glass-card rounded-[32px] p-8 lg:p-10 hover:border-white/20 transition-all duration-500 flex flex-col h-full relative"
              >
                <div className="absolute top-8 right-8 text-6xl text-white/5 font-serif leading-none">"</div>
                <div className="flex items-center gap-1.5 mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={18} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-8 text-base md:text-lg flex-1 font-medium relative z-10">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 mt-auto relative z-10 pt-6 border-t border-white/10">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-lg">
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white tracking-tight">{testimonial.name}</div>
                    <div className="text-sm text-emerald-400 flex items-center gap-1.5 font-medium mt-0.5">
                      <MapPin size={12} /> {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section id="faq" className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition} className="text-center mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">
              <HelpCircle className="w-4 h-4" /> {t.landing_faq_title}
            </span>
            <h2 id="faq-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">{t.landing_faq_subtitle}</h2>
          </motion.div>

          <div className="space-y-4">
            {t.landing_faq_items.map((item: { q: string; a: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="glass-card rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <button
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-display text-base lg:text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition-colors pr-6 tracking-tight">{item.q}</span>
                  <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-inner border border-white/5 ${
                    openFaq === i ? 'rotate-180 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 pt-2 text-base text-slate-400 leading-relaxed font-medium border-t border-white/5 mx-8 mt-2">{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" aria-hidden="true" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={fadeUp.initial} whileInView={fadeUp.animate} viewport={{ once: true }} transition={fadeUp.transition}>
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-10 group">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl group-hover:bg-emerald-400/40 group-hover:blur-3xl transition-all duration-700" />
              <div className="relative w-full h-full glass-card rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] group-hover:border-emerald-400/60 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
                <Sprout className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] group-hover:text-emerald-300 transition-colors duration-500" />
              </div>
            </div>
            <h2 id="cta-heading" className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter">
              {lang === 'hi' ? 'अभी शुरू करें' : lang === 'mr' ? 'आता सुरू करा' : 'Start Your Smart Farming Journey'}
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              {lang === 'hi' ? 'AI कृषि मित्र के साथ अपनी खेती को स्मार्ट बनाएं। मुफ्त में शुरू करें!' : lang === 'mr' ? 'AI कृषी मित्रासह तुमची शेती स्मार्ट करा. मोफत सुरू करा!' : 'Transform your farming with AI Krushi Mitra. Start free today!'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleGetStarted}
                className="relative w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#000000] rounded-3xl font-black text-xl flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Zap size={24} className="relative z-10 drop-shadow-md" />
                <span className="relative z-10 tracking-wide">{t.landing_product_btn}</span>
              </button>
              <a
                href="tel:+919999999999"
                className="w-full sm:w-auto px-10 py-6 glass-card text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-4 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300"
              >
                <Phone size={22} className="text-emerald-400" />
                {lang === 'hi' ? 'हमें कॉल करें' : lang === 'mr' ? 'आम्हाला कॉल करा' : 'Call Us'}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="contact" className="bg-[#000000] pt-24 lg:pt-32 pb-12 relative overflow-hidden border-t border-white/5" role="contentinfo">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/20 to-[#000000]/40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-8 group">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md group-hover:bg-emerald-400/30 group-hover:blur-xl transition-all duration-500" />
                  <div className="relative w-full h-full glass-card rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:border-emerald-400/50 transition-all duration-500">
                    <Sprout className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] group-hover:text-emerald-300 transition-colors duration-500" />
                  </div>
                </div>
                <span 
                  className="font-display text-3xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-50 to-emerald-200"
                  style={{
                    WebkitTextStroke: '1px rgba(16, 185, 129, 0.8)',
                    filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))'
                  }}
                >
                  {t.app_name}
                </span>
              </div>
              <p className="text-base text-slate-400 mb-8 leading-relaxed max-w-sm font-medium">
                {t.landing_desc}
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Youtube, href: '#', label: 'YouTube' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-12 h-12 rounded-2xl bg-[#0F172A]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-[#020810] hover:border-emerald-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-8 uppercase tracking-[0.2em] opacity-80">Quick Links</h4>
              <ul className="space-y-4">
                {navLinks.slice(0, 5).map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-base text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-3 font-medium group">
                      <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-emerald-500" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold text-sm mb-8 uppercase tracking-[0.2em] opacity-80">Resources</h4>
              <ul className="space-y-4">
                {navLinks.slice(5).map((link) => (
                  <li key={link.name}>
                    <a href={link.href} onClick={(e) => handleScrollTo(e, link.href)} className="text-base text-slate-400 hover:text-emerald-400 transition-colors font-medium">{link.name}</a>
                  </li>
                ))}
                <li>
                  <a href="#faq" onClick={(e) => handleScrollTo(e, '#faq')} className="text-base text-slate-400 hover:text-emerald-400 transition-colors font-medium">FAQ</a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-8 uppercase tracking-[0.2em] opacity-80">Contact</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4 text-base text-slate-400 font-medium group">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A]/60 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    <Mail size={18} className="text-emerald-400" />
                  </div>
                  <a href="mailto:support@aikrushimitra.in" className="hover:text-emerald-400 transition-colors mt-2">support@aikrushimitra.in</a>
                </li>
                <li className="flex items-start gap-4 text-base text-slate-400 font-medium group">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A]/60 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    <Phone size={18} className="text-emerald-400" />
                  </div>
                  <a href="tel:+919999999999" className="hover:text-emerald-400 transition-colors mt-2">+91 99999 99999</a>
                </li>
                <li className="flex items-start gap-4 text-base text-slate-400 font-medium group">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A]/60 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                    <MapPin size={18} className="text-emerald-400" />
                  </div>
                  <span className="mt-2">Pune, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-500 font-medium">© 2025 {t.app_name}. {t.landing_footer_rights}</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="#" onClick={(e) => handleScrollTo(e, '#')} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors font-medium">Privacy Policy</a>
              <a href="#" onClick={(e) => handleScrollTo(e, '#')} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors font-medium">Terms of Service</a>
              <a href="#" onClick={(e) => handleScrollTo(e, '#')} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors font-medium">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== GLOBAL STYLES ==================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Noto+Sans+Tamil:wght@400;700&family=Noto+Sans+Telugu:wght@400;700&family=Noto+Sans+Kannada:wght@400;700&family=Noto+Sans+Malayalam:wght@400;700&family=Noto+Sans+Bengali:wght@400;700&family=Noto+Sans+Gujarati:wght@400;700&family=Noto+Sans+Gurmukhi:wght@400;700&display=swap');

        .font-display {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .glass-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3);
        }

        .glass-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .text-glow {
          text-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
        }

        .mesh-bg {
          background-color: #000000;
          background-image: 
            radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
        }

        .hero-gradient {
          background: linear-gradient(to bottom, #ffffff, #a1a1aa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Gradient shimmer for text */
        @keyframes gradient-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shimmer {
          animation: gradient-shimmer 4s ease-in-out infinite;
        }

        /* Float animations */
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-30px) translateX(15px) scale(1.2); }
          90% { opacity: 0.6; }
        }
        .animate-float-particle {
          animation: float-particle var(--duration, 12s) ease-in-out infinite;
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }

        /* Smooth scroll behavior */
        html { scroll-behavior: smooth; }

        /* Focus styles for accessibility */
        *:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>
    </main>
  );
}