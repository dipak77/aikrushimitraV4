import React, { useState } from 'react';
import { Language, UserProfile } from '../../types';
import { Sprout, MapPin, Ruler, Globe, Check, ChevronRight, ChevronLeft, Loader2, Landmark } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { Button } from '../Button';

interface OnboardingViewProps {
  lang: Language;
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const LANGUAGES_LIST = [
  { code: 'mr', label: 'मराठी', sub: 'Marathi' },
  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
  { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
];

const CROPS_LIST = [
  { id: 'soyabean', label: { en: 'Soyabean', mr: 'सोयाबीन' }, color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30' },
  { id: 'cotton', label: { en: 'Cotton', mr: 'कापूस' }, color: 'from-blue-400/20 to-sky-500/10 border-blue-400/30' },
  { id: 'onion', label: { en: 'Onion', mr: 'कांदा' }, color: 'from-pink-500/20 to-red-600/10 border-pink-500/30' },
  { id: 'wheat', label: { en: 'Wheat', mr: 'गहू' }, color: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30' },
  { id: 'sugarcane', label: { en: 'Sugarcane', mr: 'ऊस' }, color: 'from-emerald-500/20 to-green-600/10 border-emerald-500/30' },
  { id: 'turmeric', label: { en: 'Turmeric', mr: 'हळद' }, color: 'from-orange-500/20 to-yellow-500/10 border-orange-500/30' },
  { id: 'pomegranate', label: { en: 'Pomegranate', mr: 'डाळिंब' }, color: 'from-red-500/20 to-rose-600/10 border-red-500/30' },
  { id: 'grape', label: { en: 'Grape', mr: 'द्राक्षे' }, color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30' },
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ lang, user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  
  // Location details
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [isLocating, setIsLocating] = useState(false);

  // Farming details
  const [landAcre, setLandAcre] = useState(2);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const handleLocateMe = async () => {
    triggerHaptic('light');
    setIsLocating(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
              const data = await res.json();
              if (data.locality) setVillage(data.locality);
              if (data.principalSubdivision) {
                // e.g. "Maharashtra"
                const parts = data.principalSubdivision.split(' ');
                setState(parts[0]);
              }
              triggerHaptic('medium');
            } catch (err) {
              console.error(err);
            } finally {
              setIsLocating(false);
            }
          },
          () => setIsLocating(false),
          { timeout: 5000 }
        );
      } else {
        setIsLocating(false);
      }
    } catch (e) {
      setIsLocating(false);
    }
  };

  const toggleCrop = (cropId: string) => {
    triggerHaptic('light');
    if (selectedCrops.includes(cropId)) {
      setSelectedCrops(selectedCrops.filter(c => c !== cropId));
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  const handleNext = () => {
    triggerHaptic('medium');
    setStep(step + 1);
  };

  const handleBack = () => {
    triggerHaptic('medium');
    setStep(step - 1);
  };

  const handleFinish = () => {
    triggerHaptic('heavy');
    const primaryCropName = selectedCrops.length > 0 
      ? CROPS_LIST.find(c => c.id === selectedCrops[0])?.label.en || 'Soyabean' 
      : 'Soyabean';

    const updatedProfile: UserProfile = {
      ...user,
      village: village || 'Yavatmal',
      district: district || 'Yavatmal',
      landSize: `${landAcre} Acres`,
      crop: primaryCropName,
      joinedAt: user.joinedAt || Date.now(),
      lastLogin: Date.now()
    };
    onComplete(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#020617] to-[#020617]"></div>
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-md animate-enter">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 px-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-6 rounded-[2.5rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl min-h-[400px] flex flex-col justify-between">
          
          {/* STEP 1: Language */}
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
                  <Globe className="text-emerald-400" /> Choose Language
                </h2>
                <p className="text-slate-400 text-sm mb-6">भाषा निवडा / भाषा चुनें / Select language</p>
                
                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {LANGUAGES_LIST.map((l) => {
                    const isSelected = selectedLang === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => { triggerHaptic('light'); setSelectedLang(l.code as Language); }}
                        className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-20 active:scale-95 ${
                          isSelected 
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg' 
                            : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/10'
                        }`}
                      >
                        <span className="text-lg font-black">{l.label}</span>
                        <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">{l.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  fullWidth 
                  size="lg" 
                  variant="primary" 
                  onClick={handleNext}
                  className="shadow-emerald-500/20"
                >
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
                  <MapPin className="text-emerald-400" /> Regional Location
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {selectedLang === 'mr' ? 'हवामान आणि बाजार भावासाठी पत्ता टाका.' : 'Set location for weather and APMC pricing.'}
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={14} />
                        <span>Detect Location (GPS)</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">State</label>
                      <input 
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">District</label>
                      <input 
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Village / Tehsil</label>
                    <input 
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Yavatmal"
                      className="w-full bg-slate-950/50 border border-white/5 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                  <ChevronLeft size={18} /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext} className="flex-1 shadow-emerald-500/20">
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Crops & Land Size */}
          {step === 3 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
                  <Sprout className="text-emerald-400" /> Farm Profile
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {selectedLang === 'mr' ? 'पिके व जमिनीचा आकार निवडा.' : 'Select your farm land size and primary crops.'}
                </p>

                <div className="space-y-5">
                  {/* Land Size Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <Ruler size={12} /> Land Size
                      </span>
                      <span className="text-emerald-400 text-sm">{landAcre} Acres</span>
                    </div>
                    <input 
                      type="range"
                      min={1}
                      max={50}
                      value={landAcre}
                      onChange={(e) => setLandAcre(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Crops Checkbox Grid */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                      Primary Crops / मुख्य पिके (Select at least one)
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {CROPS_LIST.map((c) => {
                        const isChecked = selectedCrops.includes(c.id);
                        return (
                          <div 
                            key={c.id}
                            onClick={() => toggleCrop(c.id)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 bg-white/5 relative overflow-hidden ${
                              isChecked 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-white/5 hover:border-white/10'
                            }`}
                          >
                            <span className="text-xs font-bold text-white mb-0.5">
                              {selectedLang === 'mr' ? c.label.mr : c.label.en}
                            </span>
                            {isChecked && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white scale-75">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                  <ChevronLeft size={18} /> Back
                </Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleFinish} 
                  disabled={selectedCrops.length === 0}
                  className="flex-1 shadow-emerald-500/20 disabled:opacity-50"
                >
                  Finish Onboarding
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
