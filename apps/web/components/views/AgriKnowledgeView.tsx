import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  Search, BookOpen, Network, Upload, Filter, FileText, Tag,
  CheckCircle2, AlertTriangle, Database, Sparkles, ChevronDown, X,
  MapPin, Calendar, Shield, Layers, ArrowLeft
} from 'lucide-react';
import { triggerHaptic } from '../../utils/common';
import { KNOWLEDGE_BASE } from '../../lib/krushi/rag/knowledge-base';
import {
  CROPS, DISEASES, FERTILIZERS, getRelatedEntities,
  CONFIDENCE_HI, STAGES_HI, SEASONS_HI, SOIL_TYPES_HI,
} from '../../lib/krushi/rag/taxonomy';
import { hybridSearch, autoTagDocument } from '../../lib/krushi/rag/rag-engine';

type Tab = 'browse' | 'search' | 'graph' | 'ingest';

export function AgriKnowledgeView({ lang, onBack, onSelect }: {
  lang: Language;
  onBack: () => void;
  onSelect: (item: any) => void;
}) {
  const [tab, setTab] = useState<Tab>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [ingestContent, setIngestContent] = useState('');
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestResult, setIngestResult] = useState<any | null>(null);

  const filteredDocs = useMemo(() => {
    let docs = KNOWLEDGE_BASE;
    if (filterConfidence !== 'all') {
      docs = docs.filter((d) => d.confidence === filterConfidence);
    }
    return docs;
  }, [filterConfidence]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    triggerHaptic('medium');
    setTimeout(() => {
      const results = hybridSearch(searchQuery, undefined, 10);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  };

  const handleIngest = () => {
    if (!ingestContent.trim() || !ingestTitle.trim()) return;
    triggerHaptic('medium');
    const tags = autoTagDocument(ingestContent);
    setIngestResult(tags);
  };

  const tabs: { id: Tab; labelHi: string; labelEn: string; icon: any }[] = [
    { id: 'browse', labelHi: 'ब्राउज़ करें', labelEn: 'Browse Base', icon: BookOpen },
    { id: 'search', labelHi: 'खोज (RAG)', labelEn: 'Search (RAG)', icon: Search },
    { id: 'graph', labelHi: 'ज्ञान ग्राफ', labelEn: 'Knowledge Graph', icon: Network },
    { id: 'ingest', labelHi: 'दस्तावेज़ जोड़ें', labelEn: 'Ingest Document', icon: Upload },
  ];

  return (
    <div className="min-h-screen text-slate-100 p-4 sm:p-6 bg-[#030704]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { triggerHaptic('light'); onBack(); }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'mr' ? 'ज्ञान बुद्धिमत्ता केंद्र' : (lang === 'hi' ? 'ज्ञान बुद्धिमत्ता केंद्र' : 'Knowledge Intelligence Center')}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              RAG-powered agriculture index with hybrid search, multi-agent query graphs & automatic tagging
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 mb-6 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { triggerHaptic('light'); setTab(t.id); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? t.labelHi : (lang === 'hi' ? t.labelHi : t.labelEn)}</span>
            </button>
          );
        })}
      </div>

      {/* Content Cases */}
      <div className="space-y-6">
        
        {/* Browse Tab */}
        {tab === 'browse' && (
          <div className="space-y-5 animate-fade-in">
            {/* Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </div>
              {['all', 'government-verified', 'expert-reviewed', 'community-verified', 'ai-generated'].map((f) => (
                <button
                  key={f}
                  onClick={() => { triggerHaptic('light'); setFilterConfidence(f); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    filterConfidence === f
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? (lang === 'mr' ? 'सर्व' : 'All') : CONFIDENCE_HI[f as keyof typeof CONFIDENCE_HI] || f}
                </button>
              ))}
              <div className="ml-auto text-xs font-bold text-slate-500">
                {filteredDocs.length} items found
              </div>
            </div>

            {/* Document grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredDocs.map((doc, i) => (
                <button
                  key={doc.id}
                  onClick={() => { triggerHaptic('light'); setSelectedDoc(doc); }}
                  className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 text-left hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{doc.metadata.documentType}</div>
                        <div className="text-[9px] text-emerald-400 font-bold">version {doc.version}</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-black tracking-wider uppercase">
                      {doc.confidenceScore}% verified
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white mb-1.5 leading-snug group-hover:text-emerald-400 transition-colors">
                    {lang === 'mr' ? doc.titleHi : (lang === 'hi' ? doc.titleHi : doc.title)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {doc.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> {doc.metadata.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-cyan-500" /> {doc.metadata.year}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> {doc.usageCount} views</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Tab (RAG) */}
        {tab === 'search' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <h3 className="text-sm font-black text-white mb-1.5 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Hybrid Search Pipeline (BM25 + Semantic Cosine Similarity)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Queries are expanded with entity lookups and run against our indexes before routing.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={lang === 'mr' ? 'जैसे: सोयाबीन पीली मोज़ेक वायरस का इलाज...' : 'e.g. Cotton pink bollworm control remedies...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#070e08]/90 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  hybrid search matches ranked by index weight:
                </div>
                
                {searchResults.map((result, i) => (
                  <div
                    key={result.doc.id}
                    onClick={() => setSelectedDoc(result.doc)}
                    className="bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          #{i + 1}
                        </span>
                        <h4 className="text-sm font-black text-white">{lang === 'mr' ? result.doc.titleHi : result.doc.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{result.doc.summary}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold pt-2">
                        <span>Source: {result.citation.source}</span>
                        <span>•</span>
                        <span>Confidence: {result.citation.confidence}%</span>
                        <span>•</span>
                        <span>v{result.citation.version}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-end md:w-36 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4 gap-2">
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400">{(result.score).toFixed(1)}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">hybrid score</div>
                      </div>

                      {/* Score breakdown metrics */}
                      <div className="flex gap-2 w-full justify-end text-[9px] text-slate-400 font-bold">
                        <div className="text-center bg-white/[0.02] border border-white/5 rounded px-1.5 py-0.5">
                          <span>KW: {result.keywordScore}</span>
                        </div>
                        <div className="text-center bg-white/[0.02] border border-white/5 rounded px-1.5 py-0.5">
                          <span>VEC: {Math.round(result.vectorScore * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Knowledge Graph Tab */}
        {tab === 'graph' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-black text-white mb-1.5 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                Taxonomic Entity Knowledge Graph
              </h3>
              <p className="text-xs text-slate-400">
                Explore relationships mapping crops to pests, diseases, fertilizers, and treatment methods.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...CROPS, ...DISEASES, ...FERTILIZERS].slice(0, 12).map((entity) => {
                const related = getRelatedEntities(entity.id);
                return (
                  <div
                    key={entity.id}
                    className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white leading-none">{entity.canonicalName}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{entity.type}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Synonyms:</div>
                      <div className="flex flex-wrap gap-1">
                        {entity.synonyms.slice(0, 4).map((syn) => (
                          <span key={syn} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>

                    {related.length > 0 && (
                      <div>
                        <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1.5">Relations ({related.length}):</div>
                        <div className="space-y-1">
                          {related.slice(0, 3).map((r, j) => (
                            <div key={j} className="flex items-center gap-2 text-[10.5px]">
                              <span className="text-emerald-400">→</span>
                              <span className="text-slate-300 font-semibold">{r.entity.canonicalName}</span>
                              <span className="text-slate-500 text-[9px] font-bold">({r.relation})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ingest Tab */}
        {tab === 'ingest' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Knowledge Ingestion Pipeline Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submit agricultural guidelines, and the autotagging analyzer parses crops, diseases, states, and confidence.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">Document Title</label>
                  <input
                    type="text"
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                    placeholder="e.g. Integrated pest control in Cotton"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070e08]/90 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 animate-enter"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">Document Content</label>
                  <textarea
                    value={ingestContent}
                    onChange={(e) => setIngestContent(e.target.value)}
                    placeholder="Paste or write crop advices..."
                    rows={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070e08]/90 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none animate-enter"
                  />
                </div>

                <button
                  onClick={handleIngest}
                  disabled={!ingestContent.trim() || !ingestTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Run Ingestion autotagger pipeline
                </button>
              </div>
            </div>

            {/* Ingestion Pipeline execution tracking */}
            {ingestResult && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4 animate-slide-up">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">autotagger pipeline outputs</h4>
                  <span className="ml-auto text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                    {ingestResult.confidence}% confidence score
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">crop ids found</div>
                    <div className="text-sm font-black text-emerald-400 mt-1">{ingestResult.crop.length}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">diseases mapped</div>
                    <div className="text-sm font-black text-rose-400 mt-1">{ingestResult.disease.length}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">detected lang</div>
                    <div className="text-sm font-black text-cyan-400 mt-1 uppercase">{ingestResult.language}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">keyword tokens</div>
                    <div className="text-sm font-black text-amber-400 mt-1">{ingestResult.keywords.length}</div>
                  </div>
                </div>

                {ingestResult.entities.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Identified entities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ingestResult.entities.map((e: any) => (
                        <span key={e.id} className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          {e.canonicalName} <span className="text-[9px] text-slate-500">({e.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-up"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">{selectedDoc.titleHi}</h3>
                <div className="text-[10px] text-slate-400 font-bold mt-0.5">{selectedDoc.title}</div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">source</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedDoc.metadata.source}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">pub year</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedDoc.metadata.year}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">confidence</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">{selectedDoc.confidenceScore}%</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ver version</div>
                  <div className="text-xs font-bold text-white mt-1">v{selectedDoc.version}</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedDoc.content}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AgriKnowledgeView;