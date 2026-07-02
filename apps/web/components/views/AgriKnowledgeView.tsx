import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { CATEGORIES, KnowledgeItem } from '../../data/knowledge';
import { fetchCrops, fetchContent, fetchSchemes } from '../../services/dbService';
import {
  Clock, Droplets, Sun, TrendingUp, IndianRupee, Percent, Sprout,
  Search, X, Wheat, Settings, Milk, Landmark, LayoutGrid, BookOpen,
  Tag, Info, ChevronRight, ArrowLeft, Sparkles, Leaf
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-3.5 h-3.5" />,
  droplet: <Droplets className="w-3.5 h-3.5" />,
  sun: <Sun className="w-3.5 h-3.5" />,
  'trending-up': <TrendingUp className="w-3.5 h-3.5" />,
  'indian-rupee': <IndianRupee className="w-3.5 h-3.5" />,
  percent: <Percent className="w-3.5 h-3.5" />,
  sprout: <Sprout className="w-3.5 h-3.5" />,
};

const catIconMap: Record<string, React.ReactNode> = {
  grid: <LayoutGrid className="w-4 h-4" />,
  wheat: <Wheat className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  milk: <Milk className="w-4 h-4" />,
  landmark: <Landmark className="w-4 h-4" />,
};

function CategoryFilter({ selected, onSelect, lang }: {
  selected: string;
  onSelect: (id: string) => void;
  lang: Language;
}) {
  const getLabel = (obj: any) => lang === 'mr' ? obj.mr : (obj.hi || obj.en);

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-4 px-1 hide-scrollbar snap-x">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => { onSelect(cat.id); triggerHaptic(); }}
            className={`snap-start flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-br ${cat.color} text-white shadow-lg shadow-${cat.color.split('-')[1]}/30 scale-105 ring-2 ring-white/50`
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md hover:border-gray-200'
            }`}
          >
            {catIconMap[cat.icon]}
            <span>{getLabel(cat.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatBadge({ stat, lang }: { stat: KnowledgeItem['stats'][0]; lang: Language }) {
  const label = lang === 'mr' ? stat.label.mr : stat.label.en;
  
  return (
    <div className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-green-50/50 transition-colors rounded-xl px-3 py-2.5 border border-gray-100/50">
      <div className="p-1.5 bg-white rounded-lg shadow-sm text-green-600">
        {iconMap[stat.icon] || <Info className="w-3.5 h-3.5" />}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</span>
        <span className="text-xs font-bold text-gray-700">{stat.value}</span>
      </div>
    </div>
  );
}

function CropCard({ item, lang, onClick }: { item: KnowledgeItem; lang: Language; onClick: () => void }) {
  const title = lang === 'mr' ? item.title.mr : (lang === 'hi' ? (item.title.hi || item.title.en) : item.title.en);
  const subtitle = lang === 'mr' ? item.subtitle.mr : (lang === 'hi' ? (item.subtitle.hi || item.subtitle.en) : item.subtitle.en);
  const category = CATEGORIES.find(c => c.id === item.category);
  const categoryName = category ? (lang === 'mr' ? category.label.mr : category.label.en) : item.category;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-green-900/5 hover:border-green-200 transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80" />
        
        {/* Floating Category Badge */}
        <div className="absolute top-4 right-4">
          <div className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xl">
            {categoryName}
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl font-extrabold text-white leading-tight mb-1 drop-shadow-md">{title}</h3>
          <p className="text-sm text-gray-200 line-clamp-1 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {item.stats.slice(0, 4).map((stat, i) => (
            <StatBadge key={i} stat={stat} lang={lang} />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-gray-100/80 text-gray-500 border border-gray-200/50">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-gray-50 text-gray-400 border border-gray-100">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Read More */}
      <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50 group-hover:bg-green-50/30 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-green-600">
          <Sparkles className="w-4 h-4 text-green-500" />
          <span>{lang === 'mr' ? 'संपूर्ण माहिती पहा' : 'View Full Guide'}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors border border-gray-100 group-hover:border-transparent text-gray-400">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function StatsOverview({ lang, items }: { lang: Language, items: KnowledgeItem[] }) {
  const stats = [
    { label: lang === 'mr' ? 'पिके' : 'Crops', count: items.filter(i => i.category === 'crop').length, icon: <Wheat className="w-5 h-5" />, color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50/50' },
    { label: lang === 'mr' ? 'तंत्रज्ञान' : 'Tech', count: items.filter(i => i.category === 'tech').length, icon: <Settings className="w-5 h-5" />, color: 'from-blue-400 to-indigo-600', bg: 'bg-blue-50/50' },
    { label: lang === 'mr' ? 'पशुपालन' : 'Livestock', count: items.filter(i => i.category === 'livestock').length, icon: <Milk className="w-5 h-5" />, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50/50' },
    { label: lang === 'mr' ? 'योजना' : 'Schemes', count: items.filter(i => i.category === 'scheme').length, icon: <Landmark className="w-5 h-5" />, color: 'from-purple-400 to-violet-600', bg: 'bg-purple-50/50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className={`relative overflow-hidden ${s.bg} rounded-[20px] p-5 border border-white shadow-sm hover:shadow-md transition-all group`}>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            {React.cloneElement(s.icon as React.ReactElement, { className: 'w-24 h-24' })}
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-800 tracking-tight">{s.count}</p>
              <p className="text-sm text-gray-500 font-bold mt-1">{s.label}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg shadow-${s.color.split('-')[1]}/30 group-hover:-translate-y-1 transition-transform`}>
              {s.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const AgriKnowledgeView = ({ lang, onBack, onSelect }: { lang: Language, onBack: () => void, onSelect: (item: KnowledgeItem) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cropsData, contentData, schemesData] = await Promise.all([
          fetchCrops(),
          fetchContent(),
          fetchSchemes()
        ]);
        
        const normalizeText = (val: any) => {
          if (!val) return { mr: '', en: '' };
          if (typeof val === 'string') return { mr: val, en: val };
          return { mr: val.mr || val.en || '', en: val.en || val.mr || '' };
        };

        const cropsMapped = (cropsData || []).map((c: any) => ({
          ...c,
          category: 'crop',
          title: normalizeText(c.title || c.name),
          subtitle: normalizeText(c.subtitle || c.scientificName),
          stats: Array.isArray(c.stats) ? c.stats : [],
          tags: Array.isArray(c.tags) ? c.tags : []
        }));
        
        const contentMapped = (contentData || []).map((c: any) => ({
          ...c,
          title: normalizeText(c.title),
          subtitle: normalizeText(c.subtitle),
          stats: Array.isArray(c.stats) ? c.stats : [],
          tags: Array.isArray(c.tags) ? c.tags : []
        }));
        
        const schemesMapped = (schemesData || []).map((s: any) => ({
          ...s,
          category: 'scheme',
          title: normalizeText(s.title || s.name),
          subtitle: normalizeText(s.subtitle || s.benefits),
          stats: Array.isArray(s.stats) ? s.stats : [],
          tags: Array.isArray(s.tags) ? s.tags : []
        }));
        
        setKnowledgeBase([...cropsMapped, ...contentMapped, ...schemesMapped] as any);
      } catch (err) {
        console.error("Failed to load knowledge hub data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = knowledgeBase.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const titleObj = item.title || { mr: '', en: '' };
    const titleEn = (titleObj.en || '').toLowerCase();
    const titleMr = (titleObj.mr || '').toLowerCase();
    const titleHi = (titleObj.hi || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags : [];
    
    return matchesCategory && (
      !query || 
      titleEn.includes(query) || 
      titleMr.includes(query) || 
      titleHi.includes(query) || 
      tags.some(t => String(t).toLowerCase().includes(query))
    );
  });

  return (
    <div className="h-full bg-[#f8fafc] flex flex-col lg:pl-64 animate-fade-in">
      {/* Premium Hero Banner */}
      <div className="relative bg-gray-900 shrink-0 rounded-b-[40px] shadow-xl z-10">
        <div className="absolute inset-0 overflow-hidden rounded-b-[40px]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-900 opacity-90" />
          {/* Animated Background Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>
        
        {/* Top Nav */}
        <div className="absolute top-4 left-4 z-20 pt-safe-top">
            <button 
                onClick={() => { onBack(); triggerHaptic(); }} 
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all shadow-lg"
            >
                <ArrowLeft size={20} />
            </button>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 relative pt-safe-top mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-green-100 text-xs font-bold uppercase tracking-widest mb-4">
                <Leaf className="w-3.5 h-3.5" />
                {lang === 'mr' ? 'स्मार्ट शेती ' : 'Smart Farming'}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                {lang === 'mr' ? 'कृषी ज्ञानकोश' : 'Agricultural Knowledge Base'}
              </h1>
              <p className="text-emerald-100/80 mt-3 text-sm sm:text-base md:text-lg font-medium max-w-xl leading-relaxed">
                {lang === 'mr'
                  ? 'पिके, आधुनिक तंत्रज्ञान, पशुपालन आणि सरकारी योजनांची अद्ययावत माहिती मिळवा.'
                  : 'Access up-to-date insights on crops, modern tech, livestock, and government schemes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Floating Search Bar (Overlapping) */}
        <div className="absolute -bottom-7 left-0 right-0 px-5 sm:px-8 max-w-7xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white/95 backdrop-blur-xl border border-white rounded-2xl shadow-lg flex items-center p-2">
              <div className="p-3 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'mr' ? 'पीक, तंत्रज्ञान किंवा योजना शोधा...' : 'Search crops, tech, or schemes...'}
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 font-medium outline-none pr-4 w-full"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="p-2 mr-1 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 pt-16 pb-24 hide-scrollbar">
        <div className="max-w-7xl mx-auto">
            
            {/* Stats Overview */}
            <StatsOverview lang={lang} items={knowledgeBase} />

            {/* Category Filter */}
            <div className="mb-8 relative">
              <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} lang={lang} />
            </div>

            {/* Results Title */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-800">
                {lang === 'mr' ? 'माहिती व लेख' : 'Articles & Guides'}
              </h2>
              <p className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">
                {filtered.length} {lang === 'mr' ? 'विषय' : 'topics'}
              </p>
            </div>

            {/* Grid / Shimmer loader */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-[24px] border border-gray-100 shadow-sm h-96 flex flex-col overflow-hidden">
                    <div className="bg-gray-200 h-56 w-full" />
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3" />
                        <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16" />
                        <div className="h-6 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item) => (
                <CropCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    onClick={() => { onSelect(item); triggerHaptic(); }}
                />
                ))}
            </div>
            ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {lang === 'mr' ? 'माहिती सापडली नाही' : 'No topics found'}
                </h3>
                <p className="text-gray-500 font-medium">
                  {lang === 'mr' ? 'कृपया वेगळे नाव टाकून पुन्हा शोधा.' : 'Try adjusting your search or category filter.'}
                </p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
                  className="mt-6 px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors"
                >
                  {lang === 'mr' ? 'सर्व माहिती पहा' : 'View All Topics'}
                </button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AgriKnowledgeView;