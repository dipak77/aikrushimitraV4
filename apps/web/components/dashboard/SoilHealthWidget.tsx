import React from 'react';
import { FlaskConical, Droplets, Leaf } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'माती आरोग्य',
    ph: 'pH',
    phValue: '6.8',
    phLabel: '(चांगले)',
    npk: 'NPK मूल्ये',
    nitrogen: 'नायट्रोजन',
    phosphorus: 'फॉस्फरस',
    potassium: 'पोटॅश',
    organic: 'सेंद्रिय कार्बन',
    organicValue: '1.2%',
    organicStatus: 'चांगले',
    moisture: 'ओलावा',
    moistureValue: '35%',
  },
  hi: {
    title: 'मिट्टी स्वास्थ्य',
    ph: 'pH',
    phValue: '6.8',
    phLabel: '(अच्छा)',
    npk: 'NPK मान',
    nitrogen: 'नाइट्रोजन',
    phosphorus: 'फॉस्फोरस',
    potassium: 'पोटाश',
    organic: 'ऑर्गेनिक कार्बन',
    organicValue: '1.2%',
    organicStatus: 'अच्छा',
    moisture: 'नमी',
    moistureValue: '35%',
  },
  en: {
    title: 'Soil Health',
    ph: 'pH',
    phValue: '6.8',
    phLabel: '(Good)',
    npk: 'NPK Values',
    nitrogen: 'Nitrogen',
    phosphorus: 'Phosphorus',
    potassium: 'Potassium',
    organic: 'Organic Carbon',
    organicValue: '1.2%',
    organicStatus: 'Good',
    moisture: 'Moisture',
    moistureValue: '35%',
  },
};

const NPK_DATA = [
  { key: 'nitrogen', value: 68, color: 'from-emerald-500 to-green-400' },
  { key: 'phosphorus', value: 45, color: 'from-blue-500 to-cyan-400' },
  { key: 'potassium', value: 72, color: 'from-amber-500 to-yellow-400' },
];

export const SoilHealthWidget = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-amber-500/30 transition-all duration-500">
      {/* Glow */}
      <div className="absolute top-0 left-0 w-28 h-28 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <FlaskConical size={16} className="text-amber-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
      </div>

      {/* pH + Organic */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">{t.ph}</span>
          <span className="text-2xl font-black text-white">{t.phValue}</span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{t.phLabel}</span>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-blue-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.organic}</p>
            <p className="text-sm font-bold text-white">{t.organicValue} <span className="text-emerald-400 text-[10px]">{t.organicStatus}</span></p>
          </div>
        </div>
      </div>

      {/* NPK Bars */}
      <div className="flex-1 space-y-3 relative z-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t.npk}</p>
        {NPK_DATA.map((n) => (
          <div key={n.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300">{(t as any)[n.key]}</span>
              <span className="text-xs font-bold text-slate-400">{n.value}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${n.color} transition-all duration-1000`}
                style={{ width: `${n.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Moisture */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 relative z-10">
        <Leaf size={14} className="text-emerald-400" />
        <span className="text-xs font-medium text-slate-400">{t.moisture}: <span className="text-white font-bold">{t.moistureValue}</span></span>
      </div>
    </div>
  );
};
