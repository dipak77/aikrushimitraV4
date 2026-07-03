import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, Leaf, CloudSun, LineChart, FlaskConical, Star, ArrowRight, Sparkles, 
  Droplets, Upload, Brain, FileText, TrendingUp, ChevronRight, Check, Tractor, 
  Users, ShieldCheck, Quote, Smartphone, QrCode, Apple, Play, Phone, Mail, 
  MapPin, Headphones, X, Send, Loader2, ChevronDown, ListChecks, Mic, LayoutGrid, Bell, 
  Map as MapIcon, Heart, Clock
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { LANGUAGES, TRANSLATIONS } from '../../constants';
import { Language, UserProfile } from '../../types';
import { db } from '../../utils/firebase';
import { collection, doc, setDoc, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getAIFarmingAdvice } from '../../services/geminiService';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  user?: UserProfile | null;
}

// ============================================================
// DYNAMIC MULTILINGUAL DATA SET
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
    { icon: Leaf, label: isMr ? 'एआय पीक डॉक्टर' : (isHi ? 'AI फसल डॉक्टर' : 'AI Crop Doctor'), color: '#10b981' },
    { icon: CloudSun, label: isMr ? 'हवामान अंदाज' : (isHi ? 'मौसम अपडेट' : 'Real-time Weather'), color: '#0ea5e9' },
    { icon: LineChart, label: isMr ? 'बाजार भाव विश्लेषण' : (isHi ? 'बाजार खुफिया' : 'Market Intelligence'), color: '#f59e0b' },
    { icon: FlaskConical, label: isMr ? 'माती आरोग्य तपासणी' : (isHi ? 'मिट्टी जांच' : 'Soil Health Check'), color: '#a855f7' },
  ];

  const howSteps = [
    { 
      step: 1, 
      icon: Upload, 
      title: isMr ? 'अपलोड / वर्णन करा' : (isHi ? 'अपलोड / विवरण दें' : 'Upload / Describe'), 
      desc: isMr ? 'पिकाचा फोटो अपलोड करा किंवा समस्या सांगा' : (isHi ? 'फसल की फोटो अपलोड करें या समस्या बताएं' : 'Upload crop photo or describe your problem'), 
      color: '#10b981' 
    },
    { 
      step: 2, 
      icon: Brain, 
      title: isMr ? 'एआय विश्लेषण' : (isHi ? 'AI विश्लेषण' : 'AI Analysis'), 
      desc: isMr ? 'आमचे एआय लगेच विश्लेषण करून आजार ओळखते' : (isHi ? 'हमारा AI तुरंत विश्लेषण कर समस्या पहचानता है' : 'Our AI analyzes and detects issues instantly'), 
      color: '#0ea5e9' 
    },
    { 
      step: 3, 
      icon: FileText, 
      title: isMr ? 'मार्गदर्शन मिळवा' : (isHi ? 'सुझाव पाएं' : 'Get Recommendations'), 
      desc: isMr ? 'सर्वोत्तम उपाय, डोस आणि सल्ला मिळवा' : (isHi ? 'सर्वोत्तम समाधान, खुराक और सलाह पाएं' : 'Get best solutions, dosage and expert advice'), 
      color: '#f59e0b' 
    },
    { 
      step: 4, 
      icon: TrendingUp, 
      title: isMr ? 'उत्पादन वाढवा' : (isHi ? 'उपज बढ़ाएं' : 'Increase Yield'), 
      desc: isMr ? 'सल्ल्याचे पालन करा आणि नफा वाढवा' : (isHi ? 'सलाह मानें और अपना मुनाफा बढ़ाएं' : 'Follow advice and increase your profit'), 
      color: '#a855f7' 
    },
  ];

  const featureCards = [
    { id: 1, title: isMr ? 'फसल आरोग्य स्कोर' : (isHi ? 'फसल स्वास्थ्य स्कोर' : 'Crop Health Score'), desc: isMr ? 'तुमच्या पिकाची आरोग्य स्थिती जाणून घ्या' : (isHi ? 'अपनी फसल की स्वास्थ्य स्थिति जानें' : 'Know your crop\'s health status'), icon: Leaf, color: '#10b981', bgGradient: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 2, title: isMr ? 'आजचे काम' : (isHi ? 'आज के कार्य' : 'Today\'s Tasks'), desc: isMr ? 'आजच्या शेती कामांची यादी' : (isHi ? 'आज के लिए निर्धारित कार्यों की सूची' : 'List of tasks scheduled for today'), icon: ListChecks, color: '#34d399', bgGradient: 'from-green-500/20 to-green-500/5' },
    { id: 3, title: isMr ? 'एआय शिफारस' : (isHi ? 'AI सुझाव' : 'AI Recommendation'), desc: isMr ? 'उत्पादन वाढवण्यासाठी एआय सल्ला' : (isHi ? 'उत्पादन बढ़ाने के लिए AI सुझाव' : 'AI tips to maximize your agricultural output'), icon: Sparkles, color: '#fbbf24', bgGradient: 'from-amber-500/20 to-amber-500/5' },
    { id: 4, title: isMr ? 'लाइव्ह बाजार भाव' : (isHi ? 'लाइव मार्केट ट्रेंड' : 'Live Market Trend'), desc: isMr ? 'बाजारातील किमतींचे थेट अपडेट्स' : (isHi ? 'बाजार में हो रहे बदलावों की जानकारी' : 'Real-time updates on market prices'), icon: LineChart, color: '#f87171', bgGradient: 'from-rose-500/20 to-rose-500/5' },
    { id: 5, title: isMr ? 'हवामान अंदाज' : (isHi ? 'मौसम पूर्वानुमान' : 'Weather Forecast'), desc: isMr ? 'येणाऱ्या हवामानाची अचूक माहिती' : (isHi ? 'आगामी मौसम की जानकारी देखें' : 'Accurate weather warnings and animations'), icon: CloudSun, color: '#60a5fa', bgGradient: 'from-sky-500/20 to-sky-500/5' },
    { id: 6, title: isMr ? 'व्हॉइस & चॅट एआय' : (isHi ? 'वॉइस & चैट AI' : 'Voice & Chat AI'), desc: isMr ? 'शेतीबद्दल प्रश्न विचारा, उत्तरे मिळवा' : (isHi ? 'खेती से संबंधित प्रश्न पूछें, जवाब पाएं' : 'Ask farming questions in your language'), icon: Mic, color: '#10b981', bgGradient: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 7, title: isMr ? 'अनेक शेते व्यवस्थापन' : (isHi ? 'एकाधिक खेत' : 'Multiple Fields'), desc: isMr ? 'तुमच्या सर्व शेतांची माहिती एकाच जागी' : (isHi ? 'अपने सभी खेतों की जानकारी एक स्थान पर' : 'Track and manage multiple fields at once'), icon: LayoutGrid, color: '#10b981', bgGradient: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 8, title: isMr ? 'अँप नोटिफिकेशन्स' : (isHi ? 'महत्वपूर्ण सूचनाएं' : 'Notifications'), desc: isMr ? 'शेतीशी संबंधित महत्त्वाचे अलर्ट्स' : (isHi ? 'खेती से संबंधित महत्वपूर्ण अपडेट्स' : 'Important notifications and alerts'), icon: Bell, color: '#ef4444', bgGradient: 'from-red-500/20 to-red-500/5' },
  ];

  const solutions = [
    {
      title: isMr ? 'अल्पभूधारक शेतकरी' : (isHi ? 'लघु और सीमांत किसान' : 'Small & Marginal Farmers'),
      desc: isMr ? 'उत्पादन आणि उत्पन्नाच्या चांगल्या वाढीसाठी एआय मार्गदर्शन' : (isHi ? 'बेहतर फसल और अधिक आय के लिए किफायती AI मार्गदर्शन' : 'Affordable AI guidance for better crops and higher income'),
      image: '/landing/farmer-small.png',
      color: '#22c55e',
      features: isMr 
        ? ['सोप्या शिफारसी', 'कमी खर्चिक उपाय', 'मराठी भाषा समर्थन'] 
        : (isHi ? ['सरल सुझाव', 'कम लागत समाधान', 'स्थानीय भाषा समर्थन'] : ['Simple recommendations', 'Low cost solutions', 'Local language support']),
    },
    {
      title: isMr ? 'प्रगतिशील शेतकरी' : (isHi ? 'प्रगतिशील किसान' : 'Progressive Farmers'),
      desc: isMr ? 'जास्तीत जास्त उत्पादन आणि कार्यक्षमतेसाठी डेटा-आधारित सल्ला' : (isHi ? 'अधिकतम उपज और दक्षता के लिए डेटा-आधारित अंतर्दृष्टि' : 'Data-driven insights for maximum yield and efficiency'),
      image: '/landing/farmer-progressive.png',
      color: '#0ea5e9',
      features: isMr 
        ? ['प्रगत विश्लेषण', 'हवामान आणि बाजार अंतर्दृष्टि', 'नफा अनुकूलन'] 
        : (isHi ? ['उन्नत विश्लेषण', 'मौसम और बाजार अंतर्दृष्टि', 'मुनाफा अनुकूलन'] : ['Advanced analytics', 'Weather & market insights', 'Profit optimization']),
    },
    {
      title: isMr ? 'कृषी व्यवसाय आणि सल्लागार' : (isHi ? 'कृषि व्यवसाय और सलाहकार' : 'Agribusiness & Advisors'),
      desc: isMr ? 'अनेक शेतांचे व्यवस्थापन करा आणि उत्तम सल्ला द्या' : (isHi ? 'कई खेतों का प्रबंधन करें और बेहतर सलाह दें' : 'Manage multiple farms and provide better advisory'),
      image: '/landing/farmer-advisor.png',
      color: '#a855f7',
      features: isMr 
        ? ['शेतांचे रिअल-टाइम नियंत्रण', 'तपशीलवार रिपोर्ट्स', 'सल्लागार साधने'] 
        : (isHi ? ['खेत निगरानी', 'रिपोर्ट और विश्लेषण', 'सलाहकार उपकरण'] : ['Farm monitoring', 'Reports & analytics', 'Advisory tools']),
    },
  ];

  const whyChoose = [
    { icon: Sprout, title: isMr ? 'अधिक उत्पादन' : (isHi ? 'अधिक उपज' : 'Higher Yield'), desc: isMr ? 'एआय शिफारसी उत्पादन २०% पर्यंत वाढवतात' : (isHi ? 'AI सुझाव से उत्पादन 20% तक बढ़ता है' : 'AI recommendations increase productivity up to 20%'), color: '#22c55e' },
    { icon: ShieldCheck, title: isMr ? 'खर्च बचत' : (isHi ? 'लागत बचत' : 'Cost Saving'), desc: isMr ? 'अचूक सल्ला आणि नियोजनासह लागवड खर्च कमी करा' : (isHi ? 'सटीक सलाह और योजना से खर्च कम करें' : 'Reduce input costs with precise advice and planning'), color: '#f97316' },
    { icon: Clock, title: isMr ? 'वेळ बचत' : (isHi ? 'समय बचत' : 'Time Saving'), desc: isMr ? 'तात्काळ उपाय मिळवा, शेतातील वेळ आणि श्रम वाचवा' : (isHi ? 'तुरंत समाधान पाएं, खेत में समय बचाएं' : 'Get instant solutions, save time and effort in field'), color: '#eab308' },
    { icon: Headphones, title: isMr ? 'तज्ज्ञ मदत' : (isHi ? 'विशेषज्ञ सहायता' : 'Expert Support'), desc: isMr ? '२४/७ एआय सहाय्यक आणि कृषी तज्ज्ञांचे मार्गदर्शन' : (isHi ? '24/7 AI सहायक और कृषि विशेषज्ञ मार्गदर्शन' : '24/7 AI assistant and agricultural expert guidance'), color: '#a855f7' },
    { icon: Users, title: isMr ? 'शेतकऱ्यांचा विश्वास' : (isHi ? 'किसानों का भरोसा' : 'Trusted by Farmers'), desc: isMr ? '५०,०००+ शेतकरी चांगल्या शेतीसाठी एआयवर विश्वास ठेवतात' : (isHi ? '50,000+ किसान हमारे AI पर भरोसा करते हैं' : '50,000+ farmers trust our AI for better farming'), color: '#22c55e' },
    { icon: ShieldCheck, title: isMr ? 'सुरक्षित आणि खाजगी' : (isHi ? 'सुरक्षित और निजी' : 'Secure & Private'), desc: isMr ? 'तुमचा डेटा सुरक्षित आहे आणि कधीही शेअर केला जात नाही' : (isHi ? 'कायदा सुरक्षित है, कभी साझा नहीं किया जाता' : 'Your data is safe and never shared with anyone'), color: '#0ea5e9' },
  ];

  const testimonials = [
    {
      quote: isMr 
        ? 'एआय कृषी मित्राने माझ्या सोयाबीनवरील रोगावर वेळेत उपाय सुचवला आणि उत्पादन १८% वाढले!' 
        : (isHi ? 'AI Krushi Mitra ने मेरे सोयाबीन पर बीमारी का समय पर सुझाव दिया और उपज 18% बढ़ी!' : 'AI Krushi Mitra gave timely advice on my soybean disease and yield increased 18%!'),
      name: 'Ramesh Patil',
      location: 'Nashik, Maharashtra',
      rating: 5,
      initial: 'R',
      color: '#22c55e',
    },
    {
      quote: isMr 
        ? 'बाजार भाव, हवामान अंदाज आणि एआय सल्ला - सर्व काही एकाच ॲपमध्ये. अत्यंत उपयुक्त!' 
        : (isHi ? 'बाजार भाव, मौसम और AI सलाह — सब कुछ एक ही ऐप में। सच में उपयोगी!' : 'Market prices, weather and AI advice — all in one app. Truly useful!'),
      name: 'Sunita Devi',
      location: 'Solapur, Maharashtra',
      rating: 5,
      initial: 'S',
      color: '#0ea5e9',
    },
    {
      quote: isMr 
        ? 'पिकाच्या रोगांची ओळख लवकर होते आणि योग्य उपाय मिळतो. खूप छान ॲप आहे!' 
        : (isHi ? 'फसल की बीमारी की पहचान जल्दी होती है और सही उपाय मिलता है। बहुत अच्छा ऐप है!' : 'Crop disease identified quickly and right solution given. Great app!'),
      name: 'Amit Sharma',
      location: 'Jaipur, Rajasthan',
      rating: 5,
      initial: 'A',
      color: '#a855f7',
    },
  ];

  const labels = {
    en: {
      heroBadge: "AI Powered Agriculture Platform",
      heroTitle: "Smart Farming Starts with AI",
      heroDesc: "Get AI-powered crop advisory, weather updates, market insights and expert guidance in your language.",
      tryAI: "Try AI Assistant",
      exploreFeatures: "Explore Features",
      howBadge: "Simple Process",
      howTitle: "How AI Krushi Mitra Works",
      howDesc: "AI Krushi Mitra works in four simple steps",
      featuresBadge: "Powerful Tools",
      featuresTitle: "Everything You Need to Farm Smarter",
      featuresDesc: "All necessary tools for smart farming in one place",
      solutionsBadge: "For Everyone",
      solutionsTitle: "Solutions for Every Farmer",
      solutionsDesc: "Tailored solutions for smallholder, commercial, and advisory farms",
      benefitsBadge: "Benefits",
      benefitsTitle: "Why Choose AI Krushi Mitra?",
      benefitsDesc: "Six great reasons to choose our platform",
      testimonialsBadge: "Testimonials",
      testimonialsTitle: "What Farmers Say",
      testimonialsDesc: "Real stories from real farmers",
      mobileBadge: "Mobile App",
      mobileTitle: "Take AI Power In Your Pocket",
      mobileDesc: "Download the AI Krushi Mitra app and make your farming smarter today!",
      scanToDownload: "Scan to download",
      contactTitle: "Contact Us",
      quickLinks: "Quick Links",
      resources: "Resources",
      company: "Company",
      loveText: "Made with ❤ for Farmers of India",
      liveMandi: "LIVE MANDI",
      viewWeb: "Or use web app now",
    },
    mr: {
      heroBadge: "एआय समर्थित कृषी प्लॅटफॉर्म",
      heroTitle: "स्मार्ट शेतीची सुरुवात एआयने",
      heroDesc: "तुमच्या भाषेत एआय-सक्षम पीक सल्ला, हवामान अपडेट्स, बाजार भाव आणि तज्ज्ञ मार्गदर्शन मिळवा.",
      tryAI: "एआय असिस्टंट वापरून पहा",
      exploreFeatures: "वैशिष्ट्ये पहा",
      howBadge: "सोपी प्रक्रिया",
      howTitle: "एआय कृषी मित्र कसे कार्य करते",
      howDesc: "चार सोप्या चरणांमध्ये कार्यप्रक्रिया",
      featuresBadge: "शक्तिशाली साधने",
      featuresTitle: "स्मार्ट शेतीसाठी आवश्यक सर्वकाही",
      featuresDesc: "स्मार्ट शेतीसाठीची सर्व आवश्यक साधने एकाच ठिकाणी",
      solutionsBadge: "सर्वांसाठी",
      solutionsTitle: "प्रत्येक शेतकऱ्यासाठी उपाय",
      solutionsDesc: "अल्पभूधारक, व्यावसायिक आणि सल्लागार शेतांसाठी तयार केलेले उपाय",
      benefitsBadge: "फायदे",
      benefitsTitle: "एआय कृषी मित्र का निवडावे?",
      benefitsDesc: "आमचे प्लॅटफॉर्म निवडण्याची सहा मोठी कारणे",
      testimonialsBadge: "प्रतिक्रिया",
      testimonialsTitle: "शेतकरी काय म्हणतात",
      testimonialsDesc: "खऱ्या शेतकऱ्यांचे खरे अनुभव",
      mobileBadge: "मोबाईल ॲप",
      mobileTitle: "एआय शक्ती तुमच्या खिशात ठेवा",
      mobileDesc: "एआय कृषी मित्र ॲप डाउनलोड करा आणि तुमची शेती आजच स्मार्ट बनवा!",
      scanToDownload: "स्कॅन करून डाउनलोड करा",
      contactTitle: "संपर्क",
      quickLinks: "द्रुत लिंक्स",
      resources: "संसाधने",
      company: "कंपनी",
      loveText: "भारतातील शेतकऱ्यांसाठी ❤ ने बनवले",
      liveMandi: "थेट मंडी बाजार",
      viewWeb: "किंवा वेब ॲप उघडा",
    },
    hi: {
      heroBadge: "AI संचालित कृषि प्लेटफॉर्म",
      heroTitle: "स्मार्ट खेती की शुरुआत AI से",
      heroDesc: "अपनी भाषा में AI-सक्षम फसल सलाह, मौसम अपडेट, बाजार अंतर्दृष्टि और विशेषज्ञ मार्गदर्शन प्राप्त करें।",
      tryAI: "AI सहायक का उपयोग करें",
      exploreFeatures: "विशेषताओं को देखें",
      howBadge: "सरल प्रक्रिया",
      howTitle: "AI कृषि मित्र कैसे काम करता है",
      howDesc: "चार आसान चरणों में कार्यप्रक्रिया",
      featuresBadge: "शक्तिशाली उपकरण",
      featuresTitle: "स्मार्ट खेती के लिए सब कुछ",
      featuresDesc: "स्मार्ट खेती के लिए सभी आवश्यक उपकरण एक ही स्थान पर",
      solutionsBadge: "सभी के लिए",
      solutionsTitle: "हर किसान के लिए समाधान",
      solutionsDesc: "छोटे, व्यावसायिक और सलाहकार खेतों के लिए समाधान",
      benefitsBadge: "लाभ",
      benefitsTitle: "AI कृषि मित्र क्यों चुनें?",
      benefitsDesc: "हमारे प्लेटफॉर्म को चुनने के छह बड़े कारण",
      testimonialsBadge: "प्रशंसापत्र",
      testimonialsTitle: "किसान क्या कहते हैं",
      testimonialsDesc: "असली किसानों के असली अनुभव",
      mobileBadge: "मोबाइल ऐप",
      mobileTitle: "AI शक्ति अपनी जेब में रखें",
      mobileDesc: "AI कृषि मित्र ऐप डाउनलोड करें और अपनी खेती को आज ही स्मार्ट बनाएं!",
      scanToDownload: "डाउनलोड के लिए स्कैन करें",
      contactTitle: "संपर्क करें",
      quickLinks: "त्वरित लिंक",
      resources: "संसाधन",
      company: "कंपनी",
      loveText: "भारत के किसानों के लिए ❤ से बनाया गया",
      liveMandi: "लाइव मंडी बाजार",
      viewWeb: "या अभी वेब ऐप चलाएं",
    }
  };

  return {
    marketTicker,
    heroStats,
    heroFeatures,
    howSteps,
    featureCards,
    solutions,
    whyChoose,
    testimonials,
    labels: labels[lang] || labels.en,
  };
};

const gridPattern: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

// ============================================================
// MAIN EXPORT COMPONENT
// ============================================================
export default function LandingPage({ onGetStarted, lang, setLang, user }: LandingPageProps) {
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const data = getLandingData(lang);
  const l = data.labels;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    if (!id) return;
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleTryAI = useCallback(() => {
    triggerHaptic();
    onGetStarted();
  }, [onGetStarted]);

  return (
    <main className="w-full min-h-screen bg-slate-950 text-white relative z-20 scroll-smooth selection:bg-emerald-500 selection:text-white overflow-x-hidden font-jakarta">
      {/* Scroll indicator progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 z-[60] origin-left shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        id="progress-bar"
      />

      {/* 1. Live Market Marquee Ticker */}
      <div className="relative z-50 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-emerald-600/20 border-b border-emerald-500/15 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2 w-max">
          {[...data.marketTicker, ...data.marketTicker, ...data.marketTicker].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-6 text-[11px] text-slate-300">
              <span className="text-emerald-400 font-semibold">{m.name}</span>
              <span className="text-white">₹{m.price.toLocaleString(lang === 'en' ? 'en-IN' : 'hi-IN')}</span>
              <span className="text-emerald-400 inline-flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />{m.change}
              </span>
              <span className="text-slate-600">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Interactive Navigation Header */}
      <header className={scrolled ? "sticky top-0 z-50 glass-strong border-b border-white/10 transition-all duration-300" : "sticky top-0 z-50 bg-transparent transition-all duration-300"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={(e) => handleScrollTo(e, '#home')} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/40 blur-lg rounded-full" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-950" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-left">
              <div className="font-bold text-[15px] text-white leading-tight">AI Krushi Mitra</div>
              <div className="text-[9.5px] text-emerald-400/80 leading-tight">Smart Farming, Better Tomorrow</div>
            </div>
          </button>

          {/* Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: isMr ? 'होम' : (isHi ? 'मुख्य' : 'Home'), target: '#home' },
              { label: isMr ? 'वैशिष्ट्ये' : (isHi ? 'विशेषताएं' : 'Features'), target: '#features' },
              { label: isMr ? 'कार्यपद्धती' : (isHi ? 'कार्यप्रणाली' : 'How It Works'), target: '#how' },
              { label: isMr ? 'समाधान' : (isHi ? 'समाधान' : 'Solutions'), target: '#solutions' },
              { label: isMr ? 'फायदे' : (isHi ? 'लाभ' : 'Why Choose Us'), target: '#why' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={(e) => handleScrollTo(e, item.target)}
                className="px-3 py-2 text-[13px] text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all font-semibold"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Lang Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-9 px-3 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-900 text-xs font-bold text-slate-200 transition-all flex items-center gap-1"
              >
                <span>{LANGUAGES.find((o) => o.code === lang)?.name || 'मराठी'}</span>
                <ChevronDown size={12} className={`opacity-60 transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-950 border border-white/10 rounded-xl shadow-2xl p-1 z-50">
                  {LANGUAGES.map((o) => (
                    <button
                      key={o.code}
                      onClick={() => { setLang(o.code as Language); setLangMenuOpen(false); triggerHaptic(); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${lang === o.code ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleTryAI}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 text-[13px] font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              {l.tryAI}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu container */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden glass-strong border-t border-white/10"
            >
              <div className="px-4 py-3 space-y-1">
                {[
                  { label: isMr ? 'होम' : (isHi ? 'मुख्य' : 'Home'), target: '#home' },
                  { label: isMr ? 'वैशिष्ट्ये' : (isHi ? 'विशेषताएं' : 'Features'), target: '#features' },
                  { label: isMr ? 'कार्यपद्धती' : (isHi ? 'कार्यप्रणाली' : 'How It Works'), target: '#how' },
                  { label: isMr ? 'समाधान' : (isHi ? 'समाधान' : 'Solutions'), target: '#solutions' },
                  { label: isMr ? 'फायदे' : (isHi ? 'लाभ' : 'Why Choose Us'), target: '#why' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => { handleScrollTo(e, item.target); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-[13px] text-slate-300 hover:text-white hover:bg-white/5 transition-all font-semibold"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { handleTryAI(); setMobileMenuOpen(false); }}
                  className="block w-full text-center px-3 py-2.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 text-[13px] font-bold"
                >
                  {l.tryAI}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. Hero Section (Animated with Framer Motion) */}
      <section id="home" className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Glowing Orbs */}
        <div className="absolute inset-0 pointer-events-none opacity-40" style={gridPattern} />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <img
          src="/landing/field-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side text column */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">{l.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-4 font-poppins">
                Smart Farming
                <br />
                Starts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 inline-block font-poppins">AI</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 max-w-xl">
                {l.heroDesc}
              </p>

              {/* Feature icons checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
                {data.heroFeatures.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/20 transition-all"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${f.color}1a`, border: `1px solid ${f.color}33` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: f.color }} />
                      </div>
                      <div className="text-[10.5px] font-semibold text-white leading-tight">{f.label}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <button
                  onClick={handleTryAI}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 text-[14px] font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95"
                >
                  {l.tryAI}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={(e) => handleScrollTo(e, '#features')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-[14px] font-semibold hover:bg-white/10 transition-all"
                >
                  {l.exploreFeatures}
                </button>
              </div>

              {/* Social proofs */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[14px] font-bold text-white">4.8/5</span>
                </div>
                <div className="h-4 w-px bg-white/15" />
                <div className="text-[12px] text-slate-300">
                  Loved by <span className="text-emerald-400 font-bold">50,000+</span> farmers
                </div>
              </div>
            </motion.div>

            {/* Right farmer screenshot visuals */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 via-transparent to-teal-500/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 glow-emerald">
                  <img
                    src="/landing/hero-farmer.png"
                    alt="Happy Indian farmer using AI Krushi Mitra app"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
                </div>

                {/* Floating app stats preview card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 w-48 glass-strong rounded-2xl p-3.5 border border-emerald-500/20 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <Leaf className="w-3.5 h-3.5 text-emerald-950" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400">श्री रामानंद</div>
                      <div className="text-[9px] text-emerald-400">Gayatri Farm</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">{isMr ? 'पीक सल्ला' : (isHi ? 'फसल सलाह' : 'Crop Advice')}</span>
                      <span className="text-emerald-400 font-bold">+15%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">{isMr ? 'माती आरोग्य' : (isHi ? 'मृदा स्वास्थ्य' : 'Soil Health')}</span>
                      <span className="text-white font-bold">94%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 inline-flex items-center gap-1"><Droplets className="w-2.5 h-2.5" /> {isMr ? 'आर्द्रता' : (isHi ? 'आर्द्रता' : 'Humidity')}</span>
                      <span className="text-white font-bold">70%</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">{isMr ? 'तापमान' : (isHi ? 'तापमान' : 'Temp')}</span>
                      <span className="text-amber-400 font-bold">28°C</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating percentage metric badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-2 glass-strong rounded-2xl px-3.5 py-2 border border-emerald-500/20 shadow-2xl"
                >
                  <div className="text-[9px] text-slate-400">{isMr ? 'उत्पादन वाढ' : (isHi ? 'उपज वृद्धि' : 'Yield Increase')}</div>
                  <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">+18%</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-14 pt-8 border-t border-white/5"
          >
            {data.heroStats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{s.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how" className="relative py-16 sm:py-24 border-t border-white/5 bg-slate-950">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={gridPattern} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{l.howBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{l.howTitle}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{l.howDesc}</p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashed connector line */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="#10b981" strokeWidth="2" strokeDasharray="4 6" opacity="0.3" />
              </svg>
            </div>

            {data.howSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center mb-4 glass border-2"
                    style={{ borderColor: `${step.color}40` }}
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-40"
                      style={{ backgroundColor: step.color }}
                    />
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${step.color}1a`, border: `1px solid ${step.color}40` }}>
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white text-slate-900 text-[12px] font-black flex items-center justify-center border border-[#0a0f1c]">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-[12px] text-slate-400 leading-snug max-w-[200px]">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="relative py-16 sm:py-24 border-t border-white/5 bg-slate-950">
        <div className="absolute -top-20 left-0 w-[500px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{l.featuresBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{l.featuresTitle}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{l.featuresDesc}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.featureCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  onClick={handleTryAI}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative glass card-hover rounded-2xl p-5 cursor-pointer overflow-hidden text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${card.color}1a`, borderColor: `${card.color}33` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: card.color }} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-[15px] font-black text-white leading-tight">{card.title}</div>
                    <p className="text-[12px] text-slate-400 leading-snug mt-2">{card.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Solutions Section */}
      <section id="solutions" className="relative py-16 sm:py-24 border-t border-white/5 bg-slate-950">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{l.solutionsBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{l.solutionsTitle}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{l.solutionsDesc}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {data.solutions.map((sol, i) => (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative glass card-hover rounded-2xl overflow-hidden border border-white/5 bg-slate-900/40"
              >
                {/* Visual Image Header */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={sol.image}
                    alt={sol.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  {/* Accent pill */}
                  <div
                    className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
                    style={{ backgroundColor: `${sol.color}26`, border: `1px solid ${sol.color}55` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sol.color }} />
                  </div>
                </div>

                {/* Info Content Area */}
                <div className="p-5">
                  <h3 className="text-[17px] font-bold text-white mb-1 leading-tight">{sol.title}</h3>
                  <p className="text-[12.5px] text-slate-400 leading-snug mb-4">{sol.desc}</p>

                  <ul className="space-y-1.5 mb-5 text-left">
                    {sol.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-[12px] text-slate-300">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${sol.color}1a` }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: sol.color }} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleTryAI}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold hover:gap-2 transition-all"
                    style={{ color: sol.color }}
                  >
                    {isMr ? 'अधिक जाणून घ्या' : (isHi ? 'अधिक जानें' : 'Learn more')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why Choose Us Section */}
      <section id="why" className="relative py-16 sm:py-24 border-t border-white/5 bg-slate-950">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={gridPattern} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{l.benefitsBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{l.benefitsTitle}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{l.benefitsDesc}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.whyChoose.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group relative glass card-hover rounded-2xl p-5 overflow-hidden text-left"
                >
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}1a`, borderColor: `${item.color}33` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-[16px] font-bold text-white mb-1 leading-tight">{item.title}</h3>
                    <p className="text-[12.5px] text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="relative py-16 sm:py-24 border-t border-white/5 bg-slate-950">
        <div className="absolute -top-20 right-0 w-[500px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{l.testimonialsBadge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">{l.testimonialsTitle}</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{l.testimonialsDesc}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {data.testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative glass card-hover rounded-2xl p-5 text-left"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5" fill="currentColor" />

                {/* Stars ratings */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                  ))}
                </div>

                <p className="text-[13px] text-slate-200 leading-relaxed mb-5 italic font-medium">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author Profile */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base border"
                    style={{ backgroundColor: `${t.color}1a`, borderColor: `${t.color}33`, color: t.color }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white">{t.name}</div>
                    <div className="text-[10.5px] text-slate-400">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. App Download Banner CTA */}
      <section className="relative py-16 sm:py-20 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-emerald-500/20"
          >
            {/* Visual glow details */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-teal-600/15" />
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={gridPattern} />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              {/* Text content details */}
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-4">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{l.mobileBadge}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                  Take AI Power<br />In Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 inline-block font-poppins">Pocket</span>
                </h2>
                <p className="text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
                  {l.mobileDesc}
                </p>

                {/* Badge actions */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <button
                    onClick={handleTryAI}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
                  >
                    <Play className="w-5 h-5 text-white" fill="currentColor" />
                    <div className="text-left">
                      <p className="text-[8.5px] text-slate-300 leading-none">GET IT ON</p>
                      <p className="text-[13px] font-bold text-white leading-tight">Google Play</p>
                    </div>
                  </button>
                  <button
                    onClick={handleTryAI}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
                  >
                    <Apple className="w-5 h-5 text-white" fill="currentColor" />
                    <div className="text-left">
                      <p className="text-[8.5px] text-slate-300 leading-none">Download on the</p>
                      <p className="text-[13px] font-bold text-white leading-tight">App Store</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleTryAI}
                  className="text-[12px] text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 font-bold"
                >
                  {l.viewWeb} →
                </button>
              </div>

              {/* Graphical screenshot mockups + QR */}
              <div className="relative flex items-center justify-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute -inset-3 bg-emerald-500/30 blur-2xl rounded-3xl" />
                  <img
                    src="/landing/app-mockup.png"
                    alt="AI Krushi Mitra mobile app"
                    className="relative w-44 sm:w-52 h-auto rounded-2xl border border-emerald-500/20 animate-float"
                  />
                </motion.div>

                {/* QR code container */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="glass-strong rounded-2xl p-4 border border-white/15"
                >
                  <div className="w-24 h-24 rounded-xl bg-white p-2 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-[9.5px] text-center text-slate-300 mt-2 font-bold">{l.scanToDownload}</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. Footer Section */}
      <footer className="relative mt-16 border-t border-white/5 bg-[#050b14] py-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={gridPattern} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {/* Brand Logo & description column */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-950" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-white leading-tight font-poppins">AI Krushi Mitra</div>
                  <div className="text-[9.5px] text-emerald-400/80 leading-tight">Smart Farming, Better Tomorrow</div>
                </div>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed mb-4">
                AI Krushi Mitra is your smart farming companion that helps you make better decisions, increase yield and grow profitably with the power of AI.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-[13px] font-bold text-white mb-3">{l.quickLinks}</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Dashboard</button></li>
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Features</button></li>
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">How It Works</button></li>
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Market Prices</button></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-[13px] font-bold text-white mb-3">{l.resources}</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Blog</button></li>
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Farming Guides</button></li>
                <li><button onClick={handleTryAI} className="text-slate-400 hover:text-emerald-400 transition-colors">Help Center</button></li>
              </ul>
            </div>

            {/* Contact Details Column */}
            <div>
              <h4 className="text-[13px] font-bold text-white mb-3">{l.contactTitle}</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+91 99999 99999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@aikrushimitra.in</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                  <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© 2025 AI Krushi Mitra. All rights reserved.</div>
            <div className="inline-flex items-center gap-1.5 font-semibold">
              {l.loveText} 🇮🇳
            </div>
          </div>
        </div>
      </footer>

      {/* Floating 24/7 Support Agent Widget */}
      <SupportAgentWidget lang={lang} user={user} />

      <script dangerouslySetInnerHTML={{
        __html: `
        (function() {
          const progressBar = document.getElementById('progress-bar');
          if (!progressBar) return;
          window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
          }, { passive: true });
        })();
      `}} />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}} />
    </main>
  );
}

// ============================================================
// LIVE AI SUPPORT AGENT WIDGET
// ============================================================
const SupportAgentWidget = ({ lang, user }: { lang: Language; user?: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [ticketCreatedAt, setTicketCreatedAt] = useState<number | null>(null);

  const isMarathi = lang === 'mr';

  useEffect(() => {
    const fetchExistingTicket = async () => {
      const searchPhone = phone;
      const searchUid = user ? (user.email || '') : '';

      if (!searchUid && !searchPhone) {
        if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
        return;
      }

      try {
        const q = query(
          collection(db, 'supportTickets'),
          where(searchUid ? 'userId' : 'phone', '==', searchUid ? searchUid : searchPhone),
          orderBy('updatedAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setTicketId(docData.id);
          setName(docData.name || '');
          setPhone(docData.phone || '');
          setVillage(docData.village || '');
          setTicketCreatedAt(docData.createdAt || Date.now());

          const history = docData.messages || [];
          if (history.length > 0) {
            setMessages(history);
          } else if (user) {
            setMessages([
              {
                role: 'agent',
                text: isMarathi
                  ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                  : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
              }
            ]);
          }
          setStep('chat');
        } else if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
      } catch (err) {
        console.warn("Could not check/load existing support ticket:", err);
        if (user) {
          setStep('chat');
          setMessages([
            {
              role: 'agent',
              text: isMarathi
                ? `नमस्कार ${user.name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. कृपया आपला शेतविषयक प्रश्न विचारा.`
                : `Hello ${user.name}! Welcome to AI Krushi Mitra Support. How can we help you today?`
            }
          ]);
        }
      }
    };

    if (isOpen) {
      if (user) {
        setName(user.name || '');
        setPhone(user.email || '');
        setVillage(user.village || '');
      }
      fetchExistingTicket();
    }
  }, [isOpen, user]);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !enquiry) return;

    setLoading(true);
    triggerHaptic();

    try {
      let newTicketId = ticketId || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdAt = ticketCreatedAt || Date.now();

      const initialUserText = enquiry;
      const agentGreeting = isMarathi
        ? `नमस्कार ${name} जी! AI कृषी मित्र सपोर्टमध्ये आपले स्वागत आहे. तुमचा सपोर्ट आयडी आहे: ${newTicketId}.\n\nउत्तर:`
        : `Hello ${name}! Welcome to AI Krushi Mitra Live Support (ID: ${newTicketId}).\n\nImmediate advice:`;

      const aiAnswer = await getAIFarmingAdvice(enquiry, lang, 'Customer Support Enquiry');

      const newMessages = [
        { role: 'user', text: initialUserText },
        { role: 'agent', text: `${agentGreeting}\n\n${aiAnswer}` }
      ] as any[];

      try {
        const ticketRef = doc(db, 'supportTickets', newTicketId);
        await setDoc(ticketRef, {
          id: newTicketId,
          userId: user ? (user.email || 'guest') : 'guest',
          name,
          phone,
          village,
          lastEnquiry: initialUserText,
          lang,
          createdAt,
          updatedAt: Date.now(),
          status: 'open',
          messages: newMessages
        });
      } catch (fsErr) {
        console.error("Firestore logging failed:", fsErr);
      }

      setTicketId(newTicketId);
      setTicketCreatedAt(createdAt);
      setMessages(newMessages);
      setStep('chat');
    } catch (err) {
      setMessages([
        { role: 'user', text: enquiry },
        { role: 'agent', text: isMarathi ? 'तुमचा प्रश्न नोंदवला गेला आहे. प्रतिनिधी संपर्क करतील.' : 'Registered. Our representative will contact you.' }
      ]);
      setStep('chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const updatedMessages = [...messages, { role: 'user', text: userText }] as any[];
    setMessages(updatedMessages);
    setLoading(true);
    triggerHaptic();

    try {
      const aiResponse = await getAIFarmingAdvice(userText, lang, 'Live Customer Support');
      const finalMessages = [...updatedMessages, { role: 'agent', text: aiResponse }] as any[];

      let currentTicketId = ticketId;
      if (!currentTicketId) {
        currentTicketId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        setTicketId(currentTicketId);
      }

      try {
        const ticketRef = doc(db, 'supportTickets', currentTicketId);
        await setDoc(ticketRef, {
          id: currentTicketId,
          userId: user ? (user.email || 'guest') : 'guest',
          name: name || user?.name || 'Guest User',
          phone: phone || user?.email || '',
          village: village || user?.village || '',
          lastEnquiry: userText,
          lang,
          createdAt: ticketCreatedAt || Date.now(),
          updatedAt: Date.now(),
          status: 'open',
          messages: finalMessages
        });
      } catch (fsErr) {
        console.error("Firestore update failed:", fsErr);
      }

      setMessages(finalMessages);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: isMarathi ? 'क्षमस्व, संपर्क साधण्यात अडचण आली.' : 'Failed to connect.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
        {!isOpen && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-lg shadow-emerald-500/30 animate-bounce flex items-center gap-1.5 border border-white/10">
            <Sparkles size={14} /> {isMarathi ? '24/7 लाइव्ह सपोर्ट' : '24/7 Live Support'}
          </div>
        )}
        <button
          onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative group"
        >
          {isOpen ? <X size={24} /> : <Headphones size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[75vh] bg-slate-950/95 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl shadow-2xl z-[999] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="bg-slate-900 p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Headphones size={18} className="text-emerald-400" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">AI Krushi Support</h3>
                <p className="text-[10px] text-emerald-400 font-medium">{isMarathi ? 'ऑनलाइन' : 'Online'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[45vh] space-y-3">
            {step === 'form' ? (
              <form onSubmit={handleSubmitEnquiry} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Phone</label>
                  <input
                    type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Village</label>
                  <input
                    type="text" value={village} onChange={e => setVillage(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Query</label>
                  <textarea
                    required rows={3} value={enquiry} onChange={e => setEnquiry(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex justify-center items-center gap-1.5 active:scale-95 transition-transform">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Submit Request
                </button>
              </form>
            ) : (
              <div className="space-y-2.5 text-left">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-300 rounded-bl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-slate-900 text-slate-300 rounded-bl-none flex gap-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {step === 'chat' && (
            <form onSubmit={handleSendFollowUp} className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
              <input
                type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask follow-up..." className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
              <button type="submit" disabled={loading} className="px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-95 transition-transform flex items-center justify-center">
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

// Simplified component mapping since Framer motion is imported as Menu icon
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}