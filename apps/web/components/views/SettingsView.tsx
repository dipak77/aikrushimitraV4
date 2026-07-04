'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Globe, Bell, Mic, RefreshCw, WifiOff,
  Ruler, Palette, Shield, LogOut, Save, ArrowLeft, Key, Lock, CheckCircle
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { triggerHaptic } from '../../utils/common';
import type { Language, UserProfile } from '../../types';

interface SettingsViewProps {
  lang: Language;
  user: UserProfile;
  onBack: () => void;
}

const TEXTS: Record<string, any> = {
  mr: {
    title: 'सेटिंग्ज',
    titleEn: 'Settings',
    subtitle: 'तुमचे खाते, प्राधान्ये आणि सिस्टम कॉन्फिगरेशन व्यवस्थापित करा',
    profile: 'प्रोफाइल',
    premiumFarmer: 'प्रीमियम शेतकरी',
    nameLabel: 'नाव',
    phoneLabel: 'फोन',
    emailLabel: 'ईमेल',
    villageLabel: 'गाव / क्षेत्र',
    saveBtn: 'जतन करा',
    notifications: 'सूचना',
    pushNotifications: 'पुश सूचना',
    pushNotificationsDesc: 'महत्वाचे अलर्ट मिळवा',
    voiceResponse: 'व्हॉइस प्रतिसाद',
    voiceResponseDesc: 'AI उत्तरे बोलून ऐका',
    autoSync: 'ऑटो सिंक',
    autoSyncDesc: 'डेटा स्वयंचलितपणे सिंक करा',
    offlineMode: 'ऑटो सिंक',
    offlineModeDesc: 'इंटरनेटशिवाय वापरा',
    langUnits: 'भाषा आणि एकके',
    langLabel: 'भाषा',
    unitLabel: 'मापन प्रणाली',
    metric: 'मेट्रिक',
    imperial: 'इम्पीरियल',
    themeLabel: 'थीम',
    dark: 'डार्क',
    light: 'लाईट',
    security: 'सुरक्षा',
    changePassword: 'पासवर्ड बदला',
    twoFA: 'दोन-घटक प्रमाणीकरण (2FA)',
    logout: 'लॉगआउट',
    saveSuccess: 'प्रोफाइल जतन केली! ✅',
    saveSuccessDesc: 'तुमची माहिती यशस्वीरित्या अपडेट झाली आहे.',
  },
  hi: {
    title: 'सेटिंग्स',
    titleEn: 'Settings',
    subtitle: 'अपना खाता, प्राथमिकताएं और सिस्टम कॉन्फ़िगरेशन प्रबंधित करें',
    profile: 'प्रोफ़ाइल',
    premiumFarmer: 'प्रीमियम किसान',
    nameLabel: 'नाम',
    phoneLabel: 'फ़ोन',
    emailLabel: 'ईमेल',
    villageLabel: 'गाँव / क्षेत्र',
    saveBtn: 'सहेजें',
    notifications: 'सूचनाएं',
    pushNotifications: 'पुश सूचनाएं',
    pushNotificationsDesc: 'महत्वपूर्ण अलर्ट प्राप्त करें',
    voiceResponse: 'वॉइस प्रतिक्रिया',
    voiceResponseDesc: 'AI उत्तरों को बोलकर सुनें',
    autoSync: 'ऑटो सिंक',
    autoSyncDesc: 'डेटा स्वचालित रूप से सिंक करें',
    offlineMode: 'ऑफलाइन मोड',
    offlineModeDesc: 'बिना इंटरनेट उपयोग करें',
    langUnits: 'भाषा और इकाइयाँ',
    langLabel: 'भाषा',
    unitLabel: 'इकाई प्रणाली',
    metric: 'मीट्रिक',
    imperial: 'इम्पीरियल',
    themeLabel: 'थीम',
    dark: 'डार्क',
    light: 'लाइट',
    security: 'सुरक्षा',
    changePassword: 'पासवर्ड बदलें',
    twoFA: 'दो-कारक प्रमाणीकरण (2FA)',
    logout: 'लॉगआउट',
    saveSuccess: 'प्रोफ़ाइल सहेजी गई! ✅',
    saveSuccessDesc: 'आपकी जानकारी अपडेट हो गई है',
  },
  en: {
    title: 'Settings',
    titleEn: 'Configuration Preferences',
    subtitle: 'Manage your account, preferences, and system configurations',
    profile: 'Profile',
    premiumFarmer: 'Premium Farmer',
    nameLabel: 'Name',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    villageLabel: 'Village / Region',
    saveBtn: 'Save Settings',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive important alerts',
    voiceResponse: 'Voice Responses',
    voiceResponseDesc: 'Listen to AI answers spoken aloud',
    autoSync: 'Auto Sync',
    autoSyncDesc: 'Synchronize data automatically',
    offlineMode: 'Offline Mode',
    offlineModeDesc: 'Use application without internet',
    langUnits: 'Language & Units',
    langLabel: 'Language',
    unitLabel: 'Unit System',
    metric: 'Metric',
    imperial: 'Imperial',
    themeLabel: 'Theme',
    dark: 'Dark',
    light: 'Light',
    security: 'Security & Access',
    changePassword: 'Change Password',
    twoFA: 'Two-Factor Authentication (2FA)',
    logout: 'Log Out',
    saveSuccess: 'Profile Saved! ✅',
    saveSuccessDesc: 'Your details have been updated successfully.',
  }
};

const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic('light');
        onCheckedChange(!checked);
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
};

export default function SettingsView({ lang, user, onBack }: SettingsViewProps) {
  const t = TEXTS[lang] || TEXTS.en;
  
  const {
    notifications,
    voiceEnabled,
    offlineMode,
    setNotifications,
    setVoiceEnabled,
    setOfflineMode,
    updateProfile,
    logout,
    setLanguage
  } = useUserStore();

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [village, setVillage] = useState(user.village || '');
  const [phone, setPhone] = useState(localStorage.getItem('user_phone') || '+91 98765 43210');
  
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const handleSaveProfile = () => {
    triggerHaptic('medium');
    updateProfile({
      name,
      email,
      village
    });
    setToast({
      title: t.saveSuccess,
      desc: t.saveSuccessDesc
    });
    setTimeout(() => setToast(null), 4000);
  };

  const triggerToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-full w-full overflow-y-auto hide-scrollbar bg-transparent text-slate-100 p-4 md:p-6 lg:pl-64">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-[999] bg-[#0d1520] border border-emerald-500/30 rounded-xl p-4 shadow-2xl flex items-start gap-3 max-w-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-white">{toast.title}</div>
            <div className="text-xs text-slate-300 mt-1 leading-snug">{toast.desc}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={onBack}
          className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all flex-shrink-0"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{t.title}</h1>
          <div className="text-[11px] text-emerald-400 uppercase tracking-wider mt-0.5">{t.titleEn}</div>
          <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 max-w-[1200px]">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 border border-white/10 bg-slate-900/60"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">{t.profile}</h3>
          </div>

          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-emerald-950 font-black text-xl">
              {name ? name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{name || 'Farmer Guest'}</div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{t.premiumFarmer}</div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">{village || 'Village, Region'}</div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10.5px] text-slate-400 mb-1 block font-semibold">{t.nameLabel}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[10.5px] text-slate-400 mb-1 block font-semibold">{t.phoneLabel}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[10.5px] text-slate-400 mb-1 block font-semibold">{t.emailLabel}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[10.5px] text-slate-400 mb-1 block font-semibold">{t.villageLabel}</label>
              <input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-emerald-950 text-xs font-black hover:shadow-lg hover:shadow-emerald-500/30 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {t.saveBtn}
            </button>
          </div>
        </motion.div>

        {/* Preferences & Language */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Notifications / Toggles */}
          <div className="glass rounded-2xl p-5 border border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">{t.notifications}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.pushNotifications}</div>
                    <div className="text-[10px] text-slate-500">{t.pushNotificationsDesc}</div>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={(v) => { setNotifications(v); triggerToast(v ? 'Notifications Enabled' : 'Notifications Muted', ''); }} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.voiceResponse}</div>
                    <div className="text-[10px] text-slate-500">{t.voiceResponseDesc}</div>
                  </div>
                </div>
                <Switch checked={voiceEnabled} onCheckedChange={(v) => { setVoiceEnabled(v); triggerToast(v ? 'Voice Assistant Feedback Enabled' : 'Voice Feedback Muted', ''); }} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.autoSync}</div>
                    <div className="text-[10px] text-slate-500">{t.autoSyncDesc}</div>
                  </div>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <WifiOff className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.offlineMode}</div>
                    <div className="text-[10px] text-slate-500">{t.offlineModeDesc}</div>
                  </div>
                </div>
                <Switch checked={offlineMode} onCheckedChange={(v) => { setOfflineMode(v); triggerToast(v ? 'Offline Cache Active' : 'Online Sync Preferred', ''); }} />
              </div>
            </div>
          </div>

          {/* Language & measurement */}
          <div className="glass rounded-2xl p-5 border border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">{t.langUnits}</h3>
            </div>
            <div className="space-y-3">
              {/* Language selection */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.langLabel}</div>
                    <div className="text-[10px] text-slate-500">App Language</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['mr', 'hi', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        triggerHaptic('light');
                        setLanguage(l);
                        triggerToast(l === 'mr' ? 'मराठी भाषा निवडली' : l === 'hi' ? 'हिंदी भाषा चयनित' : 'English Selected', '');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${lang === l ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Units Selection */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <Ruler className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.unitLabel}</div>
                    <div className="text-[10px] text-slate-500">Measurement Units</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['metric', 'imperial'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        triggerHaptic('light');
                        setUnitSystem(u);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${unitSystem === u ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {u === 'metric' ? t.metric : t.imperial}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{t.themeLabel}</div>
                    <div className="text-[10px] text-slate-500">Theme Styling</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {(['dark', 'light'] as const).map((tVal) => (
                    <button
                      key={tVal}
                      onClick={() => {
                        triggerHaptic('light');
                        setTheme(tVal);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${theme === tVal ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {tVal === 'dark' ? t.dark : t.light}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="glass rounded-2xl p-5 border border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">{t.security}</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => triggerToast(t.changePassword, 'Security feature rolling out soon.')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs text-slate-200 transition-all border border-white/5 flex items-center justify-between"
              >
                <span>{t.changePassword}</span>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => triggerToast(t.twoFA, '2FA setup configured.')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs text-slate-200 transition-all border border-white/5 flex items-center justify-between"
              >
                <span>{t.twoFA}</span>
                <Key className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  logout();
                  window.location.reload();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-xs text-red-400 transition-all border border-red-500/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
