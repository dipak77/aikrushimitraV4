import React, { useState } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { 
  Crown, BarChart2, CheckCircle2, ShieldCheck, DollarSign, 
  TrendingUp, Users, ShoppingBag, CreditCard, ChevronRight 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const PremiumServicesView = ({ lang, user, onBack }: { lang: Language; user: UserProfile; onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'advisor' | 'fpo'>('advisor');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // FPO state
  const [fertilizerQuantity, setFertilizerQuantity] = useState(2);
  const [fertilizerPoolTotal, setFertilizerPoolTotal] = useState(145);

  const handleSubscribe = () => {
    triggerHaptic('medium');
    setShowPaymentModal(true);
  };

  const handleCompletePayment = () => {
    triggerHaptic('medium');
    setPaymentSuccess(true);
    setTimeout(() => {
      setIsSubscribed(true);
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      triggerHaptic('light');
    }, 1500);
  };

  const handleJoinPool = () => {
    triggerHaptic('medium');
    setFertilizerPoolTotal(prev => prev + Number(fertilizerQuantity));
    alert(lang === 'mr' ? "तुम्ही खत खरेदी संघात यशस्वीरित्या सामील झाला आहात!" : "You joined the group fertilizer purchase successfully!");
  };

  return (
    <SimpleView 
      title={lang === 'mr' ? 'प्रीमियम सेवा' : 'Premium Hub'} 
      onBack={onBack}
    >
      <div className="space-y-6 pb-24 animate-enter">
        
        {/* Top tab switcher */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 max-w-md mx-auto shadow-inner">
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('advisor'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'advisor' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Crown size={16} />
            {lang === 'mr' ? 'विशेष सल्ला' : 'Premium Advisory'}
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('fpo'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'fpo' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart2 size={16} />
            {lang === 'mr' ? 'FPO डॅशबोर्ड' : 'FPO Cooperative'}
          </button>
        </div>

        {/* TAB 1: PREMIUM ADVISORY */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            
            {/* Status Header */}
            <div className="glass-panel p-6 rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-slate-900/40 to-transparent relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Crown size={12} /> {isSubscribed ? 'Premium Member' : 'Upgrade Plan'}
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isSubscribed ? (lang === 'mr' ? 'तुम्ही प्रीमियम सदस्य आहात!' : 'You are a Premium Member!') : (lang === 'mr' ? 'प्रीमियम कृषी सल्लागार' : 'Premium Advisory Services')}
                </h3>
                <p className="text-slate-400 text-sm max-w-md">
                  {lang === 'mr' 
                    ? 'अमर्याद कीड स्कॅनिंग, वैयक्तिक कृषी तज्ज्ञ कॉल आणि थेट हमीभाव सूचना मिळवा.'
                    : 'Get unlimited crop disease scans, priority agronomist calls, and daily premium mandi alerts.'}
                </p>
              </div>
              <div className="shrink-0">
                {isSubscribed ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl">
                    <ShieldCheck size={20} /> Active
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    className="from-amber-500 to-yellow-600 shadow-amber-500/20 text-slate-950 font-black"
                    onClick={handleSubscribe}
                  >
                    {lang === 'mr' ? 'सदस्यता घ्या' : 'Subscribe Now'}
                  </Button>
                )}
              </div>
            </div>

            {/* Plans comparison cards */}
            {!isSubscribed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Monthly */}
                <div 
                  onClick={() => setSelectedPlan('monthly')}
                  className={`glass-panel p-6 rounded-[2rem] border cursor-pointer transition-all ${
                    selectedPlan === 'monthly' ? 'border-amber-500 bg-amber-500/5 shadow-2xl scale-[1.02]' : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-white text-lg">{lang === 'mr' ? 'मासिक योजना' : 'Monthly Plan'}</h4>
                    <span className="text-xs text-slate-400">1 Month</span>
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    ₹99 <span className="text-sm font-medium text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400">Billed monthly, cancel anytime</p>
                </div>

                {/* Yearly */}
                <div 
                  onClick={() => setSelectedPlan('yearly')}
                  className={`glass-panel p-6 rounded-[2rem] border cursor-pointer transition-all relative overflow-hidden ${
                    selectedPlan === 'yearly' ? 'border-amber-500 bg-amber-500/5 shadow-2xl scale-[1.02]' : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                  }`}
                >
                  <div className="absolute top-3 right-[-32px] bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider py-1 px-10 rotate-45">
                    Save 60%
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-white text-lg">{lang === 'mr' ? 'वार्षिक योजना' : 'Yearly Plan'}</h4>
                    <span className="text-xs text-slate-400">12 Months</span>
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    ₹499 <span className="text-sm font-medium text-slate-400">/ year</span>
                  </div>
                  <p className="text-xs text-slate-400">Equivalent to ₹41/month</p>
                </div>

              </div>
            )}

            {/* Benefits detail list */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/20">
              <h3 className="font-black text-white text-lg mb-4">{lang === 'mr' ? 'प्रीमियमचे फायदे' : 'Premium Benefits'}</h3>
              <div className="space-y-4">
                {[
                  { title: lang === 'mr' ? 'अमर्याद पानांचे स्कॅनिंग (Disease Scans)' : 'Unlimited disease leaf scans', desc: lang === 'mr' ? 'कोणत्याही मर्यादेशिवाय २४ तास पिकांचे स्कॅनिंग करा' : 'Scan leaf symptoms 24/7 without limitations' },
                  { title: lang === 'mr' ? 'वैयक्तिक कृषी तज्ज्ञ भेट (1-on-1 Agronomist call)' : '1-on-1 crop expert voice calls', desc: lang === 'mr' ? 'दरमहा ३ वैयक्तिक कॉलद्वारे थेट तज्ज्ञांचा सल्ला' : 'Direct consulting call sessions with agriculture scientists' },
                  { title: lang === 'mr' ? 'सविस्तर खत आणि सिंचन दिनदर्शिका' : 'Precision fertilizer calendar advice', desc: lang === 'mr' ? 'हवामानावर आधारित अचूक सल्ले मिळवा' : 'Calculated automatically matching your land nutrients' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPI Payment Modal simulation */}
            {showPaymentModal && (
              <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-sm p-6 rounded-[2.5rem] border border-white/10 bg-[#0a1220] shadow-2xl relative text-center space-y-6">
                  <CreditCard size={48} className="mx-auto text-amber-400 animate-bounce" />
                  
                  {paymentSuccess ? (
                    <div className="space-y-2 animate-enter">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto text-lg font-bold">✓</div>
                      <h3 className="text-lg font-black text-white">{lang === 'mr' ? 'भरणा यशस्वी!' : 'Payment Success!'}</h3>
                      <p className="text-xs text-slate-400">Subscription activated</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-white">{lang === 'mr' ? 'सुरक्षित भरणा' : 'Secure Payment'}</h3>
                        <p className="text-xs text-slate-400 mt-1">AI Krushi Mitra Premium gateway</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl text-left border border-white/5">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>Plan Selected:</span>
                          <span className="text-white capitalize">{selectedPlan}</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-white mt-2">
                          <span>Amount Due:</span>
                          <span>₹{selectedPlan === 'monthly' ? '99' : '499'}</span>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="UPI ID (e.g. name@upi)" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-center text-sm focus:outline-none text-white focus:border-amber-500/50"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                        <Button variant="primary" className="flex-1 from-amber-500 to-yellow-600 text-slate-950" onClick={handleCompletePayment}>Pay Now</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: FPO COOPERATIVE */}
        {activeTab === 'fpo' && (
          <div className="space-y-6">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-[2rem] border border-white/10 bg-slate-900/40">
                <Users className="text-emerald-400 mb-2" size={24} />
                <h4 className="text-xs font-bold text-slate-400 uppercase">FPO Members</h4>
                <p className="text-2xl font-black text-white mt-1">1,240 <span className="text-xs text-slate-400">farmers</span></p>
              </div>
              <div className="glass-panel p-5 rounded-[2rem] border border-white/10 bg-slate-900/40">
                <TrendingUp className="text-blue-400 mb-2" size={24} />
                <h4 className="text-xs font-bold text-slate-400 uppercase">Acreage Registered</h4>
                <p className="text-2xl font-black text-white mt-1">3,450 <span className="text-xs text-slate-400">acres</span></p>
              </div>
            </div>

            {/* Custom Acreage chart breakdown */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/20">
              <h3 className="font-black text-white text-md mb-4">{lang === 'mr' ? 'सहकारी पीक विभागणी' : 'Collective Crop Acreage'}</h3>
              
              <div className="space-y-4">
                {[
                  { name: lang === 'mr' ? 'कापूस (Cotton)' : 'Cotton', pct: 45, acres: '1,550 ac', color: 'bg-blue-400' },
                  { name: lang === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean', pct: 35, acres: '1,200 ac', color: 'bg-emerald-400' },
                  { name: lang === 'mr' ? 'कांदा (Onion)' : 'Onion', pct: 20, acres: '700 ac', color: 'bg-orange-400' }
                ].map((crop, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{crop.name}</span>
                      <span className="text-slate-400">{crop.acres} ({crop.pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${crop.color}`} style={{ width: `${crop.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk group purchase pools */}
            <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-slate-900/40 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-md">{lang === 'mr' ? 'सहकारी खत खरेदी संघ' : 'Cooperative Fertilizer Pool'}</h3>
                  <p className="text-xs text-slate-400">{lang === 'mr' ? 'एकत्र खरेदी करा आणि ३०% बचत करा' : 'Buy collectively to save up to 30%'}</p>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">NPK 10:26:26 (IFFCO)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Pooled Quantity: <span className="text-emerald-400 font-bold">{fertilizerPoolTotal} bags</span></p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Target: 200 bags
                </span>
              </div>

              {/* Input builder */}
              <div className="flex gap-3">
                <input 
                  type="number" 
                  value={fertilizerQuantity} 
                  onChange={e => setFertilizerQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 bg-slate-950/50 border border-white/10 rounded-xl p-3 text-center font-mono font-bold text-white focus:outline-none"
                />
                <Button 
                  variant="primary" 
                  className="flex-1 from-emerald-500 to-teal-600 shadow-emerald-500/20 font-black"
                  onClick={handleJoinPool}
                >
                  {lang === 'mr' ? 'खरेदी संघात सामील व्हा' : 'Join Purchase Pool'}
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>
    </SimpleView>
  );
};

export default PremiumServicesView;
