import React from 'react';
import { Store, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { MOCK_MARKET } from '../../data/mock';
import { Language } from '../../types';
import { DASH_TEXT } from './constants';

export const MarketPricesTable = ({ lang }: { lang: Language }) => {
  const txt = DASH_TEXT[lang] || DASH_TEXT.en;
  const items = MOCK_MARKET.slice(0, 4);

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-amber-500/30 transition-all duration-500">
      {/* Background graph effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-amber-500 fill-current">
          <path d="M0 40 L0 20 Q 20 10 40 25 T 100 15 L 100 40 Z" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Store size={16} className="text-amber-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">{txt.market_rates} (APMC)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{txt.live}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 relative z-10">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-2 pb-2 border-b border-white/5 mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">पीक</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">भाव (₹)</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">बदल</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">{txt.vol}</span>
        </div>

        {/* Table Rows */}
        {items.map((m, i) => {
          const isUp = m.trend.includes('+') && m.trend !== '+0';
          return (
            <div key={i} className="grid grid-cols-4 gap-2 py-2.5 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-lg">{['🌱', '🌿', '🧅', '🫘'][i]}</span>
                <span className="text-xs font-bold text-slate-200">{txt.crops[m.name] || m.name}</span>
              </div>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 text-right">
                ₹{m.price.toLocaleString()}
              </span>
              <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{m.trend}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 text-right">{m.arrival}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors relative z-10">
        <span>{lang === 'mr' ? 'सर्व भाव पहा →' : lang === 'hi' ? 'सभी भाव देखें →' : 'View All Prices →'}</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
};
