import React from 'react';
import { Sprout, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'पीक प्रवास',
    crop: 'सोयाबीन',
    days: 'दिवस',
    of: '/',
    stages: ['पेरणी', 'शाकीय वाढ', 'फुलोरा', 'शेंगा भरणे', 'काढणी'],
    progress: 'प्रगती',
    daysLeft: '42 दिवस शिल्लक',
    viewMore: 'संपूर्ण वेळापत्रक →',
  },
  hi: {
    title: 'फसल यात्रा',
    crop: 'सोयाबीन',
    days: 'दिन',
    of: '/',
    stages: ['बुवाई', 'वृद्धि', 'फूलना', 'फलियां', 'कटाई'],
    progress: 'प्रगति',
    daysLeft: '42 दिन शेष',
    viewMore: 'पूरी अनुसूची →',
  },
  en: {
    title: 'Crop Journey',
    crop: 'Soyabean',
    days: 'days',
    of: '/',
    stages: ['Sowing', 'Growth', 'Flowering', 'Pod Fill', 'Harvest'],
    progress: 'Progress',
    daysLeft: '42 days left',
    viewMore: 'Full Schedule →',
  },
};

const STAGE_STATUS = ['completed', 'completed', 'active', 'upcoming', 'upcoming'];

export const CropJourneyWidget = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const currentDay = 48;
  const totalDays = 90;
  const progressPct = Math.round((currentDay / totalDays) * 100);

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-purple-500/30 transition-all duration-500">
      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Sprout size={16} className="text-purple-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-400">{t.crop}</span>
        </div>
      </div>

      {/* Days Counter */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white">{currentDay}</span>
          <span className="text-sm text-slate-500 font-bold">{t.of} {totalDays}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.progress}</span>
            <span className="text-xs font-bold text-emerald-400">{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-emerald-500 to-teal-400 transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between gap-1">
          {t.stages.map((stage: string, i: number) => {
            const status = STAGE_STATUS[i];
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  status === 'completed' ? 'bg-emerald-500/20 border-emerald-400' :
                  status === 'active' ? 'bg-purple-500/20 border-purple-400 animate-pulse' :
                  'bg-slate-800 border-slate-600'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : status === 'active' ? (
                    <Circle size={10} className="text-purple-400" fill="currentColor" />
                  ) : (
                    <Circle size={10} className="text-slate-600" />
                  )}
                </div>
                <span className={`text-[8px] font-bold text-center leading-tight ${
                  status === 'active' ? 'text-purple-300' :
                  status === 'completed' ? 'text-slate-400' : 'text-slate-600'
                }`}>{stage}</span>
              </div>
            );
          })}
        </div>
        {/* Connecting line */}
        <div className="absolute top-[12px] left-[12%] right-[12%] h-0.5 bg-slate-800 -z-10">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-purple-400" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Clock size={12} />
          <span>{t.daysLeft}</span>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
          <span>{t.viewMore}</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};
