import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { Language } from '../../types';

const TEXTS: Record<string, any> = {
  mr: {
    title: 'AI Chat Assistant',
    placeholder: 'कोणता प्रश्न विचारा...',
    messages: [
      { role: 'user', text: 'माझ्या सोयाबीन पिकाचा सध्याचा आरोग्य कसा आहे, काय करणं?', time: '5:00 PM' },
      { role: 'bot', text: 'ही बघा मागील काही रोपांना पीळसर जागा आलेली आहेत.\n\n• 2 किलो काबोफ्यूरेन + 1 किलो रिझोबी प्रति हेक्टर माध्यम मिसळून फवारणी करा.\n• 7 दिवसांनी पुन्हा फवारणी करा.\n• पारायजीन नित्ण स्वच्छतेसाठी तोडे.', time: '5:01 PM' },
    ],
    suggestion: 'कोणता हिरवा खतावर विचार करता...',
  },
  hi: {
    title: 'AI Chat Assistant',
    placeholder: 'कोई सवाल पूछें...',
    messages: [
      { role: 'user', text: 'मेरी सोयाबीन फसल का स्वास्थ्य कैसा है, क्या करना चाहिए?', time: '5:00 PM' },
      { role: 'bot', text: 'पिछले कुछ पौधों पर पीली धब्बे दिखाई दे रहे हैं।\n\n• 2 किलो कार्बोफ्यूरन + 1 किलो राइजोबियम प्रति हेक्टर छिड़कें।\n• 7 दिनों बाद दोबारा छिड़काव करें।', time: '5:01 PM' },
    ],
    suggestion: 'हरी खाद के बारे में सोच रहे हैं...',
  },
  en: {
    title: 'AI Chat Assistant',
    placeholder: 'Ask any question...',
    messages: [
      { role: 'user', text: "What's the current health of my soyabean crop, what should I do?", time: '5:00 PM' },
      { role: 'bot', text: "Some yellowing spots have appeared on recent plants.\n\n• Apply 2kg Carbofuran + 1kg Rhizobium per hectare.\n• Repeat spray after 7 days.\n• Maintain proper field hygiene.", time: '5:01 PM' },
    ],
    suggestion: 'Thinking about green manure...',
  },
};

export const AIChatWidget = ({ lang }: { lang: Language }) => {
  const t = TEXTS[lang] || TEXTS.en;
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-[#0d1520] to-slate-900/90 border border-white/10 flex flex-col group hover:border-emerald-500/30 transition-all duration-500">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <MessageSquare size={16} className="text-emerald-400" />
        </div>
        <span className="text-sm font-bold text-slate-200">{t.title}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 custom-scrollbar">
        {t.messages.map((msg: any, i: number) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-emerald-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
              msg.role === 'user'
                ? 'bg-emerald-500/15 border border-emerald-500/20'
                : 'bg-slate-800/50 border border-white/5'
            }`}>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">{msg.text}</p>
              <p className="text-[9px] text-slate-500 mt-1.5 text-right">{msg.time}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-cyan-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-xl px-3 py-2 focus-within:border-emerald-500/30 transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
          <button className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors">
            <Send size={12} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
