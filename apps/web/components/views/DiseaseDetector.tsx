
import React, { useState, useRef } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { X, Camera, ScanLine, Loader2, CheckCircle2, Share2, CloudOff } from 'lucide-react';
import { Button } from '../Button';
import { analyzeCropDisease } from '../../services/geminiService';
import { OfflineDB } from '../../utils/offlineDb';

const DiseaseDetector = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
         if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    
    // Check if offline
    if (!navigator.onLine) {
      try {
        const offlineId = await OfflineDB.queueDiagnostic({
          imageBase64: image,
          mimeType: 'image/jpeg',
          cropType: 'general',
          lang: lang,
          timestamp: Date.now()
        });
        
        const offlineMessage = lang === 'mr'
          ? `इंटरनेट कनेक्शन उपलब्ध नाही. तुमचे चित्र जतन केले गेले आहे (ID: ${offlineId}). तुम्ही ऑनलाइन आल्यावर ते स्वयंचलितपणे स्कॅन केले जाईल.`
          : `No internet connection. Your leaf scan has been saved locally (ID: ${offlineId}) and will auto-upload when you are online.`;
        
        setResult(offlineMessage);
      } catch (err) {
        console.error("Failed to queue scan:", err);
        setResult(lang === 'mr' ? "ऑफलाइन जतन करण्यात अयशस्वी." : "Failed to save diagnostic locally.");
      } finally {
        setAnalyzing(false);
      }
      return;
    }

    const res = await analyzeCropDisease(image, lang);
    setResult(res || t.error_analyzing);
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SimpleView title={t.scan_title} onBack={onBack}>
       <div className="flex flex-col gap-6 animate-enter pb-20">
          {/* Image Area */}
          <div className="aspect-square w-full md:aspect-video rounded-[2.5rem] glass-panel border border-white/10 relative overflow-hidden flex flex-col items-center justify-center bg-slate-900/40 group shadow-2xl">
             {image ? (
               <div className="relative w-full h-full">
                 <img src={image} alt="Crop" className="w-full h-full object-cover" />
                 {!analyzing && !result && (
                     <button onClick={reset} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                        <X size={16} />
                     </button>
                 )}
               </div>
             ) : (
               <div className="text-center p-6 relative z-10">
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 cursor-pointer group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                     <Camera size={36} className="text-cyan-300 relative z-10 drop-shadow-md"/>
                  </div>
                  <p className="text-slate-300 font-bold text-sm mb-6 max-w-[200px] mx-auto leading-relaxed">{t.scan_desc}</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="primary" icon={<Camera size={18}/>} className="shadow-cyan-500/20">
                     {t.take_photo}
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} capture="environment" />
               </div>
             )}
          </div>

          {/* Controls / Result */}
          {image && !analyzing && !result && (
             <div className="flex gap-3 animate-enter">
                <Button onClick={reset} variant="secondary" fullWidth className="py-4">{t.retake}</Button>
                <Button onClick={analyze} variant="primary" fullWidth icon={<ScanLine size={18}/>} className="py-4 shadow-emerald-500/20 from-emerald-600 to-teal-600">{t.analyze_disease_btn}</Button>
             </div>
          )}

          {analyzing && (
             <div className="glass-panel p-10 rounded-[2rem] flex flex-col items-center justify-center text-center animate-enter border border-cyan-500/20 bg-cyan-900/5">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 size={48} className="text-cyan-400 animate-spin relative z-10"/>
                </div>
                <p className="font-bold text-xl text-white animate-pulse">{t.analyzing}</p>
                <p className="text-slate-400 text-sm mt-2">{t.checking_symptoms}</p>
             </div>
          )}

          {result && (
             <div className="glass-panel p-6 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-900/10 to-transparent animate-enter shadow-2xl shadow-emerald-900/10">
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    {(() => {
                      const isOfflineSave = result && (result.includes('saved locally') || result.includes('जतन केले गेले आहे'));
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${isOfflineSave ? 'from-amber-500 to-orange-600 shadow-amber-500/20' : 'from-emerald-500 to-teal-600 shadow-emerald-500/20'} flex items-center justify-center text-white shadow-lg`}>
                            {isOfflineSave ? <CloudOff size={24}/> : <CheckCircle2 size={24}/>}
                          </div>
                          <div>
                              <h3 className="text-xl font-black text-white">{t.analysis_report}</h3>
                              <p className={`text-xs font-bold uppercase tracking-wider ${isOfflineSave ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {isOfflineSave 
                                  ? (lang === 'mr' ? 'ऑफलाइन क्यु जतन केले' : 'Saved to Offline Queue') 
                                  : t.ai_diagnosis_complete}
                              </p>
                          </div>
                        </>
                      );
                    })()}
                 </div>
                <div className="prose prose-invert prose-lg max-w-none">
                   <p className="whitespace-pre-wrap leading-relaxed text-slate-200 font-medium">{result}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                   <Button variant="primary" fullWidth icon={<Share2 size={18}/>}>{t.share_expert}</Button>
                   <Button onClick={reset} variant="ghost" fullWidth>{t.scan_another}</Button>
                </div>
             </div>
          )}
       </div>
    </SimpleView>
  );
};

export default DiseaseDetector;
