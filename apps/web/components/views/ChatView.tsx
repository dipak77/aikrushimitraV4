import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { 
  Send, Mic, MicOff, MessageSquare, Plus, History, 
  BookOpen, Sparkles, AlertTriangle, Calendar, ClipboardCheck,
  Bot, Network, Search, CheckCircle2, Loader2, ChevronDown, User,
  Globe, WifiOff, ShieldCheck
} from 'lucide-react';import { triggerHaptic } from '../../utils/common';
import { getApiUrl } from '../../services/geminiService';
import { AGENTS } from '../../lib/krushi/rag/agents';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  orchestration?: {
    intent: string;
    selectedAgent: { id: string; name: string; nameHi: string; icon: string; color: string };
    steps: { step: number; agent: string; agentName: string; action: string; status: string; result?: string }[];
    confidence: number;
    ragResults: { id: string; title: string; source: string; confidence: number; score: number }[];
    citations: string[];
    detectedEntities: { id: string; name: string; type: string }[];
  };
  citations?: { source: string; category: string; url?: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActive: number;
}

const QUICK_REPLIES: Record<string, string[]> = {
  mr: [
    "कपास में गुलाबी सुंडी का इलाज क्या है?",
    "सोयाबीन की पीली मोज़ेक बीमारी कैसे रोकें?",
    "PM-KISAN योजना के लिए कैसे आवेदन करें?",
    "टपक सिंचाई के फायदे क्या हैं?"
  ],
  hi: [
    "कपास में गुलाबी सुंडी का इलाज क्या है?",
    "सोयाबीन की पीली मोज़ेक बीमारी कैसे रोकें?",
    "PM-KISAN योजना के लिए कैसे आवेदन करें?",
    "टपक सिंचाई के फायदे क्या हैं?"
  ],
  en: [
    "What is the treatment for pink bollworm in cotton?",
    "How to prevent soybean yellow mosaic disease?",
    "How to apply for PM-KISAN scheme?",
    "What are the benefits of drip irrigation?"
  ]
};

const ChatView = ({ lang, user, onBack }: { lang: Language; user: UserProfile; onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [withoutLLM, setWithoutLLM] = useState(false); // Offline local RAG search mode toggle
  const [expandedOrch, setExpandedOrch] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('akm_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    startNewChat();
  }, []);

  // Save sessions to localStorage when they update
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem('akm_chat_sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Failed to save chat sessions", e);
    }
  };

  const startNewChat = () => {
    triggerHaptic('medium');
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: lang === 'mr' ? 'नवीन संवाद' : lang === 'hi' ? 'नया संवाद' : 'New Chat',
      messages: [
        {
          id: 'welcome',
          role: 'model',
          text: lang === 'mr'
            ? "नमस्ते शेतकरी मित्र! 🌾 मी आपला RAG-संचालित AI कृषी सहायक आहे. मी स्थानिक ज्ञान बेस मधुन अचूक माहिती शोधून, तज्ञ एजंट निवडून उत्तर देतो.\n\nतुम्ही खालीलपैकी एक प्रश्न निवडू शकता किंवा स्वतः विचारू शकता 👇"
            : lang === 'hi'
            ? "नमस्ते किसान मित्र! 🌾 मैं आपका RAG-संचालित AI कृषि सहायक हूँ। मैं स्थानीय ज्ञान बेस से सटीक जानकारी खोजकर, विशेषज्ञ एजेंट चुनकर उत्तर देता हूँ।\n\nआप नीचे दिए सुझावों पर क्लिक कर सकते हैं या अपना प्रश्न पूछ सकते हैं 👇"
            : "Hello farmer friend! 🌾 I am your RAG-powered AI agricultural assistant. I query the local knowledge base, consult specialist agents, and provide verified answers.\n\nClick a suggestion below or ask your own question 👇",
          timestamp: Date.now()
        }
      ],
      lastActive: Date.now()
    };

    const updated = [newSession, ...sessions.filter(s => s.id !== activeSessionId)];
    saveSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setShowHistory(false);
  };

  const selectSession = (sessionId: string) => {
    triggerHaptic('light');
    const sess = sessions.find(s => s.id === sessionId);
    if (sess) {
      setActiveSessionId(sessionId);
      setMessages(sess.messages);
    }
    setShowHistory(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    const filtered = sessions.filter(s => s.id !== sessionId);
    saveSessions(filtered);
    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        startNewChat();
      }
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle voice input SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputValue(text);
        setIsListening(false);
        triggerHaptic('medium');
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleSpeech = () => {
    triggerHaptic('light');
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim() || loading) return;

    triggerHaptic('light');
    setInputValue('');
    setLoading(true);

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update active session locally
    const currentSession = sessions.find(s => s.id === activeSessionId) || {
      id: activeSessionId,
      title: queryText.slice(0, 20),
      messages: [],
      lastActive: Date.now()
    };
    currentSession.messages = newMessages;
    currentSession.lastActive = Date.now();
    
    if (messages.length <= 1) {
      currentSession.title = queryText.slice(0, 18) + (queryText.length > 18 ? '...' : '');
    }

    const updatedSessions = [
      currentSession,
      ...sessions.filter(s => s.id !== activeSessionId)
    ];
    saveSessions(updatedSessions);

    try {
      // Call RAG Chat Proxy API
      const res = await fetch(getApiUrl('/api/rag/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          question: queryText,
          farmer: {
            name: user.name || 'Farmer',
            location: user.village || '',
            state: 'Maharashtra',
            language: lang,
            crops: user.crop ? [user.crop] : []
          },
          withoutLLM: withoutLLM // offline toggle state
        })
      });
      const response = await res.json();

      const assistantMessage: Message = {
        id: `msg_ai_${Date.now()}`,
        role: 'model',
        text: response.reply || response.answer || 'उत्तर देने में समस्या हो रही है।',
        timestamp: Date.now(),
        orchestration: response.orchestration
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      currentSession.messages = finalMessages;
      saveSessions([
        currentSession,
        ...sessions.filter(s => s.id !== activeSessionId)
      ]);

    } catch (e) {
      console.error(e);
      const errorMessage: Message = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: lang === 'mr' ? "क्षमा करा, RAG सर्व्हरशी संपर्क साधता आला नाही. ऑफलाइन मोड निवडून प्रयत्न करा." : "Error calling RAG server. Toggle local mode and try again.",
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const currentReplies = QUICK_REPLIES[lang] || QUICK_REPLIES['en'];
  const agentList = Object.values(AGENTS).filter((a) => a.id !== 'master');

  return (
    <SimpleView 
      title={lang === 'mr' ? 'RAG AI सल्लागार' : lang === 'hi' ? 'RAG AI सलाहकार' : 'RAG AI Assistant'} 
      onBack={onBack}
      headerRight={
        <div className="flex items-center gap-3">
          {/* Offline/LLM-free search toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setWithoutLLM(!withoutLLM);
            }}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all ${
              withoutLLM 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
            title="Toggle Offline/Local RAG search mode"
          >
            {withoutLLM ? <WifiOff size={13} /> : <Globe size={13} />}
            <span>{withoutLLM ? (lang === 'mr' ? 'लोकल सर्च' : 'Local Search') : (lang === 'mr' ? 'एआय मोड' : 'AI Mode')}</span>
          </button>

          <button 
            onClick={() => { triggerHaptic('light'); setShowHistory(!showHistory); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${showHistory ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
          >
            <History size={16} />
          </button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-140px)] relative overflow-hidden animate-enter pb-10">
        
        {/* SIDEBAR drawer for past 30 days history */}
        {showHistory && (
          <div className="absolute inset-0 z-40 bg-[#020617]/95 border-b border-white/10 rounded-t-[2rem] p-6 animate-enter flex flex-col justify-between animate-fade-in">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <History size={18} className="text-emerald-400" /> {lang === 'mr' ? 'गेले संवाद' : 'Past Conversations'}
                </h3>
                <button 
                  onClick={startNewChat}
                  className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus size={12} /> {lang === 'mr' ? 'नवीन गप्पा' : 'New Chat'}
                </button>
              </div>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {sessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => selectSession(s.id)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                        isActive 
                          ? 'bg-emerald-500/15 border-emerald-500 text-white' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare size={16} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                        <span className="text-sm font-bold truncate max-w-[180px]">{s.title}</span>
                      </div>
                      <button 
                        onClick={(e) => deleteSession(s.id, e)}
                        className="text-xs text-red-400/70 hover:text-red-400 p-1 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button variant="outline" fullWidth onClick={() => setShowHistory(false)} className="mt-4">
              Close History
            </Button>
          </div>
        )}

        {/* CHAT BUBBLES WINDOW */}
        <div className="flex-1 flex flex-col justify-between h-full bg-slate-950/40 rounded-[2.5rem] border border-white/10 p-4 md:p-6 overflow-hidden relative">
          
          {/* Active specialist agents horizontal list */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 shrink-0 border-b border-white/5 scrollbar-none">
            {agentList.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 flex-shrink-0"
              >
                <span className="text-sm">{agent.icon}</span>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider">{lang === 'mr' ? agent.nameHi : agent.name}</span>
              </div>
            ))}
          </div>

          {/* Scrollable Messages Panel */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 mb-4 custom-scrollbar">
            {messages.map((msg) => {
              const isAi = msg.role === 'model';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3.5 max-w-[90%] ${isAi ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isAi ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold' : 'bg-white/10 border border-white/15 text-slate-300'
                  }`}>
                    {isAi ? <Bot size={18} strokeWidth={2.5} /> : <User size={18} />}
                  </div>

                  {/* Bubble & Multi-Agent orchestration logic card */}
                  <div className="flex-1 space-y-2">
                    
                    {/* Orchestration steps panel */}
                    {isAi && msg.orchestration && (
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/8 to-transparent border border-emerald-500/15 overflow-hidden">
                        
                        {/* Selected agent header banner */}
                        <div className="flex items-center gap-2.5 p-3 border-b border-emerald-500/10">
                          <span className="text-xl">{msg.orchestration.selectedAgent.icon}</span>
                          <div className="flex-1">
                            <div className="text-[12px] font-black text-white">{lang === 'mr' ? msg.orchestration.selectedAgent.nameHi : msg.orchestration.selectedAgent.name}</div>
                            <div className="text-[10px] text-emerald-400 font-bold">Intent: {msg.orchestration.intent.toUpperCase()} | confidence: {Math.round(msg.orchestration.confidence)}%</div>
                          </div>
                          <button
                            onClick={() => {
                              triggerHaptic('light');
                              setExpandedOrch(expandedOrch === msg.id ? null : msg.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedOrch === msg.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {/* Summary of search counts */}
                        <div className="px-3 py-2 flex items-center gap-4 text-[10.5px] text-slate-400 border-b border-white/5 bg-slate-950/20">
                          <span className="inline-flex items-center gap-1.5"><Search className="w-3 h-3 text-emerald-400" /> {msg.orchestration.ragResults.length} docs found</span>
                          <span className="inline-flex items-center gap-1.5"><Network className="w-3 h-3 text-cyan-400" /> {msg.orchestration.detectedEntities.length} entities</span>
                          <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400" /> {msg.orchestration.citations.length} source keys</span>
                        </div>

                        {/* Orchestrated agent pipeline execution steps details */}
                        {expandedOrch === msg.id && (
                          <div className="p-3.5 space-y-2 bg-[#020503]/50 border-t border-emerald-500/10 animate-slide-down">
                            {msg.orchestration.steps.map((step) => (
                              <div key={step.step} className="flex items-start gap-2 text-[11px]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white font-bold">{step.action}</span>
                                  <span className="text-slate-500 ml-2">→ {step.result}</span>
                                </div>
                              </div>
                            ))}
                            {msg.orchestration.ragResults.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/5">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">matched RAG sources:</div>
                                <div className="space-y-1">
                                  {msg.orchestration.ragResults.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between text-[11px] py-1 px-2 rounded bg-white/[0.02] border border-white/5">
                                      <span className="text-slate-300 font-semibold truncate max-w-[70%]">{r.title}</span>
                                      <span className="text-emerald-400 font-bold">{r.confidence}% matching</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main bubble answer */}
                    <div className={`rounded-2xl p-4 border relative overflow-hidden ${
                      isAi 
                        ? 'bg-slate-900/80 border-white/10 text-slate-200 shadow-xl' 
                        : 'bg-emerald-500/10 border-emerald-500/25 text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                    </div>

                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3.5 mr-auto max-w-[90%] items-start animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                </div>
                <div className="rounded-2xl p-4 bg-slate-900/50 border border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  AI Krushi RAG engine is running agent steps...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Row */}
          {messages.length <= 2 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2 shrink-0 hide-scrollbar -mx-2 px-2">
              {currentReplies.map((r: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSend(r)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-full text-xs font-bold text-slate-300 hover:text-emerald-300 transition-all shrink-0 whitespace-nowrap active:scale-95"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Input Controls */}
          <div className="flex gap-2.5 items-center shrink-0">
            <button
              onClick={toggleSpeech}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 border-red-400' 
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? (lang === 'mr' ? 'बोलत आहे...' : 'Listening...') : (lang === 'mr' ? 'तुमचा प्रश्न इथे विचारा...' : 'Ask your farming question here...')}
              className="flex-1 bg-slate-950/50 border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors text-sm font-medium"
            />

            <button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || loading}
              className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
            >
              <Send size={18} />
            </button>
          </div>

        </div>

      </div>
    </SimpleView>
  );
};

export default ChatView;
