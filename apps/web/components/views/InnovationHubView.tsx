import React, { useState } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { 
  Cpu, Navigation, RefreshCw, Layers, ShieldCheck, 
  Map, Database, HelpCircle, AlertCircle, Play, Check 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const InnovationHubView = ({ lang, user, onBack }: { lang: Language; user: UserProfile; onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'iot' | 'blockchain'>('iot');
  
  // Drone state
  const [droneStatus, setDroneStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [droneProgress, setDroneProgress] = useState(0);

  // Blockchain state
  const [ledgerVerified, setLedgerVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleStartDroneScan = () => {
    triggerHaptic('medium');
    setDroneStatus('scanning');
    setDroneProgress(0);

    const interval = setInterval(() => {
      setDroneProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDroneStatus('completed');
          triggerHaptic('light');
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const handleVerifyLedger = () => {
    triggerHaptic('medium');
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setLedgerVerified(true);
      triggerHaptic('light');
    }, 1500);
  };

  return (
    <SimpleView 
      title={lang === 'mr' ? 'तंत्रज्ञान केंद्र' : 'Innovation Hub'} 
      onBack={onBack}
    >
      <div className="space-y-6 pb-24 animate-enter">
        
        {/* Tab selector */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 max-w-md mx-auto shadow-inner">
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('iot'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'iot' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Cpu size={16} />
            {lang === 'mr' ? 'ड्रोन व सेन्सर्स' : 'Drones & IoT'}
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('blockchain'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'blockchain' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Layers size={16} />
            {lang === 'mr' ? 'ब्लॉकचेन व उपग्रह' : 'NDVI & Ledger'}
          </button>
        </div>

        {/* TAB 1: DRONES & IOT SENSORS */}
        {activeTab === 'iot' && (
          <div className="space-y-6">
            
            {/* IoT Telemetry Gauges */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/40 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="font-black text-white text-md flex items-center gap-2">
                  <Cpu className="text-cyan-400" size={20} />
                  {lang === 'mr' ? 'थेट मातीचे सेन्सर' : 'Live IoT Soil Telemetry'}
                </h3>
                <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full animate-pulse">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: lang === 'mr' ? 'मातीतील आद्रता' : 'Soil Moisture', value: '34%', detail: 'Optimal (३०-४०%)', color: 'text-cyan-400' },
                  { label: lang === 'mr' ? 'सामू (Soil pH)' : 'Soil pH', value: '6.8', detail: 'Neutral (उदासीन)', color: 'text-emerald-400' },
                  { label: lang === 'mr' ? 'नत्र प्रमाण (Nitrogen)' : 'Nitrogen', value: '142 ppm', detail: 'Medium (मध्यम)', color: 'text-blue-400' },
                  { label: lang === 'mr' ? 'मातीचे तापमान' : 'Soil Temp', value: '23.5 °C', detail: 'Normal (साधारण)', color: 'text-orange-400' }
                ].map((sensor, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{sensor.label}</span>
                    <p className={`text-xl font-black ${sensor.color}`}>{sensor.value}</p>
                    <span className="text-[9px] text-slate-400 block font-medium">{sensor.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drone Cockpit */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/20 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-md">{lang === 'mr' ? 'ड्रोन फवारणी व स्कॅनिंग' : 'Drone Scanning & Spraying'}</h3>
                  <p className="text-xs text-slate-400">{lang === 'mr' ? 'डीजेआय मॅट्रिक्स ३०० हवाई सहाय्यक' : 'DJI Matrice 300 aerial cockpit'}</p>
                </div>
                <Navigation size={24} className="text-cyan-400" />
              </div>

              {/* Progress and status */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Drone Status:</span>
                  <span className={`capitalize ${droneStatus === 'scanning' ? 'text-cyan-400 animate-pulse font-black' : droneStatus === 'completed' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {droneStatus === 'scanning' ? `Scanning Field (${droneProgress}%)` : droneStatus === 'completed' ? 'Scan Completed' : 'Cockpit Ready'}
                  </span>
                </div>

                {droneStatus === 'scanning' && (
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-300 rounded-full" style={{ width: `${droneProgress}%` }}></div>
                  </div>
                )}

                {droneStatus === 'completed' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Check size={16} /> {lang === 'mr' ? 'शेताचे हवाई सर्वेक्षण यशस्वीरित्या पूर्ण झाले. रोगाचा प्रादुर्भाव ०.५% पेक्षा कमी आढळला.' : 'Aerial scan completed successfully. Crop anomaly index is below 0.5%.'}
                  </div>
                )}

                {droneStatus === 'idle' && (
                  <Button 
                    fullWidth 
                    variant="primary" 
                    className="from-cyan-500 to-blue-600 shadow-cyan-500/20"
                    icon={<Play size={14} />}
                    onClick={handleStartDroneScan}
                  >
                    {lang === 'mr' ? 'हवाई सर्वेक्षण सुरू करा' : 'Start Aerial Scan'}
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BLOCKCHAIN & SATELLITE NDVI */}
        {activeTab === 'blockchain' && (
          <div className="space-y-6">
            
            {/* NDVI Satellite Overlay Simulation */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/40 space-y-4">
              <div className="flex items-center gap-3">
                <Layers size={20} className="text-purple-400" />
                <div>
                  <h3 className="font-black text-white text-md">{lang === 'mr' ? 'सेंटिनेल-२ उपग्रह आरोग्य नकाशा' : 'Sentinel-2 NDVI Health Index'}</h3>
                  <p className="text-xs text-slate-400">Resolution: 10m | Updated 2 days ago</p>
                </div>
              </div>

              {/* Simulated Map Visual */}
              <div className="h-44 w-full rounded-2xl border border-white/5 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* Simulated fields */}
                <div className="absolute inset-2 grid grid-cols-3 gap-2 opacity-70">
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Field A (Healthy)</div>
                  <div className="bg-orange-500/20 border border-orange-500/40 rounded flex items-center justify-center text-[10px] text-orange-400 font-bold uppercase tracking-wider">Field B (Stress)</div>
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Field C (Healthy)</div>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 border border-white/10 px-2 py-1 rounded text-[10px] text-white font-mono uppercase">
                  NDVI Index: 0.72
                </div>
              </div>
            </div>

            {/* Blockchain Crop Provenance Ledger */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/20 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-md">{lang === 'mr' ? 'ब्लॉकचेन क्रॉप लेजर' : 'Blockchain Crop Ledger'}</h3>
                  <p className="text-xs text-slate-400">{lang === 'mr' ? 'ग्राहकांसाठी माल हमी व सत्यता पडताळणी' : 'Provenance tracking for agro-exporters'}</p>
                </div>
                <Database size={24} className="text-purple-400" />
              </div>

              {/* Blockchain steps */}
              <div className="space-y-4">
                {[
                  { step: lang === 'mr' ? 'बियाणे पेरणी (Seed Sowing)' : 'Sowing Certified Seed', hash: '0x3a8e...44f', date: '2026-06-01' },
                  { step: lang === 'mr' ? 'सेंद्रिय खत फवारणी (Bio-Fertilizer)' : 'Organic Fertilizer apply', hash: '0x7b1c...99a', date: '2026-06-15' },
                  { step: lang === 'mr' ? 'हॉलीवूड पीक तपासणी (Expert clearance)' : 'Agronomist Quality Cert', hash: '0x9d3f...12c', date: '2026-06-25' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx < 2 && (
                      <div className="absolute left-3.5 top-8 bottom-[-16px] w-[1px] bg-purple-500/30"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.step}</h4>
                        <span className="font-mono text-[10px] text-slate-500 block">{item.hash}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                {ledgerVerified ? (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold leading-relaxed flex items-center justify-center gap-2">
                    <ShieldCheck size={18} /> Verified: Hash integrity 100% matched on Polygon Mainnet
                  </div>
                ) : (
                  <Button 
                    fullWidth 
                    variant="primary" 
                    className="from-purple-500 to-indigo-600 shadow-purple-500/20"
                    loading={verifying}
                    onClick={handleVerifyLedger}
                  >
                    {lang === 'mr' ? 'ब्लॉकचेन पडताळणी करा' : 'Verify Ledger Signatures'}
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </SimpleView>
  );
};

export default InnovationHubView;
