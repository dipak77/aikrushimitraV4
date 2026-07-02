import React from 'react';
import { ClipboardCheck, CheckSquare, Square, Calendar } from 'lucide-react';
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
  },
};

export const TodaysTasks = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const doneCount = t.tasks.filter((tk: any) => tk.done).length;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-cyan-500/30 transition-all duration-500">
      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <ClipboardCheck size={16} className="text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <Calendar size={12} />
          <span>{doneCount}/{t.tasks.length}</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3 relative z-10">
        {t.tasks.map((task: any, i: number) => (
          <div key={i} className="flex items-center gap-3 group/task cursor-pointer">
            {task.done ? (
              <CheckSquare size={18} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Square size={18} className="text-slate-600 flex-shrink-0 group-hover/task:text-slate-400 transition-colors" />
            )}
            <span className={`text-sm font-medium transition-colors ${task.done ? 'text-slate-400 line-through' : 'text-slate-200 group-hover/task:text-white'}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-slate-400">{doneCount} {t.completed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="text-[10px] font-bold text-slate-500">{t.tasks.length - doneCount} {t.remaining}</span>
        </div>
      </div>
    </div>
  );
};
