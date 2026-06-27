import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════
// CHAT STORE — AI conversations, messages, and state
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // AI metadata
  inputMethod?: 'text' | 'voice';
  latencyMs?: number;
  tokenCount?: number;
  citations?: { source: string; url?: string; relevance: number }[];
  confidence?: number;
  imageUrl?: string;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  topic?: string;
  language: string;
}

interface ChatState {
  // Current conversation
  activeConversation: Conversation | null;
  conversations: Conversation[];

  // UI State
  isGenerating: boolean;
  isListening: boolean;  // Voice input active
  isSpeaking: boolean;   // TTS output active
  inputText: string;
  error: string | null;

  // Actions
  startConversation: (language: string) => void;
  addUserMessage: (content: string, inputMethod?: 'text' | 'voice', imageUrl?: string) => void;
  addAssistantMessage: (content: string, metadata?: Partial<ChatMessage>) => void;
  setInputText: (text: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setError: (error: string | null) => void;
  clearConversation: () => void;
  loadConversation: (conversation: Conversation) => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useChatStore = create<ChatState>()((set, get) => ({
  // Initial state
  activeConversation: null,
  conversations: [],
  isGenerating: false,
  isListening: false,
  isSpeaking: false,
  inputText: '',
  error: null,

  // Actions
  startConversation: (language) => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      messages: [],
      startedAt: new Date(),
      lastMessageAt: new Date(),
      language,
    };
    set({
      activeConversation: newConversation,
      error: null,
    });
  },

  addUserMessage: (content, inputMethod = 'text', imageUrl) => {
    const conversation = get().activeConversation;
    if (!conversation) return;

    const message: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      inputMethod,
      imageUrl,
    };

    set({
      activeConversation: {
        ...conversation,
        messages: [...conversation.messages, message],
        lastMessageAt: new Date(),
      },
      inputText: '',
      error: null,
    });
  },

  addAssistantMessage: (content, metadata) => {
    const conversation = get().activeConversation;
    if (!conversation) return;

    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      ...metadata,
    };

    set({
      activeConversation: {
        ...conversation,
        messages: [...conversation.messages, message],
        lastMessageAt: new Date(),
      },
      isGenerating: false,
    });
  },

  setInputText: (inputText) => set({ inputText }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setError: (error) => set({ error, isGenerating: false }),

  clearConversation: () => {
    const active = get().activeConversation;
    set({
      activeConversation: null,
      conversations: active
        ? [...get().conversations, active]
        : get().conversations,
      inputText: '',
      error: null,
    });
  },

  loadConversation: (conversation) => set({
    activeConversation: conversation,
    error: null,
  }),
}));
