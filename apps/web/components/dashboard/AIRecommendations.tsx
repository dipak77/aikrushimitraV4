'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import type { Language, UserProfile } from '../../types';

interface Recom {
  title: string;
  description: string;
  benefit: string;
  icon: string;
}

interface ApiResponse {
  success: boolean;
  recommendations?: Recom[];
  overallUplift?: string;
  error?: string;
}

const FALLBACK: Recom[] = [
  {
    title: '🌿 जैविक खाद का उपयोग',
    description: 'नाइट्रोजन की कमी को पूरा करने के लिए वर्मीकम्पोस्ट का उपयोग करें। यह मिट्टी की उर्वरता बढ़ाता है।',
    benefit: '+12%',
    icon: '🌿',
  },
  {
    title: '💧 टपक सिंचाई',
    description: 'पानी की बचत के लिए ड्रिप इरिगेशन अपनाएं। फसल को सही मात्रा में नमी मिलेगी।',
    benefit: '+18%',
    icon: '💧',
  },
  {
    title: '🐞 एकीकृत कीट प्रबंधन',
    description: 'रासायनिक कीटनाशक के बजाय जैविक तरीके अपनाएं — नीम तेल और फेरोमोन ट्रैप का उपयोग करें।',
    benefit: '+10%',
    icon: '🐞',
  },
];

const TEXTS: Record<string, any> = {
  mr: {
    title: 'AI कृषी शिफारसी',
    subtitle: 'उत्पादन {uplift} पर्यंत वाढवण्यासाठी ३ सर्वोत्तम शिफारसी',
    btnText: 'सर्व शिफारसी लागू करा',
    appliedTitle: 'शिफारसी लागू केल्या ✅',
    appliedDesc: 'तुमच्या शेतात शिफारसी लागू झाल्या आहेत. अपेक्षित नफा: {uplift}',
    loading: 'शोधत आहे...',
  },
  hi: {
    title: 'AI कृषि सुझाव',
    subtitle: 'फसल उत्पादन {uplift} तक बढ़ाने हेतु ३ बेहतरीन सुझाव',
    btnText: 'सभी सुझाव लागू करें',
    appliedTitle: 'सुझाव लागू किए गए ✅',
    appliedDesc: 'सुझाव आपके खेत पर लागू हो गए हैं। अपेक्षित लाभ: {uplift}',
    loading: 'खोज रहा हूँ...',
  },
  en: {
    title: 'AI Crop Advisory',
    subtitle: '3 key recommendations to boost yield by up to {uplift}',
    btnText: 'Apply All Recommendations',
    appliedTitle: 'Advisory Applied ✅',
    appliedDesc: 'Advisory recommendations applied to your farm. Expected gain: {uplift}',
    loading: 'Analyzing...',
  }
};

export function AIRecommendations({ lang, user }: { lang: Language; user: UserProfile }) {
  const [recs, setRecs] = useState<Recom[]>(FALLBACK);
  const [uplift, setUplift] = useState('+15%');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = TEXTS[lang] || TEXTS.en;

  const fetchRecs = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crops: user.crop ? [user.crop] : ['कापूस', 'सोयाबीन'],
          state: 'maharashtra',
          district: user.district || 'Yavatmal'
        }),
      });
      const data: ApiResponse = await res.json();
      if (data.success && data.recommendations?.length) {
        setRecs(data.recommendations);
        if (data.overallUplift) setUplift(data.overallUplift);
      }
    } catch (e) {
      console.error('Recom fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const handleApplyAll = () => {
    triggerHaptic('heavy');
    const msg = t.appliedDesc.replace('{uplift}', uplift);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 sm:p-6 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0a1220]/80 to-slate-900/90 border border-white/10"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

      {successMsg && (
        <div className="absolute inset-0 bg-[#020617]/95 z-50 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
          <h4 className="text-base font-bold text-white mb-1">{t.appliedTitle}</h4>
          <p className="text-xs text-slate-300 max-w-sm">{successMsg}</p>
          <button
            onClick={() => setSuccessMsg(null)}
            className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Okay
          </button>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-amber-400/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">{t.title}</h3>
              <p className="text-[10.5px] sm:text-xs text-slate-400 mt-0.5">
                {t.subtitle.replace('{uplift}', uplift)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium');
              fetchRecs(true);
            }}
            disabled={refreshing}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {(loading ? FALLBACK : recs).map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="group relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{rec.icon}</div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[9.5px] text-emerald-300 font-bold">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {rec.benefit}
                </div>
              </div>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-full" />
                  <div className="h-2 bg-white/5 rounded w-5/6" />
                </div>
              ) : (
                <>
                  <div className="text-[12.5px] font-bold text-white mb-1.5 leading-tight group-hover:text-emerald-300 transition-colors">{rec.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleApplyAll}
          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/25 text-[11.5px] font-bold text-emerald-300 hover:bg-emerald-500/15 active:scale-98 transition-all"
        >
          {t.btnText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
