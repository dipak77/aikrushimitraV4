import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, UserProfile } from '../../types';
import { db } from '../../utils/firebase';
import { collection, doc, setDoc, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import {
  Leaf, TrendingUp, CloudRain, Sprout, Map as MapIcon,
  ArrowRight, Languages, Users, Sparkles, Target, Eye,
  Cpu, Zap, Camera, CheckCircle2, Tractor, Play, Send, ExternalLink,
  Sun, Bug, MessageSquare, Headphones, UserCheck, Loader2, Phone, Mail, MapPin, ChevronDown, Menu, X, ShieldCheck, Heart, Star, Award, Smartphone, CheckSquare, BarChart3, Clock, HelpCircle
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { TRANSLATIONS, LANGUAGES } from '../../constants';
import { getAIFarmingAdvice } from '../../services/geminiService';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  user?: UserProfile | null;
}

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

// Intersection Observer Hook
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

// Premium styling helpers
const meshBg: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(at 20% 20%, rgba(16,185,129,0.15) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(245,158,11,0.08) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(6,182,212,0.1) 0px, transparent 50%)',
};

const gridPattern: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

// ============================================================
// LIVE MANDI TICKER
// ============================================================
const MandiTicker = () => {
  const crops = [
    { n: 'Soyabean', e: '🫘', p: '₹6,840', c: '+4.2%', up: true },
    { n: 'Cotton', e: '☁️', p: '₹7,250', c: '+2.1%', up: true },
    { n: 'Wheat', e: '🌾', p: '₹2,450', c: '+0.9%', up: true },
    { n: 'Tomato', e: '🍅', p: '₹1,890', c: '+6.3%', up: true },
    { n: 'Gram', e: '🫛', p: '₹5,420', c: '+3.7%', up: true },
    { n: 'Rice', e: '🍚', p: '₹2,890', c: '-0.4%', up: false },
  ];
  return (
    <div className="fixed top-0 left-0 right-0 z-[52] h-9 bg-slate-950 border-b border-white/5 overflow-hidden flex items-center">
      <div className="flex items-center gap-4 w-full px-4">
        <div className="flex shrink-0 items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          LIVE MANDI
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)' }}>
          <div className="flex gap-8 animate-marquee w-max">
            {[...crops, ...crops].map((c, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap text-xs">
                <span>{c.e}</span>
                <span className="font-semibold text-slate-300">{c.n}</span>
                <span className="font-bold text-white">{c.p}</span>
                <span className={`font-semibold ${c.up ? 'text-emerald-400' : 'text-red-400'}`}>{c.c}</span>
                <span className="text-white/10 ml-2">|</span>
              </div>
            ))}
          </div>
        </div>
        <a href="#contact" className="shrink-0 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          See all <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
};

// ============================================================
// HEADER
// ============================================================
const Header = ({
  scrolled, mobileMenuOpen, setMobileMenuOpen, langMenuOpen, setLangMenuOpen,
  lang, setLang, t, handleScrollTo, handleGetStarted
}: any) => {
  return (
    <header className={`fixed left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'top-9 py-2' : 'top-9 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between rounded-2xl h-14 px-5 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-transparent border border-transparent'}`}>
          
          {/* Logo */}
          <a href="#home" onClick={(e) => handleScrollTo(e, '#home')} className="flex items-center gap-2 group">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[16px] font-black text-white tracking-tight">Al Krushi Mitra</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Smart Farming, Better Tomorrow</span>
            </div>
          </a>

          {/* Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {['Dashboard', 'About', 'Features', 'How It Works', 'Solutions', 'Why Choose Us', 'Market Prices'].map((link) => (
              <a
                key={link}
                href={link === 'Dashboard' ? '#' : `#${link.toLowerCase().replace(/ /g, '-')}`}
                onClick={(e) => {
                  if (link === 'Dashboard') {
                    e.preventDefault();
                    handleGetStarted();
                  } else {
                    handleScrollTo(e, `#${link.toLowerCase().replace(/ /g, '-')}`);
                  }
                }}
                className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Lang Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-9 px-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-900 text-xs font-bold text-slate-200 transition-all flex items-center gap-1"
              >
                <span>{LANGUAGES.find((l: any) => l.code === lang)?.name || 'मराठी'}</span>
                <ChevronDown size={14} className={`opacity-60 transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
                  {LANGUAGES.map((l: any) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as Language); setLangMenuOpen(false); triggerHaptic(); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${lang === l.code ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Try Button */}
            <button
              onClick={handleGetStarted}
              className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              Try AI Assistant
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 grid place-items-center rounded-lg bg-white/5 border border-white/10 text-slate-300"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

// Mobile Navigation
const MobileMenu = ({ mobileMenuOpen, setMobileMenuOpen, handleScrollTo, handleGetStarted }: any) => {
  if (!mobileMenuOpen) return null;
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-4 animate-in fade-in">
      {['Dashboard', 'About', 'Features', 'How It Works', 'Solutions', 'Why Choose Us', 'Market Prices'].map((link) => (
        <a
          key={link}
          href={link === 'Dashboard' ? '#' : `#${link.toLowerCase().replace(/ /g, '-')}`}
          onClick={(e) => {
            setMobileMenuOpen(false);
            if (link === 'Dashboard') {
              e.preventDefault();
              handleGetStarted();
            } else {
              handleScrollTo(e, `#${link.toLowerCase().replace(/ /g, '-')}`);
            }
          }}
          className="text-lg font-bold text-slate-200 border-b border-white/5 pb-2"
        >
          {link}
        </a>
      ))}
      <button
        onClick={() => { setMobileMenuOpen(false); handleGetStarted(); }}
        className="mt-4 w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm text-center shadow-lg"
      >
        Try AI Assistant
      </button>
    </div>
  );
};

// ============================================================
// HERO SECTION
// ============================================================
const HeroSection = ({ t, handleGetStarted, handleScrollTo }: any) => {
  const { ref: heroRef, isInView: heroInView } = useInView(0.1);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center pt-36 pb-20 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 pointer-events-none" style={meshBg} />
      <div className="absolute inset-0 pointer-events-none opacity-40" style={gridPattern} />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left copy */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3.5 py-1.5 uppercase tracking-wider mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              AI Powered Agriculture Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Smart Farming <br />
              Starts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500">AI</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Get AI-powered crop advisory, weather updates, market insights and expert guidance in your language.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center lg:justify-start">
              {[
                { label: 'AI Crop Doctor', icon: Bug },
                { label: 'Real-time Weather', icon: CloudRain },
                { label: 'Market Intelligence', icon: TrendingUp },
                { label: 'Soil Health Check', icon: Cpu }
              ].map((pill, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300">
                  <pill.icon size={13} className="text-emerald-400" />
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
              <button
                onClick={handleGetStarted}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
              >
                <span>Try AI Assistant</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="#features"
                onClick={(e) => handleScrollTo(e, '#features')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-semibold transition-all"
              >
                <Play size={14} className="text-emerald-400 fill-emerald-400" />
                <span>Explore Features</span>
              </a>
            </div>

            {/* Loved by / Stars */}
            <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`/images/avatar-${i === 4 ? 3 : i}.jpg`} alt="Farmer avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-left leading-none">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-white ml-1.5">4.8/5</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Loved by 50,000+ farmers</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-10 grid grid-cols-4 gap-2.5 max-w-xl mx-auto lg:mx-0 border-t border-white/5 pt-8">
              {[
                { label: 'Happy Farmers', val: '50K+' },
                { label: 'AI Consults', val: '1M+' },
                { label: 'Accuracy Rate', val: '98%' },
                { label: 'Crops Covered', val: '200+' }
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{stat.val}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Phone + Smiling Farmer Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Background glowing circle */}
            <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="relative w-full max-w-[420px] flex items-center justify-center gap-4">
              {/* Phone Mockup */}
              <div className="relative w-[190px] h-[380px] rounded-[2rem] border-4 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl shrink-0">
                <div className="absolute top-0 inset-x-0 h-4 bg-slate-800 flex justify-center items-center rounded-b-xl z-20">
                  <div className="w-12 h-2 rounded-full bg-slate-900" />
                </div>
                {/* App Screen Content Preview */}
                <div className="p-3 pt-6 space-y-2.5 scale-90 origin-top h-full flex flex-col justify-start overflow-hidden">
                  <div className="flex justify-between items-center text-[8px] text-slate-500">
                    <span>9:41</span>
                    <span>5G</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-left">
                    <p className="text-[7px] text-emerald-400 font-bold uppercase">AI शिफारस (सोयाबीन)</p>
                    <p className="text-xs font-bold text-white mt-0.5">फुलोरा अवस्था</p>
                    <p className="text-[8px] text-slate-400 mt-1 leading-normal">आज फवारणी केल्यास उत्पादनात +15% वाढ</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-left">
                    <p className="text-[7px] text-slate-400 uppercase font-bold">हवामान</p>
                    <p className="text-sm font-black text-white">28°C</p>
                  </div>
                  <div className="p-1 rounded bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[7px] font-bold text-center">
                    संपूर्ण माहिती पहा →
                  </div>
                </div>
              </div>

              {/* Smiling Farmer Image */}
              <div className="w-[190px] h-[340px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shrink-0">
                <img src="/images/hero_farmer.png" alt="Smiling Farmer" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// ============================================================
// HOW IT WORKS SECTION
// ============================================================
const HowItWorksSection = () => {
  const { ref, isInView } = useInView(0.1);
  const steps = [
    { num: '1', title: 'Upload / Describe', desc: 'Upload crop photo or describe your problem', icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { num: '2', title: 'AI Analysis', desc: 'Our AI analyzes and detects issues instantly', icon: Cpu, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { num: '3', title: 'Get Recommendations', desc: 'Get best solutions, dosage and expert advice', icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { num: '4', title: 'Increase Yield', desc: 'Follow advice and increase your profit', icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' }
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">How <span className="text-emerald-400">Al Krushi Mitra</span> Works</h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-14">Simple 4-step workflow designed to deliver fast results right in the field.</p>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[1px] border-t border-dashed border-white/10 z-0" />

          {steps.map((st, i) => (
            <div key={i} className="flex flex-col items-center relative z-10 group">
              <div className={`w-20 h-20 rounded-2xl ${st.bg} border ${st.border} flex items-center justify-center mb-5 relative group-hover:scale-105 transition-transform duration-300`}>
                <st.icon size={26} className={st.color} />
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-emerald-400">
                  {st.num}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{st.title}</h3>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">{st.desc}</p>
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
const SolutionsSection = () => {
  const { ref, isInView } = useInView(0.1);
  const cards = [
    {
      title: 'Small & Marginal Farmers',
      desc: 'Affordable AI guidance for better crops and higher income.',
      bullets: ['Simple recommendations', 'Low cost solutions', 'Local language support'],
      themeColor: 'emerald',
      grad: 'from-emerald-950/60 to-slate-950',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      img: 'sol_farmer_1.png'
    },
    {
      title: 'Progressive Farmers',
      desc: 'Data-driven insights for maximum yield and efficiency.',
      bullets: ['Advanced analytics', 'Weather & market insights', 'Profit optimization'],
      themeColor: 'cyan',
      grad: 'from-cyan-950/60 to-slate-950',
      border: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
      img: 'sol_farmer_2.png'
    },
    {
      title: 'Agribusiness & Advisors',
      desc: 'Manage multiple farms and provide better advisory.',
      bullets: ['Farm monitoring', 'Reports & analytics', 'Advisory tools'],
      themeColor: 'purple',
      grad: 'from-purple-950/60 to-slate-950',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400',
      img: 'sol_farmer_3.png'
    }
  ];

  return (
    <section id="solutions" className="py-20 relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">Solutions for <span className="text-emerald-400">Every Farmer</span></h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-14">Tailored technology solutions designed for smallholder farmers and agricultural businesses alike.</p>

        <div ref={ref} className="grid md:grid-cols-3 gap-6 text-left">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`relative rounded-3xl overflow-hidden border ${card.border} bg-gradient-to-b ${card.grad} p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500`}
            >
              {/* Card Copy */}
              <div>
                <h3 className="text-lg font-black text-white mb-2">{card.title}</h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">{card.desc}</p>
                <div className="space-y-2.5 mb-6">
                  {card.bullets.map((bull, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={card.iconColor} />
                      <span className="text-xs text-slate-300">{bull}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row showing Portrait Image */}
              <div className="mt-4 flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  <img src={`/images/${card.img}`} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className={`text-[10px] font-bold ${card.iconColor} border border-current/20 rounded-full px-3 py-1 flex items-center gap-1 hover:bg-white/5 transition-colors cursor-pointer`}>
                  <span>Explore</span>
                  <ArrowRight size={10} />
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
// WHY CHOOSE US SECTION
// ============================================================
const WhyChooseUsSection = () => {
  const { ref, isInView } = useInView(0.1);
  const items = [
    { title: 'Higher Yield', desc: 'AI recommendations increase productivity up to 20%', icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Cost Saving', desc: 'Reduce input costs with precise advice and planning', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Time Saving', desc: 'Get instant solutions, save time and effort in field', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Expert Support', desc: '24/7 AI assistant and agricultural expert guidance', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Trusted by Farmers', desc: '50,000+ farmers trust our AI for better farming', icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Secure & Private', desc: 'Your data is safe and never shared with anyone', icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/10' }
  ];

  return (
    <section id="why-choose-us" className="py-20 relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">Why Choose <span className="text-emerald-400">Al Krushi Mitra?</span></h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-14">We combine AI agronomy data with real time mandi and weather updates to build a premium farmer engine.</p>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                <item.icon size={18} className={item.color} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// TESTIMONIALS
// ============================================================
const TestimonialsSection = () => {
  const { ref, isInView } = useInView(0.1);
  const testimonials = [
    {
      name: 'Ramesh Patil',
      loc: 'Nashik, Maharashtra',
      text: 'Al Krushi Mitra ne majhya soybean pikavar fawarni veles suchana dili ani utpadan 18% vadhla!',
      color: 'from-amber-400 to-orange-500'
    },
    {
      name: 'Sunita Devi',
      loc: 'Solapur, Maharashtra',
      text: 'Market bhav, havaman ani AI salla - sarv ekach app madhe. Kharach upyogi!',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      name: 'Amit Sharma',
      loc: 'Jaipur, Rajasthan',
      text: 'Pikachya aajarachi olakh patkan hote ani yogga upay milto. Khup chan app aahe!',
      color: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <section className="py-20 relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">What <span className="text-emerald-400">Farmers Say</span></h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-14">Hear directly from the farmers utilizing the app to improve their daily yields.</p>

        <div ref={ref} className="grid md:grid-cols-3 gap-6 text-left">
          {testimonials.map((test, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative flex flex-col justify-between hover:bg-[#0a1220] transition-colors"
            >
              <div className="absolute top-4 right-4 text-7xl font-serif text-white/5 pointer-events-none select-none">“</div>
              
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic mb-6">"{test.text}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${test.color} flex items-center justify-center text-slate-950 font-black text-sm`}>
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.name}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={8} /> {test.loc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* pagination dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          <div className="w-4 h-1.5 rounded-full bg-emerald-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        </div>
      </div>
    </section>
  );
};

// ============================================================
// APP DOWNLOAD BANNER
// ============================================================
const AppDownloadSection = () => {
  return (
    <section className="py-20 relative bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 border border-emerald-500/20 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Left Smartphone overlapping mocks */}
          <div className="relative w-full max-w-[320px] flex items-center justify-center h-[280px] shrink-0">
            {/* Phone 1 */}
            <div className="absolute left-4 top-4 w-[140px] h-[260px] rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-xl transform -rotate-6">
              <div className="p-2 space-y-1.5 scale-75 origin-top">
                <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-left">
                  <p className="text-[6px] text-emerald-400 font-bold uppercase">AI शिफारस</p>
                  <p className="text-[10px] font-bold text-white mt-0.5">फुलोरा अवस्था</p>
                </div>
              </div>
            </div>
            {/* Phone 2 */}
            <div className="absolute right-4 bottom-4 w-[140px] h-[260px] rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transform rotate-6 z-10">
              <div className="p-2 space-y-1.5 scale-75 origin-top">
                <div className="p-1.5 rounded bg-slate-900 border border-white/5 text-left">
                  <p className="text-[6px] text-slate-500 uppercase">बाजार भाव</p>
                  <p className="text-[10px] font-bold text-white">₹4,850</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Download content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Take AI Power <br />
              In Your Pocket
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed max-w-md">
              Download the Al Krushi Mitra app and make your farming smarter today! Enjoy offline mode and daily mandi updates.
            </p>

            {/* Badges + QR Code flex container */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              {/* Buttons */}
              <div className="flex flex-col gap-2.5">
                <a href="#" className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Smartphone size={16} className="text-white" />
                  <div className="text-left leading-none">
                    <p className="text-[8px] text-slate-500 uppercase">Get it on</p>
                    <p className="text-xs font-black text-white mt-0.5">Google Play</p>
                  </div>
                </a>
                <a href="#" className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Smartphone size={16} className="text-white" />
                  <div className="text-left leading-none">
                    <p className="text-[8px] text-slate-500 uppercase">Download on the</p>
                    <p className="text-xs font-black text-white mt-0.5">App Store</p>
                  </div>
                </a>
              </div>

              {/* Dotted separator */}
              <div className="hidden sm:block h-12 w-px bg-white/10" />

              {/* QR Code */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                  {/* Clean SVG QR mockup */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                    <rect x="0" y="0" width="20" height="20" fill="currentColor" />
                    <rect x="80" y="0" width="20" height="20" fill="currentColor" />
                    <rect x="0" y="80" width="20" height="20" fill="currentColor" />
                    <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                    <rect x="25" y="10" width="10" height="15" fill="currentColor" />
                    <rect x="65" y="70" width="15" height="15" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scan to Download</p>
                  <p className="text-[8px] text-slate-600 mt-1 max-w-[120px]">Instant download link straight to your device</p>
                </div>
              </div>
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
const Footer = ({ t, handleScrollTo }: any) => {
  return (
    <footer id="contact" className="bg-[#050b14] pt-16 pb-8 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-2 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950">
                <Sprout className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black text-white">Al Krushi Mitra</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Al Krushi Mitra is your smart farming companion that helps you make better decisions, increase yield and grow profitably with the power of AI.
            </p>
            <div className="flex gap-2.5 mt-5">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social, idx) => (
                <a key={idx} href="#" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors">
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Dashboard</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#solutions" className="hover:text-emerald-400 transition-colors">Market Prices</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">AI Assistant</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Farming Guides</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Videos</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">News & Updates</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-left col-span-2 md:col-span-1">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-emerald-400" />
                <span>+91 99999 99999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-emerald-400" />
                <span>support@aikrushimitra.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={12} className="text-emerald-400 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <span>© 2025 Al Krushi Mitra. All rights reserved.</span>
          <span className="flex items-center gap-1">Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Farmers of India</span>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// LIVE AI SUPPORT AGENT WIDGET
// ============================================================
const SupportAgentWidget = ({ lang, user }: { lang: Language; user?: UserProfile | null }) => {
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
  const [ticketCreatedAt, setTicketCreatedAt] = useState<number | null>(null);

  const isMarathi = lang === 'mr';

  useEffect(() => {
    const fetchExistingTicket = async () => {
      const searchPhone = phone;
      const searchUid = user ? (user.email || '') : '';

      if (!searchUid && !searchPhone) {
        if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
        return;
      }

      try {
        const q = query(
          collection(db, 'supportTickets'),
          where(searchUid ? 'userId' : 'phone', '==', searchUid ? searchUid : searchPhone),
          orderBy('updatedAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setTicketId(docData.id);
          setName(docData.name || '');
          setPhone(docData.phone || '');
          setVillage(docData.village || '');
          setTicketCreatedAt(docData.createdAt || Date.now());
          
          const history = docData.messages || [];
          if (history.length > 0) {
            setMessages(history);
          } else if (user) {
            setMessages([
              {
                role: 'agent',
                text: isMarathi
                  ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                  : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
              }
            ]);
          }
          setStep('chat');
        } else if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
      } catch (err) {
        console.warn("Could not check/load existing support ticket:", err);
        if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
      }
    };

    if (isOpen) {
      if (user) {
        setName(user.name || '');
        setPhone(user.email || '');
        setVillage(user.village || '');
      }
      fetchExistingTicket();
    }
  }, [isOpen, user]);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !enquiry) return;

    setLoading(true);
    triggerHaptic();

    try {
      let newTicketId = ticketId || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdAt = ticketCreatedAt || Date.now();
      
      const initialUserText = enquiry;
      const agentGreeting = isMarathi 
        ? `नमस्कार ${name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. तुमचा सपोर्ट आयडी आहे: ${newTicketId}.\n\nउत्तर:`
        : `Hello ${name}! Welcome to AI Krushi Mitra Live Support (ID: ${newTicketId}).\n\nImmediate advice:`;

      const aiAnswer = await getAIFarmingAdvice(enquiry, lang, 'Customer Support Enquiry');
      
      const newMessages = [
        { role: 'user', text: initialUserText },
        { role: 'agent', text: `${agentGreeting}\n\n${aiAnswer}` }
      ] as any[];

      try {
        const ticketRef = doc(db, 'supportTickets', newTicketId);
        await setDoc(ticketRef, {
          id: newTicketId,
          userId: user ? (user.email || 'guest') : 'guest',
          name,
          phone,
          village,
          lastEnquiry: initialUserText,
          lang,
          createdAt,
          updatedAt: Date.now(),
          status: 'open',
          messages: newMessages
        });
      } catch (fsErr) {
        console.error("Firestore logging failed:", fsErr);
      }

      setTicketId(newTicketId);
      setTicketCreatedAt(createdAt);
      setMessages(newMessages);
      setStep('chat');
    } catch (err) {
      setMessages([
        { role: 'user', text: enquiry },
        { role: 'agent', text: isMarathi ? 'तुमचा प्रश्न नोंदवला गेला आहे. प्रतिनिधी संपर्क करतील.' : 'Registered. Our representative will contact you.' }
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
    
    const updatedMessages = [...messages, { role: 'user', text: userText }] as any[];
    setMessages(updatedMessages);
    setLoading(true);
    triggerHaptic();

    try {
      const aiResponse = await getAIFarmingAdvice(userText, lang, 'Live Customer Support');
      const finalMessages = [...updatedMessages, { role: 'agent', text: aiResponse }] as any[];
      
      let currentTicketId = ticketId;
      if (!currentTicketId) {
        currentTicketId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        setTicketId(currentTicketId);
      }

      try {
        const ticketRef = doc(db, 'supportTickets', currentTicketId);
        await setDoc(ticketRef, {
          id: currentTicketId,
          userId: user ? (user.email || 'guest') : 'guest',
          name: name || user?.name || 'Guest User',
          phone: phone || user?.email || '',
          village: village || user?.village || '',
          lastEnquiry: userText,
          lang,
          createdAt: ticketCreatedAt || Date.now(),
          updatedAt: Date.now(),
          status: 'open',
          messages: finalMessages
        });
      } catch (fsErr) {
        console.error("Firestore update failed:", fsErr);
      }

      setMessages(finalMessages);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: isMarathi ? 'क्षमस्व, संपर्क साधण्यात अडचण आली.' : 'Failed to connect.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 animate-bounce flex items-center gap-1 border border-white/10">
            <Sparkles size={11} /> {isMarathi ? '24/7 लाइव्ह सपोर्ट' : '24/7 Live Support'}
          </div>
        )}
        <button
          onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative group"
        >
          <Headphones size={22} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[75vh] bg-slate-950/95 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl shadow-2xl z-[999] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="bg-slate-900 p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-xs">AI Krushi Support</h3>
                <p className="text-[9px] text-slate-500">{isMarathi ? 'ग्राहक सहाय्यता व थेट चौकशी' : 'Customer Support & Enquiry'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[45vh] space-y-3">
            {step === 'form' ? (
              <form onSubmit={handleSubmitEnquiry} className="space-y-3 text-left">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-500">Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-500">Phone</label>
                  <input
                    type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-500">Village</label>
                  <input
                    type="text" value={village} onChange={e => setVillage(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-500">Query</label>
                  <textarea
                    required rows={2} value={enquiry} onChange={e => setEnquiry(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex justify-center items-center gap-1">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  Submit Request
                </button>
              </form>
            ) : (
              <div className="space-y-2.5 text-left">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {step === 'chat' && (
            <form onSubmit={handleSendFollowUp} className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
              <input
                type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask follow-up..." className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button type="submit" disabled={loading} className="px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

// ============================================================
// MAIN LANDING PAGE EXPORT
// ============================================================
export default function LandingPage({ onGetStarted, lang, setLang, user }: LandingPageProps) {
  const t = TRANSLATIONS[lang];
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleScrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
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

  const handleGetStarted = useCallback(() => {
    triggerHaptic();
    onGetStarted();
  }, [onGetStarted]);

  return (
    <main className="w-full min-h-screen bg-slate-950 text-white relative z-20 scroll-smooth selection:bg-emerald-500 selection:text-white overflow-x-hidden font-sans">
      <SEOHead lang={lang} t={t} />

      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 z-[60] origin-left shadow-[0_0_8px_rgba(16,185,129,0.4)]"
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
        handleScrollTo={handleScrollTo}
        handleGetStarted={handleGetStarted}
      />

      <HeroSection t={t} handleGetStarted={handleGetStarted} handleScrollTo={handleScrollTo} />
      <HowItWorksSection />
      <SolutionsSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <AppDownloadSection />
      <Footer t={t} handleScrollTo={handleScrollTo} />
      <SupportAgentWidget lang={lang} user={user} />

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const progressBar = document.getElementById('progress-bar');
          if (!progressBar) return;
          window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
          }, { passive: true });
        })();
      `}} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 35s linear infinite; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 2s infinite ease-in-out; }
      `}} />
    </main>
  );
}
