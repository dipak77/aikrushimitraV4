
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Language } from '../../types';
import {
  LayoutDashboard, CloudSun, Sprout, Package, Bot, BookOpen, Landmark,
  Store, TrendingUp, Mic, ChevronDown, ChevronUp, Zap, Sparkles, Crown,
  Settings, ScanLine, FlaskConical, Map as MapIcon, Users, MessageSquare, Cpu, ShoppingCart, Shield,
  ChevronLeft, ChevronRight, X, Home, Globe
} from 'lucide-react';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/common';
import { useAppStore } from '../../store/useAppStore';

const MENU_TEXTS: Record<string, any> = {
  mr: {
    home: 'मुख्यपृष्ठ',
    landing: 'लँडिंग पेज',
    dashboard: 'डॅशबोर्ड',
    weather: 'हवामान',
    cropMgmt: 'पीक व्यवस्थापन',
    marketOrders: 'सब्जी मंडी',
    aiAdvice: 'AI सल्ला',
    knowledge: 'ज्ञान केंद्र',
    govtHelp: 'सरकार मदत',
    marketRates: 'बाजार भाव',
    trade: 'व्यापार',
    more: '...अधिक',
    diseaseDetector: 'पीक डॉक्टर',
    soilAnalysis: 'माती तपासणी',
    yieldPredict: 'उत्पादन अंदाज',
    areaCalc: 'क्षेत्र मोजणी',
    community: 'शेतकरी मंच',
    chat: 'AI चॅट',
    premium: 'विशेष सेवा',
    innovation: 'तंत्रज्ञान हब',
    admin: 'व्यवस्थापन',
    settings: 'सेटिंग्ज',
  },
  hi: {
    home: 'मुख्य पृष्ठ',
    landing: 'लैंडिंग पेज',
    dashboard: 'डैशबोर्ड',
    weather: 'मौसम',
    cropMgmt: 'फसल प्रबंधन',
    marketOrders: 'सब्जी मंडी',
    aiAdvice: 'AI सलाह',
    knowledge: 'ज्ञान केंद्र',
    govtHelp: 'सरकारी सहायता',
    marketRates: 'मंडी भाव',
    trade: 'व्यापार',
    more: '...और',
    diseaseDetector: 'फसल डॉक्टर',
    soilAnalysis: 'मिट्टी जांच',
    yieldPredict: 'उपज अनुमान',
    areaCalc: 'क्षेत्र गणक',
    community: 'किसान मंच',
    chat: 'AI चैट',
    premium: 'विशेष सेवा',
    innovation: 'तकनीक हब',
    admin: 'प्रशासन',
    settings: 'सेटिंग्स',
  },
  en: {
    home: 'Home',
    landing: 'Landing Page',
    dashboard: 'Dashboard',
    weather: 'Weather',
    cropMgmt: 'Crop Management',
    marketOrders: 'Sabji Mandi',
    aiAdvice: 'AI Advice',
    knowledge: 'Knowledge Hub',
    govtHelp: 'Govt Schemes',
    marketRates: 'Market Rates',
    trade: 'Trade',
    more: '...More',
    diseaseDetector: 'Crop Doctor',
    soilAnalysis: 'Soil Analysis',
    yieldPredict: 'Yield Predict',
    areaCalc: 'Area Calculator',
    community: 'Community',
    chat: 'AI Chat',
    premium: 'Premium',
    innovation: 'Innovation Hub',
    admin: 'Admin',
    settings: 'Settings',
  },
};

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const t = MENU_TEXTS[lang] || MENU_TEXTS.en;
  const { sidebarCollapsed: collapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen, platformConfig } = useAppStore();

  const isEnabled = (id: string) => {
    if (!platformConfig || !platformConfig.features) return true;
    switch (id) {
      case 'WEATHER': return platformConfig.features.weather !== false;
      case 'SABJI_MANDI': return platformConfig.features.marketplace !== false;
      case 'CHAT': return platformConfig.features.aiAssistant !== false;
      case 'SCHEMES': return platformConfig.features.govtSchemes !== false;
      case 'DISEASE_DETECTOR': return platformConfig.features.cropDiagnosis !== false;
      case 'VOICE_ASSISTANT': return platformConfig.features.voiceAssistant !== false;
      default: return true;
    }
  };

  const mainItems = [
    { id: 'DASHBOARD', icon: Home, label: t.home, color: 'emerald' },
    { id: 'LANDING', icon: Globe, label: t.landing, color: 'blue' },
    { id: 'WEATHER', icon: CloudSun, label: t.weather, color: 'amber' },
    { id: 'CALENDAR', icon: Sprout, label: t.cropMgmt, color: 'green' },
    { id: 'SABJI_MANDI', icon: ShoppingCart, label: t.marketOrders, color: 'green' },
    { id: 'CHAT', icon: Bot, label: t.aiAdvice, color: 'cyan' },
    { id: 'AGRI_KNOWLEDGE', icon: BookOpen, label: t.knowledge, color: 'blue' },
    { id: 'SCHEMES', icon: Landmark, label: t.govtHelp, color: 'cyan' },
    { id: 'MARKET', icon: Store, label: t.marketRates, color: 'violet' },
    { id: 'COMMUNITY', icon: Users, label: t.community, color: 'blue' },
  ].filter(item => isEnabled(item.id));

  const moreItems = [
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.diseaseDetector, color: 'rose' },
    { id: 'SOIL', icon: FlaskConical, label: t.soilAnalysis, color: 'lime' },
    { id: 'YIELD', icon: TrendingUp, label: t.yieldPredict, color: 'fuchsia' },
    { id: 'AREA_CALCULATOR', icon: MapIcon, label: t.areaCalc, color: 'sky' },
    { id: 'PREMIUM', icon: Crown, label: t.premium, color: 'amber' },
    { id: 'INNOVATION', icon: Cpu, label: t.innovation, color: 'cyan' },
    { id: 'SETTINGS', icon: Settings, label: t.settings, color: 'emerald' },
  ].filter(item => isEnabled(item.id));

  return (
    <>
      <style>{`
        @keyframes sidebar-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes menu-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); opacity: 0; }
        }
        .sidebar-scrollbar::-webkit-scrollbar { width: 3px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; }
      `}</style>

      {/* Backdrop for mobile slide-over menu */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={clsx(
          "fixed lg:fixed left-0 top-0 bottom-0 flex-col z-[110] lg:z-50 overflow-hidden transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          sidebarOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070a07] via-[#0a1a0f] to-[#070a07] backdrop-blur-[60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent opacity-60" />

        {/* Right border */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400/15 to-transparent blur-sm" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Logo Section */}
          <div 
            className={clsx(
              "py-6 px-4 flex items-center cursor-pointer group/logo transition-all duration-300",
              collapsed ? "flex-col gap-4 justify-center" : "flex-row gap-3 justify-between"
            )}
            onClick={() => setView('DASHBOARD')}
          >
            <div className="flex items-center gap-3">
              {/* Logo Circle */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-lime-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover/logo:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-shadow duration-500">
                  <span className="text-black font-black text-sm tracking-wider">AI</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border border-amber-300/30">
                  <Sparkles size={8} className="text-amber-900" />
                </div>
              </div>
              {/* Logo Text */}
              {!collapsed && (
                <div className="animate-fade-in truncate">
                  <h1 className="text-sm font-black text-white leading-none">AI Krushi Agent</h1>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Smart Farming Assistant</p>
                </div>
              )}
            </div>

            {/* Action buttons: Collapse (desktop) & Close (mobile) */}
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSidebarCollapsed(!collapsed); 
                  triggerHaptic(); 
                }}
                className={clsx(
                  "hidden lg:block p-1.5 rounded-lg border border-white/5 hover:bg-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200 transition-colors",
                  collapsed ? "mt-1" : ""
                )}
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSidebarOpen(false); 
                  triggerHaptic(); 
                }}
                className="lg:hidden p-1.5 rounded-lg border border-white/5 hover:bg-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                title="Close Menu"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scrollbar space-y-1">
            {mainItems.map((item) => {
              const active = view === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group/item relative overflow-hidden',
                    active
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'border border-transparent hover:bg-white/5 hover:border-white/5',
                    collapsed ? 'justify-center px-0' : ''
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-emerald-400 to-lime-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  )}

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent skew-x-12 translate-x-[-200%] group-hover/item:translate-x-[200%] transition-transform duration-700" />
                  </div>

                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0',
                    active
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'bg-white/5 border border-white/5 group-hover/item:border-white/10'
                  )}>
                    <Icon
                      size={16}
                      className={clsx(
                        'transition-all duration-300',
                        active ? 'text-emerald-400' : 'text-slate-500 group-hover/item:text-slate-300'
                      )}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  {!collapsed && (
                    <span className={clsx(
                      'text-sm font-semibold transition-colors duration-300 truncate animate-fade-in',
                      active ? 'text-emerald-400' : 'text-slate-400 group-hover/item:text-slate-200'
                    )}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More Section */}
            <div className="pt-2">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={clsx(
                  "w-full flex items-center rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all duration-300",
                  collapsed ? "justify-center py-2" : "justify-between px-3 py-2.5"
                )}
                title={collapsed ? t.more : undefined}
              >
                {!collapsed ? (
                  <span className="text-sm font-semibold text-slate-500">{t.more}</span>
                ) : (
                  <span className="text-slate-500 text-lg font-bold leading-none">•••</span>
                )}
                {!collapsed && (
                  moreOpen ? (
                    <ChevronUp size={16} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500" />
                  )
                )}
              </button>

              {moreOpen && (
                <div className="space-y-1 mt-1 animate-[fadeInUp_0.3s_ease-out]">
                  {moreItems.map((item) => {
                    const active = view === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setView(item.id as ViewState); triggerHaptic(); }}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group/item relative overflow-hidden',
                          active
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'border border-transparent hover:bg-white/5 hover:border-white/5',
                          collapsed ? 'justify-center px-0' : ''
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-emerald-400 to-lime-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        )}
                        <div className={clsx(
                          'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0',
                          active
                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                            : 'bg-white/5 border border-white/5'
                        )}>
                          <Icon
                            size={14}
                            className={clsx(
                              'transition-all duration-300',
                              active ? 'text-emerald-400' : 'text-slate-500 group-hover/item:text-slate-300'
                            )}
                          />
                        </div>
                        {!collapsed && (
                          <span className={clsx(
                            'text-xs font-semibold transition-colors duration-300 truncate animate-fade-in',
                            active ? 'text-emerald-400' : 'text-slate-500 group-hover/item:text-slate-300'
                          )}>
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Voice Button */}
          <div className={clsx("pb-6 pt-2 transition-all duration-300", collapsed ? "px-3" : "px-5")}>
            <button
              onClick={() => { setView('VOICE_ASSISTANT'); triggerHaptic(); }}
              className={clsx(
                "w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-lime-400 text-black font-extrabold shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group/voice",
                collapsed ? "h-11 rounded-xl" : "gap-2 py-3 rounded-xl text-sm"
              )}
              title={collapsed ? (lang === 'mr' ? 'बोला' : lang === 'hi' ? 'बोलें' : 'Voice') : undefined}
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/voice:translate-x-[200%] transition-transform duration-1000" />
              <Mic size={18} strokeWidth={2.5} className="relative z-10 flex-shrink-0" />
              {!collapsed && (
                <span className="relative z-10 animate-fade-in truncate">{lang === 'mr' ? 'बोला' : lang === 'hi' ? 'बोलें' : 'Voice'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
