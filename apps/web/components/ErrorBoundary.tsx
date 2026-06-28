import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Language } from '../../types';
import { AlertTriangle, RefreshCw, WifiOff, Clock, ShieldAlert, KeyRound, Database, ImageOff, Monitor } from 'lucide-react';

// Error messages matching system-context.md §5 Error Handling Strategy
const ERROR_MESSAGES: Record<string, Record<Language, { title: string; message: string; icon: any }>> = {
  network: {
    mr: { title: 'इंटरनेट कनेक्शन नाही', message: 'ऑफलाइन मोड — शेवटचे अपडेट पाहत आहे. इंटरनेट कनेक्शन तपासा.', icon: WifiOff },
    hi: { title: 'इंटरनेट कनेक्शन नहीं', message: 'ऑफलाइन मोड — अंतिम अपडेट देख रहे हैं।', icon: WifiOff },
    en: { title: 'No Internet Connection', message: 'Offline mode — showing last cached data. Check your connection.', icon: WifiOff },
  },
  rateLimit: {
    mr: { title: 'खूप जास्त विनंत्या', message: 'कृपया काही सेकंदांनी पुन्हा प्रयत्न करा.', icon: Clock },
    hi: { title: 'बहुत अधिक अनुरोध', message: 'कृपया कुछ सेकंड बाद पुनः प्रयास करें।', icon: Clock },
    en: { title: 'Too Many Requests', message: 'Please wait a few seconds and try again.', icon: Clock },
  },
  aiTimeout: {
    mr: { title: 'AI प्रतिसाद मिळत नाही', message: 'AI सल्लागाराने उशीर केला. कृपया पुन्हा प्रयत्न करा.', icon: Clock },
    hi: { title: 'AI प्रतिसाद नहीं मिल रहा', message: 'AI सलाहकार ने देर की। कृपया पुनः प्रयास करें।', icon: Clock },
    en: { title: 'AI Response Timeout', message: 'The AI advisor took too long. Please try again.', icon: Clock },
  },
  safetyBlock: {
    mr: { title: 'विषय अनुपलब्ध', message: 'मला या विषयावर उत्तर देता येत नाही. कृपया कृषी-संबंधित प्रश्न विचारा.', icon: ShieldAlert },
    hi: { title: 'विषय अनुपलब्ध', message: 'मुझे इस विषय पर उत्तर देने में असमर्थ हूँ।', icon: ShieldAlert },
    en: { title: 'Topic Unavailable', message: 'I cannot answer questions on this topic. Please ask agriculture-related questions.', icon: ShieldAlert },
  },
  authExpired: {
    mr: { title: 'सत्र संपले', message: 'कृपया पुन्हा लॉगिन करा.', icon: KeyRound },
    hi: { title: 'सत्र समाप्त', message: 'कृपया पुनः लॉगिन करें।', icon: KeyRound },
    en: { title: 'Session Expired', message: 'Please log in again to continue.', icon: KeyRound },
  },
  quota: {
    mr: { title: 'सेवा अस्थायी अनुपलब्ध', message: 'सर्व्हर बिझी आहे. डेटा स्वयंचलितपणे सिंक होईल.', icon: Database },
    hi: { title: 'सेवा अस्थायी अनुपलब्ध', message: 'सर्वर व्यस्त है। डेटा स्वचालित रूप से सिंक होगा।', icon: Database },
    en: { title: 'Service Temporarily Unavailable', message: 'Server is busy. Data will sync automatically.', icon: Database },
  },
  imageTooLarge: {
    mr: { title: 'फोटो खूप मोठा', message: 'फोटो कॉम्प्रेस करत आहे... कृपया 5MB पेक्षा लहान फोटो वापरा.', icon: ImageOff },
    hi: { title: 'फोटो बहुत बड़ा', message: 'फोटो कंप्रेस हो रहा है... कृपया 5MB से छोटा फोटो उपयोग करें।', icon: ImageOff },
    en: { title: 'Image Too Large', message: 'Compressing photo... Please use images smaller than 5MB.', icon: ImageOff },
  },
  unsupported: {
    mr: { title: 'ब्राउझर सपोर्ट नाही', message: 'कृपया Chrome किंवा Firefox ब्राउझर वापरा.', icon: Monitor },
    hi: { title: 'ब्राउज़र समर्थित नहीं', message: 'कृपया Chrome या Firefox ब्राउज़र का उपयोग करें।', icon: Monitor },
    en: { title: 'Browser Not Supported', message: 'Please use Chrome or Firefox browser.', icon: Monitor },
  },
  generic: {
    mr: { title: 'काहीतरी चूक झाली', message: 'अनपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.', icon: AlertTriangle },
    hi: { title: 'कुछ गलत हो गया', message: 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।', icon: AlertTriangle },
    en: { title: 'Something Went Wrong', message: 'An unexpected error occurred. Please try again.', icon: AlertTriangle },
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
  lang?: Language;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorType: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorType: 'generic' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Categorize the error
    const message = error.message?.toLowerCase() || '';
    let errorType = 'generic';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
      errorType = 'network';
    } else if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
      errorType = 'rateLimit';
    } else if (message.includes('timeout') || message.includes('timed out')) {
      errorType = 'aiTimeout';
    } else if (message.includes('safety') || message.includes('blocked') || message.includes('filter')) {
      errorType = 'safetyBlock';
    } else if (message.includes('auth') || message.includes('token') || message.includes('expired')) {
      errorType = 'authExpired';
    } else if (message.includes('quota') || message.includes('limit exceeded')) {
      errorType = 'quota';
    }
    
    return { hasError: true, errorType };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    console.error('🛑 ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorType: 'generic' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const lang = this.props.lang || 'mr';
      const errorConfig = ERROR_MESSAGES[this.state.errorType]?.[lang] || ERROR_MESSAGES.generic[lang];
      const IconComponent = errorConfig.icon;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="glass-panel max-w-sm w-full p-8 rounded-[2.5rem] border border-rose-500/20 bg-slate-900/60 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <IconComponent size={28} className="text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">{errorConfig.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{errorConfig.message}</p>
            </div>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw size={14} />
              {lang === 'mr' ? 'पुन्हा प्रयत्न करा' : lang === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
