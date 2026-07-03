import React from 'react';
import { Activity, ClipboardCheck, Cpu, TrendingUp, CloudSun, Mic, Map, Bell } from 'lucide-react';
import { Language } from '../../types';

const ITEMS: Record<string, { icon: any; color: string; bg: string; border: string }[]> = {
  all: [
    { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: ClipboardCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { icon: Cpu, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: CloudSun, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: Mic, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { icon: Map, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { icon: Bell, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ],
};

const TEXTS: Record<string, any> = {
  mr: {
    title: 'KEY IMPROVEMENTS',
    items: [
      { title: 'Farm Health Score', desc: 'स्वयंचलित हेल्थ स्कोर स्कोर प्रणाली' },
      { title: "Today's Tasks", desc: 'वैयक्तिक कार्ये आणि सूचना प्रणाली' },
      { title: 'AI Recommendation', desc: 'AI आधारित शिफारसी आणि सल्ला मंच' },
      { title: 'Live Market Trend', desc: 'बाजार भाव आणि विश्लेषण' },
      { title: 'Weather Animation', desc: 'वास्तविक हवामान सजीव प्रदर्शन' },
      { title: 'Voice & Chat AI', desc: 'बोलून प्रश्न विचारा, लगेच उत्तर मिळवा' },
      { title: 'Multiple Fields', desc: 'अनेक शेतजमिनींची एकत्रित माहिती' },
      { title: 'Notifications', desc: 'महत्त्वाच्या सूचना आणि अलर्ट सिस्टम' },
    ],
  },
  hi: {
    title: 'KEY IMPROVEMENTS',
    items: [
      { title: 'Farm Health Score', desc: 'स्वचालित हेल्थ स्कोर प्रणाली' },
      { title: "Today's Tasks", desc: 'व्यक्तिगत कार्य और सूचनाएं' },
      { title: 'AI Recommendation', desc: 'AI आधारित सिफारिशें और सलाह' },
      { title: 'Live Market Trend', desc: 'बाजार भाव और विश्लेषण' },
      { title: 'Weather Animation', desc: 'वास्तविक मौसम प्रदर्शन' },
      { title: 'Voice & Chat AI', desc: 'बोलकर सवाल पूछें, तुरंत जवाब पाएं' },
      { title: 'Multiple Fields', desc: 'कई खेतों की एकीकृत जानकारी' },
      { title: 'Notifications', desc: 'महत्वपूर्ण सूचनाएं और अलर्ट' },
    ],
  },
  en: {
    title: 'KEY IMPROVEMENTS',
    items: [
      { title: 'Farm Health Score', desc: 'Automated health scoring system' },
      { title: "Today's Tasks", desc: 'Personalized tasks and reminders' },
      { title: 'AI Recommendation', desc: 'AI-powered crop recommendations' },
      { title: 'Live Market Trend', desc: 'Real-time market price analytics' },
      { title: 'Weather Animation', desc: 'Animated weather visualization' },
      { title: 'Voice & Chat AI', desc: 'Ask questions by voice, get instant answers' },
      { title: 'Multiple Fields', desc: 'Unified multi-field management' },
      { title: 'Notifications', desc: 'Important alerts and notifications' },
    ],
  },
};

export const KeyImprovements = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const icons = ITEMS.all;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 p-5 group">
      {/* Header */}
      <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-4">{t.title}</h3>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {t.items.map((item: any, i: number) => {
          const iconConfig = icons[i];
          const Icon = iconConfig.icon;
          return (
            <div
              key={i}
              className="group/card relative rounded-xl bg-slate-800/30 border border-white/5 p-3 hover:border-white/15 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg ${iconConfig.bg} ${iconConfig.border} border flex items-center justify-center mb-2`}>
                <Icon size={16} className={iconConfig.color} />
              </div>
              <h4 className="text-xs font-bold text-slate-200 mb-1">{item.title}</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
