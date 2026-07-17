import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckSquare, Square, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'आजचे कार्य',
    tasks: [
      { label: 'बीज बुद्धा', done: true },
      { label: 'जमिनीचू काम्प्ले', done: true },
      { label: 'खत रोपे', done: false },
      { label: 'गट नियोजन', done: false },
      { label: 'पाणी देणे', done: false },
    ],
    completed: 'पूर्ण',
    remaining: 'बाकी',
    summaryText: 'प्रगती',
    viewMore: 'संपूर्ण माहिती पहा',
  },
  hi: {
    title: 'आज के कार्य',
    tasks: [
      { label: 'बीज बुवाई', done: true },
      { label: 'जमीन तैयारी', done: true },
      { label: 'खाद डालना', done: false },
      { label: 'समूह नियोजन', done: false },
      { label: 'सिंचाई', done: false },
    ],
    completed: 'पूर्ण',
    remaining: 'शेष',
    summaryText: 'प्रगति',
    viewMore: 'पूरी जानकारी देखें',
  },
  en: {
    title: "Today's Tasks",
    tasks: [
      { label: 'Seed Sowing', done: true },
      { label: 'Land Preparation', done: true },
      { label: 'Fertilizer', done: false },
      { label: 'Group Planning', done: false },
      { label: 'Irrigation', done: false },
    ],
    completed: 'Done',
    remaining: 'Remaining',
    summaryText: 'Progress',
    viewMore: 'View Details',
  },
};

export const TodaysTasks = ({ lang, onClick }: { lang: Language; onClick?: () => void }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [mounted, setMounted] = useState(false);
  const doneCount = t.tasks.filter((tk: any) => tk.done).length;
  const totalCount = t.tasks.length;
  const completionPercentage = Math.round((doneCount / totalCount) * 100);

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
    }, 150);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full rounded-[28px] overflow-hidden border border-white/[0.10] backdrop-blur-xl transition-all duration-700 hover:border-cyan-400/30 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,182,212,0.15)] flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(10,26,34,0.90) 0%, rgba(6,16,22,0.96) 50%, rgba(4,10,14,0.92) 100%)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Noise Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-cyan-500/[0.08] rounded-full blur-[64px] pointer-events-none group-hover:bg-cyan-400/[0.12] transition-all duration-700" />

      <div className="relative z-10 p-[24px] flex flex-col justify-between h-full flex-1">
        {/* Header section */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ClipboardCheck size={16} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black tracking-tight text-zinc-100">{t.title}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <Calendar size={11} className="text-cyan-400" />
            <span>{doneCount}/{totalCount} {t.completed}</span>
          </div>
        </div>

        {/* Task Items List */}
        <div className="flex-1 space-y-3 py-1.5">
          {t.tasks.map((task: any, i: number) => (
            <div key={i} className="flex items-center gap-3 group/task cursor-pointer">
              {task.done ? (
                <div className="w-[18px] h-[18px] rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-[18px] h-[18px] rounded border border-slate-700 bg-slate-950/60 shrink-0 group-hover/task:border-cyan-400/50 transition-colors duration-300" />
              )}
              <span className={`text-[13px] font-bold transition-colors leading-none ${
                task.done 
                  ? 'text-zinc-500 line-through' 
                  : 'text-zinc-300 group-hover/task:text-white'
              }`}>
                {task.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar footer */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span className="uppercase tracking-wider">{t.summaryText}</span>
            <span className="text-cyan-400">{completionPercentage}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#0a141a] border border-white/[0.04] p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: mounted ? `${completionPercentage}%` : '0%',
                background: 'linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #22c55e 100%)',
                boxShadow: '0 0 10px rgba(6,182,212,0.4)',
                transition: 'width 1.5s cubic-bezier(0.22,1,0.36,1) 0.1s',
              }}
            />
          </div>
        </div>

        {/* Action Button footer */}
        <button 
          onClick={(e) => {
            if (onClick) {
              e.stopPropagation();
              onClick();
            }
          }}
          className="group/btn mt-4 w-full h-10 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center justify-between pl-4 pr-1 text-xs font-bold text-white hover:bg-gradient-to-r hover:from-[#0ea5e9] hover:to-[#06b6d4] hover:text-black hover:border-transparent hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] transition-all duration-500"
        >
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
