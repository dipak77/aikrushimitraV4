import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cache for generated chunk embeddings to prevent redundant API calls
const chunkEmbeddingCache = {};

// Load knowledge base dynamically
let KNOWLEDGE_BASE = [];
try {
  const knowledgePath = path.resolve(__dirname, '../data/knowledge.ts');
  if (fs.existsSync(knowledgePath)) {
    const fileContent = fs.readFileSync(knowledgePath, 'utf8');
    const match = fileContent.match(/export const KNOWLEDGE_BASE\s*:\s*KnowledgeItem\[\]\s*=\s*([\s\S]*?);/);
    if (match) {
      const jsObjStr = match[1]
        .replace(/as const/g, '')
        .trim();
      KNOWLEDGE_BASE = eval(`(${jsObjStr})`);
    }
  }
} catch (e) {
  console.warn('Failed to parse knowledge.ts database dynamically:', e.message);
}

function cleanText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[#*`_]/g, '') // remove markdown styling
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunkText(text, size = 300, overlap = 50) {
  const words = cleanText(text).split(' ');
  const chunks = [];
  
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + size);
    chunks.push(chunkWords.join(' '));
    if (i + size >= words.length) break;
    i += size - overlap;
  }
  
  return chunks;
}

export function cosineSimilarity(v1, v2) {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getKeywordScore(text, queryWords) {
  const lowerText = text.toLowerCase();
  let score = 0;
  queryWords.forEach((word) => {
    if (word.length < 3) return;
    const regex = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * (word.length / 3);
    }
  });
  return score;
}

export async function retrieveContext(query, userContext = {}, apiKey) {
  const articles = KNOWLEDGE_BASE || [];
  
  const filteredArticles = articles.filter((art) => {
    if (!userContext.crops || userContext.crops.length === 0) return true;
    const titleText = `${art.title.mr || ''} ${art.title.en || ''} ${art.title.hi || ''}`.toLowerCase();
    const categoryText = (art.category || '').toLowerCase();
    return userContext.crops.some(
      (crop) => titleText.includes(crop.toLowerCase()) || categoryText.includes(crop.toLowerCase())
    );
  });

  const targetArticles = filteredArticles.length > 0 ? filteredArticles : articles;
  
  const allChunks = [];
  targetArticles.forEach((art, artIdx) => {
    const sectionsText = (art.sections || [])
      .map((s) => `${s.title.mr || ''} ${s.title.en || ''} ${s.content.mr || ''} ${s.content.en || ''}`)
      .join('\n');

    const textChunks = chunkText(sectionsText, 250, 40);
    const sourceTitle = art.title.mr || art.title.en || 'Knowledge Base';
    
    textChunks.forEach((chunk, chunkIdx) => {
      allChunks.push({
        id: `art_${artIdx}_chunk_${chunkIdx}`,
        text: chunk,
        source: sourceTitle,
        category: art.category
      });
    });
  });

  if (allChunks.length === 0) {
    return { contextText: '', citations: [] };
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const scoredChunks = allChunks.map((chunk) => ({
    chunk,
    score: getKeywordScore(chunk.text, queryWords)
  }));
  
  scoredChunks.sort((a, b) => b.score - a.score);
  const candidates = scoredChunks.slice(0, 12).map(c => c.chunk);

  const activeKey = apiKey || '';
  if (activeKey && candidates.length > 0) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });

      const queryEmbedResp = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: query
      });
      const queryVector = queryEmbedResp.embeddings?.[0]?.values || queryEmbedResp.embedding?.values;

      if (queryVector) {
        const uncachedCandidates = candidates.filter(c => !chunkEmbeddingCache[c.id]);
        if (uncachedCandidates.length > 0) {
          const embedPromises = uncachedCandidates.map(c =>
            ai.models.embedContent({
              model: 'text-embedding-004',
              contents: c.text
            }).then(resp => {
              const vector = resp.embeddings?.[0]?.values || resp.embedding?.values;
              if (vector) {
                chunkEmbeddingCache[c.id] = vector;
              }
            }).catch(() => {})
          );
          await Promise.all(embedPromises);
        }

        const semanticScores = candidates.map(c => {
          const vector = chunkEmbeddingCache[c.id];
          return {
            chunk: c,
            score: vector ? cosineSimilarity(queryVector, vector) : 0
          };
        });

        const topMatches = semanticScores.slice(0, 3).filter(m => m.score > 0.45).map(m => m.chunk);
        if (topMatches.length > 0) {
          const contextText = topMatches.map(m => `[Source: ${m.source}]\n${m.text}`).join('\n\n');
          const citations = topMatches.map(m => ({ source: m.source, category: m.category }));
          return { contextText, citations };
        }
      }
    } catch (e) {
      console.warn('RAG Semantic Search Failed, falling back to keyword matches:', e);
    }
  }

  const bestKeywordChunks = candidates.slice(0, 2);
  const contextText = bestKeywordChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n');
  const citations = bestKeywordChunks.map(c => ({ source: c.source, category: c.category }));
  return { contextText, citations };
}
