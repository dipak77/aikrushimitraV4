# Architectural Decision Record — Gemini Model Selection & Routing

## Context & Problem
Operating high-volume AI advisory chats (RAG) and leaves-diagnostics (Vision) triggers high API cost and latency constraints. We need an LLM toolchain with support for native multimodal parsing (audio and images) and competitive cost structures.

## Proposed Strategy
Integrate **Gemini 2.5 Flash** as our primary model routing engine:
1.  **AI Chat & Diagnostics:** Gemini 2.5 Flash processes all requests at a low cost.
2.  **Voice assistant:** Connect to `gemini-2.5-flash-native-audio-preview` for native real-time audio streams.

## Consequences
*   **Pros:** Native audio capability (no separate text-to-speech needed), multimodal vision support, and extremely low latency.
*   **Cons:** Access is subject to rate-limit quotas. Mitigated by implementing request rate limiting and client fallback options.
