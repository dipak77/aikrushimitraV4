import React, { useState, useEffect } from 'react';
import { 
  Settings, Bot, Key, Database, Bell, Flag, FileText, 
  Activity, ClipboardList, Download, Upload, Shield, 
  CheckCircle, XCircle, Loader2, Save, RotateCcw, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../Button';
import clsx from 'clsx';

interface AdminConfigCenterProps {
  passcode: string;
}

export default function AdminConfigCenter({ passcode }: AdminConfigCenterProps) {
  const [config, setConfig] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'general' | 'ai' | 'secrets' | 'firebase' | 'notifications' | 'features' | 'prompts' | 'diagnostics' | 'audit' | 'backup'
  >('general');
  
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
      const res = await fetch('/api/admin/config', { headers });
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
      const res = await fetch('/api/admin/config', {
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
      const res = await fetch('/api/admin/config/validate', {
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
      const res = await fetch('/api/admin/diagnostics', { headers });
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
      const res = await fetch('/api/admin/audit-logs', { headers });
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'diagnostics') fetchDiagnostics();
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
      const res = await fetch('/api/admin/config/backup', { method: 'POST', headers });
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
        const res = await fetch('/api/admin/config/restore', {
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

  if (!config) return null;

  const sidebarTabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'ai', label: 'AI Providers', icon: Bot },
    { id: 'secrets', label: 'API & Secrets', icon: Key },
    { id: 'firebase', label: 'Firebase Config', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'prompts', label: 'Prompt Management', icon: FileText },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Activity },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
    { id: 'backup', label: 'Backup & Restore', icon: Download }
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 min-h-[600px]">
      
      {/* 1. Sub navigation menu side bar */}
      <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
        {sidebarTabs.map(tab => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSubTab(tab.id); setMessage(null); }}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left",
                active 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
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
              "flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold animate-enter",
              message.type === 'success' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* ── GENERAL SETTINGS ── */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">General Platform Settings</h3>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Profile</label>
                <select 
                  value={config.profile}
                  onChange={e => setConfig({ ...config, profile: e.target.value })}
                  className="w-full max-w-xs bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
                <p className="text-xs text-slate-500">Specifies settings grouping and debugging levels for the system.</p>
              </div>
            </div>
          )}

          {/* ── AI PROVIDERS ── */}
          {activeSubTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">AI Models & Router</h3>
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
                  return (
                    <div key={key} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white uppercase">{key}</span>
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
            <div className="space-y-6">
              <h3 className="text-lg font-black text-white">API Credentials & Secrets</h3>
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
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">Dynamic Firebase Client Setup</h3>
              <p className="text-xs text-slate-400">Specifies Firebase configurations used on the client. Keys are masked for protection.</p>
              
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
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">SMS & Email Delivery Settings</h3>
              
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
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">Runtime Feature Flags</h3>
              <p className="text-xs text-slate-400">Specifies modules enabled for clients in real-time. Toggling changes take place instantly.</p>
              
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Prompt Template Management</h3>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Diagnostics & Latency Matrix</h3>
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
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">Configuration Audit Logs</h3>
              <p className="text-xs text-slate-400">Chronological history of settings changes and actor updates.</p>
              
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
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">System Backups & Migration</h3>
              <p className="text-xs text-slate-400">Export and import complete profile setups as JSON configurations.</p>
              
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

        {/* Global Save Button (Exclude prompts/diagnostics/audit logs/backup tabs) */}
        {['general', 'ai', 'secrets', 'firebase', 'notifications', 'features'].includes(activeSubTab) && (
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
