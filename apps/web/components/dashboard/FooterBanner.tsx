import React from 'react';
import { Languages, Shield, Wifi, MessageSquare, BookOpen, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Languages, text: '12+ भाषा रिपोर्ट' },
  { icon: Shield, text: '100% सुरक्षित डेटा' },
  { icon: Wifi, text: 'ऑफलाइन मोड' },
  { icon: MessageSquare, text: 'तत्काळ AI सल्ला' },
  { icon: BookOpen, text: 'तज्ञांचे मार्गदर्शन' },
  { icon: Globe, text: 'भारत तयार, शेतकऱ्यांसाठी' },
];

export const FooterBanner = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#0d1f35] to-[#0a1628] border-t border-white/5">
      {/* Glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Scrolling content */}
      <div className="py-3 flex items-center">
        <div className="flex items-center gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...FEATURES, ...FEATURES].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="flex items-center gap-2 px-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Icon size={12} className="text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-300">{feat.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
