# AI Krushi Mitra — RAG Pipeline Architecture

> **Version:** 1.0 | **Status:** Approved | **Owner:** RAG Architect  
> **Last Updated:** 2026-06-28

---

## 1. Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     RAG Pipeline Architecture                    │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ INGEST   │───►│ PROCESS  │───►│ INDEX    │───►│ RETRIEVE │  │
│  │          │    │          │    │          │    │          │  │
│  │ Sources  │    │ Chunk    │    │ Embed    │    │ Search   │  │
│  │ Crawl    │    │ Clean    │    │ Store    │    │ Rerank   │  │
│  │ Validate │    │ Enrich   │    │ Validate │    │ Cite     │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ┌──────────┐    ┌──────────┐                                   │
│  │ GENERATE │◄───│ EVALUATE │                                   │
│  │          │    │          │                                   │
│  │ Prompt   │    │ Accuracy │                                   │
│  │ LLM Call │    │ Ground   │                                   │
│  │ Format   │    │ Safety   │                                   │
│  └──────────┘    └──────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Source Catalog

### 2.1 Primary Sources (Authoritative)

| Source | Type | Content | Language | Update Freq | Access Method |
|--------|------|---------|----------|-------------|--------------|
| **ICAR Publications** | PDFs, web pages | Crop cultivation packages, research bulletins | English, Hindi | Quarterly | Web scrape + manual |
| **KVK Advisories** | Web pages | District-level crop advisories | Hindi, regional | Weekly | RSS/API |
| **State Agri Dept** | Web portals | State schemes, circulars, advisories | Regional | Monthly | Web scrape |
| **APEDA** | PDFs, web | Export guidelines, quality standards | English | Annually | Manual download |
| **Agmarknet** | API/web | APMC mandi prices | English | Real-time | API polling |
| **IMD** | API/web | Weather data, forecasts, alerts | English | Hourly | API |
| **Soil Health Card Portal** | Web | Soil test parameters, recommendations | Hindi, English | On-demand | API |

### 2.2 Secondary Sources (Supplementary)

| Source | Type | Content | Quality Control |
|--------|------|---------|----------------|
| **Agricultural universities** | Research papers | Advanced farming techniques | Expert review required |
| **FAO/CGIAR** | PDFs, databases | Global best practices | Adapt to Indian context |
| **Farmer community forums** | User-generated | Practical field experience | AI moderation + expert validation |
| **YouTube transcripts** | Video transcripts | Popular agri-channels | Fact-check against primary sources |
| **WhatsApp forwards** | Text | Common farmer queries | Heavy filtering for misinformation |

### 2.3 Generated Sources (AI-Enhanced)

| Source | Content | Generation Method |
|--------|---------|-------------------|
| **Crop encyclopedias** | Comprehensive crop guides | LLM summarization of primary sources |
| **Disease treatment protocols** | Step-by-step treatment guides | LLM structuring of research papers |
| **Seasonal advisories** | Region-specific farming calendars | LLM + weather data + crop calendar |
| **FAQ databases** | Common farmer questions with answers | Mining community forums + expert validation |

---

## 3. Ingestion Pipeline

### 3.1 Document Extraction

```python
# Extraction Pipeline
def extract_document(source):
    if source.type == 'pdf':
        # Use PyMuPDF for text extraction
        # OCR fallback for scanned PDFs (Tesseract with Hindi/Marathi)
        text = extract_pdf_text(source.path)
        
    elif source.type == 'web_page':
        # Use Playwright for JavaScript-rendered pages
        # BeautifulSoup for static HTML
        text = extract_web_content(source.url)
        
    elif source.type == 'api':
        # Direct API response parsing
        data = fetch_api_data(source.endpoint)
        text = structure_api_response(data)
    
    return {
        'text': text,
        'source_url': source.url,
        'source_name': source.name,
        'extraction_date': now(),
        'language': detect_language(text),
        'content_type': classify_content(text)
    }
```

### 3.2 Document Cleaning

```python
# Cleaning Pipeline
def clean_document(doc):
    # 1. Remove boilerplate (headers, footers, navigation)
    doc.text = remove_boilerplate(doc.text)
    
    # 2. Normalize Unicode (important for Hindi/Marathi)
    doc.text = normalize_unicode(doc.text, form='NFC')
    
    # 3. Fix encoding issues (common in govt PDFs)
    doc.text = fix_encoding(doc.text)
    
    # 4. Remove duplicate content
    doc.text = deduplicate_sections(doc.text)
    
    # 5. Standardize formatting
    doc.text = standardize_formatting(doc.text)
    
    # 6. Extract tables (convert to structured text)
    doc.tables = extract_and_format_tables(doc.text)
    
    return doc
```

### 3.3 Chunking Strategy

| Content Type | Chunk Size | Overlap | Strategy |
|-------------|-----------|---------|----------|
| **Crop guides** | 500 tokens | 100 tokens | Section-based (per topic heading) |
| **Disease descriptions** | 300 tokens | 50 tokens | Per symptom/treatment section |
| **Treatment protocols** | 200 tokens | 30 tokens | Per treatment step (keep atomic) |
| **Market reports** | 150 tokens | 0 | Per commodity entry |
| **Weather advisories** | 200 tokens | 50 tokens | Per advisory item |
| **Government schemes** | 400 tokens | 80 tokens | Per scheme section |
| **Research papers** | 500 tokens | 100 tokens | Paragraph-based |
| **FAQ entries** | 150 tokens | 0 | One chunk per Q&A pair |

```python
def chunk_document(doc, config):
    chunks = []
    
    if doc.content_type in ['crop_guide', 'research_paper']:
        # Semantic chunking: split on section boundaries
        sections = split_on_headings(doc.text)
        for section in sections:
            if token_count(section) > config.max_chunk_size:
                # Recursive split on paragraph boundaries
                sub_chunks = split_on_paragraphs(section, config.max_chunk_size, config.overlap)
                chunks.extend(sub_chunks)
            else:
                chunks.append(section)
                
    elif doc.content_type == 'faq':
        # One chunk per Q&A pair
        qa_pairs = extract_qa_pairs(doc.text)
        chunks.extend(qa_pairs)
        
    elif doc.content_type == 'treatment_protocol':
        # Keep each treatment step as atomic chunk
        steps = extract_treatment_steps(doc.text)
        chunks.extend(steps)
    
    return chunks
```

### 3.4 Metadata Enrichment

Every chunk receives the following metadata:

```typescript
interface ChunkMetadata {
  // Source tracking
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  extractionDate: string;
  
  // Content classification
  contentType: 'crop_guide' | 'disease_info' | 'treatment' | 'market_data' | 
               'weather' | 'scheme' | 'faq' | 'general_advisory';
  
  // Agricultural domain tags
  crops: string[];                // Related crop IDs
  diseases: string[];             // Related disease IDs
  pests: string[];                // Related pest IDs
  regions: string[];              // Applicable regions
  seasons: string[];              // Applicable seasons
  
  // Language
  language: string;               // 'en', 'hi', 'mr'
  hasTranslation: boolean;
  translatedFrom?: string;
  
  // Quality
  expertReviewed: boolean;
  authorityScore: number;         // 0-1 (ICAR = 1.0, forum = 0.3)
  freshness: string;              // ISO date of content
  
  // Retrieval tuning
  importance: 'critical' | 'high' | 'medium' | 'low';
  searchKeywords: string[];       // Additional search terms
}
```

### 3.5 Embedding Generation

| Config | Value | Rationale |
|--------|-------|-----------|
| **Model** | `text-embedding-004` (Google) | Best multilingual support for Indian languages |
| **Dimensions** | 768 | Balance of quality and storage cost |
| **Batch Size** | 100 chunks | API rate limit consideration |
| **Languages** | Embed in original language + English translation | Cross-lingual retrieval support |

```python
def generate_embeddings(chunks):
    embeddings = []
    for batch in batched(chunks, 100):
        # Generate embedding for original text
        original_embeddings = embed_model.encode([c.text for c in batch])
        
        # If non-English, also embed English translation
        for chunk, embedding in zip(batch, original_embeddings):
            result = {
                'chunk_id': chunk.id,
                'text': chunk.text,
                'embedding': embedding,
                'metadata': chunk.metadata
            }
            
            if chunk.metadata.language != 'en':
                # Translate to English and embed
                en_text = translate(chunk.text, target='en')
                en_embedding = embed_model.encode(en_text)
                result['en_embedding'] = en_embedding
                result['en_text'] = en_text
            
            embeddings.append(result)
    
    return embeddings
```

---

## 4. Retrieval Pipeline

### 4.1 Query Processing

```python
def process_query(user_query, user_context):
    # 1. Language detection
    query_lang = detect_language(user_query)
    
    # 2. Translate to English (for cross-lingual search)
    if query_lang != 'en':
        en_query = translate(user_query, target='en')
    else:
        en_query = user_query
    
    # 3. Query expansion
    expanded_queries = expand_query(en_query, user_context)
    # Example: "cotton leaf disease" → 
    #   ["cotton leaf disease", "cotton bacterial blight", 
    #    "cotton fungal infection symptoms"]
    
    # 4. Generate query embedding
    query_embedding = embed_model.encode(en_query)
    
    # 5. Build metadata filters
    filters = build_filters(user_context)
    # Example: { crops: ['cotton'], regions: ['maharashtra'], 
    #            seasons: ['kharif'] }
    
    return query_embedding, expanded_queries, filters
```

### 4.2 Vector Search

```python
def search_vector_store(query_embedding, filters, top_k=10):
    # Primary search: vector similarity
    results = vector_store.search(
        embedding=query_embedding,
        top_k=top_k * 2,  # Over-fetch for reranking
        filters=filters,
        score_threshold=0.7  # Minimum relevance
    )
    
    # Secondary search: keyword fallback (BM25)
    keyword_results = bm25_search(
        query=expanded_queries,
        top_k=top_k,
        filters=filters
    )
    
    # Merge with reciprocal rank fusion
    merged = reciprocal_rank_fusion(results, keyword_results)
    
    return merged[:top_k * 2]
```

### 4.3 Reranking

```python
def rerank_results(query, candidates, user_context):
    scored_results = []
    
    for candidate in candidates:
        score = candidate.similarity_score
        
        # Boost factors
        if candidate.metadata.expertReviewed:
            score *= 1.2  # Prefer expert-reviewed content
        
        score *= candidate.metadata.authorityScore  # Source authority
        
        # Freshness decay (newer is better for market/weather)
        if candidate.metadata.contentType in ['market_data', 'weather']:
            age_days = days_since(candidate.metadata.freshness)
            score *= max(0.5, 1.0 - (age_days / 30))
        
        # Regional relevance boost
        if user_context.state in candidate.metadata.regions:
            score *= 1.3
        
        # Crop relevance boost
        if any(c in candidate.metadata.crops for c in user_context.crops):
            score *= 1.4
        
        scored_results.append((candidate, score))
    
    # Sort by final score
    scored_results.sort(key=lambda x: x[1], reverse=True)
    
    return scored_results[:5]  # Return top 5 after reranking
```

### 4.4 Context Assembly

```python
def assemble_context(ranked_results, user_context, max_tokens=4000):
    context_parts = []
    total_tokens = 0
    citations = []
    
    for result, score in ranked_results:
        chunk_tokens = count_tokens(result.text)
        
        if total_tokens + chunk_tokens > max_tokens:
            break
        
        context_parts.append(f"[Source: {result.metadata.sourceName}]\n{result.text}")
        citations.append({
            'source': result.metadata.sourceName,
            'url': result.metadata.sourceUrl,
            'relevance': score
        })
        total_tokens += chunk_tokens
    
    # Add user context
    user_context_text = f"""
    Farmer Profile:
    - Location: {user_context.district}, {user_context.state}
    - Crops: {', '.join(user_context.crops)}
    - Season: {current_season()}
    - Land: {user_context.landSize}
    """
    
    return {
        'retrieved_context': '\n\n'.join(context_parts),
        'user_context': user_context_text,
        'citations': citations,
        'chunks_used': len(context_parts)
    }
```

---

## 5. Freshness & Update Cadence

| Content Type | Update Frequency | Trigger | Method |
|-------------|-----------------|---------|--------|
| **Market Prices** | Every 15 minutes | Scheduled Cloud Function | API polling |
| **Weather Data** | Every 30 minutes | Scheduled Cloud Function | API polling |
| **Crop Advisories** | Weekly | Content team review | Manual + auto-update |
| **Disease Database** | Monthly | Expert review cycle | Manual curation |
| **Government Schemes** | On change | Web monitoring | Scrape + notification |
| **ICAR Publications** | Quarterly | Publication calendar | Manual ingestion |
| **Seasonal Content** | Season change (3x/year) | Calendar trigger | Auto-swap content set |

---

## 6. Quality Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Retrieval Precision@5** | ≥ 0.8 | Expert-labeled evaluation set |
| **Retrieval Recall@10** | ≥ 0.9 | Same evaluation set |
| **Answer Groundedness** | ≥ 95% | % of claims traceable to retrieved chunks |
| **Citation Accuracy** | ≥ 98% | Manual audit of citation links |
| **Cross-lingual Retrieval** | ≥ 0.75 (Marathi query → English source) | Bilingual evaluation set |
| **Freshness Compliance** | ≥ 99% | Market data < 15min old, weather < 30min |
| **Index Completeness** | ≥ 90% | % of ICAR publications indexed |
