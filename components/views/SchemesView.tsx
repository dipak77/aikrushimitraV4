
import React, { useState } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS, SCHEMES_DATA } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Landmark, ArrowUpRight, Sparkles, X, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import clsx from 'clsx';

const SchemesView = ({ lang, onBack, onSelect }: { lang: Language, onBack: () => void, onSelect: (scheme: any) => void }) => {
    const t = TRANSLATIONS[lang];
    const schemes = SCHEMES_DATA[lang as Language] || SCHEMES_DATA['en'];
    const user = useUserStore((state) => state.user);

    const [matching, setMatching] = useState(false);
    const [matchResult, setMatchResult] = useState<string | null>(null);

    const handleAIMatch = async () => {
        if (!user) return;
        setMatching(true);
        setMatchResult(null);
        try {
            const res = await fetch('/api/schemes/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, schemes })
            });
            if (res.ok) {
                const data = await res.json();
                setMatchResult(data.text);
            }
        } catch (err) {
            console.error("Failed to match schemes:", err);
            setMatchResult("योजना शोधताना काही त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
            setMatching(false);
        }
    };

    return (
        <SimpleView title={t.schemes_title} onBack={onBack}>
            <div className="space-y-4 pb-24 relative">
                <p className="text-slate-400 text-sm px-2 mb-4">{t.schemes_desc}</p>

                {/* AI Scheme Matcher Trigger Button */}
                {user && (
                    <button
                        onClick={handleAIMatch}
                        disabled={matching}
                        className="w-full relative group overflow-hidden h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-glow hover:shadow-glow-strong flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {matching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="animate-pulse">पात्र योजना शोधत आहे (Matching Schemes...)</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 animate-bounce" />
                                <span>AI योजना शोधक (AI Scheme Matcher)</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    </button>
                )}

                {/* Schemes list */}
                {schemes.map((s: any) => (
                    <div onClick={() => onSelect(s)} key={s.id} className="glass-panel rounded-[2rem] p-5 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all border border-white/10 flex flex-col gap-4">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.grad} opacity-10 blur-3xl rounded-full`}></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-lg`}>
                                <Landmark size={24}/>
                            </div>
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-green-500/20">{s.status}</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white leading-tight mb-1">{s.title}</h3>
                            <p className="text-slate-400 text-sm">{s.subtitle}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.apply_btn}</span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ArrowUpRight size={16} className="text-white"/>
                            </div>
                        </div>
                    </div>
                ))}

                {/* AI Match Result Dialog/Modal Overlay */}
                {matchResult && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-fade-in">
                        <div className="bg-neutral-900 border border-emerald-500/30 rounded-[2.5rem] p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl relative">
                            <button
                                onClick={() => setMatchResult(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">पात्र योजना (Matched Schemes)</h3>
                                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">AI पात्रता पडताळणी निकाल</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {matchResult}
                            </div>

                            <button
                                onClick={() => setMatchResult(null)}
                                className="w-full mt-6 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-wide transition-colors border border-white/10"
                            >
                                बंद करा (Close)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SimpleView>
    );
};

export default SchemesView;
