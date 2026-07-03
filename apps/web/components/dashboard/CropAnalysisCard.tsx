import React from 'react';
import { Sprout, TrendingUp, CheckCircle2, ChevronRight, Leaf } from 'lucide-react';
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
    viewMore: 'संपूर्ण माहिती पहा →',
  },
  hi: {
    label: 'AI सिफारिश (सोयाबीन)',
    title: 'फूलने की अवस्था',
    desc: 'आज छिड़काव करने से उपज में +15% वृद्धि संभव',
    yield: '+15% उपज वृद्धि संभव',
    health: 'फसल स्वास्थ्य',
    healthPct: '94%',
    progress: 'अच्छी प्रगति',
    viewMore: 'पूरी जानकारी देखें →',
  },
  en: {
    label: 'AI Recommendation (Soyabean)',
    title: 'Flowering Stage',
    desc: 'Spraying today can increase yield by +15%',
    yield: '+15% Yield Potential',
    health: 'Crop Health',
    healthPct: '94%',
    progress: 'Excellent Progress',
    viewMore: 'View Full Details →',
  },
};

export const CropAnalysisCard = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900/80 via-green-900/60 to-teal-900/50 border border-emerald-500/20 p-5 flex flex-col justify-between group hover:border-emerald-400/40 transition-all duration-500">
      {/* Glow Background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px] pointer-events-none" />

      {/* Header Tag */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 mb-3">
          <Sprout size={12} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{t.label}</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white mb-1.5 leading-tight">{t.title}</h3>
        <p className="text-sm text-emerald-200/70 leading-relaxed mb-4">{t.desc}</p>

        {/* Yield Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">{t.yield}</span>
          </div>
        </div>
      </div>

      {/* Health Progress */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Leaf size={12} className="text-emerald-400" />
            {t.health}: {t.healthPct}
          </span>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">{t.progress}</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style={{ width: '94%' }} />
        </div>

        {/* View More */}
        <button className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/btn">
          <span>{t.viewMore}</span>
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
