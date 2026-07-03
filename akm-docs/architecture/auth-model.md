# AI Krushi Mitra — Authentication & Authorization Model

> **Version:** 1.0 | **Status:** Approved | **Owner:** Security Lead  
> **Last Updated:** 2026-06-28

---

## 1. Authentication Streams

We support three entry gates for onboarding farmers:

```
[Entry Point]
    │
    ├──► Google Sign-In (OAuth 2.0) ──► Firebase Auth token ──► Zustand Store (Persistent)
    ├──► OTP Phone Login (Fast SMS) ──► Custom JWT Token  ──► Zustand Store (Persistent)
    └──► Guest mode (Anonymous)    ──► Session ID only   ──► Limited database quotas
```

---

## 2. Role-Based Access Control (RBAC)

We classify clients into 4 role descriptors to authorize database updates:

| Role | Access Permissions | Rules |
|------|--------------------|-------|
| **Guest** | Read-only static pages | Deny `/api/soil/*` and visual diagnosis history logs after 2 scans |
| **Farmer** | Read/write own user profile and query logs | Firestore constraint: `request.auth.uid == resource.data.userId` |
| **FPO Lead** | Read aggregate member charts | Allowed access to custom cooperative dashboard |
| **Admin** | Read/write knowledge base templates and system settings | Strict Google email filter whitelist check |
