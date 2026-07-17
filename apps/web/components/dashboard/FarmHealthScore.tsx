import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Circle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'फार्म हेल्थ स्कोर',
    tasks: [
      { label: 'बीज काळी', done: true },
      { label: 'जमिनीचू काम्प्ले', done: true },
      { label: 'खत रोपे', done: false },
      { label: 'गट नियोजन', done: false },
    ],
    tasksDone: 'पूर्ण २ दिवसांत',
    viewMore: 'संपूर्ण माहिती पहा',
    progress: 'उत्तम स्थिती',
    scoreText: 'एकूण आरोग्य स्कोअर'
  },
  hi: {
    title: 'फार्म हेल्थ स्कोर',
    tasks: [
      { label: 'बीज बुवाई', done: true },
      { label: 'जमीन तैयारी', done: true },
      { label: 'खाद डालना', done: false },
      { label: 'समूह नियोजन', done: false },
    ],
    tasksDone: '२ दिनों में पूर्ण',
    viewMore: 'पूरी जानकारी देखें',
    progress: 'उत्तम स्थिति',
    scoreText: 'कुल स्वास्थ्य स्कोर'
  },
  en: {
    title: 'Farm Health Score',
    tasks: [
      { label: 'Seed Sowing', done: true },
      { label: 'Land Preparation', done: true },
      { label: 'Fertilizer Application', done: false },
      { label: 'Group Planning', done: false },
    ],
    tasksDone: 'Complete in 2 days',
    viewMore: 'View Details',
    progress: 'Great Health',
    scoreText: 'Overall health score'
  },
};

export const FarmHealthScore = ({ lang, onClick }: { lang: Language; onClick?: () => void }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [mounted, setMounted] = useState(false);
  const [scoreVal, setScoreVal] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setScoreVal(92);
    }, 150);
    return () => clearTimeout(id);
  }, []);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreVal / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full rounded-[28px] overflow-hidden border border-white/[0.10] backdrop-blur-xl transition-all duration-700 hover:border-emerald-400/30 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(34,197,94,0.15)] flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(10,34,16,0.90) 0%, rgba(6,18,10,0.96) 50%, rgba(4,14,6,0.92) 100%)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Texture Noise Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/[0.08] rounded-full blur-[64px] pointer-events-none group-hover:bg-emerald-400/[0.12] transition-all duration-700" />

      <div className="relative z-10 p-[24px] flex flex-col justify-between h-full flex-1">
        {/* Header Title */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black tracking-tight text-zinc-100">{t.title}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-300 uppercase tracking-widest leading-none">
            <Sparkles size={8} /> LIVE
          </div>
        </div>

        {/* Circular Gauge and Task Checklist */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2 flex-1">
          {/* Glowing Radial Circle */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg width="112" height="112" viewBox="0 0 112 112" className="transform -rotate-90">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <circle cx="56" cy="56" r={radius} fill="none" stroke="#08170c" strokeWidth="6" />
              <circle
                cx="56" cy="56" r={radius}
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? strokeDashoffset : circumference}
                style={{
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black tracking-tight text-white leading-none">{scoreVal}%</span>
              <span className="text-[7.5px] font-black tracking-widest text-emerald-400 uppercase mt-1">{t.progress}</span>
            </div>
          </div>

          {/* Mini checklist details */}
          <div className="flex-1 space-y-2.5 w-full">
            {t.tasks.map((task: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 group/task cursor-pointer">
                {task.done ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={11} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 group-hover/task:border-slate-500 transition-colors" />
                )}
                <span className={`text-[12px] font-bold transition-colors ${task.done ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {task.label}
                </span>
              </div>
            ))}
            <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{t.tasksDone}</span>
            </div>
          </div>
        </div>

        {/* Action Button footer */}
        <button className="group/btn mt-4 w-full h-10 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center justify-between pl-4 pr-1 text-xs font-bold text-white hover:bg-gradient-to-r hover:from-[#10b981] hover:to-[#0ea5e9] hover:text-black hover:border-transparent hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all duration-500">
          <span className="flex items-center gap-2">
            {t.viewMore}
            <span className="opacity-60 group-hover/btn:opacity-100 transition-opacity">→</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-white/[0.08] group-hover/btn:bg-black/10 flex items-center justify-center transition-all">
            <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
