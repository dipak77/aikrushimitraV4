import React from 'react';
import { Activity, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
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
    tasksDone: 'पूर्ण 2 दिवसांत',
    viewMore: 'संपूर्ण माहिती पहा →',
  },
  hi: {
    title: 'फार्म हेल्थ स्कोर',
    tasks: [
      { label: 'बीज बुवाई', done: true },
      { label: 'जमीन तैयारी', done: true },
      { label: 'खाद डालना', done: false },
      { label: 'समूह नियोजन', done: false },
    ],
    tasksDone: '2 दिनों में पूर्ण',
    viewMore: 'पूरी जानकारी देखें →',
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
    viewMore: 'View Details →',
  },
};

export const FarmHealthScore = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const score = 92;
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-emerald-500/30 transition-all duration-500">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Activity size={16} className="text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
      </div>

      {/* Score Circle + Tasks */}
      <div className="flex items-center gap-5 flex-1 relative z-10">
        {/* Circular Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
            {/* Background circle */}
            <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r="52"
              stroke="url(#healthGrad)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{score}%</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">उत्तम</span>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 space-y-2.5">
          {t.tasks.map((task: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5">
              {task.done ? (
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle size={16} className="text-slate-600 flex-shrink-0" />
              )}
              <span className={`text-xs font-medium ${task.done ? 'text-slate-300' : 'text-slate-500'}`}>
                {task.label}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 mt-2">{t.tasksDone}</p>
        </div>
      </div>

      {/* Footer */}
      <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors relative z-10">
        <span>{t.viewMore}</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
