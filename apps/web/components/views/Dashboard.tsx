import React, { useState, useEffect } from 'react';
import { UserProfile, Language, ViewState } from '../../types';
import { TRANSLATIONS, LANGUAGES } from '../../constants';
import { 
  Languages, 
  ChevronDown, 
  CheckCircle2, 
  Bell, 
  Calendar, 
  Shield, 
  Sparkles, 
  Menu,
  Search,
  Wifi,
  MapPin,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sprout,
  Cloud,
  Zap,
  Globe
} from 'lucide-react';
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
import { AIChatAssistant } from '../dashboard/AIChatAssistant';
import { AIRecommendations } from '../dashboard/AIRecommendations';
import { VoiceAssistantWidget } from '../dashboard/VoiceAssistantWidget';
import { MultiFieldsOverview } from '../dashboard/MultiFieldsOverview';
import { NotificationsWidget } from '../dashboard/NotificationsWidget';
import { FooterBanner } from '../dashboard/FooterBanner';

import { useAppStore, selectSidebarCollapsed } from '../../store/useAppStore';
import { getAIRecommendations } from '../../services/geminiService';
import clsx from 'clsx';

const Dashboard = ({ lang, setLang, user, onNavigate }: { lang: Language, setLang: (l: Language) => void, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
    const t = TRANSLATIONS[lang];
    const txt = DASH_TEXT[lang];
    const [weather, setWeather] = useState<any>(MOCK_WEATHER);
    const collapsed = useAppStore(selectSidebarCollapsed);
    const { toggleSidebar, platformConfig } = useAppStore();
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [liveLocation, setLiveLocation] = useState<string>(user.village || "Locating...");

    const showWeather = !platformConfig || platformConfig.features?.weather !== false;
    const showVoice = !platformConfig || platformConfig.features?.voiceAssistant !== false;
    const showAi = !platformConfig || platformConfig.features?.aiAssistant !== false;
    const showDiagnosis = !platformConfig || platformConfig.features?.cropDiagnosis !== false;

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

    // Current date and live ticking clock
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Collapsible AI suggestions state
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recs, setRecs] = useState<any[]>([]);
    const [uplift, setUplift] = useState('+15%');
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [successMsgRecs, setSuccessMsgRecs] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const data = await getAIRecommendations({
                    crops: user.crop ? [user.crop] : ['कापूस', 'सोयाबीन'],
                    state: user.state || 'maharashtra',
                    district: user.district || 'Yavatmal'
                });
                if (data && data.recommendations?.length) {
                    setRecs(data.recommendations);
                    if (data.overallUplift) setUplift(data.overallUplift);
                }
            } catch (e) {
                console.debug('Dashboard recommendations fetch error:', e);
            } finally {
                setLoadingRecs(false);
            }
        };
        fetchRecs();
    }, [user]);

    // Handle Ctrl+K / Cmd+K focus on search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('dashboard-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleApplyAllRecs = () => {
        triggerHaptic('heavy');
        const labels = {
            mr: `तुमच्या शेतात शिफारसी लागू झाल्या आहेत. अपेक्षित नफा: ${uplift}`,
            hi: `सुझाव आपके खेत पर लागू हो गए हैं। अपेक्षित लाभ: ${uplift}`,
            en: `Advisory recommendations applied to your farm. Expected gain: ${uplift}`
        };
        setSuccessMsgRecs(labels[lang === 'mr' || lang === 'hi' ? lang : 'en']);
        setTimeout(() => setSuccessMsgRecs(null), 4000);
    };

    const dTxt = {
        mr: {
            live: "लाइव्ह",
            online: "ऑनलाइन • कृषी सत्र सक्रिय",
            greeting: "नमस्ते शेतकरी मित्र,",
            subtitle: "तुमचे शेत फुलांनी आणि फळांनी बहरत आहे",
            aiAdvisory: "AI शिफारस (कृषी)",
            aiAdvisoryDesc: "३ सर्वोत्तम शिफारसी तयार आहेत — आता लागू करा",
            yieldUplift: "+१५% पीक उत्पादन",
            btnViewStatus: "शेताची स्थिती पहा →",
            cropHealth: "पीक आरोग्य",
            weeklyTrend: "↗ या आठवड्यात +१५%",
            lastUpdate: "अंतिम अपडेट: आत्ताच",
            searchPlaceholder: "शोधा... पीक, हवामान, बाजारभाव",
            statsQueries: "AI क्वेरीझ",
            statsCrops: "पीक ट्रॅक",
            statsWeather: "हवामान",
            statsSystem: "सिस्टम",
            statsQueriesDesc: "आज",
            statsCropsDesc: "सक्रिय",
            statsWeatherDesc: "ढगाळ",
            statsSystemDesc: "अपटाइम",
            intelHub: "AI इंटेलिजन्स हब",
            intelHubDesc: "६ AI-संचालित वैशिष्ट्ये • न्यूरल नेटवर्क • रिअल-टाइम",
            viewAllLink: "पूर्ण दृश्य पहा ↗",
            premiumFarmer: "प्रीमियम शेतकरी",
            viewLess: "माहिती बंद करा ↑"
        },
        hi: {
            live: "लाइव",
            online: "ऑनलाइन • कृषि सत्र सक्रिय",
            greeting: "नमस्ते किसानजी,",
            subtitle: "आपका खेत फल-फूल रहा है",
            aiAdvisory: "AI सुझाव (कृषि)",
            aiAdvisoryDesc: "परिणाम 3 बेहतरीन सुझाव तैयार हैं — अभी लागू करें",
            yieldUplift: "+15% फसल उत्पादन",
            btnViewStatus: "खेत की स्थिति देखें →",
            cropHealth: "फसल स्वास्थ्य",
            weeklyTrend: "↗ +15% इस सप्ताह",
            lastUpdate: "अंतिम अपडेट: अभी",
            searchPlaceholder: "खोजें... फसल, मौसम, बाजार भाव",
            statsQueries: "AI क्वेरीज़",
            statsCrops: "फसलें ट्रैक",
            statsWeather: "मौसम",
            statsSystem: "सिस्टम",
            statsQueriesDesc: "आज",
            statsCropsDesc: "सक्रिय",
            statsWeatherDesc: "बादल",
            statsSystemDesc: "अपटाइम",
            intelHub: "AI INTELLIGENCE HUB",
            intelHubDesc: "6 AI-संचालित सुविधाएं • न्यूरल नेटवर्क • रियल-टाइम",
            viewAllLink: "पूरा दृश्य देखें ↗",
            premiumFarmer: "प्रीमियम किसान",
            viewLess: "सुझाव बंद करें ↑"
        },
        en: {
            live: "Live",
            online: "Online • Agri-Session Active",
            greeting: "Hello Farmer,",
            subtitle: "Your farm is flourishing beautifully",
            aiAdvisory: "AI Suggestions (Agri)",
            aiAdvisoryDesc: "3 optimal recommendations ready — apply now",
            yieldUplift: "+15% Yield Potential",
            btnViewStatus: "View Farm Status →",
            cropHealth: "Crop Health",
            weeklyTrend: "↗ +15% this week",
            lastUpdate: "Last update: Just now",
            searchPlaceholder: "Search... crop, weather, market prices",
            statsQueries: "AI Queries",
            statsCrops: "Crops Tracked",
            statsWeather: "Weather",
            statsSystem: "System Status",
            statsQueriesDesc: "Today",
            statsCropsDesc: "Active",
            statsWeatherDesc: "Cloudy",
            statsSystemDesc: "Uptime",
            intelHub: "AI INTELLIGENCE HUB",
            intelHubDesc: "6 AI-driven features • Neural Network • Real-time",
            viewAllLink: "View Full Screen ↗",
            premiumFarmer: "Premium Farmer",
            viewLess: "Collapse Suggestions ↑"
        }
    }[lang === 'mr' || lang === 'hi' ? lang : 'en'] || {
        live: "Live",
        online: "Online • Session Active",
        greeting: "Hello,",
        subtitle: "Your farm is flourishing",
        aiAdvisory: "AI Suggestions",
        aiAdvisoryDesc: "Recommendations ready",
        yieldUplift: "+15%",
        btnViewStatus: "View Farm Status →",
        cropHealth: "Crop Health",
        weeklyTrend: "+15% this week",
        lastUpdate: "Just now",
        searchPlaceholder: "Search...",
        statsQueries: "AI Queries",
        statsCrops: "Crops",
        statsWeather: "Weather",
        statsSystem: "System",
        statsQueriesDesc: "Today",
        statsCropsDesc: "Active",
        statsWeatherDesc: "Cloudy",
        statsSystemDesc: "Uptime",
        intelHub: "AI INTELLIGENCE HUB",
        intelHubDesc: "6 AI features • Real-time",
        viewAllLink: "View all ↗",
        premiumFarmer: "Premium Farmer",
        viewLess: "Collapse ↑"
    };

    const dateStr = currentTime.toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const timeStr = currentTime.toLocaleTimeString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className={clsx("h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar bg-transparent text-slate-100 selection:bg-emerald-500/30 flex flex-col relative transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}>
            
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
                @keyframes pulseGreen {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(1.2); }
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
            <div className="px-4 md:px-6 py-2.5 flex items-center justify-between z-50 gap-4 sticky top-0 bg-[#070a07]/95 backdrop-blur-xl border-b border-emerald-500/10 transition-all">
                {/* Left: Brand Logo & Menu Trigger */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleSidebar()}
                        className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
                        title="Open Menu"
                    >
                        <Menu size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-400 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                            <Sparkles size={16} className="text-black" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black text-white leading-none">AI कृषि एजेंट</h2>
                            <span className="text-[9px] font-bold text-emerald-400 mt-0.5 tracking-wider uppercase">ज़्यादा फसल, न्यूनतम खर्च</span>
                        </div>
                    </div>
                </div>

                {/* Center: Interactive Search Box */}
                <div className="hidden md:flex items-center relative w-full max-w-xs xl:max-w-md">
                    <Search size={14} className="absolute left-3 text-slate-400" />
                    <input
                        id="dashboard-search"
                        type="text"
                        placeholder={dTxt.searchPlaceholder}
                        className="w-full h-8 pl-9 pr-12 text-xs rounded-full bg-[#0a140a]/60 border border-emerald-500/10 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-semibold"
                    />
                    <kbd className="absolute right-3 top-2.5 h-3.5 select-none pointer-events-none items-center gap-1 rounded bg-white/5 px-1.5 font-mono text-[9px] font-bold text-slate-400 flex border border-white/5">
                        <span className="text-[8px]">Ctrl</span>K
                    </kbd>
                </div>

                {/* Right: Date-Time, Status, Language, Profile */}
                <div className="flex items-center gap-3">
                    {/* Live indicator badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block animate-ping" style={{ animation: 'pulseGreen 2s infinite' }}></span>
                        <span>{dTxt.live}</span>
                    </div>

                    {/* Live ticking clock */}
                    <div className="hidden xl:flex flex-col items-end text-right font-semibold">
                        <span className="text-[10px] text-white leading-tight">{dateStr}</span>
                        <span className="text-[9px] text-slate-400">{timeStr}</span>
                    </div>

                    {/* Language dropdown picker */}
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className={`h-8 px-2.5 rounded-full transition-all flex items-center gap-1.5 backdrop-blur-md border text-[10px] font-bold uppercase tracking-wider ${langMenuOpen ? 'bg-gradient-to-r from-emerald-500 to-lime-400 border-emerald-500 text-slate-900' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                        >
                            <Globe size={13} className={langMenuOpen ? 'text-slate-900' : 'text-emerald-400'} />
                            <span>
                                {LANGUAGES.find(l => l.code === lang)?.name}
                            </span>
                            <ChevronDown size={10} className={`transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {langMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-[#0a140a]/95 border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden z-[120] p-2"
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
                                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${lang === l.code ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300'}`}
                                            >
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-xs font-bold">{l.name}</span>
                                                    <span className="text-[9px] opacity-50 uppercase tracking-wider">{l.label}</span>
                                                </div>
                                                {lang === l.code && <CheckCircle2 size={13} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notification bell */}
                    <button className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center backdrop-blur-md group">
                        <Bell size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#070a07] flex items-center justify-center">
                        </div>
                    </button>

                    {/* Admin Dashboard Shield */}
                    <button
                        onClick={() => onNavigate('ADMIN')}
                        className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all items-center justify-center backdrop-blur-md group"
                        title="Admin Config Panel"
                    >
                        <Shield size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    </button>

                    {/* User profile block */}
                    <div onClick={() => onNavigate('SETTINGS')} className="flex items-center gap-2 cursor-pointer group shrink-0 ml-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 p-[1px] shadow-[0_0_12px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all">
                            <div className="w-full h-full rounded-full bg-[#051108] flex items-center justify-center overflow-hidden">
                                {user.picture ? (
                                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-black text-white">{user.name?.charAt(0) || 'G'}</span>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-[11px] font-black text-white leading-none group-hover:text-emerald-400 transition-colors">{user.name || "Gayatri"}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{dTxt.premiumFarmer}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HERO SECTION CONTAINER */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 pt-5 pb-2 max-w-[1600px] mx-auto w-full animate-[fadeInUp_0.5s_ease-out]">
                <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0a1a0f]/90 via-[#070a07]/95 to-[#0b1d0e]/90 border border-emerald-500/20 p-5 md:p-8 flex flex-col md:flex-row justify-between gap-6 shadow-[0_20px_50px_rgba(2,6,23,0.6)]">
                    {/* Glow background decorations */}
                    <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-lime-500/5 rounded-full blur-[80px] pointer-events-none" />

                    {/* Left half: Greetings and AI suggestions */}
                    <div className="flex-1 flex flex-col justify-between relative z-10">
                        <div>
                            {/* Tags at top */}
                            <div className="flex flex-wrap gap-2 mb-3.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                                    <Wifi size={10} className="animate-pulse" />
                                    {dTxt.online}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0a140a]/60 border border-emerald-500/10 text-[10px] font-bold text-slate-300">
                                    <MapPin size={10} className="text-lime-400" />
                                    {user.district || 'Yavatmal'}, {user.state || 'Maharashtra'}
                                </span>
                            </div>

                            {/* Heading greet */}
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-2">
                                {dTxt.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">{user.name || "Gayatri"}</span> ✨
                            </h1>
                            <p className="text-sm text-slate-400 font-semibold mb-6">{dTxt.subtitle}</p>
                        </div>

                        {/* Integrated AI Suggestion Widget Card */}
                        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-[#070a07]/40 border border-emerald-500/30 shadow-lg flex items-center justify-between gap-4 max-w-2xl group hover:border-lime-500/40 transition-all duration-300">
                            {/* Inner contents */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
                                    <Sparkles size={18} className="animate-pulse" />
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-emerald-400 tracking-wider uppercase mb-0.5">{dTxt.aiAdvisory}</div>
                                    <p className="text-xs font-bold text-white leading-snug">{dTxt.aiAdvisoryDesc}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Yield Badge */}
                                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/20 text-[10.5px] font-bold text-emerald-300 whitespace-nowrap">
                                    {dTxt.yieldUplift}
                                </span>
                                {/* Toggle action button */}
                                <button
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        setShowRecommendations(!showRecommendations);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-black text-xs font-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                                >
                                    <span>{showRecommendations ? dTxt.viewLess : dTxt.btnViewStatus}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right half: dynamic circular gauge progress score */}
                    <div className="flex items-center justify-center flex-col shrink-0 relative z-10 bg-[#070a07]/50 border border-emerald-500/10 rounded-3xl p-5 md:p-6 min-w-[200px]">
                        {/* Circular ring wrapper */}
                        <div className="relative flex items-center justify-center w-36 h-36">
                            <svg className="w-full h-full transform -rotate-90">
                                <defs>
                                    <linearGradient id="crop-health-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#a3e635" />
                                    </linearGradient>
                                </defs>
                                <circle cx="72" cy="72" r="50" className="stroke-slate-800/60 fill-transparent" strokeWidth="8" />
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="50"
                                    className="fill-transparent transition-all duration-1000"
                                    stroke="url(#crop-health-grad)"
                                    strokeWidth="8"
                                    strokeDasharray="314.16"
                                    strokeDashoffset={314.16 * (1 - 0.94)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Gauge Label inside circle */}
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white leading-none tracking-tight">94%</span>
                                <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-1.5">{dTxt.cropHealth}</span>
                            </div>
                        </div>

                        {/* Under ring labels */}
                        <span className="text-xs font-bold text-emerald-400 mt-4 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {dTxt.weeklyTrend}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{dTxt.lastUpdate}</span>
                    </div>
                </div>

                {/* Collapsible Recommendations List (Slides down from the Hero card) */}
                <AnimatePresence>
                    {showRecommendations && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-2"
                        >
                            <div className="rounded-[2rem] border border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl p-5 md:p-6 space-y-4">
                                {successMsgRecs && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
                                        {successMsgRecs}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {(loadingRecs ? [
                                        { title: "सेंद्रिय खतांचा वापर", description: "माती सुपीक बनवण्यासाठी व्हर्मिकंपोस्ट खत वापरा.", benefit: "+12%", icon: "🌿" },
                                        { title: "ठिबक सिंचन पद्धत", description: "पाण्याची बचत करण्यासाठी आणि ओलावा राखण्यासाठी वापर करा.", benefit: "+18%", icon: "💧" },
                                        { title: "एकात्मिक कीड नियंत्रण", description: "नीम तेल आणि फेरोमोन ट्रॅपचा वापर करा.", benefit: "+10%", icon: "🐞" }
                                    ] : recs).map((rec, i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all duration-300 text-left"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl">{rec.icon}</span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                                                    {rec.benefit}
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-black text-white mb-1">{rec.title}</h4>
                                            <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleApplyAllRecs}
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 text-xs font-black hover:bg-emerald-400 transition-all"
                                >
                                    <span>{lang === 'mr' ? 'सर्व शिफारसी लागू करा' : lang === 'hi' ? 'सभी सुझाव लागू करें' : 'Apply All Suggestions'}</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* FOUR STATS CARDS ROW */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Stats Card 1: Queries */}
                <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center gap-3 hover:border-emerald-500/30 hover:bg-slate-900/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <MessageSquare size={18} />
                    </div>
                    <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dTxt.statsQueries}</span>
                        <h4 className="text-lg font-black text-white leading-none mt-0.5">1,247</h4>
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">{dTxt.statsQueriesDesc}</span>
                    </div>
                </div>

                {/* Stats Card 2: Crops Tracked */}
                <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center gap-3 hover:border-emerald-500/30 hover:bg-slate-900/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Sprout size={18} />
                    </div>
                    <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dTxt.statsCrops}</span>
                        <h4 className="text-lg font-black text-white leading-none mt-0.5">{user.crops?.length || (user.crop ? 1 : 0) || 3}</h4>
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">{dTxt.statsCropsDesc}</span>
                    </div>
                </div>

                {/* Stats Card 3: Weather */}
                <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center gap-3 hover:border-emerald-500/30 hover:bg-slate-900/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Cloud size={18} />
                    </div>
                    <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dTxt.statsWeather}</span>
                        <h4 className="text-lg font-black text-white leading-none mt-0.5">{weather?.main?.temp ? `${Math.round(weather.main.temp - 273.15)}°C` : '28°C'}</h4>
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">{dTxt.statsWeatherDesc}</span>
                    </div>
                </div>

                {/* Stats Card 4: System Status */}
                <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-slate-900/30 flex items-center gap-3 hover:border-emerald-500/30 hover:bg-slate-900/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Zap size={18} />
                    </div>
                    <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dTxt.statsSystem}</span>
                        <h4 className="text-lg font-black text-white leading-none mt-0.5">99.9%</h4>
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">{dTxt.statsSystemDesc}</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* AI INTELLIGENCE HUB BANNER */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 max-w-[1600px] mx-auto w-full mb-4">
                <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/25 via-[#020617]/50 to-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                            {dTxt.intelHub}
                        </span>
                        <p className="text-[11px] text-slate-300 font-semibold text-center sm:text-left">{dTxt.intelHubDesc}</p>
                    </div>
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            onNavigate('ADMIN');
                        }}
                        className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                        {dTxt.viewAllLink}
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 1: AI Analysis | Farm Health | Today's Tasks       */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* AI Crop Analysis (5 cols) */}
                {showDiagnosis && (
                  <div className="col-span-1 md:col-span-5 min-h-[260px] animate-[fadeInUp_0.5s_ease-out]">
                      <CropAnalysisCard lang={lang} onClick={() => onNavigate('FARM_DETAIL_PAGE')} />
                  </div>
                )}

                {/* Farm Health Score (4 cols) */}
                <div className="col-span-1 md:col-span-4 min-h-[260px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                    <FarmHealthScore lang={lang} onClick={() => onNavigate('FARM_DETAIL_PAGE')} />
                </div>

                {/* Today's Tasks (3 cols) */}
                <div className="col-span-1 md:col-span-3 min-h-[260px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                    <TodaysTasks lang={lang} onClick={() => onNavigate('FARM_DETAIL_PAGE')} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 2: Weather | Market Prices | Soil Health | Crop    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Weather (3 cols) */}
                {showWeather && (
                  <div className="col-span-1 md:col-span-3 h-[280px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                      <WeatherWidget weather={weather} loading={loadingWeather} location={liveLocation} lang={lang} onNavigate={onNavigate} />
                  </div>
                )}

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
            {/* ROW 3: Market Trend | AI Chat Assistant | Voice Assistant */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Market Trend Chart (4 cols) */}
                <div className="col-span-1 md:col-span-4 min-h-[380px] animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
                    <MarketTrendChart lang={lang} />
                </div>

                {/* AI Chat (4 cols) */}
                {showAi && (
                  <div className="col-span-1 md:col-span-4 min-h-[380px] animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
                      <AIChatAssistant lang={lang} user={user} />
                  </div>
                )}

                {/* Voice Assistant (4 cols) */}
                {showVoice && (
                  <div className="col-span-1 md:col-span-4 min-h-[380px] animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                      <VoiceAssistantWidget lang={lang} user={user} />
                  </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ROW 4: Multiple Fields Overview | Notifications Panel */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full mb-4">
                {/* Multiple Fields (6 cols) */}
                <div className="col-span-1 md:col-span-6 min-h-[360px] animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
                    <MultiFieldsOverview lang={lang} />
                </div>

                {/* Notifications (6 cols) */}
                <div className="col-span-1 md:col-span-6 min-h-[360px] animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
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
            {showVoice && (
              <div className="hidden md:block px-4 md:px-6 max-w-[1600px] mx-auto w-full mb-4">
                  <div className="h-20">
                      <VoiceWidget onNavigate={onNavigate} lang={lang} />
                  </div>
              </div>
            )}

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