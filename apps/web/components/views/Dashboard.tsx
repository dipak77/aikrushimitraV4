import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS, LANGUAGES } from '../../constants';
import { Languages, ChevronDown, CheckCircle2, Bell, Calendar, Shield, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { motion, AnimatePresence } from 'framer-motion';

import { fetchWeather, getPlaceName, DEFAULT_COORDS, MOCK_WEATHER } from '../../services/weatherService';
import { DASH_TEXT } from '../dashboard/constants';
import { DynamicGreeting } from '../dashboard/DynamicGreeting';
import { SmartBanner } from '../dashboard/SmartBanner';
import { WeatherWidget } from '../dashboard/WeatherWidget';
import { VoiceWidget } from '../dashboard/VoiceWidget';
import { CropAnalysisCard } from '../dashboard/CropAnalysisCard';
import { FarmHealthScore } from '../dashboard/FarmHealthScore';
import { TodaysTasks } from '../dashboard/TodaysTasks';
import { SoilHealthWidget } from '../dashboard/SoilHealthWidget';
import { CropJourneyWidget } from '../dashboard/CropJourneyWidget';
import { MarketPricesTable } from '../dashboard/MarketPricesTable';
import { KeyImprovements } from '../dashboard/KeyImprovements';
import { MarketTrendChart } from '../dashboard/MarketTrendChart';
import { AIChatWidget } from '../dashboard/AIChatWidget';
import { MultiFieldsOverview } from '../dashboard/MultiFieldsOverview';
import { NotificationsWidget } from '../dashboard/NotificationsWidget';
import { FooterBanner } from '../dashboard/FooterBanner';

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
    const t = TRANSLATIONS[lang];
    const txt = DASH_TEXT[lang];
    const [weather, setWeather] = useState<any>(MOCK_WEATHER);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [liveLocation, setLiveLocation] = useState<string>(user.village || "Locating...");

    useEffect(() => {
        const loadWeather = async () => {
            let lat = DEFAULT_COORDS.lat;
            let lng = DEFAULT_COORDS.lng;

            const getCoords = (): Promise<{lat: number, lng: number}> => {
                return new Promise((resolve) => {
                    if (!navigator.geolocation) return resolve(DEFAULT_COORDS);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => resolve(DEFAULT_COORDS),
                        { timeout: 5000 }
                    );
                });
            };

            try {
                const coords = await getCoords();
                lat = coords.lat;
                lng = coords.lng;

                const [weatherData, name] = await Promise.all([
                    fetchWeather(lat, lng),
                    getPlaceName(lat, lng, lang)
                ]);

                setWeather(weatherData);
                setLiveLocation(name);
            } catch (e) {
                console.error("Weather load error", e);
                try {
                    const fallback = await fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
                    setWeather(fallback);
                } catch (err) {
                    console.error("Critical weather failure");
                }
            } finally {
                setLoadingWeather(false);
            }
        };

        loadWeather();
    }, [lang]);

    // Current date
    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const dayStr = now.toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' });

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-transparent text-slate-100 lg:pl-64 selection:bg-emerald-500/30 flex flex-col relative">
            
            {/* --- INJECT KEYFRAMES --- */}
            <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-100%); }
                }
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HEADER BAR */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 py-3 flex items-center justify-between z-50 gap-4 sticky top-0 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 transition-all">
                {/* Left: Title */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                            <Sparkles size={16} className="text-black" strokeWidth={2.5} />
                        </div>
                        <div className="lg:hidden">
                            <h2 className="text-sm font-black text-white leading-none">AI Krushi Agent</h2>
                        </div>
                    </div>
                </div>

                {/* Center: Date & Day (desktop) */}
                <div className="hidden md:flex items-center gap-2 text-slate-400">
                    <Calendar size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold">{dateStr}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs font-medium text-slate-500">{dayStr}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Language Picker */}
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className={`h-9 px-3 rounded-full transition-all flex items-center gap-2 backdrop-blur-md border ${langMenuOpen ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                        >
                            <Languages size={16} className={langMenuOpen ? 'text-slate-900' : 'text-emerald-400'} />
                            <span className="hidden md:block text-[10px] font-bold uppercase tracking-wide">
                                {LANGUAGES.find(l => l.code === lang)?.name}
                            </span>
                            <ChevronDown size={12} className={`transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {langMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-64 bg-[#0a1220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[120] p-2"
                                >
                                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {LANGUAGES.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => {
                                                    setLang(l.code as Language);
                                                    setLangMenuOpen(false);
                                                    triggerHaptic();
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${lang === l.code ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300'}`}
                                            >
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-sm font-bold">{l.name}</span>
                                                    <span className="text-[10px] opacity-50 uppercase tracking-wider">{l.label}</span>
                                                </div>
                                                {lang === l.code && <CheckCircle2 size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <button className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md group">
                        <Bell size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#020617] flex items-center justify-center">
                            <span className="text-[7px] font-black text-white">5</span>
                        </div>
                    </button>

                    {/* Admin */}
                    <button
                        onClick={() => onNavigate('ADMIN')}
                        className="hidden sm:flex w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all items-center justify-center backdrop-blur-md group"
                        title="Analytics"
                    >
                        <Shield size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    </button>

                    {/* User Profile */}
                    <div onClick={() => onNavigate('PROFILE')} className="relative cursor-pointer group shrink-0 ml-1">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[1.5px] shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
                            <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                {user.picture ? (
                                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-black text-white">{user.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* GREETING SECTION */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 pt-5 pb-2 max-w-[1600px] mx-auto w-full">
                <DynamicGreeting user={user} lang={lang} />
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 1: AI Analysis | Farm Health | Today's Tasks       */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* AI Crop Analysis (5 cols) */}
                <div className="col-span-1 md:col-span-5 min-h-[260px] animate-[fadeInUp_0.5s_ease-out]">
                    <CropAnalysisCard lang={lang} />
                </div>

                {/* Farm Health Score (4 cols) */}
                <div className="col-span-1 md:col-span-4 min-h-[260px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                    <FarmHealthScore lang={lang} />
                </div>

                {/* Today's Tasks (3 cols) */}
                <div className="col-span-1 md:col-span-3 min-h-[260px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                    <TodaysTasks lang={lang} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 2: Weather | Market Prices | Soil Health | Crop    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Weather (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[280px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                    <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} onNavigate={onNavigate} />
                </div>

                {/* Market Prices Table (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[280px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                    <MarketPricesTable lang={lang} />
                </div>

                {/* Soil Health (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[280px] animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                    <SoilHealthWidget lang={lang} />
                </div>

                {/* Crop Journey (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[280px] animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
                    <CropJourneyWidget lang={lang} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* KEY IMPROVEMENTS SECTION                               */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 max-w-[1600px] mx-auto w-full mb-4 animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                <KeyImprovements lang={lang} />
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 3: Market Trend | AI Chat | Fields | Notifications */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Market Trend Chart (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[360px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                    <MarketTrendChart lang={lang} />
                </div>

                {/* AI Chat (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[360px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                    <AIChatWidget lang={lang} />
                </div>

                {/* Multiple Fields (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[360px] animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                    <MultiFieldsOverview lang={lang} />
                </div>

                {/* Notifications (3 cols) */}
                <div className="col-span-1 md:col-span-3 h-[360px] animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
                    <NotificationsWidget lang={lang} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SMART BANNER (AI-powered rotating insights)            */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 max-w-[1600px] mx-auto w-full mb-4 animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                <SmartBanner lang={lang} className="w-full !max-w-none !mx-0 shadow-2xl" weather={weather} user={user} />
            </div>

            {/* Voice Widget (Desktop Only) - Floating style */}
            <div className="hidden md:block px-4 md:px-6 max-w-[1600px] mx-auto w-full mb-4">
                <div className="h-20">
                    <VoiceWidget onNavigate={onNavigate} lang={lang} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* FOOTER BANNER                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mt-auto pb-20 lg:pb-0">
                <FooterBanner />
            </div>
        </div>
    );
};

export default Dashboard;