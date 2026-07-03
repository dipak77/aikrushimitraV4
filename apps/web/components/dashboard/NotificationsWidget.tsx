import React from 'react';
import { Bell, CloudSun, TrendingUp, Landmark, ChevronRight } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'Notifications Panel',
    viewAll: 'सर्व सूचना पहा →',
    items: [
      { icon: CloudSun, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'हवा ओढवार पावसाची शक्यता', desc: 'पळवणी करा आणि उदया पाऊस असेल', time: '10 मिनिटांपूर्वी', badge: null },
      { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'सोयाबीन बाव वाढली', desc: 'सोयाबीन ₹4,850 या पूर्ण बाव', time: '30 मिनिटांपूर्वी', badge: null },
      { icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'सरकारच्या रोजगार प्राप्तता', desc: 'PM Kisan ₹2000 किस्त', time: '1 तासापूर्वी', badge: null },
      { icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', title: 'सरकारची रोजगार प्रास्तार', desc: 'PM Kisan अद्यदया प्राप्तता', time: '1 तासापूर्वी', badge: null },
    ],
  },
  hi: {
    title: 'Notifications Panel',
    viewAll: 'सभी सूचनाएं देखें →',
    items: [
      { icon: CloudSun, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'भारी बारिश की संभावना', desc: 'कल बारिश की संभावना, फसल सुरक्षित करें', time: '10 मिनट पहले', badge: null },
      { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'सोयाबीन भाव बढ़ा', desc: 'सोयाबीन ₹4,850 का भाव', time: '30 मिनट पहले', badge: null },
      { icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'सरकारी योजना अपडेट', desc: 'PM Kisan ₹2000 किस्त', time: '1 घंटा पहले', badge: null },
      { icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', title: 'फसल डॉक्टर सिफारिश', desc: 'छिड़काव का समय', time: '2 घंटे पहले', badge: null },
    ],
  },
  en: {
    title: 'Notifications Panel',
    viewAll: 'View All Notifications →',
    items: [
      { icon: CloudSun, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Heavy Rain Expected', desc: 'Protect crops, rain expected tomorrow', time: '10 min ago', badge: null },
      { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Soyabean Price Up', desc: 'Soyabean reached ₹4,850/quintal', time: '30 min ago', badge: null },
      { icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Govt Scheme Update', desc: 'PM Kisan ₹2000 installment', time: '1 hr ago', badge: null },
      { icon: Bell, color: 'text-pink-400', bg: 'bg-pink-500/10', title: 'Crop Doctor Recommendation', desc: 'Time to spray pesticide', time: '2 hrs ago', badge: null },
    ],
  },
};

export const NotificationsWidget = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 flex flex-col group hover:border-orange-500/30 transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 relative">
            <Bell size={16} className="text-orange-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0d1520] flex items-center justify-center">
              <span className="text-[7px] font-black text-white">4</span>
            </div>
          </div>
          <span className="text-sm font-bold text-slate-200">{t.title}</span>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 space-y-2.5 relative z-10 overflow-y-auto custom-scrollbar">
        {t.items.map((item: any, i: number) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/20 border border-white/5 hover:border-white/10 hover:bg-slate-800/40 transition-all cursor-pointer group/notif"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={14} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 mb-0.5 truncate">{item.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[9px] text-slate-600">{item.time}</span>
                <ChevronRight size={12} className="text-slate-600 group-hover/notif:text-slate-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <button className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors relative z-10">
        <span>{t.viewAll}</span>
      </button>
    </div>
  );
};
