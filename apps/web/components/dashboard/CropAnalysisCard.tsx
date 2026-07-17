import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, CheckCircle2, ChevronRight, Leaf, Droplets, Thermometer } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    label: 'AI शिफारस (सोयाबीन)',
    title: 'फुलोरा अवस्था',
    desc: 'आज फवारणी केल्यास उत्पादनात +15% वाढ होण्याची शक्यता',
    yield: '+15% वाढ होण्याची शक्यता',
    health: 'पिकाची तब्येत',
    healthPct: '94%',
    progress: 'प्रगती उत्तम',
    viewMore: 'संपूर्ण माहिती पहा',
    stage: 'फुलोरा',
    moisture: '६८% आर्द्रता',
    temp: '२८°से',
    ndvi: 'NDVI ०.८२ • निरोगी',
    stageLabel: 'अवस्था',
  },
  hi: {
    label: 'AI सिफारिश (सोयाबीन)',
    title: 'फूलने की अवस्था',
    desc: 'आज छिड़काव करने से उपज में +15% वृद्धि संभव',
    yield: '+15% उपज वृद्धि संभव',
    health: 'फसल स्वास्थ्य',
    healthPct: '94%',
    progress: 'अच्छी प्रगति',
    viewMore: 'पूरी जानकारी देखें',
    stage: 'फूलना',
    moisture: '६८% नमी',
    temp: '२८°से',
    ndvi: 'NDVI ०.८२ • स्वस्थ',
    stageLabel: 'अवस्था',
  },
  en: {
    label: 'AI Recommendation (Soyabean)',
    title: 'Flowering Stage',
    desc: 'Spraying today can increase yield by +15%',
    yield: '+15% Yield Potential',
    health: 'Crop Health',
    healthPct: '94%',
    progress: 'Excellent Progress',
    viewMore: 'View Full Details',
    stage: 'Flowering',
    moisture: '68% Moisture',
    temp: '28°C',
    ndvi: 'NDVI 0.82 • Healthy',
    stageLabel: 'Stage',
  },
};

export const CropAnalysisCard = ({ lang, onClick }: { lang: Language; onClick?: () => void }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [mounted, setMounted] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setPct(94);
    }, 120);
    return () => clearTimeout(id);
  }, [lang]);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full rounded-[28px] overflow-hidden border border-white/[0.10] backdrop-blur-xl transition-all duration-700 hover:border-emerald-400/30 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(34,197,94,0.15)] ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(16,42,16,0.90) 0%, rgba(10,26,10,0.96) 48%, rgba(10,22,10,0.92) 100%)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-[200px] h-[200px] bg-emerald-500/[0.10] rounded-full blur-[64px] pointer-events-none group-hover:bg-emerald-400/[0.14] transition-all duration-700" />
      <div className="absolute -bottom-20 -left-16 w-[220px] h-[220px] bg-teal-500/[0.08] rounded-full blur-[72px] pointer-events-none" />

      <div className="relative z-10 p-[24px] flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-[11px] py-[6px] rounded-full bg-[#22c55e]/[0.12] border border-[#22c55e]/[0.25] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Sprout size={12} className="text-[#a3e635]" strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#a3e635] leading-none">{t.label}</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[26px] font-black tracking-[-0.02em] leading-[1.08] text-white">{t.title}</h3>
          <p className="text-[13.5px] leading-[1.5] text-zinc-400 mt-[8px] max-w-[85%]">{t.desc}</p>
        </div>

        <div className="mt-[20px]">
          <div className="inline-flex items-center gap-2.5 px-3 py-[7px] rounded-full bg-gradient-to-r from-[#22c55e]/20 to-[#a3e635]/[0.14] border border-[#22c55e]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center">
              <TrendingUp size={12} className="text-emerald-300" strokeWidth={2.5} />
            </div>
            <span className="text-[12.5px] font-bold text-emerald-100">{t.yield}</span>
            <svg width="36" height="16" viewBox="0 0 36 16" className="overflow-visible ml-1">
              <path
                d="M0 12 C4 11, 8 10, 12 7 S20 3, 24 2.5 S30 3, 36 0.5"
                fill="none"
                stroke="#a3e635"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(163,230,53,0.6)]"
                style={{
                  strokeDasharray: '40',
                  strokeDashoffset: mounted ? '0' : '40',
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s',
                }}
              />
              <circle cx="36" cy="0.5" r="2.5" fill="#a3e635" className="animate-pulse" />
            </svg>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-[7px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] backdrop-blur-sm">
              <span className="text-[11px]">🌱</span>
              <span className="text-[11px] font-medium text-zinc-300">{t.stageLabel}: {t.stage}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] backdrop-blur-sm">
              <Droplets size={11} className="text-sky-300/80" />
              <span className="text-[11px] font-medium text-zinc-300">{t.moisture}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.06] backdrop-blur-sm">
              <Thermometer size={11} className="text-amber-300/80" />
              <span className="text-[11px] font-medium text-zinc-300">{t.temp}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[20px] bg-[#0a160a]/70 border border-white/[0.06] backdrop-blur-xl p-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex gap-4 items-center">
            <div className="relative w-14 h-14 shrink-0">
              <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#a3e635" />
                  </linearGradient>
                </defs>
                <circle cx="28" cy="28" r={radius} fill="none" stroke="#1a2e1a" strokeWidth="4.5" />
                <circle
                  cx="28" cy="28" r={radius}
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={mounted ? offset : circumference}
                  style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[14px] font-black tracking-tight text-white leading-none">{t.healthPct}</span>
                <span className="text-[7px] font-bold tracking-widest text-emerald-300/80 uppercase mt-[1px]">LIVE</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                    <Leaf size={10} className="text-emerald-400" />
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-200">{t.health}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-wide text-emerald-400">{t.progress}</span>
                </div>
              </div>
              <div className="mt-2.5 relative w-full h-[10px] rounded-full bg-[#0f1f0f] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] overflow-hidden p-[2px]">
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 40%, #a3e635 100%)',
                    boxShadow: '0 0 12px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                    transition: 'width 1.6s cubic-bezier(0.22,1,0.36,1) 0.3s',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#132a13] border border-[#22c55e]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.04em] text-emerald-300/90">{t.ndvi}</span>
            </div>
            <span className="text-[10px] text-zinc-500">• Updated now</span>
          </div>
        </div>

        <button className="group/btn mt-5 w-full h-11 rounded-full bg-white/[0.06] border border-white/[0.10] backdrop-blur-xl flex items-center justify-between pl-5 pr-1.5 text-[13px] font-semibold text-white hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#a3e635] hover:text-black hover:border-transparent hover:shadow-[0_0_28px_rgba(34,197,94,0.45)] transition-all duration-500">
          <span className="flex items-center gap-2">
            {t.viewMore}
            <span className="opacity-60 group-hover/btn:opacity-100 transition-opacity">→</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-white/[0.08] group-hover/btn:bg-black/10 border border-white/10 group-hover/btn:border-black/10 flex items-center justify-center transition-all duration-500">
            <ChevronRight size={16} className="transition-transform duration-500 group-hover/btn:translate-x-0.5" strokeWidth={2.2} />
          </div>
        </button>
      </div>
    </div>
  );
};
