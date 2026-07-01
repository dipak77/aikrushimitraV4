import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { 
  Send, Mic, MicOff, MessageSquare, Plus, History, 
  BookOpen, Sparkles, AlertTriangle, Calendar, ClipboardCheck 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { getAIFarmingAdvice } from '../../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  citations?: { source: string; category: string }[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActive: number;
}

const QUICK_REPLIES: Record<string, string[]> = {
  mr: [
    "सोयाबीन किडींचे नियंत्रण कसे करावे?",
    "कापूस पिकासाठी खत नियोजन सांगा.",
    "माझ्या भागातील आजचे बाजार भाव काय आहेत?",
    "पिकांवरील तांबेरा रोगावर उपाय काय?"
  ],
  hi: [
    "सोयाबीन कीटों का नियंत्रण कैसे करें?",
    "कपास की फसल के लिए उर्वरक नियोजन बताएं।",
    "मेरे क्षेत्र में आज मंडी भाव क्या हैं?",
    "फसल में लगने वाले रस्ट रोग का उपाय बताएं।"
  ],
  en: [
    "How to control soybean pests?",
    "Suggest fertilizer plan for cotton.",
    "What are today's mandi prices?",
    "Remedies for rust disease in crops?"
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
    // Create first default session if none exist
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
            ? "राम राम शेतकरी मित्र! मी आपला AI कृषी मित्र आहे. पिकांचे नियोजन, कीड नियंत्रण किंवा बाजार भावाबाबत काही अडचण असेल तर नक्की विचारा."
            : lang === 'hi'
            ? "राम राम किसान मित्र! मैं आपका AI कृषि मित्र हूँ। फसलों का नियोजन, कीट नियंत्रण या मंडी भाव के बारे में कुछ भी पूछें।"
            : "Hello farmer friend! I am your AI farming assistant. Ask me anything about crop planning, pest control, or market prices.",
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
    // Rename session title based on first query
    if (messages.length <= 1) {
      currentSession.title = queryText.slice(0, 18) + (queryText.length > 18 ? '...' : '');
    }

    const updatedSessions = [
      currentSession,
      ...sessions.filter(s => s.id !== activeSessionId)
    ];
    saveSessions(updatedSessions);

    try {
      // Call Gemini advice API (RAG augmented context mapping)
      const response = await getAIFarmingAdvice(queryText, lang, user.crop || 'cotton', messages);
      
      const assistantMessage: Message = {
        id: `msg_ai_${Date.now()}`,
        role: 'model',
        text: response,
        timestamp: Date.now(),
        // Mock citations fallback derived from text tags
        citations: response.includes('Source:') 
          ? [{ source: 'ICAR / KVK Guide', category: 'crop' }]
          : undefined
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
        text: lang === 'mr' ? "क्षमा करा, मला संपर्क साधता आला नाही. पुन्हा प्रयत्न करा." : "Error getting response. Please try again.",
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const currentReplies = QUICK_REPLIES[lang] || QUICK_REPLIES['en'];

  return (
    <SimpleView 
      title={lang === 'mr' ? 'AI सल्लागार' : lang === 'hi' ? 'AI सलाहकार' : 'AI Assistant'} 
      onBack={onBack}
      headerRight={
        <button 
          onClick={() => { triggerHaptic('light'); setShowHistory(!showHistory); }}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${showHistory ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
        >
          <History size={16} />
        </button>
      }
    >
      <div className="flex h-[calc(100vh-140px)] relative overflow-hidden animate-enter pb-10">
        
        {/* SIDEBAR drawer for past 30 days history */}
        {showHistory && (
          <div className="absolute inset-0 z-40 bg-[#020617]/95 border-b border-white/10 rounded-t-[2rem] p-6 animate-enter flex flex-col justify-between">
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
          
          {/* Scrollable Messages Panel */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 custom-scrollbar">
            {messages.map((msg) => {
              const isAi = msg.role === 'model';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAi ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    isAi ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 font-bold'
                  }`}>
                    {isAi ? <Sparkles size={14} /> : user.name?.charAt(0) || 'U'}
                  </div>

                  {/* Bubble */}
                  <div className={`rounded-2xl p-4 border relative overflow-hidden ${
                    isAi 
                      ? 'bg-slate-900/80 border-white/10 text-slate-200' 
                      : 'bg-emerald-500/10 border-emerald-500/25 text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>
                    
                    {/* Citations block */}
                    {isAi && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-2">
                        {msg.citations.map((cite, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-black tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full"
                          >
                            <BookOpen size={8} /> {cite.source}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-[85%] items-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div className="rounded-2xl p-4 bg-slate-900/50 border border-white/5 text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  AI Krushi Mitra is thinking...
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
            {/* Mic Toggle */}
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

            {/* Input Box */}
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? (lang === 'mr' ? 'बोलत आहे...' : 'Listening...') : (lang === 'mr' ? 'तुमचा प्रश्न इथे विचारा...' : 'Ask your farming question here...')}
              className="flex-1 bg-slate-950/50 border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors text-sm font-medium"
            />

            {/* Send Button */}
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
