# AI Krushi Mitra — Context Memory & Window Strategy

> **Version:** 1.0 | **Status:** Approved | **Owner:** AI Engineer  
> **Last Updated:** 2026-06-28

---

## 1. Token Budgets & Limits

We operate a strict token allocation budget to keep latency under 2 seconds and API costs predictable:

| Segment | Token Limit | Description |
|---------|-------------|-------------|
| **System Prompt** | ~1,200 | Static instructions and rules |
| **RAG Context** | ~1,000 | Top 3 retrieved vector chunks |
| **Chat History** | ~800 | Last 5 conversation turns (rolling window) |
| **User Input** | ~200 | Active query / speech transcription |
| **Total Input Budget** | **3,200 Tokens** | Well within the 1M+ context window |

---

## 2. Conversation Retention Window

We do not pass infinite history to prevent token ballooning. Instead, we use a sliding window:

```
[Start Session]
   │
[Turn 1] -> [Turn 2] -> [Turn 3] -> [Turn 4] -> [Turn 5]
   │                                               │
   └───────────────── Retained in Context ─────────┘
   
[Turn 6 arrives] -> Drop Turn 1. Retain Turns 2-6.
```

If the chat exceeds 15 minutes of inactivity, the session is archived in local storage and the active memory context is cleared.
