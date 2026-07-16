import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, Leaf, CloudSun, LineChart, FlaskConical, Star, ArrowRight, Sparkles,
  Droplets, Upload, Brain, FileText, TrendingUp, ChevronRight, Check, Tractor,
  Users, ShieldCheck, Quote, Smartphone, QrCode, Apple, Play, Phone, Mail,
  MapPin, Headphones, X, Send, Loader2, ChevronDown, ListChecks, Mic, LayoutGrid, Bell,
  Map as MapIcon, Heart, Clock as ClockIcon, Crosshair, Navigation, Zap, Globe, WifiOff
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { LANGUAGES, TRANSLATIONS } from '../../constants';
import { Language, UserProfile } from '../../types';
import { db } from '../../utils/firebase';
import { collection, doc, setDoc, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getAIFarmingAdvice } from '../../services/geminiService';

// If your project doesn't have this image, put the provided file at public/landing/hero-farm.jpg
// Fallback uses generated image: /mnt/data/maharashtra_golden_hour_farm_panorama.webp -> copy to public/landing/field-bg.png
const HERO_FARM_IMAGE = '/landing/hero-farmer.png'; // your existing farmer image
const FIELD_BG_IMAGE = '/landing/field-bg.png'; // copy generated farmland panorama here
const FALLBACK_FARM_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  user?: UserProfile | null;
}

// ============================================================
// DATA - Compatible with your existing getLandingData
// ============================================================
const getLandingData = (lang: Language) => {
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';

  const marketTicker = [
    { name: isMr ? 'सोयाबीन' : (isHi ? 'सोयाबीन' : 'Soybean'), price: 6840, change: '+4.2%' },
    { name: isMr ? 'कापूस' : (isHi ? 'कपास' : 'Cotton'), price: 7250, change: '+2.1%' },
    { name: isMr ? 'गहू' : (isHi ? 'गेहूं' : 'Wheat'), price: 2450, change: '+0.9%' },
    { name: isMr ? 'टोमॅटो' : (isHi ? 'टमाटर' : 'Tomato'), price: 1890, change: '+6.3%' },
    { name: isMr ? 'हरभरा' : (isHi ? 'चना' : 'Gram'), price: 5420, change: '+3.7%' },
    { name: isMr ? 'तांदूळ' : (isHi ? 'धान' : 'Rice'), price: 2890, change: '+0.4%' },
  ];

  const heroStats = [
    { value: '50K+', label: isMr ? 'आनंदी शेतकरी' : (isHi ? 'संतुष्ट किसान' : 'Happy Farmers') },
    { value: '1M+', label: isMr ? 'एआय सल्ला' : (isHi ? 'AI परामर्श' : 'AI Consultations') },
    { value: '98%', label: isMr ? 'अचूकता दर' : (isHi ? 'सटीकता दर' : 'Accuracy Rate') },
    { value: '200+', label: isMr ? 'पिके समाविष्ट' : (isHi ? 'फसलें समाविष्ट' : 'Crops Covered') },
  ];

  const heroFeatures = [
    { icon: Leaf, label: isMr ? 'एआय पीक डॉक्टर' : (isHi ? 'AI फसल डॉक्टर' : 'AI Crop Doctor'), color: '#22c55e' },
    { icon: CloudSun, label: isMr ? 'हवामान अंदाज' : (isHi ? 'मौसम अपडेट' : 'Real-time Weather'), color: '#0ea5e9' },
    { icon: LineChart, label: isMr ? 'बाजार भाव विश्लेषण' : (isHi ? 'बाजार खुफिया' : 'Market Intelligence'), color: '#f59e0b' },
    { icon: FlaskConical, label: isMr ? 'माती आरोग्य तपासणी' : (isHi ? 'मिट्टी जांच' : 'Soil Health Check'), color: '#a855f7' },
  ];

  const howSteps = [
    { step: 1, icon: Upload, title: isMr ? 'अपलोड / वर्णन करा' : (isHi ? 'अपलोड / विवरण दें' : 'Upload / Describe'), desc: isMr ? 'पिकाचा फोटो अपलोड करा किंवा समस्या सांगा' : (isHi ? 'फसल की फोटो अपलोड करें या समस्या बताएं' : 'Upload crop photo or describe your problem'), color: '#22c55e' },
    { step: 2, icon: Brain, title: isMr ? 'एआय विश्लेषण' : (isHi ? 'AI विश्लेषण' : 'AI Analysis'), desc: isMr ? 'आमचे एआय लगेच विश्लेषण करून आजार ओळखते' : (isHi ? 'हमारा AI तुरंत विश्लेषण कर समस्या पहचानता है' : 'Our AI analyzes and detects issues instantly'), color: '#0ea5e9' },
    { step: 3, icon: FileText, title: isMr ? 'मार्गदर्शन मिळवा' : (isHi ? 'सुझाव पाएं' : 'Get Recommendations'), desc: isMr ? 'सर्वोत्तम उपाय, डोस आणि सल्ला मिळवा' : (isHi ? 'सर्वोत्तम समाधान, खुराक और सलाह पाएं' : 'Get best solutions, dosage and expert advice'), color: '#f59e0b' },
    { step: 4, icon: TrendingUp, title: isMr ? 'उत्पादन वाढवा' : (isHi ? 'उपज बढ़ाएं' : 'Increase Yield'), desc: isMr ? 'सल्ल्याचे पालन करा आणि नफा वाढवा' : (isHi ? 'सलाह मानें और अपना मुनाफा बढ़ाएं' : 'Follow advice and increase your profit'), color: '#a855f7' },
  ];

  const featureCards = [
    { id: 1, title: isMr ? 'फसल आरोग्य स्कोर' : (isHi ? 'फसल स्वास्थ्य स्कोर' : 'Crop Health Score'), desc: isMr ? 'तुमच्या पिकाची आरोग्य स्थिती जाणून घ्या' : (isHi ? 'अपनी फसल की स्वास्थ्य स्थिति जानें' : 'Know your crop health status'), icon: Leaf, color: '#22c55e', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 2, title: isMr ? 'आजचे काम' : (isHi ? 'आज के कार्य' : "Today's Tasks"), desc: isMr ? 'आजच्या शेती कामांची यादी' : (isHi ? 'आज के लिए निर्धारित कार्यों की सूची' : 'List of tasks scheduled for today'), icon: ListChecks, color: '#16a34a', bg: 'from-green-500/20 to-green-500/5' },
    { id: 3, title: isMr ? 'एआय शिफारस' : (isHi ? 'AI सुझाव' : 'AI Recommendation'), desc: isMr ? 'उत्पादन वाढवण्यासाठी एआय सल्ला' : (isHi ? 'उत्पादन बढ़ाने के लिए AI सुझाव' : 'AI tips to maximize output'), icon: Sparkles, color: '#fbbf24', bg: 'from-amber-500/20 to-amber-500/5' },
    { id: 4, title: isMr ? 'लाइव्ह बाजार भाव' : (isHi ? 'लाइव मार्केट ट्रेंड' : 'Live Market Trend'), desc: isMr ? 'बाजारातील किमतींचे थेट अपडेट्स' : (isHi ? 'बाजार में हो रहे बदलावों की जानकारी' : 'Real-time market prices'), icon: LineChart, color: '#f87171', bg: 'from-rose-500/20 to-rose-500/5' },
    { id: 5, title: isMr ? 'हवामान अंदाज' : (isHi ? 'मौसम पूर्वानुमान' : 'Weather Forecast'), desc: isMr ? 'येणाऱ्या हवामानाची अचूक माहिती' : (isHi ? 'आगामी मौसम की जानकारी' : 'Accurate weather warnings'), icon: CloudSun, color: '#38bdf8', bg: 'from-sky-500/20 to-sky-500/5' },
    { id: 6, title: isMr ? 'व्हॉइस & चॅट एआय' : (isHi ? 'वॉइस & चैट AI' : 'Voice & Chat AI'), desc: isMr ? 'शेतीबद्दल प्रश्न विचारा, उत्तरे मिळवा' : (isHi ? 'खेती से संबंधित प्रश्न पूछें' : 'Ask farming questions'), icon: Mic, color: '#22c55e', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 7, title: isMr ? 'अनेक शेते व्यवस्थापन' : (isHi ? 'एकाधिक खेत' : 'Multiple Fields'), desc: isMr ? 'तुमच्या सर्व शेतांची माहिती एकाच जागी' : (isHi ? 'सभी खेतों की जानकारी एक स्थान पर' : 'Manage multiple fields'), icon: LayoutGrid, color: '#22c55e', bg: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 8, title: isMr ? 'अँप नोटिफिकेशन्स' : (isHi ? 'सूचनाएं' : 'Notifications'), desc: isMr ? 'शेतीशी संबंधित महत्त्वाचे अलर्ट्स' : (isHi ? 'खेती से संबंधित अपडेट्स' : 'Important alerts'), icon: Bell, color: '#ef4444', bg: 'from-red-500/20 to-red-500/5' },
  ];

  const solutions = [
    { title: isMr ? 'अल्पभूधारक शेतकरी' : (isHi ? 'लघु किसान' : 'Small & Marginal'), desc: isMr ? 'उत्पादन आणि उत्पन्न वाढीसाठी एआय मार्गदर्शन' : (isHi ? 'बेहतर फसल और आय के लिए AI' : 'Affordable AI for better income'), image: '/landing/farmer-small.png', color: '#22c55e', features: isMr ? ['सोप्या शिफारसी', 'कमी खर्चिक', 'मराठी समर्थन'] : (isHi ? ['सरल सुझाव', 'कम लागत', 'भाषा समर्थन'] : ['Simple tips', 'Low cost', 'Local language']) },
    { title: isMr ? 'प्रगतिशील शेतकरी' : (isHi ? 'प्रगतिशील किसान' : 'Progressive Farmers'), desc: isMr ? 'जास्त उत्पादनासाठी डेटा-आधारित सल्ला' : (isHi ? 'अधिकतम उपज के लिए डेटा अंतर्दृष्टि' : 'Data-driven insights for max yield'), image: '/landing/farmer-progressive.png', color: '#0ea5e9', features: isMr ? ['प्रगत विश्लेषण', 'हवामान अंतर्दृष्टि', 'नफा अनुकूलन'] : (isHi ? ['उन्नत विश्लेषण', 'मौसम अंतर्दृष्टि', 'मुनाफा'] : ['Advanced analytics', 'Weather insights', 'Profit opt']) },
    { title: isMr ? 'कृषी व्यवसाय' : (isHi ? 'कृषि व्यवसाय' : 'Agribusiness'), desc: isMr ? 'अनेक शेतांचे व्यवस्थापन आणि सल्ला' : (isHi ? 'कई खेतों का प्रबंधन' : 'Manage farms & advisory'), image: '/landing/farmer-advisor.png', color: '#a855f7', features: isMr ? ['रिअल-टाइम नियंत्रण', 'रिपोर्ट्स', 'सल्ला साधने'] : (isHi ? ['निगरानी', 'रिपोर्ट', 'उपकरण'] : ['Monitoring', 'Reports', 'Tools']) },
  ];

  const whyChoose = [
    { icon: Sprout, title: isMr ? 'अधिक उत्पादन' : (isHi ? 'अधिक उपज' : 'Higher Yield'), desc: isMr ? 'एआय शिफारसी २०% वाढवतात' : (isHi ? 'AI से 20% वृद्धि' : 'AI increases yield up to 20%'), color: '#22c55e' },
    { icon: ShieldCheck, title: isMr ? 'खर्च बचत' : (isHi ? 'लागत बचत' : 'Cost Saving'), desc: isMr ? 'अचूक सल्ल्याने खर्च कमी' : (isHi ? 'सटीक सलाह से बचत' : 'Reduce costs with precise advice'), color: '#f97316' },
    { icon: ClockIcon, title: isMr ? 'वेळ बचत' : (isHi ? 'समय बचत' : 'Time Saving'), desc: isMr ? 'तात्काळ उपाय मिळवा' : (isHi ? 'तुरंत समाधान' : 'Instant solutions'), color: '#eab308' },
    { icon: Headphones, title: isMr ? 'तज्ज्ञ मदत' : (isHi ? 'विशेषज्ञ सहायता' : 'Expert Support'), desc: isMr ? '२४/७ एआय सहाय्यक' : (isHi ? '24/7 AI सहायक' : '24/7 AI & expert'), color: '#a855f7' },
    { icon: Users, title: isMr ? 'विश्वास' : (isHi ? 'भरोसा' : 'Trusted'), desc: isMr ? '५०,०००+ शेतकरी' : (isHi ? '50K+ किसान' : '50K+ farmers trust'), color: '#22c55e' },
    { icon: ShieldCheck, title: isMr ? 'सुरक्षित' : (isHi ? 'सुरक्षित' : 'Secure'), desc: isMr ? 'डेटा सुरक्षित' : (isHi ? 'डेटा सुरक्षित' : 'Data safe & private'), color: '#0ea5e9' },
  ];

  const testimonials = [
    { quote: isMr ? 'एआय कृषी मित्राने सोयाबीन रोगावर वेळेत उपाय सुचवला, उत्पादन १८% वाढले!' : (isHi ? 'AI Krushi Mitra ने सोयाबीन पर बीमारी का सुझाव दिया, उपज 18% बढ़ी!' : 'AI Krushi Mitra gave timely soybean advice, yield +18%!'), name: 'Ramesh Patil', location: 'Nashik, Maharashtra', rating: 5, initial: 'R', color: '#22c55e' },
    { quote: isMr ? 'बाजार, हवामान, सल्ला एकाच ॲपमध्ये. खूप उपयुक्त!' : (isHi ? 'बाजार, मौसम, AI सलाह एक ऐप में। उपयोगी!' : 'Market, weather, AI advice in one app. Useful!'), name: 'Sunita Devi', location: 'Solapur, Maharashtra', rating: 5, initial: 'S', color: '#0ea5e9' },
    { quote: isMr ? 'रोग ओळख लवकर होते, योग्य उपाय मिळतो. छान ॲप!' : (isHi ? 'बीमारी जल्दी पहचान, सही उपाय। बढ़िया ऐप!' : 'Disease detected quickly, right solution. Great!'), name: 'Amit Sharma', location: 'Jaipur, Rajasthan', rating: 5, initial: 'A', color: '#a855f7' },
  ];

  const labels = {
    en: { heroBadge: "AI Powered Agriculture Platform", heroTitle: "Smart Farming Starts with AI", heroDesc: "Get AI-powered crop advisory, weather updates, market insights and expert guidance in your language.", tryAI: "AI Dashboard", exploreFeatures: "Explore Features", howBadge: "Simple Process", howTitle: "How AI Krushi Mitra Works", featuresBadge: "Powerful Tools", featuresTitle: "Everything You Need to Farm Smarter", solutionsBadge: "For Everyone", solutionsTitle: "Solutions for Every Farmer", benefitsBadge: "Benefits", benefitsTitle: "Why Choose AI Krushi Mitra?", testimonialsBadge: "Testimonials", testimonialsTitle: "What Farmers Say", mobileBadge: "Mobile App", mobileTitle: "Take AI Power In Your Pocket", mobileDesc: "Download the app and make farming smarter today!", scanToDownload: "Scan to download", contactTitle: "Contact Us", quickLinks: "Quick Links", resources: "Resources", company: "Company", loveText: "Made with ❤ for Farmers of India", liveMandi: "LIVE MANDI", viewWeb: "Or use web app now" },
    mr: { heroBadge: "एआय समर्थित कृषी प्लॅटफॉर्म", heroTitle: "स्मार्ट शेतीची सुरुवात एआयने", heroDesc: "तुमच्या भाषेत एआय पीक सल्ला, हवामान, बाजार भाव मिळवा.", tryAI: "एआय डॅशबोर्ड", exploreFeatures: "वैशिष्ट्ये पहा", howBadge: "सोपी प्रक्रिया", howTitle: "एआय कृषी मित्र कसे कार्य करते", featuresBadge: "शक्तिशाली साधने", featuresTitle: "स्मार्ट शेतीसाठी सर्वकाही", solutionsBadge: "सर्वांसाठी", solutionsTitle: "प्रत्येक शेतकऱ्यासाठी उपाय", benefitsBadge: "फायदे", benefitsTitle: "का निवडावे?", testimonialsBadge: "प्रतिक्रिया", testimonialsTitle: "शेतकरी काय म्हणतात", mobileBadge: "मोबाईल ॲप", mobileTitle: "एआय शक्ती खिशात", mobileDesc: "ॲप डाउनलोड करा!", scanToDownload: "स्कॅन करा", contactTitle: "संपर्क", quickLinks: "द्रुत लिंक्स", resources: "संसाधने", company: "कंपनी", loveText: "भारतातील शेतकऱ्यांसाठी ❤ ने", liveMandi: "थेट मंडी", viewWeb: "वेब ॲप उघडा" },
    hi: { heroBadge: "AI संचालित कृषि प्लेटफॉर्म", heroTitle: "स्मार्ट खेती की शुरुआत AI से", heroDesc: "अपनी भाषा में AI फसल सलाह, मौसम, बाजार पाएं।", tryAI: "एआय डैशबोर्ड", exploreFeatures: "विशेषताएं देखें", howBadge: "सरल प्रक्रिया", howTitle: "AI कैसे काम करता है", featuresBadge: "शक्तिशाली उपकरण", featuresTitle: "स्मार्ट खेती के लिए सब कुछ", solutionsBadge: "सभी के लिए", solutionsTitle: "हर किसान के लिए समाधान", benefitsBadge: "लाभ", benefitsTitle: "क्यों चुनें?", testimonialsBadge: "प्रशंसा", testimonialsTitle: "किसान क्या कहते हैं", mobileBadge: "mobile app", mobileTitle: "AI शक्ति जेब में", mobileDesc: "ऐप डाउनलोड करें!", scanToDownload: "स्कैन करें", contactTitle: "संपर्क", quickLinks: "लिंक", resources: "संसाधन", company: "कंपनी", loveText: "किसानों के लिए ❤ से", liveMandi: "लाइव मंडी", viewWeb: "वेब ऐप चलाएं" }
  } as any;

  return { marketTicker, heroStats, heroFeatures, howSteps, featureCards, solutions, whyChoose, testimonials, labels: labels[lang] || labels.en };
};

const gridPattern: React.CSSProperties = {
  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

export default function LandingPage({ onGetStarted, lang, setLang, user }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [liveLoc, setLiveLoc] = useState({ lat: 18.5204, lng: 73.8567, acc: 28 });
  const [locStatus, setLocStatus] = useState<'idle' | 'fetching' | 'active'>('active');
  const [satLayer, setSatLayer] = useState('True Color');
  const liveMapRef = useRef<any>(null);
  const satMapRef = useRef<any>(null);
  const data = getLandingData(lang);
  const l = data.labels;
  const isMr = lang === 'mr'; const isHi = lang === 'hi';

  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (index: number) => {
    const angle = (index * 60) - 90; // Starting from Top (-90 deg)
    const rad = (angle * Math.PI) / 180;
    const radius = isMobile ? 120 : 190;
    const center = isMobile ? 170 : 250;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  const currentCoordinates = getCoordinates(activeFeature);

  const hubFeatures = [
    {
      icon: ShieldCheck,
      titleEn: 'Disease & Pest Detection',
      titleHi: 'बीमारी और कीट पहचान',
      titleMr: 'रोग आणि कीड नियंत्रण',
      descEn: 'Diagnose leaf diseases and pest infestations instantly from uploaded photos, getting biological and chemical remedies.',
      descHi: 'अपलोड किए गए पत्तों या फसलों के चित्रों से तुरंत रोग और कीटों की पहचान करें और उपचार के वैज्ञानिक सुझाव प्राप्त करें।',
      descMr: 'अपलोड केलेल्या पानाच्या किंवा पिकाच्या फोटोवरून रोगांचे अचूक निदान करा आणि जैविक व रासायनिक उपाय मिळवा.'
    },
    {
      icon: LineChart,
      titleEn: 'Market Intelligence',
      titleHi: 'बाजार बुद्धि',
      titleMr: 'बाजार भाव विश्लेषण',
      descEn: 'Track live Mandi rates and analyze historical trends using smart charts to determine the best times to sell.',
      descHi: 'विभिन्न मंडियों की लाइव दरों को ट्रैक करें और बेचने के सर्वोत्तम समय का निर्णय लेने के लिए ऐतिहासिक मूल्य प्रवृत्तियों का विश्लेषण करें।',
      descMr: 'विविध मंड्यांमधील थेट बाजार भाव तपासा आणि पीक विक्रीच्या सर्वोत्तम वेळेचा निर्णय घेण्यासाठी ऐतिहासिक आलेखाचे विश्लेषण करा.'
    },
    {
      icon: CloudSun,
      titleEn: 'Weather Analytics',
      titleHi: 'मौसम बुद्धि',
      titleMr: 'हवामान अंदाज',
      descEn: 'Receive highly accurate, location-specific forecasts and actionable farming weather advisories for irrigation and spraying.',
      descHi: 'सिंचाई और छिड़काव के लिए स्थान-विशिष्ट अत्यंत सटीक मौसम पूर्वानुमान और कृषि मौसम संबंधी अलर्ट प्राप्त करें।',
      descMr: 'पिकांवर औषध फवारणी आणि सिंचनाच्या अचूक नियोजनासाठी तुमच्या गावातील हवामानाचा अचूक अंदाज आणि अलर्ट मिळवा.'
    },
    {
      icon: ListChecks,
      titleEn: 'Crop Scheduler',
      titleHi: 'कार्य योजना',
      titleMr: 'कामकाज नियोजन',
      descEn: 'Generate fully customized sowing-to-harvest schedules for your chosen crops to optimize fertilization and care.',
      descHi: 'उर्वरक प्रबंधन और देखभाल को अनुकूलित करने के लिए चुनी गई फसलों के लिए बोने से लेकर कटाई तक का एक व्यक्तिगत कैलेंडर बनाएं।',
      descMr: 'तुमच्या मुख्य पिकासाठी पेरणीपासून ते कापणीपर्यंतच्या सर्व शेती कामांचे सविस्तर वेळापत्रक आणि स्मरणपत्रे तयार करा.'
    },
    {
      icon: FlaskConical,
      titleEn: 'Soil Interpreter',
      titleHi: 'मिट्टी बुद्धि',
      titleMr: 'माती परीक्षण',
      descEn: 'Interpret soil laboratory reports with AI explanations and customized NPK fertilizer recommendation schemes.',
      descHi: 'मिट्टी परीक्षण प्रयोगशाला रिपोर्टों को सरल स्पष्टीकरण के साथ समझें और व्यक्तिगत NPK उर्वरक मात्रा की गणना करें।',
      descMr: 'माती तपासणी रिपोर्ट सहजपणे समजून घ्या आणि पिकांच्या गरजेनुसार आवश्यक खत व औषध मात्रांचे अचूक प्रमाण काढा.'
    },
    {
      icon: Leaf,
      titleEn: 'Crop Identifier',
      titleHi: 'फसल पहचान',
      titleMr: 'पीक ओळख',
      descEn: 'Analyze plant profiles and growth stages from leaf imagery, verifying species, health scores, and nutrition parameters.',
      descHi: 'पत्ती के चित्रों से पौधे की प्रजातियों और विकास चरणों का विश्लेषण करें और स्वास्थ्य स्कोर और पोषण मापदंडों की पुष्टि करें।',
      descMr: 'पानाच्या फोटोवरून पिकाची जात, वाढीची अवस्था, आरोग्य स्कोर आणि आवश्यक पोषण घटकांचे अचूक विश्लेषण मिळवा.'
    }
  ];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Progress bar
  useEffect(() => {
    const bar = document.getElementById('progress-bar-live');
    if (!bar) return;
    const onScroll = () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      (bar as any).style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Leaflet loader - robust, no onLine check
  useEffect(() => {
    let cancelled = false;
    const load = (): Promise<any> => new Promise(res => {
      const w: any = window;
      if (w.L) return res(w.L);
      const linkId = 'leaflet-css-live';
      if (!document.getElementById(linkId)) {
        const lk = document.createElement('link'); lk.id = linkId; lk.rel = 'stylesheet'; lk.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(lk);
      }
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onerror = () => { const fb = document.createElement('script'); fb.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'; fb.onload = () => res((window as any).L); fb.onerror = () => res(null); document.body.appendChild(fb); };
      s.onload = () => res((window as any).L); document.body.appendChild(s);
    });
    const timer = setTimeout(() => {
      load().then(L => {
        if (cancelled || !L) return;
        try {
          const liveEl = document.getElementById('liveMapLive');
          const satEl = document.getElementById('satMapLive');
          if (liveEl) {
            if (liveMapRef.current) liveMapRef.current.remove();
            const m = L.map(liveEl, { zoomControl: false, attributionControl: false }).setView([liveLoc.lat, liveLoc.lng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
            L.marker([liveLoc.lat, liveLoc.lng]).addTo(m); liveMapRef.current = m;
          }
          if (satEl) {
            if (satMapRef.current) satMapRef.current.remove();
            const m2 = L.map(satEl, { zoomControl: false, attributionControl: false }).setView([liveLoc.lat, liveLoc.lng], 16);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(m2);
            L.marker([liveLoc.lat, liveLoc.lng]).addTo(m2);
            L.circle([liveLoc.lat, liveLoc.lng], { radius: 140, color: '#22c55e', fillOpacity: 0.15 }).addTo(m2);
            satMapRef.current = m2;
          }
          setTimeout(() => { liveMapRef.current?.invalidateSize(); satMapRef.current?.invalidateSize(); }, 300);
        } catch { }
      });
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const getLiveLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocStatus('idle'); return; }
    setLocStatus('fetching');
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude, accuracy } = pos.coords;
      setLiveLoc({ lat: latitude, lng: longitude, acc: Math.round(accuracy) });
      setLocStatus('active');
      try { liveMapRef.current?.setView([latitude, longitude], 16); satMapRef.current?.setView([latitude, longitude], 16); } catch { }
      try { triggerHaptic(); } catch { }
    }, () => setLocStatus('idle'), { enableHighAccuracy: true, timeout: 9000 });
  }, []);

  const handleScrollTo = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault(); const id = href.replace('#', ''); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMobileMenuOpen(false);
  }, []);

  const handleTryAI = useCallback(() => { try { triggerHaptic(); } catch { }; onGetStarted(); }, [onGetStarted]);

  return (
    <main className="w-full min-h-screen bg-[#070a07] text-white relative z-20 scroll-smooth selection:bg-emerald-500 selection:text-black overflow-x-hidden font-[Inter]">
      <div id="progress-bar-live" className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 z-[70] origin-left shadow-[0_0_12px_rgba(34,197,94,0.6)]" style={{ width: '0%' }} />

      {/* 1. LIVE Ticker */}
      <div className="relative z-50 bg-gradient-to-r from-emerald-950/80 via-[#0a1a0f] to-emerald-950/60 border-b border-emerald-500/15 overflow-hidden backdrop-blur">
        <div className="flex animate-[marquee_32s_linear_infinite] whitespace-nowrap py-2.5 w-max hover:[animation-play-state:paused]">
          {[...data.marketTicker, ...data.marketTicker, ...data.marketTicker].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span className="text-zinc-400 uppercase tracking-wider text-[10px]">{l.liveMandi}</span>
              <span className="text-emerald-300 font-semibold">{m.name}</span>
              <span className="text-white font-mono">₹{m.price.toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 inline-flex items-center gap-1 font-bold"><TrendingUp className="w-3 h-3" />{m.change}</span>
              <span className="text-white/10">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Header */}
      <header className={scrolled ? "sticky top-0 z-50 bg-[#070a07]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all" : "sticky top-0 z-50 bg-transparent border-b border-transparent transition-all"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <button onClick={(e: any) => handleScrollTo(e, '#home')} className="flex items-center gap-3">
            <div className="relative"><div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full" /><div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center shadow-lg"><Leaf className="w-5 h-5 text-black" strokeWidth={2.5} /></div></div>
            <div className="text-left"><div className="font-extrabold text-[15px] tracking-tight">AI Krushi Mitra</div><div className="text-[10px] text-emerald-400/70 -mt-0.5">Smart Farming, Better Tomorrow</div></div>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {[{ label: isMr ? 'होम' : isHi ? 'मुख्य' : 'Home', t: '#home' }, { label: isMr ? 'वैशिष्ट्ये' : isHi ? 'विशेषताएं' : 'Features', t: '#features' }, { label: isMr ? 'कार्यपद्धती' : isHi ? 'कार्यप्रणाली' : 'How It Works', t: '#how' }, { label: 'Live Map', t: '#live' }, { label: isMr ? 'समाधान' : isHi ? 'समाधान' : 'Solutions', t: '#solutions' }].map(it => (
              <button key={it.label} onClick={(e) => handleScrollTo(e, it.t)} className="px-3.5 py-2 text-[13px] font-medium text-zinc-300 hover:text-white rounded-full hover:bg-white/[0.06] transition">{it.label}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangMenuOpen(v => !v)} className="h-9 px-3 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10">{LANGUAGES.find(o => o.code === lang)?.name || 'मराठी'}<ChevronDown size={14} className={`opacity-60 transition ${langMenuOpen ? 'rotate-180' : ''}`} /></button>
              {langMenuOpen && (<div className="absolute right-0 mt-2 w-36 bg-[#0f1a0f] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-xl">{LANGUAGES.map(o => (<button key={o.code} onClick={() => { setLang(o.code as Language); setLangMenuOpen(false); try { triggerHaptic() } catch { } }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs ${lang === o.code ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'hover:bg-white/5 text-zinc-400'}`}>{o.name}</button>))}</div>)}
            </div>
            <button onClick={handleTryAI} className="hidden sm:inline-flex items-center gap-2 px-5 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black text-[13px] font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">{l.tryAI}<ArrowRight className="w-4 h-4" /></button>
            <button onClick={() => setMobileMenuOpen(v => !v)} className="lg:hidden p-2.5 rounded-full bg-white/5 border border-white/10"><MenuIcon /></button>
          </div>
        </div>
        <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden bg-[#070a07]/95 backdrop-blur-xl border-t border-white/10"><div className="px-4 py-4 space-y-1">{['#home', '#features', '#how', '#live', '#solutions'].map((t, i) => { const labels = [isMr ? 'होम' : isHi ? 'मुख्य' : 'Home', isMr ? 'वैशिष्ट्ये' : isHi ? 'विशेषताएं' : 'Features', isMr ? 'कार्यपद्धती' : isHi ? 'कार्यप्रणाली' : 'How', 'Live Map', isMr ? 'समाधान' : 'Solutions']; return <button key={t} onClick={(e: any) => handleScrollTo(e, t)} className="w-full text-left px-4 py-3 rounded-xl text-sm text-zinc-300 hover:bg-white/5">{labels[i]}</button> })}<button onClick={handleTryAI} className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold text-sm">{l.tryAI}</button></div></motion.div>)}</AnimatePresence>
      </header>

      {/* 3. Hero */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20">
        <div className="absolute inset-0 opacity-[0.035]" style={gridPattern} />
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-emerald-500/12 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-lime-500/8 rounded-full blur-[140px]" />
        <img src={FIELD_BG_IMAGE} onError={e => { (e.target as any).src = FALLBACK_FARM_IMAGE }} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur"><Sparkles className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[11px] font-bold tracking-widest uppercase text-emerald-300">{l.heroBadge}</span><span className="ml-2 h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /></div>
              <h1 className="mt-5 text-[40px] sm:text-[56px] lg:text-[64px] font-black leading-[0.95] tracking-tight">Smart Farming<br />Starts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-400 animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]">AI</span></h1>
              <p className="mt-4 text-[16px] leading-7 text-zinc-400 max-w-[520px]">{l.heroDesc}</p>
              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[520px]">
                {data.heroFeatures.map((f, i) => { const Icon = f.icon; return (<motion.div key={f.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="group p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-emerald-500/20 transition"><div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 border" style={{ background: `${f.color}14`, borderColor: `${f.color}22` }}><Icon className="w-5 h-5" style={{ color: f.color }} /></div><div className="text-[11px] font-semibold leading-tight text-zinc-200">{f.label}</div></motion.div>) })}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={handleTryAI} className="group inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold text-[14px] shadow-[0_8px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_36px_rgba(34,197,94,0.45)] hover:translate-y-[-1px] active:translate-y-[0px] transition-all">{l.tryAI}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></button>
                <button onClick={(e: any) => handleScrollTo(e, '#live')} className="inline-flex items-center gap-2 px-7 h-[48px] rounded-full bg-white/[0.06] border border-white/10 text-white font-semibold text-[14px] hover:bg-white/10 backdrop-blur"><MapIcon className="w-4 h-4" />Live Map देखें</button>
              </div>
              <div className="mt-8 flex items-center gap-5"><div className="flex items-center gap-1.5"><div className="flex -space-x-1">{[1, 2, 3].map(i => <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-[#070a07] flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(64 + i)}</div>)}</div><div className="flex ml-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />)}</div><span className="text-[13px] font-bold">4.8/5</span></div><div className="h-4 w-px bg-white/10" /><div className="text-[12px] text-zinc-400">Loved by <span className="text-emerald-400 font-bold">50K+</span> farmers</div></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative lg:h-[560px]">
              <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/15 via-transparent to-lime-500/10 rounded-[40px] blur-2xl" />
              <div className="relative h-full rounded-[32px] overflow-hidden border border-white/10 bg-[#0c160c] shadow-2xl">
                <img src={HERO_FARM_IMAGE} onError={e => { (e.target as any).src = FIELD_BG_IMAGE }} alt="farm" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a07] via-[#070a07]/40 to-transparent" />
                <div className="absolute inset-0 opacity-20" style={gridPattern} />
                {/* Top live pills */}
                <div className="absolute top-4 left-4 right-4 flex justify-between"><span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[11px] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{locStatus === 'fetching' ? 'Locating...' : `GPS Active • ${liveLoc.lat.toFixed(4)}, ${liveLoc.lng.toFixed(4)}`}</span><button onClick={getLiveLocation} className="px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold flex items-center gap-1"><Crosshair className="w-3 h-3" />Live</button></div>
                {/* Bottom glass stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-[20px] bg-black/40 backdrop-blur-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-black font-bold text-xs">R</div><div><div className="text-[12px] font-semibold">श्री रामानंद</div><div className="text-[10px] text-emerald-300">Gayatri Farm • Pune</div></div></div><span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">+15% उपज</span></div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]"><div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center"><div className="text-zinc-400 text-[10px]">मृदा स्वास्थ्य</div><div className="font-bold text-white mt-0.5">94%</div><div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[94%] bg-gradient-to-r from-emerald-400 to-lime-400" /></div></div><div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center"><div className="text-zinc-400 text-[10px] flex items-center justify-center gap-1"><Droplets className="w-3 h-3" />आर्द्रता</div><div className="font-bold mt-0.5">70%</div></div><div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center"><div className="text-zinc-400 text-[10px]">तापमान</div><div className="font-bold text-amber-300 mt-0.5">28°C</div></div></div>
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="absolute -top-3 -right-3 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-black shadow-xl border border-white/20"><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">उपज वृद्धि</div><div className="text-[18px] font-black leading-none">+18%</div></motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="absolute -bottom-6 -left-6 px-3.5 py-2 rounded-full bg-[#101a10] border border-white/10 shadow-xl flex items-center gap-2 text-[11px]"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" /><span className="w-2 h-2 rounded-full bg-emerald-400 relative" />Live Satellite • NDVI 0.82 Healthy</motion.div>
            </motion.div>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-8">{data.heroStats.map(s => <div key={s.label}><div className="text-[28px] font-black tracking-tight bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">{s.value}</div><div className="text-[12px] text-zinc-500 mt-1">{s.label}</div></div>)}</div>
        </div>
      </section>

      {/* 4. AI AGRI INTELLIGENCE HUB (AI कृषि बुद्धिमत्ता केंद्र) */}
      <section className="relative py-24 overflow-hidden border-b border-white/5 bg-[#030704]">
        <div className="absolute inset-0 opacity-[0.02]" style={gridPattern} />
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Header */}
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMr ? 'AI कृषी बुद्धिमत्ता केंद्र' : (isHi ? 'AI कृषि बुद्धिमत्ता केंद्र' : 'AI Agri Intelligence Hub')}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {isMr ? 'एक प्लॅटफॉर्म, अमर्याद शक्यता' : (isHi ? 'एक प्लेटफ़ॉर्म, असीमित संभावनाएं' : 'One Platform, Limitless Possibilities')}
            </h2>
            
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              {isMr ? '६ एआय-संचालित वैशिष्ट्ये एकाच ठिकाणी' : (isHi ? '6 AI-संचालित सुविधाएं एक केंद्रीय हब में' : '6 AI-driven features in a single central hub')}
            </p>
          </div>

          {/* Wheel Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
            
            {/* The interactive SVG Wheel */}
            <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] flex items-center justify-center select-none scale-95 sm:scale-100 transition-all">
              
              {/* Central Glowing AI Orb */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-900/30 to-lime-500/15 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                <div className="absolute inset-1 rounded-full border border-dashed border-emerald-400/20 animate-spin-slow" />
                <div className="absolute inset-3 rounded-full border border-dotted border-emerald-300/25 animate-spin-reverse" />
                
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-slate-950/90 border border-emerald-500/30 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase">KRUSHI CORE</span>
                  <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">★ AI ★</span>
                </div>
              </div>

              {/* Orbital Background Track */}
              <div className="absolute w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] rounded-full border border-dashed border-emerald-500/10 animate-spin-slow pointer-events-none" />

              {/* Dynamic SVG Connector Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <g className="transition-all duration-500">
                  <line 
                    x1="50%" 
                    y1="50%" 
                    x2={currentCoordinates.x} 
                    y2={currentCoordinates.y} 
                    className="stroke-emerald-400 stroke-2"
                    strokeDasharray="6,6"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' }}
                  />
                  <circle 
                    cx={currentCoordinates.x} 
                    cy={currentCoordinates.y} 
                    r="4" 
                    className="fill-emerald-400" 
                  />
                </g>
              </svg>

              {/* Floating Node Items */}
              {hubFeatures.map((feat, index) => {
                const angle = (index * 60) - 90; // Starting from Top (-90 deg)
                const rad = (angle * Math.PI) / 180;
                
                // Adaptive layout radius based on screens
                const radius = isMobile ? 120 : 190;
                
                // Offset calculation from center (which is 50%, 50%)
                const leftOffset = radius * Math.cos(rad);
                const topOffset = radius * Math.sin(rad);

                const active = activeFeature === index;
                const Icon = feat.icon;

                return (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    onMouseEnter={() => setActiveFeature(index)}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${leftOffset}px - 28px)`,
                      top: `calc(50% + ${topOffset}px - 28px)`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 z-20 ${
                      active 
                        ? 'bg-emerald-500 border-emerald-400 text-black scale-110 shadow-[0_0_25px_rgba(52,211,153,0.6)]' 
                        : 'bg-[#0f1d12]/90 border-emerald-500/20 text-emerald-400/80 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Icon size={22} className={active ? 'text-black' : 'text-emerald-400 group-hover:scale-105'} />
                  </button>
                );
              })}
            </div>

            {/* Description Info Card */}
            <div className="lg:max-w-md w-full text-left space-y-6">
              <div className="bg-[#0f1a0f]/60 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-[28px] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {React.createElement(hubFeatures[activeFeature].icon, { size: 20 })}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {lang === 'mr' ? hubFeatures[activeFeature].titleMr : (lang === 'hi' ? hubFeatures[activeFeature].titleHi : hubFeatures[activeFeature].titleEn)}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                          {hubFeatures[activeFeature].titleEn}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed min-h-[72px]">
                      {lang === 'mr' ? hubFeatures[activeFeature].descMr : (lang === 'hi' ? hubFeatures[activeFeature].descHi : hubFeatures[activeFeature].descEn)}
                    </p>

                    <button 
                      onClick={handleTryAI}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline pt-2 group/btn"
                    >
                      <span>{isMr ? 'आता तपासा' : (isHi ? 'अभी जांचें' : 'Try Feature')}</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom glass features bar */}
              <div className="rounded-[20px] bg-slate-950/60 border border-white/5 p-4 flex justify-between items-center text-[11px] sm:text-xs text-zinc-400">
                <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-emerald-400" /> 24x7 AI</span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5"><Mic size={13} className="text-cyan-400" /> {isMr ? 'व्हॉइस' : (isHi ? 'वॉइस' : 'Voice')}</span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5"><Globe size={13} className="text-amber-400" /> 12 {isMr ? 'भाषा' : (isHi ? 'भाषाएँ' : 'Languages')}</span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5"><WifiOff size={13} className="text-rose-400" /> {isMr ? 'ऑफलाइन' : (isHi ? 'ऑफ़लाइन' : 'Offline')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LIVE MAP PREVIEW - NEW */}
      <section id="live" className="relative py-16 border-y border-white/5 bg-[#08110a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-widest uppercase text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE INTELLIGENCE</div><h2 className="mt-3 text-[32px] font-black tracking-tight">Live Location • Satellite • Weather</h2><p className="mt-1 text-sm text-zinc-400">Real GPS, Esri World Imagery, IMD hyperlocal - all in one glass dashboard</p></div><div className="flex gap-2"><button onClick={getLiveLocation} className="px-4 h-9 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-100"><Navigation className="w-3.5 h-3.5" />{locStatus === 'fetching' ? 'Locating...' : 'Get Live Location'}</button><span className="px-3 h-9 inline-flex items-center rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-400">Accuracy ±{liveLoc.acc}m</span></div></div>
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 rounded-[24px] overflow-hidden border border-white/10 bg-[#0d1a0d] p-1.5"><div className="rounded-[18px] overflow-hidden bg-[#0a140a] h-[340px] relative" id="liveMapLive" /><div className="p-3 flex justify-between text-[11px] text-zinc-400"><span>Lat {liveLoc.lat.toFixed(6)} • Lng {liveLoc.lng.toFixed(6)}</span><span className="text-emerald-400">● GPS Active</span></div></div>
            <div className="lg:col-span-7 rounded-[24px] overflow-hidden border border-white/10 bg-[#0d1a0d] p-1.5">
              <div className="rounded-[18px] overflow-hidden bg-[#0a140a] h-[340px] relative">
                <img 
                  src="/landing/satellite-view.jpg" 
                  alt="Satellite Farm View" 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                />
                
                {/* Visual scanning overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a07]/60 via-transparent to-black/20 pointer-events-none" />
                
                {/* Target cursor scanner marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-emerald-400/30 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full border border-emerald-400/50 bg-emerald-400/5 flex items-center justify-center">
                    <Crosshair className="w-6 h-6 text-emerald-400/80 animate-pulse" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 z-[400] flex gap-1.5">
                  {['True Color', 'NDVI', 'Moisture'].map(lay => (
                    <button 
                      key={lay} 
                      onClick={() => setSatLayer(lay)} 
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium backdrop-blur border transition ${
                        satLayer === lay 
                          ? 'bg-emerald-500 text-black border-emerald-500 font-bold' 
                          : 'bg-black/50 text-white border-white/15 hover:bg-black/75'
                      }`}
                    >
                      {lay}
                    </button>
                  ))}
                </div>

                {satLayer !== 'True Color' && (
                  <div className="absolute inset-0 z-[300] pointer-events-none opacity-50 transition-all duration-300" style={{ 
                    background: satLayer === 'NDVI' 
                      ? 'radial-gradient(circle at 40% 40%, rgba(74,222,128,0.4) 0%, rgba(34,197,94,0.15) 50%, transparent 100%)' 
                      : 'radial-gradient(circle at 60% 50%, rgba(59,130,246,0.45) 0%, rgba(29,78,216,0.2) 60%, transparent 100%)' 
                  }} />
                )}
              </div>
              <div className="p-3 flex justify-between text-[11px] text-zinc-400">
                <span>AI Farm Analysis • {satLayer} • Hyperlocal</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NDVI Scan Active
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-3 text-[12px]"><div className="rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 flex justify-between"><span className="text-zinc-400">NDVI</span><b className="text-lime-300">0.82 Healthy</b></div><div className="rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 flex justify-between"><span className="text-zinc-400">Moisture</span><b>68% • Good</b></div><div className="rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 flex justify-between"><span className="text-zinc-400">Field</span><b>2.4 acre • Pune</b></div></div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-20 border-b border-white/5">
        <div className="absolute inset-0 opacity-[0.03]" style={gridPattern} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12"><div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-widest text-emerald-300 uppercase">{l.howBadge}</div><h2 className="mt-3 text-[34px] font-black tracking-tight">{l.howTitle}</h2><p className="mt-2 text-sm text-zinc-400">AI Krushi Mitra works in four simple steps</p></div>
          <div className="relative grid md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            {data.howSteps.map((s, i) => { const Icon = s.icon; return (<motion.div key={s.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative text-center group"><div className="relative mx-auto w-[96px] h-[96px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center backdrop-blur group-hover:border-emerald-500/30 transition"><div className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition" style={{ background: s.color }} /><div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background: `${s.color}14`, borderColor: `${s.color}30` }}><Icon className="w-7 h-7" style={{ color: s.color }} /></div><span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white text-black text-xs font-black flex items-center justify-center shadow">{s.step}</span></div><h3 className="mt-4 font-bold text-[15px]">{s.title}</h3><p className="mt-1 text-[13px] text-zinc-400 leading-snug max-w-[220px] mx-auto">{s.desc}</p></motion.div>) })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#080f08] border-b border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12"><div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-widest text-emerald-300 uppercase">{l.featuresBadge}</div><h2 className="mt-3 text-[34px] font-black">{l.featuresTitle}</h2><p className="text-sm text-zinc-400 mt-2">All necessary tools for smart farming in one place</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{data.featureCards.map((c, i) => { const Icon = c.icon; return (<motion.button key={c.id} onClick={handleTryAI} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }} className="group text-left p-5 rounded-[20px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/20 backdrop-blur relative overflow-hidden"><div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition`} /><div className="relative"><div className="flex justify-between items-start mb-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `${c.color}12`, borderColor: `${c.color}20` }}><Icon className="w-5 h-5" style={{ color: c.color }} /></div><ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" /></div><div className="font-bold text-[14px] leading-tight">{c.title}</div><p className="text-[12px] text-zinc-400 mt-1.5 leading-snug line-clamp-2">{c.desc}</p></div></motion.button>) })}</div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="text-center mb-12"><div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-widest uppercase text-zinc-300">{l.solutionsBadge}</div><h2 className="mt-3 text-[34px] font-black">{l.solutionsTitle}</h2></div><div className="grid md:grid-cols-3 gap-6">{data.solutions.map((s, i) => (<motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-[24px] overflow-hidden bg-white/[0.03] border border-white/10 hover:border-white/15 transition"><div className="relative h-48 overflow-hidden bg-[#0f1a0f]"><img src={s.image} alt={s.title} onError={e => { (e.target as any).src = FIELD_BG_IMAGE }} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" /><div className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur bg-black/30 border border-white/10 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} /></div></div><div className="p-5"><h3 className="font-bold text-[16px]">{s.title}</h3><p className="text-[13px] text-zinc-400 mt-1 leading-snug">{s.desc}</p><ul className="mt-4 space-y-2">{s.features.map((f: any) => <li key={f} className="flex items-center gap-2 text-[12px] text-zinc-300"><span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${s.color}15` }}><Check className="w-3 h-3" style={{ color: s.color }} /></span>{f}</li>)}</ul><button onClick={handleTryAI} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold hover:gap-2 transition" style={{ color: s.color }}>Learn more <ArrowRight className="w-3.5 h-3.5" /></button></div></motion.div>))}</div></div>
      </section>

      {/* Why + Testimonials */}
      <section id="why" className="py-20 bg-[#080f08] border-b border-white/5"><div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="grid lg:grid-cols-2 gap-12"><div><div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold tracking-widest text-emerald-300 uppercase">{l.benefitsBadge}</div><h2 className="mt-3 text-[30px] font-black leading-tight">{l.benefitsTitle}</h2><div className="mt-8 grid sm:grid-cols-2 gap-4">{data.whyChoose.map((it: any) => { const Icon = it.icon; return (<div key={it.title} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition group"><div className="w-10 h-10 rounded-xl flex items-center justify-center border mb-3 group-hover:scale-105 transition" style={{ background: `${it.color}12`, borderColor: `${it.color}20` }}><Icon className="w-5 h-5" style={{ color: it.color }} /></div><div className="font-bold text-[14px]">{it.title}</div><p className="text-[12px] text-zinc-400 mt-1 leading-snug">{it.desc}</p></div>) })}</div></div><div><div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-widest uppercase text-zinc-300">{l.testimonialsBadge}</div><h2 className="mt-3 text-[30px] font-black">{l.testimonialsTitle}</h2><div className="mt-8 space-y-4">{data.testimonials.map((t: any) => (<div key={t.name} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur relative overflow-hidden"><Quote className="absolute top-4 right-4 w-10 h-10 text-white/[0.04]" fill="currentColor" /><div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />)}</div><p className="text-[13px] leading-relaxed text-zinc-200 italic">“{t.quote}”</p><div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/5"><div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border" style={{ background: `${t.color}14`, borderColor: `${t.color}25`, color: t.color }}>{t.initial}</div><div><div className="text-[13px] font-bold">{t.name}</div><div className="text-[11px] text-zinc-500">{t.location}</div></div></div></div>))}</div></div></div></div></section>

      {/* App Download */}
      <section className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="relative overflow-hidden rounded-[32px] border border-emerald-500/15 bg-gradient-to-br from-emerald-950/40 via-[#0a1a0f] to-[#0f1f0a] p-8 md:p-12"><div className="absolute inset-0 opacity-[0.04]" style={gridPattern} /><div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 blur-[80px] rounded-full" /><div className="relative grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase"><Smartphone className="w-3.5 h-3.5" />{l.mobileBadge}</div><h2 className="mt-4 text-[32px] font-black leading-[1.1]">Take AI Power<br />In Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">Pocket</span></h2><p className="mt-3 text-sm text-zinc-400 max-w-md">{l.mobileDesc}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={handleTryAI} className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-[13px]"><Play className="w-4 h-4" fill="currentColor" />Google Play</button><button onClick={handleTryAI} className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-[13px] backdrop-blur"><Apple className="w-4 h-4" fill="currentColor" />App Store</button></div><button onClick={handleTryAI} className="mt-4 text-xs text-emerald-300 font-semibold hover:text-emerald-200">{l.viewWeb} →</button></div><div className="relative flex justify-center"><div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full" /><div className="relative w-56 h-[380px] rounded-[28px] border border-white/15 bg-black overflow-hidden shadow-2xl"><img src={HERO_FARM_IMAGE} onError={e => { (e.target as any).src = FIELD_BG_IMAGE }} className="w-full h-full object-cover opacity-80" alt="app" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 backdrop-blur border border-white/10"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400" /><div><div className="text-[11px] font-bold">AI Krushi Mitra</div><div className="text-[10px] text-emerald-300">Live • 50K+ farmers</div></div></div></div></div><div className="ml-4 hidden md:block p-3 rounded-2xl bg-white border border-white/20 shadow-xl"><div className="w-24 h-24 bg-white flex items-center justify-center rounded-xl"><QrCode className="w-20 h-20 text-black" /></div><div className="text-[10px] text-center mt-2 font-bold text-black">{l.scanToDownload}</div></div></div></div></div></div></section>

      <footer className="border-t border-white/5 bg-[#050a05] py-12"><div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="grid md:grid-cols-4 gap-8"><div className="md:col-span-1"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center"><Leaf className="w-5 h-5 text-black" /></div><div><div className="font-extrabold text-[14px]">AI Krushi Mitra</div><div className="text-[10px] text-emerald-400/60">Smart Farming, Better Tomorrow</div></div></div><p className="mt-3 text-[12px] text-zinc-500 leading-relaxed">AI companion for better decisions, higher yield and profitable farming.</p></div><div><h4 className="font-bold text-[13px] mb-3">{l.quickLinks}</h4><ul className="space-y-2 text-[12px] text-zinc-500">{['Dashboard', 'Features', 'How It Works', 'Market'].map(x => <li key={x}><button onClick={handleTryAI} className="hover:text-emerald-400 transition">{x}</button></li>)}</ul></div><div><h4 className="font-bold text-[13px] mb-3">{l.resources}</h4><ul className="space-y-2 text-[12px] text-zinc-500">{['Blog', 'Guides', 'Help Center'].map(x => <li key={x}><button className="hover:text-emerald-400 transition">{x}</button></li>)}</ul></div><div><h4 className="font-bold text-[13px] mb-3">{l.contactTitle}</h4><div className="space-y-2 text-[12px] text-zinc-500"><div className="flex gap-2 items-center"><Phone className="w-3.5 h-3.5 text-emerald-400" />+91 99999 99999</div><div className="flex gap-2 items-center"><Mail className="w-3.5 h-3.5 text-emerald-400" />support@aikrushimitra.in</div><div className="flex gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />Pune, Maharashtra</div></div></div></div><div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-zinc-600"><span>© 2025 AI Krushi Mitra. All rights reserved.</span><span className="font-semibold">{l.loveText} 🇮🇳</span></div></div></footer>

      <SupportAgentWidget lang={lang} user={user} />

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}} @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} .animate-[shimmer_3s_linear_infinite]{animation:shimmer 3s linear infinite}`}</style>
    </main>
  );
}

function MenuIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>) }

// Support widget - keep your existing logic, dark styled
const SupportAgentWidget = ({ lang, user }: { lang: Language; user?: any }) => {
  const [isOpen, setIsOpen] = useState(false); const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [village, setVillage] = useState(''); const [enquiry, setEnquiry] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([]); const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null); const [inputMessage, setInputMessage] = useState('');
  const isMr = lang === 'mr';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name || !phone || !enquiry) return; setLoading(true);
    try {
      const id = ticketId || `SUP-${Math.floor(1000 + Math.random() * 9000)}`; let ai = ''; try { ai = await getAIFarmingAdvice(enquiry, lang, 'Support') } catch { ai = isMr ? 'तुमचा प्रश्न नोंदवला गेला.' : 'Registered. Representative will contact.' }
      const msgs = [{ role: 'user', text: enquiry } as any, { role: 'agent', text: `Namaskar ${name}! (ID:${id})\n\n${ai}` }]; setMessages(msgs); setTicketId(id); setStep('chat');
      try { await setDoc(doc(db, 'supportTickets', id), { id, userId: user?.email || 'guest', name, phone, village, lastEnquiry: enquiry, lang, createdAt: Date.now(), updatedAt: Date.now(), status: 'open', messages: msgs }) } catch { }
    } finally { setLoading(false) }
  };
  const sendFollow = async (e: React.FormEvent) => {
    e.preventDefault(); if (!inputMessage.trim()) return; const txt = inputMessage.trim(); setInputMessage(''); const upd = [...messages, { role: 'user', text: txt } as any]; setMessages(upd); setLoading(true);
    try { let ai = ''; try { ai = await getAIFarmingAdvice(txt, lang, 'Support') } catch { ai = 'Failed to connect.' } const fin = [...upd, { role: 'agent', text: ai } as any]; setMessages(fin); const id = ticketId || `SUP-${Math.floor(1000 + Math.random() * 9000)}`; setTicketId(id); try { await setDoc(doc(db, 'supportTickets', id), { id, userId: user?.email || 'guest', name, phone, village, lastEnquiry: txt, lang, createdAt: Date.now(), updatedAt: Date.now(), status: 'open', messages: fin }) } catch { } } finally { setLoading(false) }
  };
  return (<><div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">{!isOpen && (<div className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-black text-xs px-4 py-2 rounded-full shadow-lg animate-bounce flex items-center gap-1.5"><Sparkles size={14} />24/7 Live Support</div>)}<button onClick={() => { try { triggerHaptic() } catch { }; setIsOpen(!isOpen) }} className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition">{isOpen ? <X size={22} /> : <Headphones size={22} />}</button></div>{isOpen && (<div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[70vh] bg-[#0a140a]/95 backdrop-blur-2xl border border-emerald-500/20 rounded-[24px] shadow-2xl z-[999] flex flex-col overflow-hidden"><div className="bg-[#0f1f0f] p-4 border-b border-white/5 flex justify-between items-center"><div className="flex items-center gap-2"><Headphones size={16} className="text-emerald-400" /><div><div className="font-bold text-sm">AI Krushi Support</div><div className="text-[10px] text-emerald-400">Online • Live</div></div></div><button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button></div><div className="p-4 overflow-y-auto flex-1 space-y-3">{step === 'form' ? (<form onSubmit={handleSubmit} className="space-y-3"><input required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500/40" /><input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-emerald-500/40" /><input value={village} onChange={e => setVillage(e.target.value)} placeholder="Village (optional)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none" /><textarea required rows={3} value={enquiry} onChange={e => setEnquiry(e.target.value)} placeholder="Your farming query..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none" /><button disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold text-xs flex justify-center gap-2">{loading && <Loader2 size={14} className="animate-spin" />}Submit Request</button></form>) : (<div className="space-y-2.5">{messages.map((m, i) => <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-emerald-500 text-black rounded-br-sm' : 'bg-white/5 border border-white/5 text-zinc-200 rounded-bl-sm'}`}>{m.text}</div></div>)}{loading && <div className="flex gap-1 p-2"><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:100ms]" /><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:200ms]" /></div>}</div>)}</div>{step === 'chat' && (<form onSubmit={sendFollow} className="p-3 bg-black/30 border-t border-white/5 flex gap-2"><input value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Ask follow-up..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" /><button className="px-4 rounded-xl bg-emerald-500 text-black font-bold"><Send size={14} /></button></form>)}</div>)}</>);
};
