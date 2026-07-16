// Multi-Agent System — Master Orchestrator + Specialist Agents

import { rewriteQuery, hybridSearch, compressContext, generateCitations } from './rag-engine.js';
import { getRelatedEntities } from './taxonomy.js';

export const AGENTS = {
  master: {
    id: 'master',
    name: 'Master Agriculture Agent',
    nameHi: 'मास्टर कृषि एजेंट',
    icon: '🧠',
    description: 'Orchestrates all specialist agents and routes queries',
    descriptionHi: 'सभी विशेषज्ञ एजेंटों का समन्वय करता है',
    capabilities: ['intent-detection', 'agent-routing', 'context-assembly', 'answer-composition'],
    systemPrompt: 'तुम AI Krushi Mitra के मास्टर एजेंट हो। किसान के प्रश्न को समझकर उचित विशेषज्ञ एजेंट को रूट करो।',
    toolAccess: ['rag-search', 'weather', 'market', 'all-agents'],
    color: '#10b981',
  },
  'crop-expert': {
    id: 'crop-expert',
    name: 'Crop Expert Agent',
    nameHi: 'फसल विशेषज्ञ एजेंट',
    icon: '🌾',
    description: 'Crop selection, growth stages, variety recommendations',
    descriptionHi: 'फसल चयन, वृद्धि चरण, किस्म अनुशंसा',
    capabilities: ['crop-selection', 'variety-recommendation', 'growth-stage-advice', 'cropping-pattern'],
    systemPrompt: 'तुम फसल विशेषज्ञ AI हो। फसल चयन, किस्में, वृद्धि चरण और फसल चक्र पर सलाह दो।',
    toolAccess: ['rag-search', 'knowledge-graph'],
    color: '#22c55e',
  },
  'plant-doctor': {
    id: 'plant-doctor',
    name: 'Plant Doctor Agent',
    nameHi: 'प्लांट डॉक्टर एजेंट',
    icon: '🔬',
    description: 'Disease diagnosis, pest identification, treatment plans',
    descriptionHi: 'बीमारी निदान, कीट पहचान, उपचार योजना',
    capabilities: ['disease-diagnosis', 'pest-identification', 'treatment-plan', 'image-analysis'],
    systemPrompt: 'तुम प्लांट डॉक्टर AI हो। फसल की बीमारी और कीट की पहचान कर उपचार सुझाओ।',
    toolAccess: ['rag-search', 'knowledge-graph', 'image-analysis'],
    color: '#ef4444',
  },
  'soil-expert': {
    id: 'soil-expert',
    name: 'Soil Expert Agent',
    nameHi: 'मिट्टी विशेषज्ञ एजेंट',
    icon: '🪴',
    description: 'Soil health, nutrient management, fertilizer recommendations',
    descriptionHi: 'मिट्टी स्वास्थ्य, पोषक प्रबंधन, खाद अनुशंसा',
    capabilities: ['soil-analysis', 'nutrient-recommendation', 'fertilizer-advice', 'ph-management'],
    systemPrompt: 'तुम मिट्टी विशेषज्ञ AI हो। मिट्टी जांच, पोषक तत्व और खाद की सलाह दो।',
    toolAccess: ['rag-search', 'soil-data'],
    color: '#a855f7',
  },
  weather: {
    id: 'weather',
    name: 'Weather Agent',
    nameHi: 'मौसम एजेंट',
    icon: '🌤️',
    description: 'Weather forecasts, farming advisories, alerts',
    descriptionHi: 'मौसम पूर्वानुमान, खेती सलाह, अलर्ट',
    capabilities: ['forecast', 'advisory', 'alert', 'irrigation-timing'],
    systemPrompt: 'तुम मौसम विशेषज्ञ AI हो। मौसम के आधार पर खेती की सलाह दो।',
    toolAccess: ['weather-api', 'rag-search'],
    color: '#0ea5e9',
  },
  market: {
    id: 'market',
    name: 'Market Agent',
    nameHi: 'बाजार एजेंट',
    icon: '📈',
    description: 'Market prices, trends, selling recommendations',
    descriptionHi: 'बाजार भाव, रुझान, बिक्री अनुशंसा',
    capabilities: ['price-tracking', 'trend-analysis', 'selling-advice', 'mandi-info'],
    systemPrompt: 'तुम बाजार विशेषज्ञ AI हो। फसल के भाव, रुझान और बिक्री का सही समय बताओ।',
    toolAccess: ['market-api', 'rag-search'],
    color: '#f59e0b',
  },
  scheme: {
    id: 'scheme',
    name: 'Government Scheme Agent',
    nameHi: 'सरकारी योजना एजेंट',
    icon: '🏛️',
    description: 'Government schemes, subsidies, eligibility',
    descriptionHi: 'सरकारी योजनाएं, सब्सिडी, पात्रता',
    capabilities: ['scheme-search', 'eligibility-check', 'application-help', 'subsidy-info'],
    systemPrompt: 'तुम सरकारी योजना विशेषज्ञ AI हो। किसानों के लिए उपलब्ध योजनाओं और सब्सिडी की जानकारी दो।',
    toolAccess: ['rag-search', 'scheme-database'],
    color: '#3b82f6',
  },
  irrigation: {
    id: 'irrigation',
    name: 'Irrigation Agent',
    nameHi: 'सिंचाई एजेंट',
    icon: '💧',
    description: 'Irrigation planning, water management, drip systems',
    descriptionHi: 'सिंचाई योजना, जल प्रबंधन, टपक प्रणाली',
    capabilities: ['irrigation-scheduling', 'water-requirement', 'system-recommendation', 'efficiency'],
    systemPrompt: 'तुम सिंचाई विशेषज्ञ AI हो। पानी की आवश्यकता, सिंचाई का समय and विधि की सलाह दो।',
    toolAccess: ['rag-search', 'weather-api'],
    color: '#06b6d4',
  },
  livestock: {
    id: 'livestock',
    name: 'Livestock Agent',
    nameHi: 'पशुधन एजेंट',
    icon: '🐄',
    description: 'Animal husbandry, feed, health, breeding',
    descriptionHi: 'पशुपालन, चारा, स्वास्थ्य, प्रजनन',
    capabilities: ['animal-health', 'feed-management', 'breeding-advice', 'vaccination'],
    systemPrompt: 'तुम पशुधन विशेषज्ञ AI हो। गोपालन, चारा, स्वास्थ्य और प्रजनन की सलाह दो।',
    toolAccess: ['rag-search'],
    color: '#f97316',
  },
  finance: {
    id: 'finance',
    name: 'Farm Finance Agent',
    nameHi: 'फार्म फाइनेंस एजेंट',
    icon: '💰',
    description: 'Farm economics, loans, insurance, profit optimization',
    descriptionHi: 'खेत अर्थशास्त्र, ऋण, बीमा, मुनाफा अनुकूलन',
    capabilities: ['cost-analysis', 'loan-info', 'insurance-advice', 'profit-optimization'],
    systemPrompt: 'तुम कृषि वित्त विशेषज्ञ AI हो। लागत, ऋण, बीमा और मुनाफे की सलाह दो।',
    toolAccess: ['rag-search', 'market-api'],
    color: '#eab308',
  },
  research: {
    id: 'research',
    name: 'Research Agent',
    nameHi: 'रिसर्च एजेंट',
    icon: '📚',
    description: 'Research papers, studies, latest agriculture science',
    descriptionHi: 'शोध पत्र, अध्ययन, नवीनतम कृषि विज्ञान',
    capabilities: ['paper-search', 'study-summary', 'innovation-tracking', 'best-practices'],
    systemPrompt: 'तुम कृषि अनुसंधान विशेषज्ञ AI हो। नवीनतम शोध और वैज्ञानिक जानकारी दो।',
    toolAccess: ['rag-search', 'research-papers'],
    color: '#8b5cf6',
  },
};

function selectAgent(intent) {
  const mapping = {
    diagnosis: 'plant-doctor',
    treatment: 'plant-doctor',
    scheme: 'scheme',
    weather: 'weather',
    market: 'market',
    irrigation: 'irrigation',
    soil: 'soil-expert',
    pest: 'plant-doctor',
    fertilizer: 'soil-expert',
    general: 'crop-expert',
  };
  return mapping[intent] || 'crop-expert';
}

export function buildContext(query, farmer, ragResults) {
  const rq = rewriteQuery(query);

  const farmerProfile = farmer.name
    ? `किसान: ${farmer.name}${farmer.location ? ', स्थान: ' + farmer.location : ''}${farmer.state ? ', राज्य: ' + farmer.state : ''}${farmer.language ? ', भाषा: ' + farmer.language : ''}`
    : 'किसान: अज्ञात';

  const farmProfile = [
    farmer.crops?.length ? `फसलें: ${farmer.crops.join(', ')}` : '',
    farmer.farmSize ? `खेत का आकार: ${farmer.farmSize} एकड़` : '',
    farmer.soilType ? `मिट्टी: ${farmer.soilType}` : '',
    farmer.irrigationMethod ? `सिंचाई: ${farmer.irrigationMethod}` : '',
  ].filter(Boolean).join(' | ');

  const conversationSummary = farmer.conversationHistory?.slice(-3).map((m) => `${m.role}: ${m.content?.slice(0, 100) || m.text?.slice(0, 100)}`).join(' | ') || '';

  const knowledgeContext = compressContext(ragResults, 1500);

  const relatedEntities = [];
  for (const entity of rq.detectedEntities) {
    const related = getRelatedEntities(entity.id);
    for (const r of related) {
      if (!relatedEntities.find((e) => e.id === r.entity.id)) {
        relatedEntities.push(r.entity);
      }
    }
  }

  const totalContext = [
    farmerProfile,
    farmProfile,
    conversationSummary ? `वार्तालाप: ${conversationSummary}` : '',
    knowledgeContext ? `ज्ञान संदर्भ:\n${knowledgeContext}` : '',
    relatedEntities.length > 0 ? `संबंधित विषय: ${relatedEntities.map((e) => e.canonicalName).join(', ')}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    farmerProfile,
    farmProfile,
    conversationSummary,
    weatherContext: '',
    marketContext: '',
    knowledgeContext,
    relatedEntities,
    ragResults,
    totalContext,
  };
}

export function orchestrate(query, farmer, messages) {
  const rq = rewriteQuery(query);
  const selectedAgentType = selectAgent(rq.intent);
  const selectedAgent = AGENTS[selectedAgentType];

  // RAG search
  const ragResults = hybridSearch(query, undefined, 5);
  const citations = generateCitations(ragResults);

  // Build context
  const context = buildContext(query, { ...farmer, conversationHistory: messages }, ragResults);

  const steps = [
    { step: 1, agent: 'master', agentName: AGENTS.master.name, action: 'Intent Detection', status: 'complete', result: `Intent: ${rq.intent}` },
    { step: 2, agent: 'master', agentName: AGENTS.master.name, action: 'Entity Extraction', status: 'complete', result: `${rq.detectedEntities.length} entities: ${rq.detectedEntities.map((e) => e.canonicalName).join(', ') || 'none'}` },
    { step: 3, agent: 'master', agentName: AGENTS.master.name, action: 'Agent Routing', status: 'complete', result: selectedAgent.name },
    { step: 4, agent: selectedAgentType, agentName: selectedAgent.name, action: 'RAG Knowledge Retrieval', status: 'complete', result: `${ragResults.length} documents found` },
    { step: 5, agent: selectedAgentType, agentName: selectedAgent.name, action: 'Context Compiling', status: 'complete', result: `${context.totalContext.length} chars assembled` },
    { step: 6, agent: selectedAgentType, agentName: selectedAgent.name, action: 'Answer Routing', status: 'complete', result: 'Response configured' },
  ];

  const confidence = ragResults.length > 0
    ? Math.min(98, 60 + ragResults[0].doc.confidenceScore * 0.3 + ragResults.length * 2)
    : 50;

  return {
    query,
    intent: rq.intent,
    selectedAgent,
    steps,
    context,
    ragResults,
    citations,
    confidence,
    answer: '',
  };
}
