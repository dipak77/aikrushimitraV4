import React, { useState, useEffect } from 'react';
import SimpleView from '../layout/SimpleView';
import { Language } from '../../types';
import { 
  Sprout, 
  Activity, 
  ClipboardCheck, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Leaf, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'शेत आणि पीक प्रगती विवरण',
    back: 'मागे',
    allTab: 'सर्व तपशील',
    floweringTab: 'फुलोरा अवस्था',
    healthTab: 'आरोग्य स्कोअर',
    tasksTab: 'आजचे कार्य',
    
    // Flowering stage texts
    floweringTitle: 'फुलोरा अवस्था (Flowering Stage)',
    floweringDesc: 'पिकाच्या सर्वाधिक संवेदनशील वाढीचा काळ. या काळात फुलांची गळती रोखण्यासाठी आणि फवारणीचे योग्य नियोजन करण्यासाठी खालील बाबींचे पालन करा.',
    ndviScore: 'NDVI निर्देशांक',
    ndviStatus: 'निरोगी पीक',
    moisture: 'हवेतील आर्द्रता',
    temp: 'तापमान',
    yieldPotential: 'उत्पादन वाढ क्षमता',
    yieldPotentialVal: '+१५% वाढीची शक्यता',
    healthPct: 'पिकाचे आरोग्य',
    advisoryTitle: 'कृषी वैज्ञानिक सल्ला व शिफारसी',
    fertilizerAdv: 'खत व्यवस्थापन: फुलोरा अवस्थेत (४५-५० दिवस) २% युरिया + ०.५% सूक्ष्म अन्नद्रव्य मिश्रणाची फवारणी करावी. जमिनीत ओलावा असतानाच खते द्यावीत.',
    irrigationAdv: 'पाणी व्यवस्थापन: सिंचन संतुलित ठेवावे, पाणी जास्त साचल्यास किंवा कमी पडल्यास फुलांची गळती होते. सकाळी किंवा संध्याकाळी पाणी देणे उत्तम.',
    pestAdv: 'कीड व रोग नियंत्रण: फुलकिडे आणि मावा किडींचा प्रादुर्भाव वाढू शकतो. ५% निंबोळी अर्काची पहिली फवारणी करावी.',
    ndviChartTitle: 'मागील ४ आठवड्यांतील NDVI वाढ',

    // Farm Health Score texts
    healthTitle: 'फार्म हेल्थ स्कोर (Farm Health Score)',
    healthDesc: 'तुमच्या शेतीचे एकूण आरोग्य स्कोअर. हा स्कोअर आजची कार्ये आणि नियोजनावर आधारित आहे. तो १००% पर्यंत नेण्यासाठी सर्व कार्ये पूर्ण करा.',
    overallScore: 'एकूण आरोग्य स्कोअर',
    healthBreakdown: 'आरोग्य विभागणी',
    soilHealth: 'मातीचे आरोग्य',
    cropHealth: 'पिकाचे आरोग्य',
    waterMgmt: 'पाणी व्यवस्थापन',
    pestRisk: 'कीड धोका नियंत्रण',
    howToImprove: 'स्कोअर सुधारण्यासाठी आवश्यक उपाय',
    improveFertilizer: 'खत व्यवस्थापन पूर्ण करा (स्कोअर +१०% वाढेल)',
    improvePlanning: 'गट नियोजन कार्य पूर्ण करा (स्कोअर +३% वाढेल)',
    improveIrrigation: 'पाणी देणे (सिंचन) पूर्ण करा (स्कोअर +५% वाढेल)',
    excellentStatus: 'उत्तम स्थिती',
    goodStatus: 'चांगली स्थिती',
    adequateStatus: 'योग्य स्थिती',
    lowRisk: 'कमी धोका',

    // Tasks texts
    tasksTitle: 'आजचे कार्य (Today\'s Tasks)',
    tasksDesc: 'तुमच्या दैनंदिन कृषी कामांची यादी. कामे पूर्ण करून चेक करा म्हणजे तुमचा फार्म हेल्थ स्कोअर आपोआप वाढेल.',
    progressText: 'कामाची प्रगती',
    highPriority: 'अति महत्त्वाचे (High Priority)',
    mediumPriority: 'मध्यम (Medium Priority)',
    lowPriority: 'कमी महत्त्वाचे (Low Priority)',
    addTaskPlaceholder: 'नवीन काम लिहा...',
    addTaskBtn: 'काम जोडा',
    noTasks: 'कोणतीही कामे शिल्लक नाहीत!',
    remaining: 'बाकी',
    completed: 'पूर्ण',
    createdText: 'नवीन कार्य जोडले गेले',
  },
  hi: {
    title: 'फसल और खेत विवरण',
    back: 'पीछे',
    allTab: 'सभी विवरण',
    floweringTab: 'फूलने की अवस्था',
    healthTab: 'स्वास्थ्य स्कोर',
    tasksTab: 'आज के कार्य',
    
    // Flowering stage texts
    floweringTitle: 'फूलने की अवस्था (Flowering Stage)',
    floweringDesc: 'फसल के सबसे संवेदनशील विकास का समय। फूलों को गिरने से रोकने और छिड़काव की योजना बनाने के लिए निम्नलिखित बातों का पालन करें।',
    ndviScore: 'NDVI सूचकांक',
    ndviStatus: 'स्वस्थ फसल',
    moisture: 'हवा में नमी',
    temp: 'तापमान',
    yieldPotential: 'उपज वृद्धि क्षमता',
    yieldPotentialVal: '+१५% वृद्धि की संभावना',
    healthPct: 'फसल स्वास्थ्य',
    advisoryTitle: 'कृषि वैज्ञानिक सलाह और सिफारिशें',
    fertilizerAdv: 'उर्वरक प्रबंधन: फूल आने की अवस्था (45-50 दिन) में 2% यूरिया + 0.5% सूक्ष्म पोषक तत्व मिश्रण का छिड़काव करें। जमीन में नमी होने पर ही खाद दें।',
    irrigationAdv: 'जल प्रबंधन: सिंचाई संतुलित रखें, पानी अधिक होने या कम होने से फूल गिर जाते हैं। सुबह या शाम को सिंचाई करना सर्वोत्तम है।',
    pestAdv: 'कीट और रोग नियंत्रण: थ्रिप्स और एफिड्स का प्रकोप बढ़ सकता है। 5% नीम के अर्क का पहला छिड़काव करें।',
    ndviChartTitle: 'पिछले ४ सप्ताह में NDVI वृद्धि',

    // Farm Health Score texts
    healthTitle: 'फार्म हेल्थ स्कोर (Farm Health Score)',
    healthDesc: 'आपके खेत का कुल स्वास्थ्य स्कोर। यह स्कोर आज के कार्यों और नियोजन पर आधारित है। इसे 100% तक ले जाने के लिए सभी कार्य पूर्ण करें।',
    overallScore: 'कुल स्वास्थ्य स्कोर',
    healthBreakdown: 'स्वास्थ्य विश्लेषण',
    soilHealth: 'मिट्टी का स्वास्थ्य',
    cropHealth: 'फसल का स्वास्थ्य',
    waterMgmt: 'जल प्रबंधन',
    pestRisk: 'कीट जोखिम नियंत्रण',
    howToImprove: 'स्कोर सुधारने के उपाय',
    improveFertilizer: 'उर्वरक प्रबंधन पूरा करें (स्कोर +१०% बढ़ेगा)',
    improvePlanning: 'समूह नियोजन कार्य पूरा करें (स्कोर +३% बढ़ेगा)',
    improveIrrigation: 'सिंचाई कार्य पूरा करें (स्कोर +५% बढ़ेगा)',
    excellentStatus: 'उत्तम स्थिति',
    goodStatus: 'अच्छी स्थिति',
    adequateStatus: 'उचित स्थिति',
    lowRisk: 'कम जोखिम',

    // Tasks texts
    tasksTitle: 'आज के कार्य (Today\'s Tasks)',
    tasksDesc: 'आपके दैनिक कृषि कार्यों की सूची। कार्यों को पूरा करके चेक करें ताकि आपका फार्म हेल्थ स्कोर स्वचालित रूप से बढ़ सके।',
    progressText: 'कार्य प्रगति',
    highPriority: 'अति आवश्यक (High Priority)',
    mediumPriority: 'मध्यम (Medium Priority)',
    lowPriority: 'सामान्य (Low Priority)',
    addTaskPlaceholder: 'नया कार्य लिखें...',
    addTaskBtn: 'कार्य जोड़ें',
    noTasks: 'कोई कार्य शेष नहीं है!',
    remaining: 'शेष',
    completed: 'पूर्ण',
    createdText: 'नया कार्य जोड़ा गया',
  },
  en: {
    title: 'Farm & Crop Insights',
    back: 'Back',
    allTab: 'All Details',
    floweringTab: 'Flowering Stage',
    healthTab: 'Health Score',
    tasksTab: 'Today\'s Tasks',
    
    // Flowering stage texts
    floweringTitle: 'Flowering Stage',
    floweringDesc: 'This is the most critical stage of crop growth. Follow the advice below to prevent flower drop and manage sprays.',
    ndviScore: 'NDVI Index',
    ndviStatus: 'Healthy Crop',
    moisture: 'Air Moisture',
    temp: 'Temperature',
    yieldPotential: 'Yield Potential',
    yieldPotentialVal: '+15% Potential Increase',
    healthPct: 'Crop Health',
    advisoryTitle: 'Agri-Scientific Advisory & Recommendations',
    fertilizerAdv: 'Fertilizer: During flowering (45-50 days), spray 2% Urea + 0.5% micronutrient mix. Apply only when there is soil moisture.',
    irrigationAdv: 'Irrigation: Maintain balanced watering. Excess or shortage of water causes flowers to drop. Water in early morning or late evening.',
    pestAdv: 'Pest & Disease: Thrips and aphids risk is higher. Spray 5% neem oil emulsion as a preventive measure.',
    ndviChartTitle: 'NDVI Growth Trend (Last 4 Weeks)',

    // Farm Health Score texts
    healthTitle: 'Farm Health Score',
    healthDesc: 'The overall health of your farm, calculated based on soil quality, crop conditions, and task compliance. Complete tasks to reach 100%.',
    overallScore: 'Overall Health Score',
    healthBreakdown: 'Health Breakdown',
    soilHealth: 'Soil Health',
    cropHealth: 'Crop Health',
    waterMgmt: 'Water Management',
    pestRisk: 'Pest Risk Control',
    howToImprove: 'How to Improve Score',
    improveFertilizer: 'Complete fertilizer application (+10% score)',
    improvePlanning: 'Complete group planning task (+3% score)',
    improveIrrigation: 'Complete irrigation task (+5% score)',
    excellentStatus: 'Excellent',
    goodStatus: 'Good',
    adequateStatus: 'Adequate',
    lowRisk: 'Low Risk',

    // Tasks texts
    tasksTitle: 'Today\'s Tasks',
    tasksDesc: 'Check list of your farming operations for today. Toggling tasks will automatically recalculate your Farm Health Score.',
    progressText: 'Progress',
    highPriority: 'High Priority',
    mediumPriority: 'Medium Priority',
    lowPriority: 'Low Priority',
    addTaskPlaceholder: 'Enter new task...',
    addTaskBtn: 'Add Task',
    noTasks: 'No tasks left!',
    remaining: 'Remaining',
    completed: 'Completed',
    createdText: 'New task added',
  }
};

interface TaskItem {
  id: number;
  label: { mr: string; hi: string; en: string };
  done: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  scoreContribution: number;
}

export const FarmDetailPage = ({ lang, onBack }: { lang: Language; onBack: () => void }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [activeTab, setActiveTab] = useState<'all' | 'flowering' | 'health' | 'tasks'>('all');
  const [mounted, setMounted] = useState(false);

  // Shared Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, label: { mr: 'बियाणे पेरणी', hi: 'बीज बुवाई', en: 'Seed Sowing' }, done: true, priority: 'medium', category: 'sowing', scoreContribution: 15 },
    { id: 2, label: { mr: 'जमिनीची मशागत', hi: 'जमीन तैयारी', en: 'Land Preparation' }, done: true, priority: 'medium', category: 'soil', scoreContribution: 15 },
    { id: 3, label: { mr: '१२:६१:०० खताची फवारणी', hi: 'खाद डालना', en: 'Fertilizer Application' }, done: false, priority: 'high', category: 'fertilizer', scoreContribution: 10 },
    { id: 4, label: { mr: 'कृषी गट नियोजन बैठक', hi: 'समूह नियोजन', en: 'Group Planning' }, done: false, priority: 'low', category: 'planning', scoreContribution: 5 },
    { id: 5, label: { mr: 'पीक पाणी व्यवस्थापन (सिंचन)', hi: 'सिंचाई', en: 'Crop Irrigation' }, done: false, priority: 'high', category: 'water', scoreContribution: 5 },
  ]);

  const [newTaskText, setNewTaskText] = useState('');

  // Calculate dynamic health score: 52% base + completed tasks contributions
  const completedContributions = tasks.filter(tk => tk.done).reduce((acc, tk) => acc + tk.scoreContribution, 0);
  const rawScore = 52 + completedContributions;
  const activeScore = Math.min(rawScore, 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTask = (id: number) => {
    triggerHaptic();
    setTasks(prev => prev.map(tk => tk.id === id ? { ...tk, done: !tk.done } : tk));
  };

  const handleDeleteTask = (id: number) => {
    triggerHaptic();
    setTasks(prev => prev.filter(tk => tk.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    triggerHaptic();
    const newTask: TaskItem = {
      id: Date.now(),
      label: { mr: newTaskText, hi: newTaskText, en: newTaskText },
      done: false,
      priority: 'medium',
      category: 'custom',
      scoreContribution: 5
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  const doneCount = tasks.filter(tk => tk.done).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // NDVI SVG chart values (Last 4 weeks)
  const chartPoints = [
    { label: 'Week 1', val: 0.50, x: 20, y: 130 },
    { label: 'Week 2', val: 0.62, x: 110, y: 100 },
    { label: 'Week 3', val: 0.74, x: 200, y: 65 },
    { label: 'Week 4', val: 0.82, x: 290, y: 40 }
  ];

  // Circle meter math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  return (
    <SimpleView title={t.title} onBack={onBack}>
      <div className="space-y-6 pb-24 animate-enter">
        
        {/* ==================== Navigation Tabs ==================== */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: t.allTab, icon: Sprout, color: 'text-emerald-400' },
            { id: 'flowering', label: t.floweringTab, icon: Sprout, color: 'text-[#a3e635]' },
            { id: 'health', label: t.healthTab, icon: Activity, color: 'text-cyan-400' },
            { id: 'tasks', label: t.tasksTab, icon: ClipboardCheck, color: 'text-violet-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); triggerHaptic(); }}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-1 justify-center border",
                  active
                    ? "bg-white/[0.08] text-white border-white/[0.12] shadow-lg"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                )}
              >
                <Icon size={14} className={clsx(tab.color, active ? "scale-110" : "")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== ALL SUMMARY VIEW ==================== */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Flowering Stage Summary Card */}
            <div 
              onClick={() => { setActiveTab('flowering'); triggerHaptic(); }}
              className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] hover:border-[#a3e635]/40 bg-gradient-to-br from-[#102a10]/40 to-slate-900/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#a3e635]">
                    <Sprout size={16} />
                  </div>
                  <h3 className="font-black text-white text-base">{t.floweringTab}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#a3e635]">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{t.healthPct}:</span>
                  <span className="font-extrabold text-emerald-400">94%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{t.yieldPotential}:</span>
                  <span className="font-extrabold text-[#a3e635]">{t.yieldPotentialVal}</span>
                </div>
                <div className="flex gap-2 text-xs pt-1">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">{chartPoints[3].val} NDVI</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">28°C</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">68% Humidity</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors">
                <span>विस्तृत शिफारसी पहा (View recommendations)</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Farm Health Score Summary Card */}
            <div 
              onClick={() => { setActiveTab('health'); triggerHaptic(); }}
              className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] hover:border-cyan-400/40 bg-gradient-to-br from-cyan-950/20 to-slate-900/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Activity size={16} />
                  </div>
                  <h3 className="font-black text-white text-base">{t.healthTab}</h3>
                </div>
                <div className="text-2xl font-black text-cyan-400">{activeScore}%</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${activeScore}%` }} />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{t.soilHealth}: 95%</span>
                  <span>{t.cropHealth}: 94%</span>
                </div>
                <p className="text-xs text-slate-400 italic line-clamp-1 mt-1">
                  {tasks.filter(tk => !tk.done).length > 0 ? `${t.howToImprove}: ${(tasks.find(tk => !tk.done)?.label as any)[lang] || ''}` : t.excellentStatus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors">
                <span>आरोग्य विभागणी पहा (View health breakdown)</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Today's Tasks Summary Card */}
            <div 
              onClick={() => { setActiveTab('tasks'); triggerHaptic(); }}
              className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] hover:border-violet-400/40 bg-gradient-to-br from-violet-950/20 to-slate-900/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <ClipboardCheck size={16} />
                  </div>
                  <h3 className="font-black text-white text-base">{t.tasksTab}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">{doneCount}/{totalCount} {t.completed}</span>
              </div>

              <div className="space-y-3">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="space-y-1.5">
                  {tasks.slice(0, 2).map((tk) => (
                    <div key={tk.id} className="flex items-center gap-2 text-xs">
                      <span className={clsx("w-1.5 h-1.5 rounded-full", tk.done ? "bg-emerald-400" : "bg-zinc-600")} />
                      <span className={clsx("truncate text-zinc-300", tk.done && "line-through text-slate-500")}>
                        {(tk.label as any)[lang] || tk.label.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors">
                <span>कामे पूर्ण करा व जोडा (Manage tasks)</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        )}

        {/* ==================== FLOWERING STAGE DETAILS ==================== */}
        {activeTab === 'flowering' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Detail Panel */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              
              {/* Header Info */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] bg-[#0a1b0a]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[64px] pointer-events-none" />
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  <Sprout className="text-[#a3e635]" /> {t.floweringTitle}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{t.floweringDesc}</p>
              </div>

              {/* Advisory List */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-4">
                <h4 className="text-base font-extrabold text-white pb-2 border-b border-white/5 flex items-center gap-2">
                  <Info size={16} className="text-[#a3e635]" /> {t.advisoryTitle}
                </h4>
                
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[#a3e635] text-xs font-bold">1</div>
                    <p className="text-zinc-300 leading-relaxed">{t.fertilizerAdv}</p>
                  </div>
                  
                  <div className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[#a3e635] text-xs font-bold">2</div>
                    <p className="text-zinc-300 leading-relaxed">{t.irrigationAdv}</p>
                  </div>

                  <div className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[#a3e635] text-xs font-bold">3</div>
                    <p className="text-zinc-300 leading-relaxed">{t.pestAdv}</p>
                  </div>
                </div>
              </div>

              {/* Warning Alert Panel */}
              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 flex gap-3.5 items-start">
                <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold text-amber-300 text-sm">
                    {lang === 'mr' ? 'फूल गळतीचा धोका!' : lang === 'hi' ? 'फूल झड़ने का खतरा!' : 'Flower Drop Warning!'}
                  </h5>
                  <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
                    {lang === 'mr' 
                      ? 'हवेतील तापमान २८ अंश सेल्सियस पेक्षा जास्त होत असल्याने पाणी देण्याची वेळ काळजीपूर्वक पाळा. जमिनीत पाण्याचा ताण पडल्यास किंवा जास्त पाणी साचल्यास फुले गळू शकतात.' 
                      : lang === 'hi' 
                        ? 'तापमान 28 डिग्री सेल्सियस से अधिक होने के कारण सिंचाई का समय सावधानीपूर्वक निर्धारित करें। जमीन में पानी की कमी या अधिकता से फूल झड़ सकते हैं।' 
                        : 'With temperatures around 28°C, carefully monitor watering. Both water stress and excess logging trigger premature flower drop.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Widget Panel */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              {/* Climate Widget */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {lang === 'mr' ? 'पर्यावरण स्थिती' : lang === 'hi' ? 'पर्यावरण स्थिति' : 'Climate Conditions'}
                </h4>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between h-24">
                    <Thermometer size={20} className="text-amber-400" />
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">{t.temp}</span>
                      <span className="text-lg font-black text-zinc-100">28°C</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between h-24">
                    <Droplets size={20} className="text-sky-400" />
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">{t.moisture}</span>
                      <span className="text-lg font-black text-zinc-100">68%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] col-span-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Leaf size={14} />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium block">{t.ndviScore}</span>
                        <span className="text-sm font-black text-white">0.82 • {t.ndviStatus}</span>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* NDVI SVG Chart */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{t.ndviChartTitle}</h4>
                
                <div className="relative w-full h-[160px] bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-end p-2">
                  <svg className="w-full h-full" viewBox="0 0 310 150">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* SVG grid lines */}
                    <line x1="20" y1="130" x2="290" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="20" y1="90" x2="290" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="20" y1="50" x2="290" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Gradient Area under curve */}
                    <path
                      d="M20 130 L 20 130 L 110 100 L 200 65 L 290 40 L 290 130 Z"
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Line path */}
                    <path
                      d="M20 130 L 110 100 L 200 65 L 290 40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Nodes */}
                    {chartPoints.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          className="fill-emerald-400 stroke-slate-900 stroke-2"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          fontSize="9"
                          fontWeight="bold"
                          fill="#a3e635"
                          textAnchor="middle"
                        >
                          {pt.val}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">
                  <span>Wk 1 (0.50)</span>
                  <span>Wk 2 (0.62)</span>
                  <span>Wk 3 (0.74)</span>
                  <span>Wk 4 (0.82)</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== FARM HEALTH SCORE DETAILS ==================== */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Dynamic Score Indicator Panel */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              
              <div className="glass-panel p-8 rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-cyan-950/20 to-emerald-950/20 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">{t.overallScore}</h3>
                
                {/* Radial Gauge */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg width="144" height="144" viewBox="0 0 144 144" className="transform -rotate-90">
                    <defs>
                      <linearGradient id="scoreTabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <circle cx="72" cy="72" r={radius} fill="none" stroke="#0a1a1f" strokeWidth="8" />
                    <circle
                      cx="72" cy="72" r={radius}
                      fill="none"
                      stroke="url(#scoreTabGrad)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={mounted ? strokeDashoffset : circumference}
                      style={{
                        transition: 'stroke-dashoffset 0.8s ease-out',
                        filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.3))'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white tracking-tight">{activeScore}%</span>
                    <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase mt-1">
                      {activeScore >= 90 ? t.excellentStatus : activeScore >= 75 ? t.goodStatus : t.adequateStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{lang === 'mr' ? 'थेट मोजणी सुरु आहे' : lang === 'hi' ? 'सीधा मापन सक्रिय है' : 'Live Recalculating'}</span>
                </div>
              </div>

              {/* Improvement Tips */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-cyan-400" /> {t.howToImprove}
                </h4>

                <div className="space-y-3">
                  {tasks.filter(tk => !tk.done).map((tk) => {
                    let contribText = '';
                    if (tk.category === 'fertilizer') contribText = t.improveFertilizer;
                    else if (tk.category === 'planning') contribText = t.improvePlanning;
                    else if (tk.category === 'water') contribText = t.improveIrrigation;
                    else contribText = `${(tk.label as any)[lang] || tk.label.en} (${lang === 'mr' ? 'पूर्ण करा' : lang === 'hi' ? 'पूरा करें' : 'complete'} +${tk.scoreContribution}%)`;

                    return (
                      <div 
                        key={tk.id} 
                        onClick={() => handleToggleTask(tk.id)}
                        className="flex gap-3 p-3 rounded-xl border border-dashed border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.02] cursor-pointer transition-all duration-300 text-xs text-zinc-300 group"
                      >
                        <span className="w-5 h-5 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">+</span>
                        <p className="leading-relaxed">{contribText}</p>
                      </div>
                    );
                  })}

                  {tasks.filter(tk => !tk.done).length === 0 && (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center text-xs text-emerald-300 font-bold">
                      🎉 {lang === 'mr' ? 'अभिनंदन! तुमचे शेत परिपूर्ण निरोगी आहे.' : lang === 'hi' ? 'बधाई हो! आपका खेत पूर्ण स्वस्थ है।' : 'Congratulations! Your farm is in optimal condition.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Score Breakdown Detail Panel */}
            <div className="col-span-1 lg:col-span-7 space-y-6">
              
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-6">
                <h3 className="text-base font-extrabold text-white pb-2 border-b border-white/5 flex items-center gap-2">
                  <Activity size={18} className="text-cyan-400" /> {t.healthBreakdown}
                </h3>

                <p className="text-sm text-zinc-400 leading-relaxed">{t.healthDesc}</p>

                <div className="space-y-5 pt-2">
                  
                  {/* Category 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">{t.soilHealth}</span>
                      <span className="text-emerald-400">95% ({t.excellentStatus})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/[0.04] p-0.5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '95%' }} />
                    </div>
                  </div>

                  {/* Category 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">{t.cropHealth}</span>
                      <span className="text-emerald-400">94% ({t.excellentStatus})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/[0.04] p-0.5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: '94%' }} />
                    </div>
                  </div>

                  {/* Category 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">{t.waterMgmt}</span>
                      <span className={clsx("text-cyan-400", (tasks.find(tk => tk.category === 'water') as any)?.done ? "text-emerald-400" : "text-amber-400")}>
                        {(tasks.find(tk => tk.category === 'water') as any)?.done ? '93% (' + t.excellentStatus + ')' : '88% (' + t.adequateStatus + ')'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/[0.04] p-0.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500" 
                        style={{ width: (tasks.find(tk => tk.category === 'water') as any)?.done ? '93%' : '88%' }} 
                      />
                    </div>
                  </div>

                  {/* Category 4 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">{t.pestRisk}</span>
                      <span className="text-emerald-400">92% ({t.lowRisk})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/[0.04] p-0.5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#a3e635]" style={{ width: '92%' }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TODAY'S TASKS DETAILS ==================== */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tasks list panel */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ClipboardCheck size={18} className="text-violet-400" /> {t.tasksTitle}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {doneCount}/{totalCount} {t.completed}
                  </span>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">{t.tasksDesc}</p>

                {/* Task Item Renderers */}
                {totalCount > 0 ? (
                  <div className="space-y-3.5">
                    {['high', 'medium', 'low'].map((prio) => {
                      const prioTasks = tasks.filter(tk => tk.priority === prio);
                      if (prioTasks.length === 0) return null;

                      const priorityTitle = prio === 'high' ? t.highPriority : prio === 'medium' ? t.mediumPriority : t.lowPriority;
                      const priorityColor = prio === 'high' ? 'text-rose-400 bg-rose-500/10' : prio === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-white/5';

                      return (
                        <div key={prio} className="space-y-2">
                          <div className={clsx("inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider", priorityColor)}>
                            {priorityTitle}
                          </div>
                          
                          <div className="space-y-2 pl-1.5">
                            {prioTasks.map((tk) => (
                              <div 
                                key={tk.id} 
                                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
                              >
                                <div 
                                  onClick={() => handleToggleTask(tk.id)} 
                                  className="flex-1 flex items-center gap-3.5 cursor-pointer select-none"
                                >
                                  {tk.done ? (
                                    <div className="w-[20px] h-[20px] rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                      <CheckCircle2 size={13} strokeWidth={2.5} />
                                    </div>
                                  ) : (
                                    <div className="w-[20px] h-[20px] rounded-md border border-slate-700 bg-slate-950/60 shrink-0 group-hover:border-violet-400 transition-colors" />
                                  )}
                                  <span className={clsx("text-sm font-bold leading-relaxed transition-all", tk.done ? "text-slate-500 line-through" : "text-zinc-200")}>
                                    {(tk.label as any)[lang] || tk.label.en}
                                  </span>
                                </div>
                                
                                <button 
                                  onClick={() => handleDeleteTask(tk.id)}
                                  className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                  title="Delete Task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500 italic">
                    {t.noTasks}
                  </div>
                )}
                
                {/* Form to Add Task */}
                <form onSubmit={handleAddTask} className="flex gap-2 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder={t.addTaskPlaceholder}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-violet-500/60 text-sm font-semibold text-white focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all flex items-center gap-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  >
                    <Plus size={16} /> <span>{t.addTaskBtn}</span>
                  </button>
                </form>

              </div>

            </div>

            {/* Progress breakdown panel */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              <div className="glass-panel p-6 rounded-[2rem] border border-white/[0.08] space-y-6">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{t.progressText}</h4>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-black text-white leading-none">{progressPct}%</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                        {doneCount} / {totalCount} {t.completed}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#a3e635] bg-emerald-500/10 px-2 py-0.5 rounded">
                      {totalCount - doneCount} {t.remaining}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-900 border border-white/[0.04] p-0.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-emerald-400 transition-all duration-500" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5">
                    💡 {lang === 'mr' 
                      ? 'अति महत्त्वाच्या कामांना पहिले प्राधान्य द्या. खते आणि सिंचन वेळेवर केल्यास फुलोरा उत्तम राहील.' 
                      : lang === 'hi' 
                        ? 'अति आवश्यक कार्यों को प्राथमिकता दें। उर्वरक और सिंचाई समय पर करने से फूलने की प्रक्रिया बेहतर होगी।' 
                        : 'Prioritize High Priority operations. Prompt irrigation and fertilizer application ensure high flower retention.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </SimpleView>
  );
};
