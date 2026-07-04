'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Volume2, Square, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import type { Language, UserProfile } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const WELCOME_MESSAGES: Record<string, Message> = {
  mr: {
    id: 'welcome',
    role: 'assistant',
    content: `नमस्कार शेतकरी बंधूंनो! 🌾 मी **AI कृषी मित्र** आहे. पीक, माती, हवामान, सिंचन, कीटक नियंत्रण किंवा बाजारभाव — कोणत्याही कृषी संबंधित प्रश्नासाठी विचारा. 

तुम्ही खालीलपैकी एका प्रश्नावर क्लिक करू शकता 👇`,
  },
  hi: {
    id: 'welcome',
    role: 'assistant',
    content: `नमस्ते किसानजी! 🌾 मैं **AI कृषि मित्र** हूँ। फसल, मिट्टी, मौसम, सिंचाई, कीट नियंत्रण या बाजार भाव — किसी भी कृषि संबंधी प्रश्न के लिए पूछें। 

आप नीचे दिए सुझाव वाले प्रश्नों पर भी क्लिक कर सकते हैं 👇`,
  },
  en: {
    id: 'welcome',
    role: 'assistant',
    content: `Hello Farmer! 🌾 I am your **AI Krushi Mitra**. Ask me anything about crops, soil health, weather forecasts, irrigation, pest control, or market prices. 

You can also click on one of the suggested questions below 👇`,
  }
};

const SUGGESTIONS: Record<string, string[]> = {
  mr: [
    'माझ्या सोयाबीन पिकाची काळजी कशी घेऊ?',
    'कापूस पिकासाठी उत्तम खत कोणते आहे?',
    'जैविक पद्धतीने कीड नियंत्रण कसे करावे?',
    'हवामानानुसार सिंचनाची योग्य वेळ कोणती?',
  ],
  hi: [
    'मेरी सोयाबीन फसल की देखभाल कैसे करूँ?',
    'गेहूं के लिए सबसे अच्छी खाद कौन सी है?',
    'कीट नियंत्रण के जैविक तरीके बताओ',
    'मौसम के अनुसार सिंचाई का समय?',
  ],
  en: [
    'How do I care for my soybean crops?',
    'Which fertilizer is best for wheat?',
    'What are organic pest control methods?',
    'Best time for irrigation based on weather?',
  ]
};

const TEXTS: Record<string, any> = {
  mr: {
    title: 'AI कृषी सहाय्यक',
    online: 'ऑनलाईन • मराठीत उत्तर',
    newChat: 'नवीन संभाषण',
    thinking: 'विचार करत आहे...',
    placeholder: 'कृषी संबंधित कोणताही प्रश्न विचारा...',
    errorMsg: '⚠️ त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
    ttsError: 'व्हॉइस प्लेबॅक त्रुटी.'
  },
  hi: {
    title: 'AI कृषि सहायक',
    online: 'ऑनलाइन • हिंदी में उत्तर',
    newChat: 'नई बातचीत',
    thinking: 'सोच रहा हूँ...',
    placeholder: 'कृषि से संबंधित कोई प्रश्न पूछें...',
    errorMsg: '⚠️ नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।',
    ttsError: 'आवाज चलाने में समस्या।'
  },
  en: {
    title: 'AI Krushi Assistant',
    online: 'Online • English Responses',
    newChat: 'New Conversation',
    thinking: 'Thinking...',
    placeholder: 'Ask an agriculture related question...',
    errorMsg: '⚠️ Error. Please try again.',
    ttsError: 'Voice feedback error.'
  }
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

function formatMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('### ')) {
      return <div key={i} className="font-bold text-emerald-300 text-[12.5px] mt-2 mb-1">{line.slice(4)}</div>;
    }
    if (line.startsWith('## ')) {
      return <div key={i} className="font-bold text-white text-sm mt-2 mb-1">{line.slice(3)}</div>;
    }
    if (line.startsWith('# ')) {
      return <div key={i} className="font-bold text-white text-base mt-2 mb-1">{line.slice(2)}</div>;
    }
    if (/^[-*•]\s/.test(line)) {
      const content = line.replace(/^[-*•]\s/, '');
      return (
        <div key={i} className="flex gap-2 ml-1 my-0.5 text-xs">
          <span className="text-emerald-400 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      return (
        <div key={i} className="ml-1 my-0.5 text-xs" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
      );
    }
    return (
      <div key={i} className="my-0.5 text-xs" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
    );
  });
}

export function AIChatAssistant({ lang, user }: { lang: Language; user: UserProfile }) {
  const t = TEXTS[lang] || TEXTS.en;
  const initialMsg = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en;

  const [messages, setMessages] = useState<Message[]>([initialMsg]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMessages([initialMsg]);
  }, [lang, initialMsg]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    triggerHaptic('light');
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    const loadingMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: '', loading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const history = messages
        .filter((m) => !m.loading && m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: trimmed }],
          user
        }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: data.reply || 'क्षमस्व, आता उत्तर देण्यास काही अडचण येत आहे.', loading: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: t.errorMsg, loading: false }
            : m
        )
      );
    } finally {
      setIsThinking(false);
    }
  }, [messages, isThinking, user, t.errorMsg]);

  const speak = async (msg: Message) => {
    triggerHaptic('medium');
    if (speakingId === msg.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingId(null);
      return;
    }
    try {
      setSpeakingId(msg.id);
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content.replace(/\*\*/g, '') }), // Strip markdown bold markers for TTS
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setSpeakingId(null);
      audio.onerror = () => setSpeakingId(null);
      await audio.play();
    } catch (e) {
      console.error('Voice error:', e);
      setSpeakingId(null);
    }
  };

  const reset = () => {
    triggerHaptic('heavy');
    setMessages([initialMsg]);
    setInput('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);
  };

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl flex flex-col h-[380px] relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0a1220]/80 to-slate-900/90 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Bot className="w-4 h-4 text-emerald-950" strokeWidth={2.5} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0f1c]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {t.title}
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
            <div className="text-[9.5px] text-emerald-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              {t.online}
            </div>
          </div>
        </div>
        <button
          onClick={reset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={t.newChat}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                : 'bg-white/10 border border-white/15'
            )}>
              {msg.role === 'assistant' ? (
                <Bot className="w-3.5 h-3.5 text-emerald-950" strokeWidth={2.5} />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-300" />
              )}
            </div>

            <div className={cn('group relative max-w-[80%] rounded-xl px-3 py-2', msg.role === 'assistant'
              ? 'bg-white/[0.04] border border-white/5 rounded-tl-sm text-left'
              : 'bg-emerald-500/15 border border-emerald-500/20 rounded-tr-sm text-right')}>
              {msg.loading ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 ml-1">{t.thinking}</span>
                </div>
              ) : (
                <>
                  <div className="text-[11.5px] text-slate-200 leading-relaxed whitespace-pre-line text-left">
                    {formatMarkdown(msg.content)}
                  </div>
                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <button
                      onClick={() => speak(msg)}
                      className="absolute -bottom-1.5 -right-1.5 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center transition-all hover:scale-105 shadow-md"
                      title="Speak"
                    >
                      {speakingId === msg.id ? <Square className="w-2.5 h-2.5" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-nowrap overflow-x-auto gap-1.5 hide-scrollbar">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[10.5px] px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 transition-all flex-shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-2.5 border-t border-white/5 bg-white/[0.01]">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={isThinking}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 flex items-center justify-center hover:shadow-md hover:shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
