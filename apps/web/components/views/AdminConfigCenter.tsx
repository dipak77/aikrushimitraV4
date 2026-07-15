import React, { useState, useEffect } from 'react';
import { 
  Settings, Bot, Key, Database, Bell, Flag, FileText, 
  Activity, ClipboardList, Download, Upload, Shield, 
  CheckCircle, XCircle, Loader2, Save, RotateCcw, AlertTriangle, Eye, EyeOff,
  LayoutGrid, ChevronUp, ChevronDown, Sparkles, Zap, Brain, Lock, Server
} from 'lucide-react';
import { Button } from '../Button';
import clsx from 'clsx';
import { getApiUrl } from '../../services/geminiService';

interface AdminConfigCenterProps {
  passcode: string;
}

export default function AdminConfigCenter({ passcode }: AdminConfigCenterProps) {
  const [config, setConfig] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'general' | 'menu' | 'ai' | 'secrets' | 'firebase' | 'notifications' | 'features' | 'prompts' | 'diagnostics' | 'audit' | 'backup'
  >('overview');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Diagnostics and Audit state
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // Prompt edit state
  const [selectedPromptKey, setSelectedPromptKey] = useState<string>('diseaseDiagnosis');
  const [promptContent, setPromptContent] = useState<string>('');

  // Key validation state
  const [validatingKey, setValidatingKey] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${passcode}`,
    'x-admin-actor': 'Admin User'
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/config'), { headers });
      if (!res.ok) throw new Error('Failed to fetch configurations.');
      const data = await res.json();
      setConfig(data.config);
      if (data.config?.prompts?.[selectedPromptKey]) {
        setPromptContent(data.config.prompts[selectedPromptKey].content);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (updatedConfig = config) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(getApiUrl('/api/admin/config'), {
        method: 'POST',
        headers,
        body: JSON.stringify(updatedConfig)
      });
      if (!res.ok) throw new Error('Failed to save settings.');
      const data = await res.json();
      setConfig(data.config);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleValidateKey = async (provider: string, apiKey: string) => {
    if (!apiKey || apiKey.startsWith('****')) {
      setValidationResults(prev => ({
        ...prev,
        [provider]: { success: true, message: 'Existing key remains valid.' }
      }));
      return;
    }
    
    setValidatingKey(provider);
    try {
      const res = await fetch(getApiUrl('/api/admin/config/validate'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      setValidationResults(prev => ({
        ...prev,
        [provider]: { success: res.ok, message: data.message || data.error }
      }));
    } catch (err: any) {
      setValidationResults(prev => ({
        ...prev,
        [provider]: { success: false, message: 'Validation connection failed.' }
      }));
    } finally {
      setValidatingKey(null);
    }
  };

  const fetchDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/diagnostics'), { headers });
      const data = await res.json();
      setDiagnostics(data.diagnostics || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudits(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/audit-logs'), { headers });
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'diagnostics' || activeSubTab === 'overview') fetchDiagnostics();
    if (activeSubTab === 'audit') fetchAuditLogs();
  }, [activeSubTab]);

  const handlePromptChange = (key: string) => {
    setSelectedPromptKey(key);
    if (config?.prompts?.[key]) {
      setPromptContent(config.prompts[key].content);
    }
  };

  const handleSavePrompt = () => {
    if (!config) return;
    const updated = {
      ...config,
      prompts: {
        ...config.prompts,
        [selectedPromptKey]: {
          ...config.prompts[selectedPromptKey],
          content: promptContent
        }
      }
    };
    handleSave(updated);
  };

  const handleRollbackPrompt = (historicalContent: string) => {
    setPromptContent(historicalContent);
    const updated = {
      ...config,
      prompts: {
        ...config.prompts,
        [selectedPromptKey]: {
          ...config.prompts[selectedPromptKey],
          content: historicalContent
        }
      }
    };
    handleSave(updated);
  };

  const handleExportConfig = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/config/backup'), { method: 'POST', headers });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `akm-config-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Backup export failed: ' + err.message });
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const res = await fetch(getApiUrl('/api/admin/config/restore'), {
          method: 'POST',
          headers,
          body: JSON.stringify({ config: parsed })
        });
        if (!res.ok) throw new Error('Import verification failed.');
        fetchConfig();
        setMessage({ type: 'success', text: 'Configuration restored successfully!' });
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to restore config: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const toggleSecretVisibility = (field: string) => {
    setVisibleSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-emerald-400">
        <Loader2 className="animate-spin mr-2" /> Loading configurations...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-[#070a07] backdrop-blur-md rounded-2xl border border-white/5 p-6 min-h-[300px] flex flex-col justify-center items-center gap-4 text-center">
        {message ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
              <AlertTriangle size={24} />
              <span>{message.text}</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">Failed to load platform configuration. Please check your credentials and try again.</p>
            <button onClick={fetchConfig} className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 transition mx-auto mt-2">
              <RotateCcw size={14} /> Retry Connection
            </button>
          </div>
        ) : (
          <div className="text-slate-500">No configuration found.</div>
        )}
      </div>
    );
  }

  const sidebarTabs = [
    { id: 'overview', label: 'ओवरव्यू', labelEn: 'Overview', icon: LayoutGrid },
    { id: 'general', label: 'सामान्य सेटिंग्स', labelEn: 'General Settings', icon: Settings },
    { id: 'menu', label: 'मेन्यू सेटिंग्स', labelEn: 'Navigation & Menu', icon: LayoutGrid },
    { id: 'ai', label: 'AI प्रदाता', labelEn: 'AI Providers', icon: Bot },
    { id: 'secrets', label: 'API और सीक्रेट्स', labelEn: 'API & Secrets', icon: Key },
    { id: 'firebase', label: 'Firebase कॉन्फ़िग', labelEn: 'Firebase Config', icon: Database },
    { id: 'notifications', label: 'सूचनाएं', labelEn: 'Notifications', icon: Bell },
    { id: 'features', label: 'फ़ीचर फ़्लैग', labelEn: 'Feature Flags', icon: Flag },
    { id: 'prompts', label: 'प्रॉम्प्ट प्रबंधन', labelEn: 'Prompt Management', icon: FileText },
    { id: 'diagnostics', label: 'सिस्टम डायग्नोस्टिक्स', labelEn: 'System Diagnostics', icon: Activity },
    { id: 'audit', label: 'ऑडिट लॉग', labelEn: 'Audit Logs', icon: ClipboardList },
    { id: 'backup', label: 'बैकअप और रिस्टोर', labelEn: 'Backup & Restore', icon: Download }
  ] as const;

  const PROVIDER_ICON: Record<string, typeof Bot> = {
    openai: Sparkles,
    gemini: Zap,
    claude: Brain,
    deepseek: Bot,
    groq: Zap
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#070a07]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 min-h-[600px]">
      
      {/* 1. Sub navigation menu sidebar */}
      <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
        {sidebarTabs.map(tab => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSubTab(tab.id); setMessage(null); }}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-all text-left border",
                active 
                  ? "bg-emerald-500/10 text-white border-emerald-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
              )}
            >
              <Icon size={14} className={active ? "text-emerald-400" : "text-slate-500"} />
              <div className="flex flex-col">
                <span className="text-[12px]">{tab.label}</span>
                <span className="text-[9px] text-slate-500 font-normal uppercase tracking-wider">{tab.labelEn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Main Content pane */}
      <div className="lg:col-span-3 flex flex-col justify-between">
        
        {/* Tab content area */}
        <div className="space-y-6">
          
          {/* Notifications Banner */}
          {message && (
            <div className={clsx(
              "flex items-center gap-3 p-4 rounded-xl border text-xs font-semibold animate-enter",
              message.type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* ── OVERVIEW TAB ── */}
          {activeSubTab === 'overview' && (() => {
            const enabledProvidersCount = Object.values(config.ai?.providers || {}).filter((p: any) => p.enabled).length;
            const flagsOnCount = Object.values(config.features || {}).filter((f: any) => f === true).length;
            const healthyServicesCount = diagnostics.filter((d: any) => d.status === 'Connected').length;

            const stats = [
              { label: 'सक्रिय AI प्रदाता', labelEn: 'Enabled AI Providers', value: enabledProvidersCount, icon: Bot, accent: 'from-emerald-400 to-emerald-600' },
              { label: 'वर्तमान प्रोफ़ाइल', labelEn: 'Active Profile', value: config.profile ?? '—', icon: Activity, accent: 'from-sky-400 to-sky-600' },
              { label: 'फ़ीचर फ़्लैग चालू', labelEn: 'Feature Flags On', value: flagsOnCount, icon: Flag, accent: 'from-amber-400 to-amber-600' },
              { label: 'स्वस्थ सेवाएँ', labelEn: 'Healthy Services', value: `${healthyServicesCount}/${diagnostics.length || 0}`, icon: Server, accent: 'from-rose-400 to-rose-600' }
            ];

            return (
              <div className="space-y-6 animate-enter">
                <div>
                  <h2 className="text-xl font-bold text-white">ओवरव्यू</h2>
                  <p className="text-[12px] text-slate-400 mt-0.5">Platform Overview · सिस्टम की समग्र स्थिति</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.labelEn} className="glass bg-white/[0.02] rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.accent} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-black" />
                          </div>
                        </div>
                        <div className="text-xl font-bold text-white leading-tight">{s.value}</div>
                        <div className="text-[11px] text-white font-medium mt-1">{s.label}</div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">{s.labelEn}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Provider status summary */}
                <div className="glass bg-white/[0.02] rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">AI प्रदाता स्थिति</h3>
                    <span className="text-[10px] text-slate-500 ml-auto uppercase tracking-wider">AI Providers Status</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Object.keys(config.ai?.providers || {}).map(key => {
                      const p = config.ai.providers[key];
                      const Icon = PROVIDER_ICON[key] ?? Bot;
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.enabled ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                            <Icon className={`w-4 h-4 ${p.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-white capitalize">{key}</div>
                            <div className="text-[10px] text-slate-500 truncate">{p.model}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.enabled ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">सक्रिय</span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10">बंद</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── GENERAL SETTINGS ── */}
          {activeSubTab === 'general' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">सामान्य सेटिंग्स</h3>
                <p className="text-[12px] text-slate-400">General Settings · प्लेटफ़ॉर्म की बुनियादी जानकारी</p>
              </div>

              <div className="glass bg-white/[0.02] rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11.5px] text-slate-400">सक्रिय प्रोफ़ाइल (Active Profile)</label>
                    <select 
                      value={config.profile}
                      onChange={e => setConfig({ ...config, profile: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs"
                    >
                      <option value="Development">Development</option>
                      <option value="Testing">Testing</option>
                      <option value="Staging">Staging</option>
                      <option value="Production">Production</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NAVIGATION & MENU CONTROL ── */}
          {activeSubTab === 'menu' && (() => {
            const sequence = config.menuSettings?.sequence || [
              'DASHBOARD', 'LANDING', 'WEATHER', 'CALENDAR', 'SABJI_MANDI', 
              'CHAT', 'AGRI_KNOWLEDGE', 'SCHEMES', 'MARKET', 'COMMUNITY', 
              'DISEASE_DETECTOR', 'SOIL', 'YIELD', 'AREA_CALCULATOR', 
              'PREMIUM', 'INNOVATION', 'ADMIN', 'SETTINGS'
            ];
            const visibility = config.menuSettings?.visibility || {};

            return (
              <div className="space-y-4 animate-enter">
                <div>
                  <h3 className="text-lg font-black text-white">मेन्यू सेटिंग्स</h3>
                  <p className="text-[12px] text-slate-400">Navigation & Menu · साइडबार लिंक व्यवस्थापन</p>
                </div>

                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                  <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {sequence.map((id: string, index: number) => {
                      const isVisible = visibility[id] !== false;
                      const name = {
                        DASHBOARD: 'Dashboard / Home',
                        LANDING: 'Landing Page',
                        WEATHER: 'Weather Forecast',
                        CALENDAR: 'Crop Management',
                        SABJI_MANDI: 'Sabji Mandi (Marketplace)',
                        CHAT: 'AI Chat Advisor',
                        AGRI_KNOWLEDGE: 'Agriculture Knowledge Hub',
                        SCHEMES: 'Government Schemes',
                        MARKET: 'Mandi Rates',
                        COMMUNITY: 'Farmer Community',
                        DISEASE_DETECTOR: 'Crop Doctor (Disease Detector)',
                        SOIL: 'Soil Analysis / Health',
                        YIELD: 'Yield Predictor',
                        AREA_CALCULATOR: 'Area Calculator',
                        PREMIUM: 'Premium Services',
                        INNOVATION: 'Innovation Hub',
                        ADMIN: 'Admin Console',
                        SETTINGS: 'System Settings'
                      }[id] || id;

                      const moveUp = () => {
                        if (index === 0) return;
                        const newSeq = [...sequence];
                        const temp = newSeq[index - 1];
                        newSeq[index - 1] = newSeq[index];
                        newSeq[index] = temp;
                        setConfig({
                          ...config,
                          menuSettings: {
                            sequence: newSeq,
                            visibility
                          }
                        });
                      };

                      const moveDown = () => {
                        if (index === sequence.length - 1) return;
                        const newSeq = [...sequence];
                        const temp = newSeq[index + 1];
                        newSeq[index + 1] = newSeq[index];
                        newSeq[index] = temp;
                        setConfig({
                          ...config,
                          menuSettings: {
                            sequence: newSeq,
                            visibility
                          }
                        });
                      };

                      const toggleVisibility = () => {
                        if (id === 'SETTINGS') return;
                        setConfig({
                          ...config,
                          menuSettings: {
                            sequence,
                            visibility: {
                              ...visibility,
                              [id]: !isVisible
                            }
                          }
                        });
                      };

                      return (
                        <div key={id} className="flex items-center justify-between bg-black/30 px-4 py-2.5 border border-white/5 rounded-xl hover:border-emerald-500/25 transition">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-mono w-6">{index + 1}</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-white">{name}</span>
                              <span className="text-[10px] text-slate-500 font-mono -mt-0.5">{id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={moveUp} 
                              disabled={index === 0}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button 
                              onClick={moveDown} 
                              disabled={index === sequence.length - 1}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                            >
                              <ChevronDown size={14} />
                            </button>

                            <button 
                              onClick={toggleVisibility}
                              disabled={id === 'SETTINGS'}
                              className={`p-1.5 rounded transition ${
                                id === 'SETTINGS' ? 'text-slate-600 cursor-not-allowed' :
                                isVisible ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── AI PROVIDERS ── */}
          {activeSubTab === 'ai' && (
            <div className="space-y-6 animate-enter">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">AI प्रदाता</h3>
                  <p className="text-[12px] text-slate-400">AI Providers · विभिन्न AI मॉडल कॉन्फ़िगर करें</p>
                </div>
                <div className="flex gap-2 items-center text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
                  <span className="text-slate-400">Default Router Provider:</span>
                  <select
                    value={config.ai.defaultProvider}
                    onChange={e => setConfig({
                      ...config,
                      ai: { ...config.ai, defaultProvider: e.target.value }
                    })}
                    className="bg-transparent text-emerald-400 font-bold border-none outline-none focus:ring-0"
                  >
                    {Object.keys(config.ai.providers).map(p => (
                      <option key={p} value={p} className="bg-slate-950 text-white">{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.keys(config.ai.providers).map(key => {
                  const provider = config.ai.providers[key];
                  const Icon = PROVIDER_ICON[key] ?? Bot;
                  return (
                    <div key={key} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={provider.enabled ? "text-emerald-400" : "text-slate-500"} />
                          <span className="font-bold text-sm text-white uppercase">{key}</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={e => {
                            const updated = { ...config };
                            updated.ai.providers[key].enabled = e.target.checked;
                            setConfig(updated);
                          }}
                          className="w-4 h-4 rounded text-emerald-500 bg-black border-white/10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-slate-500">Model Name</label>
                          <input 
                            type="text"
                            value={provider.model}
                            onChange={e => {
                              const updated = { ...config };
                              updated.ai.providers[key].model = e.target.value;
                              setConfig(updated);
                            }}
                            className="w-full bg-black/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500">Max Tokens</label>
                          <input 
                            type="number"
                            value={provider.maxTokens}
                            onChange={e => {
                              const updated = { ...config };
                              updated.ai.providers[key].maxTokens = parseInt(e.target.value, 10) || 4096;
                              setConfig(updated);
                            }}
                            className="w-full bg-black/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-white mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── API & SECRETS ── */}
          {activeSubTab === 'secrets' && (
            <div className="space-y-6 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">API और सीक्रेट्स</h3>
                <p className="text-[12px] text-slate-400">API & Secrets · विभिन्न एपीआई क्रेडेंशियल्स</p>
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                {Object.keys(config.ai.providers).map(key => {
                  const provider = config.ai.providers[key];
                  const secretKey = `ai_${key}`;
                  const isVisible = visibleSecrets[secretKey] || false;
                  return (
                    <div key={key} className="space-y-2 border-b border-white/5 pb-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 uppercase">{key} API Key</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleSecretVisibility(secretKey)}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleValidateKey(key, provider.apiKey)}
                            className="text-xs text-emerald-400 hover:underline font-bold"
                            disabled={validatingKey === key}
                          >
                            {validatingKey === key ? 'Validating...' : 'Validate Key'}
                          </button>
                        </div>
                      </div>
                      <input 
                        type={isVisible ? "text" : "password"}
                        value={provider.apiKey}
                        onChange={e => {
                          const updated = { ...config };
                          updated.ai.providers[key].apiKey = e.target.value;
                          setConfig(updated);
                        }}
                        placeholder="Not Configured"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs"
                      />
                      {validationResults[key] && (
                        <div className={clsx(
                          "text-[10px] font-semibold flex items-center gap-1.5 mt-1",
                          validationResults[key].success ? "text-emerald-400" : "text-red-400"
                        )}>
                          {validationResults[key].success ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          <span>{validationResults[key].message}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FIREBASE SETTINGS ── */}
          {activeSubTab === 'firebase' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">Firebase कॉन्फ़िग</h3>
                <p className="text-[12px] text-slate-400">Firebase Config · डेटाबेस सेटअप</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(config.firebase).map(key => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input 
                      type="text"
                      value={config.firebase[key]}
                      onChange={e => {
                        const updated = { ...config };
                        updated.firebase[key] = e.target.value;
                        setConfig(updated);
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS SETTINGS ── */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">सूचनाएं</h3>
                <p className="text-[12px] text-slate-400">Notifications · एसएमएस और ईमेल सेटअप</p>
              </div>
              
              <div className="space-y-4">
                {/* Twilio */}
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SMS Twilio Gateway</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-500">Account SID</label>
                      <input 
                        type="text" 
                        value={config.externalApis.sms.accountSid} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.externalApis.sms.accountSid = e.target.value;
                          setConfig(updated);
                        }}
                        className="w-full bg-black/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Auth Token</label>
                      <input 
                        type="password" 
                        value={config.externalApis.sms.authToken} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.externalApis.sms.authToken = e.target.value;
                          setConfig(updated);
                        }}
                        className="w-full bg-black/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-white mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* SMTP Email */}
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SMTP Email Server</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Host</label>
                      <input 
                        type="text" 
                        value={config.externalApis.email.host} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.externalApis.email.host = e.target.value;
                          setConfig(updated);
                        }}
                        className="w-full bg-black/60 border border-white/5 rounded-lg px-2 py-1.5 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Port</label>
                      <input 
                        type="number" 
                        value={config.externalApis.email.port} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.externalApis.email.port = parseInt(e.target.value, 10) || 587;
                          setConfig(updated);
                        }}
                        className="w-full bg-black/60 border border-white/5 rounded-lg px-2 py-1.5 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">User</label>
                      <input 
                        type="text" 
                        value={config.externalApis.email.user} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.externalApis.email.user = e.target.value;
                          setConfig(updated);
                        }}
                        className="w-full bg-black/60 border border-white/5 rounded-lg px-2 py-1.5 text-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FEATURE FLAGS ── */}
          {activeSubTab === 'features' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">फ़ीचर फ़्लैग</h3>
                <p className="text-[12px] text-slate-400">Feature Flags · रीयल-टाइम मॉड्यूल नियंत्रण</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                {Object.keys(config.features).map(key => (
                  <div key={key} className="flex justify-between items-center bg-slate-950/40 p-3.5 border border-white/5 rounded-xl">
                    <span className="text-xs font-semibold capitalize text-white">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.features[key]} 
                        onChange={e => {
                          const updated = { ...config };
                          updated.features[key] = e.target.checked;
                          setConfig(updated);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROMPT MANAGEMENT ── */}
          {activeSubTab === 'prompts' && (
            <div className="space-y-4 animate-enter">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">प्रॉम्प्ट प्रबंधन</h3>
                  <p className="text-[12px] text-slate-400">Prompt Management · एआई प्रॉम्प्ट टेम्पलेट्स</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedPromptKey}
                    onChange={e => handlePromptChange(e.target.value)}
                    className="bg-slate-950 text-white border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold"
                  >
                    <option value="diseaseDiagnosis">Crop Diagnosis</option>
                    <option value="weatherAdvisory">Weather Advisory</option>
                    <option value="schemeMatcher">Schemes Matcher</option>
                    <option value="soilInterpreter">Soil Interpreter</option>
                    <option value="agriExpert">Agri Expert Advisor</option>
                  </select>
                  <Button size="sm" variant="primary" onClick={handleSavePrompt} disabled={saving}>
                    Update Prompt
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 px-1">
                    <span>Template Editor</span>
                    <span>Version {config.prompts[selectedPromptKey]?.version || '1.0'}</span>
                  </div>
                  <textarea 
                    value={promptContent}
                    onChange={e => setPromptContent(e.target.value)}
                    className="w-full h-80 bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>

                {/* History/Rollbacks */}
                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-slate-400 block border-b border-white/5 pb-2">Version History</span>
                  <div className="space-y-2 h-72 overflow-y-auto pr-1">
                    {(!config.prompts[selectedPromptKey]?.history || config.prompts[selectedPromptKey].history.length === 0) ? (
                      <p className="text-[10px] text-slate-600">No prompt revisions documented yet.</p>
                    ) : (
                      config.prompts[selectedPromptKey].history.map((hist: any, index: number) => (
                        <div key={index} className="bg-black/40 p-2.5 rounded-lg text-[10px] border border-white/5 flex flex-col gap-1.5">
                          <div className="flex justify-between text-slate-500">
                            <span>v{hist.version}</span>
                            <span>{new Date(hist.timestamp).toLocaleDateString()}</span>
                          </div>
                          <span className="text-slate-400">By {hist.actor}</span>
                          <button 
                            onClick={() => handleRollbackPrompt(hist.content)}
                            className="text-[10px] text-left text-emerald-400 hover:underline font-bold"
                          >
                            Rollback to this version
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SYSTEM DIAGNOSTICS ── */}
          {activeSubTab === 'diagnostics' && (
            <div className="space-y-4 animate-enter">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">सिस्टम डायग्नोस्टिक्स</h3>
                  <p className="text-[12px] text-slate-400">Diagnostics · सेवा संपर्क जांच</p>
                </div>
                <Button size="sm" variant="secondary" onClick={fetchDiagnostics} disabled={loadingDiagnostics}>
                  {loadingDiagnostics ? 'Checking...' : 'Run Diagnostics'}
                </Button>
              </div>

              {loadingDiagnostics ? (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <Loader2 className="animate-spin mr-2" /> Executing service connectivity checks...
                </div>
              ) : (
                <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Service Name</th>
                        <th className="px-4 py-3">Health Status</th>
                        <th className="px-4 py-3">Latency (ms)</th>
                        <th className="px-4 py-3">Details / Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {diagnostics.map((diag, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="px-4 py-3 font-semibold text-white">{diag.name}</td>
                          <td className="px-4 py-3">
                            <span className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                              diag.status === 'Connected' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              diag.status === 'Error' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                              "bg-slate-800 border-white/5 text-slate-400"
                            )}>
                              {diag.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{diag.latency ? `${diag.latency}ms` : '-'}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{diag.error || diag.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── AUDIT LOGS ── */}
          {activeSubTab === 'audit' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">ऑडिट लॉग</h3>
                <p className="text-[12px] text-slate-400">Audit Logs · सेटिंग बदलाव इतिहास</p>
              </div>
              
              {loadingAudits ? (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <Loader2 className="animate-spin mr-2" /> Loading audit history...
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto pr-1 border border-white/5 rounded-xl bg-slate-950/40">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-bold sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Actor</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Details of Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No logs on record.</td>
                        </tr>
                      ) : (
                        auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3 text-emerald-400 font-semibold">{log.actor}</td>
                            <td className="px-4 py-3 text-white font-bold">{log.action}</td>
                            <td className="px-4 py-3 text-slate-400">
                              <div className="flex flex-col gap-1 text-[10px]">
                                {log.details?.map((det: any, k: number) => (
                                  <span key={k}>
                                    <strong className="text-slate-500 font-bold">{det.field}:</strong> {det.oldValue} ➔ {det.newValue}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── BACKUP & RESTORE ── */}
          {activeSubTab === 'backup' && (
            <div className="space-y-4 animate-enter">
              <div>
                <h3 className="text-lg font-black text-white">बैकअप और रिस्टोर</h3>
                <p className="text-[12px] text-slate-400">Backup & Restore · प्रोफाइल बैकअप निर्यात और आयात</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button variant="secondary" className="flex items-center gap-2" onClick={handleExportConfig}>
                  <Download size={16} /> Export JSON Config
                </Button>
                <div className="relative">
                  <input 
                    type="file" 
                    id="import-config-file" 
                    onChange={handleImportConfig} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".json"
                  />
                  <Button variant="primary" className="flex items-center gap-2 pointer-events-none">
                    <Upload size={16} /> Import JSON Config
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Save Button (Exclude prompts/diagnostics/audit logs/backup/overview tabs) */}
        {['general', 'menu', 'ai', 'secrets', 'firebase', 'notifications', 'features'].includes(activeSubTab) && (
          <div className="flex justify-end pt-6 border-t border-white/5 mt-6">
            <Button variant="primary" onClick={() => handleSave()} disabled={saving} className="flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Configuration</span>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
