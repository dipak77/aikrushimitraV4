'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Volume2, Sparkles, AudioLines, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import type { Language, UserProfile } from '../../types';
import { getApiUrl, getAIFarmingAdvice } from '../../services/geminiService';

type State = 'idle' | 'recording' | 'thinking' | 'speaking';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const TEXTS: Record<string, any> = {
  mr: {
    badge: 'व्हॉइस AI सहाय्यक',
    title: 'कृषी सहाय्यकाशी बोला',
    desc: 'माईक दाबा आणि मराठीत किंवा हिंदीत प्रश्न विचारा — AI लगेच उत्तर देईल',
    statusIdle: 'बोलण्यासाठी माईक दाबा',
    statusListening: 'ऐकत आहे...',
    statusThinking: 'विचार करत आहे...',
    statusSpeaking: 'बोलत आहे...',
    youSaid: 'तुम्ही म्हणालात',
    aiReply: 'AI उत्तर',
    newQuestion: '↺ नवीन प्रश्न',
    asrFallbackText: 'माझ्या सोयाबीन पिकाची काळजी कशी घेऊ?',
  },
  hi: {
    badge: 'वॉइस AI सहायक',
    title: 'कृषि सहायक से बात करें',
    desc: 'माइक बटन दबाएं और हिंदी में अपना प्रश्न पूछें — AI तुरंत उत्तर देगा',
    statusIdle: 'बोलने के लिए माइक दबाएं',
    statusListening: 'सुन रहा हूँ...',
    statusThinking: 'सोच रहा हूँ...',
    statusSpeaking: 'बोल रहा हूँ...',
    youSaid: 'आपने कहा',
    aiReply: 'AI उत्तर',
    newQuestion: '↺ नया प्रश्न',
    asrFallbackText: 'मेरे खेत में फसलों की देखभाल कैसे करूं?',
  },
  en: {
    badge: 'Voice AI Assistant',
    title: 'Talk to Agri Assistant',
    desc: 'Press the mic button and ask your question — AI will speak the reply',
    statusIdle: 'Press mic to start speaking',
    statusListening: 'Listening...',
    statusThinking: 'Thinking...',
    statusSpeaking: 'Speaking...',
    youSaid: 'You Said',
    aiReply: 'AI Response',
    newQuestion: '↺ New Question',
    asrFallbackText: 'How do I take care of my crops?',
  }
};

export function VoiceAssistantWidget({ lang, user }: { lang: Language; user: UserProfile }) {
  const t = TEXTS[lang] || TEXTS.en;

  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    triggerHaptic('medium');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await processAudio(audioBlob);
      };
      mr.start();
      setState('recording');
    } catch (e) {
      console.error('Mic error:', e);
      // Fallback simulating voice with a default question
      setTranscript(t.asrFallbackText);
      setState('thinking');
      setTimeout(() => processText(t.asrFallbackText), 1200);
    }
  };

  const stopRecording = () => {
    triggerHaptic('medium');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setState('thinking');
  };

  const processAudio = async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          const asrRes = await fetch(getApiUrl('/api/asr'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio }),
          });
          const asrData = await asrRes.json();
          const text = asrData.text || t.asrFallbackText;
          setTranscript(text);
          await processText(text);
        } catch (innerErr) {
          console.error('ASR parse error:', innerErr);
          setTranscript(t.asrFallbackText);
          await processText(t.asrFallbackText);
        }
      };
    } catch (e) {
      console.error('ASR error:', e);
      setTranscript(t.asrFallbackText);
      await processText(t.asrFallbackText);
    }
  };

  const processText = async (text: string) => {
    setState('thinking');
    setTranscript(text);
    try {
      const reply = await getAIFarmingAdvice(text, lang, user.crop || 'cotton', []);
      setResponse(reply);
      setState('speaking');

      // Call TTS (silently fallback if backend voice API is down)
      try {
        const ttsRes = await fetch(getApiUrl('/api/voice'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply.replace(/\*\*/g, '') }),
        });
        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setState('idle');
          audio.onerror = () => setState('idle');
          await audio.play();
        } else {
          setState('idle');
        }
      } catch {
        setState('idle');
      }
    } catch (e) {
      console.error('Chat error:', e);
      setResponse('⚠️ काहीतरी त्रुटी झाली. पुन्हा प्रयत्न करा.');
      setState('idle');
    }
  };

  const reset = () => {
    triggerHaptic('heavy');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setState('idle');
    setTranscript('');
    setResponse('');
  };

  const isRecording = state === 'recording';
  const isBusy = state === 'thinking' || state === 'speaking';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0a1220]/80 to-slate-900/90 border border-white/10 flex flex-col items-center justify-center text-center h-[380px]"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative w-full flex flex-col items-center">
        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-[9.5px] text-emerald-300 font-bold uppercase tracking-wider">{t.badge}</span>
        </div>

        <h3 className="text-sm font-bold text-white mb-0.5">{t.title}</h3>
        <p className="text-[10px] text-slate-400 mb-5 max-w-xs leading-relaxed">
          {t.desc}
        </p>

        {/* Mic button with waves */}
        <div className="relative mb-5">
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="absolute -inset-2.5 rounded-full border border-emerald-500/30 animate-pulse" />
            </>
          )}
          {state === 'speaking' && (
            <div className="absolute -inset-2 rounded-full border border-emerald-400/20 animate-pulse" />
          )}
          <button
            onClick={isRecording ? stopRecording : state === 'idle' ? startRecording : reset}
            className={cn(
              'relative w-16 h-16 rounded-full flex items-center justify-center transition-all',
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/35 hover:scale-105 active:scale-95'
            )}
          >
            {isRecording ? (
              <Square className="w-5 h-5 text-white" fill="currentColor" />
            ) : isBusy ? (
              <AudioLines className="w-6 h-6 text-emerald-950 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6 text-emerald-950" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Status */}
        <div className="h-4 mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[11px] font-bold"
            >
              {state === 'idle' && <span className="text-slate-400">{t.statusIdle}</span>}
              {state === 'recording' && <span className="text-red-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> {t.statusListening}</span>}
              {state === 'thinking' && <span className="text-amber-400 flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> {t.statusThinking}</span>}
              {state === 'speaking' && <span className="text-emerald-400 flex items-center gap-1.5"><Volume2 className="w-3 h-3" /> {t.statusSpeaking}</span>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wave animation */}
        {(isRecording || state === 'speaking') && (
          <div className="flex items-center gap-0.5 h-5 mb-3">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 rounded-full bg-emerald-400"
                animate={{ height: [4, 16, 4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}

        {/* Transcript & Response log */}
        {(transcript || response) && (
          <div className="w-full space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar px-1">
            {transcript && (
              <div className="text-left p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[8.5px] uppercase tracking-wider text-emerald-400 font-bold mb-0.5">{t.youSaid}</div>
                <div className="text-[11px] text-white leading-relaxed">{transcript}</div>
              </div>
            )}
            {response && (
              <div className="text-left p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[8.5px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">{t.aiReply}</div>
                <div className="text-[11px] text-slate-200 line-clamp-3 leading-relaxed">{response}</div>
              </div>
            )}
          </div>
        )}

        {(transcript || response) && (
          <button
            onClick={reset}
            className="mt-3 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors font-bold"
          >
            {t.newQuestion}
          </button>
        )}
      </div>
    </motion.div>
  );
}
