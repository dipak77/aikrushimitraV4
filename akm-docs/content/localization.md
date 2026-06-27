# AI Krushi Mitra — Multilingual Localization & Translation Strategy

> **Version:** 1.0 | **Status:** Approved | **Owner:** Localization Lead  
> **Last Updated:** 2026-06-28

---

## 1. Supported Languages Matrix

We target full support across 12 Indian regional language scripts:

*   **P0:** Marathi (`mr`), Hindi (`hi`), English (`en`).
*   **P1:** Telugu (`te`), Tamil (`ta`), Kannada (`kn`), Bengali (`bn`), Gujarati (`gu`).
*   **P2:** Punjabi (`pa`), Malayalam (`ml`), Odia (`or`), Assamese (`as`).

---

## 2. Dynamic prompt translation translation rules

To ensure the AI responds in the exact user-selected language:
1.  **Enforce System Instructions:** Every backend prompt injection includes `{user_language}` to instruct the model to think in the designated language.
2.  **Fallback to Hindi/English:** If localized RAG chunks are not available in a regional dialect, the core documentation is retrieved in English/Hindi and Gemini translates it dynamically during response generation.
3.  **Voice synthesis match:** The Voice Assistant prebuilt voice model matches language dialects to optimize natural pronunciation (e.g. Marathi speaker models use appropriate regional inflections).
