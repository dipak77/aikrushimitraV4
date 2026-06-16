import React, { useState, useCallback } from 'react';
import { Language } from '../../types';
import { KnowledgeItem, CATEGORIES } from '../../data/knowledge';
import {
  ArrowLeft, Clock, Droplets, Sun, TrendingUp, IndianRupee, Percent, Sprout,
  BookOpen, Star, Info, ChevronRight, ChevronDown, Tag, Leaf, ShieldCheck, 
  Award, Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-4 h-4" />,
  droplet: <Droplets className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  'trending-up': <TrendingUp className="w-4 h-4" />,
  'indian-rupee': <IndianRupee className="w-4 h-4" />,
  percent: <Percent className="w-4 h-4" />,
  sprout: <Sprout className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  crop: 'from-green-500 to-emerald-600',
  tech: 'from-blue-500 to-indigo-600',
  livestock: 'from-amber-400 to-orange-600',
  scheme: 'from-purple-500 to-fuchsia-600',
};

const categoryGlow: Record<string, string> = {
  crop: 'shadow-green-500/30',
  tech: 'shadow-blue-500/30',
  livestock: 'shadow-orange-500/30',
  scheme: 'shadow-fuchsia-500/30',
};

// Reusable premium widget for Yield, Market Info, etc.
const InfoWidget = ({ 
  icon: Icon, title, content, colorTheme, tags 
}: { 
  icon: any, title: string, content?: string, colorTheme: 'green' | 'amber' | 'blue', tags?: string[] 
}) => {
  const themes = {
    green: 'bg-emerald-50/50 border-emerald-100/60 text-emerald-800 icon-bg-emerald-100 icon-text-emerald-600',
    amber: 'bg-amber-50/50 border-amber-100/60 text-amber-900 icon-bg-amber-100 icon-text-amber-600',
    blue: 'bg-blue-50/50 border-blue-100/60 text-blue-900 icon-bg-blue-100 icon-text-blue-600',
  };
  const theme = themes[colorTheme];

  return (
    <div className={`relative overflow-hidden rounded-[24px] p-5 border ${theme} shadow-sm group hover:shadow-md transition-shadow`}>
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${theme.split(' icon-bg-')[1].split(' ')[0]} ${theme.split(' icon-text-')[1]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black mb-1.5 opacity-90">{title}</h3>
          {content && <p className="text-sm font-medium leading-relaxed opacity-80">{content}</p>}
          {tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className={`text-xs px-3 py-1.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 font-bold shadow-sm ${theme.split(' text-')[1]}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KnowledgeDetailView = ({ item, lang, onBack }: { item: KnowledgeItem, lang: Language, onBack: () => void }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));

  const getLabel = (obj: any) => lang === 'mr' ? obj.mr : (obj.hi || obj.en);

  const toggleSection = useCallback((index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    triggerHaptic();
  }, []);

  const expandAll = () => {
    setExpandedSections(new Set(item.sections.map((_, i) => i)));
    triggerHaptic();
  };

  const title = getLabel(item.title);
  const subtitle = getLabel(item.subtitle);
  const catLabelObj = CATEGORIES.find(c => c.id === item.category)?.label;
  const categoryLabel = catLabelObj ? getLabel(catLabelObj) : item.category;
  const activeColor = categoryColors[item.category] || categoryColors.crop;
  const activeGlow = categoryGlow[item.category] || categoryGlow.crop;

  return (
    <div className="h-full bg-[#f8fafc] flex flex-col lg:pl-28 animate-fade-in overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[340px] w-full shrink-0 rounded-b-[40px] shadow-sm">
            <img
                src={item.image}
                alt={title}
                className="w-full h-full object-cover rounded-b-[40px]"
            />
            {/* Immersive Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-gray-900/20 rounded-b-[40px]" />
            
            {/* Top Navigation */}
            <div className="absolute top-4 left-0 right-0 px-4 z-20 pt-safe-top mt-2 flex items-center justify-between">
                <button
                    onClick={() => { onBack(); triggerHaptic(); }}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r ${activeColor} text-white shadow-lg border border-white/20`}>
                    {categoryLabel}
                </span>
            </div>

            {/* Title Block */}
            <div className="absolute bottom-16 left-0 right-0 p-6 sm:p-8 z-10">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md tracking-tight">
                        {title}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 font-medium max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-20">
            
            {/* Overlapping Glassmorphic Stats Grid */}
            <div className="-mt-10 mb-8 bg-white/90 backdrop-blur-2xl rounded-[28px] shadow-xl border border-white p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {item.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeColor} flex items-center justify-center text-white shadow-md ${activeGlow} shrink-0`}>
                            {iconMap[stat.icon] || <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">{getLabel(stat.label)}</span>
                            <span className="text-sm font-bold text-gray-800">{stat.value}</span>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* Info Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {/* Best Varieties */}
                {item.bestVarieties && item.bestVarieties.length > 0 && (
                    <div className={item.expectedYield || item.marketInfo ? "md:col-span-2" : "md:col-span-1"}>
                        <InfoWidget 
                            icon={Award}
                            title={lang === 'mr' ? 'शिफारस केलेले वाण' : 'Recommended Varieties'}
                            tags={item.bestVarieties}
                            colorTheme="green"
                        />
                    </div>
                )}
                
                {/* Expected Yield */}
                {item.expectedYield && (
                    <InfoWidget 
                        icon={TrendingUp}
                        title={lang === 'mr' ? 'अपेक्षित उत्पादन' : 'Expected Yield'}
                        content={getLabel(item.expectedYield)}
                        colorTheme="amber"
                    />
                )}

                {/* Market Info */}
                {item.marketInfo && (
                    <InfoWidget 
                        icon={IndianRupee}
                        title={lang === 'mr' ? 'बाजार माहिती' : 'Market Information'}
                        content={getLabel(item.marketInfo)}
                        colorTheme="blue"
                    />
                )}
            </div>

            {/* Detailed Sections Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${activeColor} text-white shadow-lg`}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
                        {lang === 'mr' ? 'सविस्तर माहिती' : 'Detailed Guide'}
                    </h2>
                </div>
                <button
                    onClick={expandAll}
                    className={`text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 ${
                        expandedSections.size === item.sections.length 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : `bg-${activeColor.split('-')[1]}-50 text-${activeColor.split('-')[1]}-700 hover:bg-${activeColor.split('-')[1]}-100`
                    }`}
                    disabled={expandedSections.size === item.sections.length}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'mr' ? 'सर्व उघडा' : 'Expand All'}
                </button>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-4">
            {item.sections.map((section, index) => {
                const isExpanded = expandedSections.has(index);
                return (
                <div
                    key={index}
                    className={`bg-white rounded-[24px] border transition-all duration-300 overflow-hidden ${
                    isExpanded ? `border-${activeColor.split('-')[1]}-200 shadow-xl shadow-${activeColor.split('-')[1]}-900/5 ring-1 ring-${activeColor.split('-')[1]}-100` : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                    }`}
                >
                    <button
                        onClick={() => toggleSection(index)}
                        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isExpanded ? `bg-${activeColor.split('-')[1]}-50/30` : 'bg-transparent'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
                            isExpanded
                                ? `bg-gradient-to-br ${activeColor} text-white shadow-md scale-110`
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                                {index + 1}
                            </div>
                            <h3 className={`text-base sm:text-lg font-bold transition-colors duration-300 ${isExpanded ? 'text-gray-900' : 'text-gray-600'}`}>
                                {getLabel(section.title)}
                            </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? `bg-${activeColor.split('-')[1]}-100 text-${activeColor.split('-')[1]}-600 rotate-180` : 'bg-gray-50 text-gray-400'}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>
                    
                    {/* Expandable Content with smooth grid trick */}
                    <div 
                        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                        <div className="overflow-hidden">
                            <div className="px-5 pb-6 pt-2">
                                <div className={`p-5 rounded-2xl bg-gray-50/80 border border-gray-100`}>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                                        {getLabel(section.content)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
            
            {/* End Marker */}
            <div className="mt-12 flex flex-col items-center justify-center text-gray-300">
                <ShieldCheck className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest">{lang === 'mr' ? 'माहिती समाप्त' : 'End of Guide'}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetailView;