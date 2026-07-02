import React from 'react';
import { Map, Plus, ChevronRight } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'Multiple Fields Overview',
    addNew: 'शेत +',
    fields: [
      { name: 'शेत 1', size: '2.5 एकर', crops: 'सोयाबीन + मुगदळ', health: 92, color: 'from-emerald-500 to-teal-400' },
      { name: 'शेत 2', size: '3 एकर', crops: 'कापूस + कडधी', health: 85, color: 'from-blue-500 to-cyan-400' },
      { name: 'शेत 3', size: '1.5 एकर', crops: 'मका + सरकी', health: 78, color: 'from-amber-500 to-yellow-400' },
    ],
    healthLabel: 'पीक स्वास्थ्य',
  },
  hi: {
    title: 'Multiple Fields Overview',
    addNew: 'खेत +',
    fields: [
      { name: 'खेत 1', size: '2.5 एकड़', crops: 'सोयाबीन + मूंग', health: 92, color: 'from-emerald-500 to-teal-400' },
      { name: 'खेत 2', size: '3 एकड़', crops: 'कपास + कड्ही', health: 85, color: 'from-blue-500 to-cyan-400' },
      { name: 'खेत 3', size: '1.5 एकड़', crops: 'मक्का + सरसों', health: 78, color: 'from-amber-500 to-yellow-400' },
    ],
    healthLabel: 'फसल स्वास्थ्य',
  },
  en: {
    title: 'Multiple Fields Overview',
    addNew: 'Add Field +',
    fields: [
      { name: 'Field 1', size: '2.5 acres', crops: 'Soyabean + Moong', health: 92, color: 'from-emerald-500 to-teal-400' },
      { name: 'Field 2', size: '3 acres', crops: 'Cotton + Kadhi', health: 85, color: 'from-blue-500 to-cyan-400' },
      { name: 'Field 3', size: '1.5 acres', crops: 'Maize + Mustard', health: 78, color: 'from-amber-500 to-yellow-400' },
    ],
    healthLabel: 'Crop Health',
  },
};

export const MultiFieldsOverview = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-teal-500/30 transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Map size={16} className="text-teal-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
          <Plus size={12} />
          {t.addNew}
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 space-y-3 relative z-10">
        {t.fields.map((field: any, i: number) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/15 hover:bg-slate-800/50 transition-all cursor-pointer group/field"
          >
            {/* Field Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${field.color} opacity-20 flex items-center justify-center flex-shrink-0 relative`}>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${field.color} opacity-30`} />
              <Map size={18} className="text-white relative z-10" />
            </div>

            {/* Field Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-slate-200">{field.name}</span>
                <span className="text-[10px] text-slate-500">({field.size})</span>
              </div>
              <p className="text-[10px] text-slate-400">{field.crops}</p>
            </div>

            {/* Health */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${field.color}`} style={{ width: `${field.health}%` }} />
                </div>
                <span className={`text-xs font-bold ${field.health >= 90 ? 'text-emerald-400' : field.health >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {field.health}%
                </span>
              </div>
            </div>

            <ChevronRight size={14} className="text-slate-600 group-hover/field:text-slate-400 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
