import React, { useState } from 'react';
import { TrendingUp, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { Language } from '../../types';

const CHART_DATA = [
  { day: '16 जू', price: 4500 },
  { day: '17 जू', price: 4550 },
  { day: '18 जू', price: 4600 },
  { day: '19 जू', price: 4650 },
  { day: '20 जू', price: 4700 },
  { day: '21 जू', price: 4780 },
  { day: '22 जू', price: 4850 },
];

const PERIODS = ['7D', '1M', '3M', '1Y'];

const TEXTS: Record<string, any> = {
  mr: {
    title: 'Market Trend – Enhanced',
    crop: 'सोयाबीन (आजचे)',
    price: '₹4,850',
    change: '+120 (2.53%)',
  },
  hi: {
    title: 'Market Trend – Enhanced',
    crop: 'सोयाबीन (आज)',
    price: '₹4,850',
    change: '+120 (2.53%)',
  },
  en: {
    title: 'Market Trend – Enhanced',
    crop: 'Soyabean (Today)',
    price: '₹4,850',
    change: '+120 (2.53%)',
  },
};

export const MarketTrendChart = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [activePeriod, setActivePeriod] = useState('7D');

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-emerald-500/30 transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-sm font-bold text-slate-200">{t.title}</span>
        <button className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <X size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Crop & Price */}
      <div className="mb-4 relative z-10">
        <p className="text-xs font-bold text-emerald-400 mb-1">{t.crop}</p>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">{t.price}</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <TrendingUp size={14} />
            {t.change}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[120px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: any) => [`₹${value}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#chartGrad)"
              dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#0f172a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Period Toggles */}
      <div className="flex items-center gap-2 mt-3 relative z-10">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activePeriod === p
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
