import React, { useState, useEffect } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../constants';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { 
  Users, AlertOctagon, Heart, MessageCircle, Share2, 
  Send, Plus, MapPin, CheckCircle, Bug, Sparkles, Filter 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

interface ForumReply {
  id: string;
  author: string;
  role: 'farmer' | 'expert' | 'ai';
  text: string;
  timestamp: number;
}

interface ForumPost {
  id: string;
  author: string;
  village: string;
  crop: string;
  title: string;
  description: string;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: ForumReply[];
  timestamp: number;
}

interface PestAlert {
  id: string;
  disease: string;
  crop: string;
  region: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: number;
  symptoms: string[];
  recommendation: string;
}

const MOCK_FORUM_POSTS: Partial<Record<Language, ForumPost[]>> & { en: ForumPost[]; mr: ForumPost[]; hi: ForumPost[] } = {
  mr: [
    {
      id: "post_1",
      author: "ज्ञानेश्वर शिंदे",
      village: "मांजरी, पुणे",
      crop: "सोयाबीन (Soybean)",
      title: "पानांवर पिवळे डाग पडत आहेत, काय उपाय करावा?",
      description: "माझ्या सोयाबीनच्या पानांवर काही दिवसांपासून हलके पिवळे डाग दिसत आहेत आणि पाने सुकत चालली आहेत. कृपया योग्य सल्ला द्यावा.",
      upvotes: 24,
      replies: [
        {
          id: "rep_1_1",
          author: "डॉ. सतीश पाटील (कृषी तज्ज्ञ)",
          role: "expert",
          text: "हा पिवळा मोझॅक व्हायरस (Yellow Mosaic Virus) असू शकतो. रोगट झाडे उपटून नष्ट करा आणि पांढऱ्या माशीच्या नियंत्रणासाठी इमिडाक्लोप्रिड फवारा.",
          timestamp: Date.now() - 3600000 * 2
        },
        {
          id: "rep_1_2",
          author: "AI कृषी मित्र",
          role: "ai",
          text: "सेंद्रिय उपाय म्हणून १०% दशपर्णी अर्क किंवा ५% निंबोळी अर्काची फवारणी करा. पिवळे चिकट सापळे एकरी १० लावा.",
          timestamp: Date.now() - 3600000
        }
      ],
      timestamp: Date.now() - 3600000 * 4
    },
    {
      id: "post_2",
      author: "तुकाराम शेळके",
      village: "शिराळा, सांगली",
      crop: "कांदा (Onion)",
      title: "कांद्याची रोपे सडत आहेत, उपाय सुचवा.",
      description: "सध्या सततच्या पावसामुळे रोपवाटिकेत कांद्याची रोपे मुळापाशी सडत आहेत. बुरशीनाशक कोणते वापरावे?",
      upvotes: 15,
      replies: [
        {
          id: "rep_2_1",
          author: "रामराव कदम (प्रगतीशील शेतकरी)",
          role: "farmer",
          text: "पाण्याचा निचरा करा. ट्रायकोडर्मा १ किलो शेणखतात मिसळून रोपवाटिकेत टाकल्याने चांगला फायदा होतो.",
          timestamp: Date.now() - 3600000 * 12
        }
      ],
      timestamp: Date.now() - 3600000 * 16
    }
  ],
  hi: [
    {
      id: "post_1",
      author: "ज्ञानेश्वर शिंदे",
      village: "मांजरी, पुणे",
      crop: "सोयाबीन (Soybean)",
      title: "पत्तियों पर पीले धब्बे पड़ रहे हैं, क्या उपाय करें?",
      description: "मेरे सोयाबीन की पत्तियों पर कुछ दिनों से हल्के पीले धब्बे दिखाई दे रहे हैं। कृपया उचित सलाह दें।",
      upvotes: 24,
      replies: [
        {
          id: "rep_1_1",
          author: "डॉ. सतीश पाटिल (कृषि विशेषज्ञ)",
          role: "expert",
          text: "यह पीला मोज़ेक वायरस हो सकता है। रोगग्रस्त पौधों को नष्ट करें और सफेद मक्खी के नियंत्रण के लिए इमिडाक्लोप्रिड का छिड़काव करें।",
          timestamp: Date.now() - 3600000 * 2
        }
      ],
      timestamp: Date.now() - 3600000 * 4
    }
  ],
  en: [
    {
      id: "post_1",
      author: "Dnyaneshwar Shinde",
      village: "Manjari, Pune",
      crop: "Soybean",
      title: "Yellow spots appearing on leaves, need control measures.",
      description: "I am seeing light yellow spots on my soybean crop leaves. The leaves are drying up. Please suggest remedies.",
      upvotes: 24,
      replies: [
        {
          id: "rep_1_1",
          author: "Dr. Satish Patil (Agri Expert)",
          role: "expert",
          text: "This could be Yellow Mosaic Virus. Uproot infected plants and spray Imidacloprid to control the whitefly vectors.",
          timestamp: Date.now() - 3600000 * 2
        }
      ],
      timestamp: Date.now() - 3600000 * 4
    }
  ]
};

const MOCK_PEST_ALERTS: Partial<Record<Language, PestAlert[]>> & { en: PestAlert[]; mr: PestAlert[]; hi: PestAlert[] } = {
  mr: [
    {
      id: "alert_1",
      disease: "लष्करी अळीचा प्रादुर्भाव (Fall Armyworm)",
      crop: "मका (Maize)",
      region: "यवतमाळ, महाराष्ट्र",
      severity: "critical",
      reportedAt: Date.now() - 3600000 * 24,
      symptoms: [
        "पानांवर गोलाकार मोठी छद्रे पडणे",
        "पोंगा पोखरून अळी आत शिरणे",
        "पानांवर भुश्यासारखी विष्ठा जमा होणे"
      ],
      recommendation: "तात्काळ इमामेक्टिन बेन्झोएट ४ ग्रॅम प्रति १० लिटर पाण्यात मिसळून पोंग्यात फवारणी करावी."
    },
    {
      id: "alert_2",
      disease: "तांबेरा रोग (Soybean Rust)",
      crop: "सोयाबीन (Soybean)",
      region: "सातारा, महाराष्ट्र",
      severity: "high",
      reportedAt: Date.now() - 3600000 * 48,
      symptoms: [
        "पानांच्या खालच्या बाजूला तांबूस-तपकिरी रंगाचे फोड येणे",
        "पाने अकाली पिवळी पडून गळणे"
      ],
      recommendation: "टेबुकॉनाझोल १०% + सल्फर ६५% WG (१.२५ ग्रॅम/लिटर) बुरशीनाशकाची पहिली फवारणी करावी."
    }
  ],
  hi: [
    {
      id: "alert_1",
      disease: "फॉल आर्मीवॉर्म का प्रकोप",
      crop: "मक्का (Maize)",
      region: "यवतमाल, महाराष्ट्र",
      severity: "critical",
      reportedAt: Date.now() - 3600000 * 24,
      symptoms: [
        "पत्तियों पर बड़े गोल छेद होना",
        "इल्ली का तने में घुस जाना"
      ],
      recommendation: "तुरंत इमामेक्टिन बेंजोएट 4 ग्राम प्रति 10 लीटर पानी में मिलाकर छिड़काव करें।"
    }
  ],
  en: [
    {
      id: "alert_1",
      disease: "Fall Armyworm Outbreak Alert",
      crop: "Maize",
      region: "Yavatmal, Maharashtra",
      severity: "critical",
      reportedAt: Date.now() - 3600000 * 24,
      symptoms: [
        "Large circular holes on leaves",
        "Larvae feeding inside the central whorl"
      ],
      recommendation: "Spray Emamectin Benzoate 5% SG @ 4g per 10 Litres of water immediately."
    }
  ]
};

const CommunityForumView = ({ lang, user, onBack }: { lang: Language; user: UserProfile; onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'forum' | 'alerts'>('forum');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [alerts, setAlerts] = useState<PestAlert[]>([]);
  
  // Modals / Input states
  const [showAddPost, setShowAddPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCrop, setNewCrop] = useState(user.crop || '');
  
  const [showReportOutbreak, setShowReportOutbreak] = useState(false);
  const [outbreakDisease, setOutbreakDisease] = useState('');
  const [outbreakCrop, setOutbreakCrop] = useState(user.crop || '');
  const [outbreakSymptoms, setOutbreakSymptoms] = useState('');

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem('akm_forum_posts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(MOCK_FORUM_POSTS[lang] || MOCK_FORUM_POSTS['en']);
      }

      const savedAlerts = localStorage.getItem('akm_pest_alerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      } else {
        setAlerts(MOCK_PEST_ALERTS[lang] || MOCK_PEST_ALERTS['en']);
      }
    } catch (e) {
      setPosts(MOCK_FORUM_POSTS[lang] || MOCK_FORUM_POSTS['en']);
      setAlerts(MOCK_PEST_ALERTS[lang] || MOCK_PEST_ALERTS['en']);
    }
  }, [lang]);

  const savePostsLocal = (updated: ForumPost[]) => {
    setPosts(updated);
    localStorage.setItem('akm_forum_posts', JSON.stringify(updated));
  };

  const saveAlertsLocal = (updated: PestAlert[]) => {
    setAlerts(updated);
    localStorage.setItem('akm_pest_alerts', JSON.stringify(updated));
  };

  const handleUpvote = (postId: string) => {
    triggerHaptic('light');
    const updated = posts.map(p => {
      if (p.id === postId) {
        const upvoted = !p.hasUpvoted;
        return {
          ...p,
          upvotes: upvoted ? p.upvotes + 1 : p.upvotes - 1,
          hasUpvoted: upvoted
        };
      }
      return p;
    });
    savePostsLocal(updated);
  };

  const handleAddPost = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    triggerHaptic('medium');
    
    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      author: user.name || 'शेतकरी मित्र',
      village: `${user.village || 'गाव'}, ${user.district || 'जिल्हा'}`,
      crop: newCrop,
      title: newTitle,
      description: newDesc,
      upvotes: 0,
      replies: [],
      timestamp: Date.now()
    };

    const updated = [newPost, ...posts];
    savePostsLocal(updated);
    
    // Clear inputs
    setNewTitle('');
    setNewDesc('');
    setShowAddPost(false);
  };

  const handleAddReply = (postId: string) => {
    const replyText = replyInputs[postId];
    if (!replyText?.trim()) return;
    triggerHaptic('light');

    const newReply: ForumReply = {
      id: `rep_${Date.now()}`,
      author: user.name || 'शेतकरी मित्र',
      role: 'farmer',
      text: replyText,
      timestamp: Date.now()
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...p.replies, newReply]
        };
      }
      return p;
    });

    savePostsLocal(updated);
    setReplyInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReportOutbreak = () => {
    if (!outbreakDisease.trim() || !outbreakCrop.trim()) return;
    triggerHaptic('medium');

    const newAlert: PestAlert = {
      id: `alert_${Date.now()}`,
      disease: outbreakDisease,
      crop: outbreakCrop,
      region: `${user.district || 'यवतमाळ'}, महाराष्ट्र`,
      severity: 'high',
      reportedAt: Date.now(),
      symptoms: outbreakSymptoms.split(',').map(s => s.trim()).filter(Boolean),
      recommendation: lang === 'mr' 
        ? "कृषी पर्यवेक्षकांच्या सल्ल्याने त्वरित बुरशीनाशक / कीटकनाशक फवारावे."
        : "Spray appropriate pesticide immediately as advised by local block officer."
    };

    const updated = [newAlert, ...alerts];
    saveAlertsLocal(updated);

    // Clear inputs
    setOutbreakDisease('');
    setOutbreakSymptoms('');
    setShowReportOutbreak(false);
  };

  return (
    <SimpleView 
      title={lang === 'mr' ? 'शेतकरी मंच' : lang === 'hi' ? 'किसान मंच' : 'Community Hub'} 
      onBack={onBack}
    >
      <div className="space-y-6 pb-24 animate-enter">
        
        {/* Toggle tabs */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 max-w-md mx-auto shadow-inner">
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('forum'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'forum' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={16} />
            {lang === 'mr' ? 'शेतकरी चर्चा' : 'Discussion Board'}
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('alerts'); }}
            className={`flex-1 py-3 text-center text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'alerts' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <AlertOctagon size={16} />
            {lang === 'mr' ? 'कीड इशारे' : 'Pest Alerts'}
            {alerts.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping absolute right-3 top-3"></span>
            )}
          </button>
        </div>

        {/* TAB 1: DISCUSSION BOARD */}
        {activeTab === 'forum' && (
          <div className="space-y-4">
            
            {/* New Post Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white">{lang === 'mr' ? 'सक्रिय चर्चा' : 'Active Discussions'}</h3>
              <Button 
                onClick={() => { triggerHaptic('light'); setShowAddPost(true); }}
                variant="primary" 
                size="sm"
                icon={<Plus size={14} />}
                className="from-emerald-500 to-teal-600"
              >
                {lang === 'mr' ? 'चर्चा सुरू करा' : 'New Post'}
              </Button>
            </div>

            {/* Create Post Modal Overlay */}
            {showAddPost && (
              <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg p-6 rounded-[2.5rem] border border-white/10 bg-[#0a1220] shadow-2xl relative">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <MessageCircle size={20} className="text-emerald-400" /> {lang === 'mr' ? 'नवीन प्रश्न विचारा' : 'Start Discussion'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">प्रश्न किंवा शीर्षक</label>
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="उदा: पिकावर कीड दिसत आहे, काय करावे?"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">पिक (Crop)</label>
                      <input 
                        type="text" 
                        value={newCrop} 
                        onChange={e => setNewCrop(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">वर्णन (Description)</label>
                      <textarea 
                        rows={4}
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="तुमच्या समस्येबाबत सविस्तर माहिती लिहा..."
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="flex-1" onClick={() => setShowAddPost(false)}>Cancel</Button>
                    <Button variant="primary" className="flex-1 from-emerald-500 to-teal-600" onClick={handleAddPost}>Publish</Button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Posts */}
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="glass-panel p-5 rounded-[2rem] border border-white/10 bg-slate-900/40 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{post.author}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={10} /> {post.village}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      {post.crop}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="space-y-2">
                    <h3 className="text-md font-black text-white hover:text-emerald-400 cursor-pointer" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {post.description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-4 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${post.hasUpvoted ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Heart size={14} fill={post.hasUpvoted ? 'currentColor' : 'none'} /> {post.upvotes}
                    </button>
                    <button 
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      <MessageCircle size={14} /> {post.replies.length} {lang === 'mr' ? 'उत्तरे' : 'Answers'}
                    </button>
                  </div>

                  {/* Expanded Comments/Replies Drawer */}
                  {expandedPostId === post.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-enter">
                      <div className="space-y-3.5">
                        {post.replies.map(reply => (
                          <div 
                            key={reply.id} 
                            className={`p-3.5 rounded-2xl border ${
                              reply.role === 'expert'
                                ? 'bg-gradient-to-r from-blue-900/20 to-transparent border-blue-500/20 text-slate-200'
                                : reply.role === 'ai'
                                ? 'bg-gradient-to-r from-emerald-950/20 to-transparent border-emerald-500/20 text-slate-200'
                                : 'bg-white/5 border-white/5 text-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                {reply.author}
                                {reply.role === 'expert' && <span className="text-[9px] uppercase font-black tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Expert</span>}
                                {reply.role === 'ai' && <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-0.5"><Sparkles size={8}/> AI</span>}
                              </span>
                              <span className="text-[10px] text-slate-500">Just now</span>
                            </div>
                            <p className="text-xs leading-relaxed font-medium">{reply.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input */}
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={lang === 'mr' ? 'तुमचे उत्तर लिहा...' : 'Write your answer...'}
                          value={replyInputs[post.id] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setReplyInputs(prev => ({ ...prev, [post.id]: val }));
                          }}
                          onKeyDown={e => e.key === 'Enter' && handleAddReply(post.id)}
                          className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                        />
                        <button 
                          onClick={() => handleAddReply(post.id)}
                          className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 active:scale-95 transition-all"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: PEST OUTBREAK ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            
            {/* Outbreak Alert Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white">{lang === 'mr' ? 'सध्याचे इशारे' : 'Outbreak Warnings'}</h3>
              <Button 
                onClick={() => { triggerHaptic('light'); setShowReportOutbreak(true); }}
                variant="primary" 
                size="sm"
                icon={<Bug size={14} />}
                className="from-rose-500 to-red-600 shadow-rose-500/20"
              >
                {lang === 'mr' ? 'प्रादुर्भाव नोंदवा' : 'Report Outbreak'}
              </Button>
            </div>

            {/* Outbreak Reporting Modal */}
            {showReportOutbreak && (
              <div className="fixed inset-0 z-50 bg-[#000]/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-lg p-6 rounded-[2.5rem] border border-white/10 bg-[#0a1220] shadow-2xl relative">
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-rose-500" /> {lang === 'mr' ? 'प्रादुर्भाव नोंदवा' : 'Report Outbreak'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">कीड किंवा रोगाचे नाव</label>
                      <input 
                        type="text" 
                        value={outbreakDisease} 
                        onChange={e => setOutbreakDisease(e.target.value)}
                        placeholder="उदा: लष्करी अळी (Fall Armyworm)"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">प्रभावित पीक</label>
                      <input 
                        type="text" 
                        value={outbreakCrop} 
                        onChange={e => setOutbreakCrop(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">लक्षणे (Symptoms - comma separated)</label>
                      <input 
                        type="text" 
                        value={outbreakSymptoms} 
                        onChange={e => setOutbreakSymptoms(e.target.value)}
                        placeholder="उदा: पानांवर छद्रे पडणे, खोड पोखरले जाणे"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="flex-1" onClick={() => setShowReportOutbreak(false)}>Cancel</Button>
                    <Button variant="primary" className="flex-1 from-rose-500 to-red-600" onClick={handleReportOutbreak}>Submit Report</Button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Alerts */}
            <div className="space-y-4">
              {alerts.map(alert => {
                const isCritical = alert.severity === 'critical' || alert.severity === 'high';
                return (
                  <div 
                    key={alert.id} 
                    className={`glass-panel p-5 rounded-[2rem] border relative overflow-hidden bg-slate-900/40 ${
                      isCritical ? 'border-rose-500/25 shadow-[0_0_25px_rgba(244,63,94,0.05)]' : 'border-white/10'
                    }`}
                  >
                    {/* Background glow for critical */}
                    {isCritical && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
                    )}

                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${
                          isCritical ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          <AlertOctagon size={10} /> {alert.severity} Outbreak
                        </span>
                        <h3 className="text-base font-black text-white">{alert.disease}</h3>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                          {alert.crop}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 justify-end">
                          <MapPin size={10} /> {alert.region}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-1.5 mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase">लक्षणे (Symptoms):</h4>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5 font-medium">
                        {alert.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation Box */}
                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/10 text-slate-200">
                      <h4 className="text-[10px] font-black uppercase text-rose-400 mb-1 flex items-center gap-1">
                        <CheckCircle size={11} /> सल्ला (Advisory):
                      </h4>
                      <p className="text-xs font-medium leading-relaxed">{alert.recommendation}</p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </SimpleView>
  );
};

export default CommunityForumView;
