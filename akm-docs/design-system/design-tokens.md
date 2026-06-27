# AI Krushi Mitra — Design System Specification

> **Version:** 1.0 | **Status:** Approved | **Owner:** UI Design Lead  
> **Last Updated:** 2026-06-28

---

## 1. Brand Identity

### 1.1 Brand Personality

| Trait | Description | Voice Example |
|-------|-------------|---------------|
| **Trustworthy** | Reliable, expert-backed, transparent | "Based on ICAR research, we recommend..." |
| **Approachable** | Friendly, non-intimidating, warm | "शेतीत काही अडचण? आम्ही मदत करतो!" |
| **Empowering** | Makes farmers feel capable, not dependent | "You've saved ₹15,000 this season using our tips" |
| **Modern** | Cutting-edge AI, not outdated government portal | Sleek dark UI with glassmorphism |
| **Indian** | Culturally rooted, not Western transplant | Indian crop photos, regional greetings |

### 1.2 Brand Mark

- **Name:** AI Krushi Mitra (AI कृषी मित्र)
- **Meaning:** AI + Agriculture + Friend
- **Icon:** Stylized leaf combined with circuit/AI nodes
- **Primary Usage:** Always with text lockup; icon-only for app icon and favicon

---

## 2. Color Tokens

### 2.1 Core Palette

```css
:root {
  /* ═══════════════════════════════════════════════════
     PRIMARY — Agriculture Green
     Represents: Growth, nature, agriculture, trust
     ═══════════════════════════════════════════════════ */
  --color-primary-50:  #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;  /* ← Primary brand color */
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
  --color-primary-950: #022c22;

  /* ═══════════════════════════════════════════════════
     ACCENT — Earth Amber  
     Represents: Harvest, warmth, prosperity, Indian soil
     ═══════════════════════════════════════════════════ */
  --color-accent-50:  #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;  /* ← Accent color */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;

  /* ═══════════════════════════════════════════════════
     SEMANTIC — Functional colors
     ═══════════════════════════════════════════════════ */
  --color-success:    #10b981;  /* Green — Healthy, approved */
  --color-warning:    #f59e0b;  /* Amber — Caution, alerts */
  --color-error:      #ef4444;  /* Red — Critical, disease */
  --color-info:       #3b82f6;  /* Blue — Information, weather */

  /* Price indicators (color-blind safe) */
  --color-price-up:   #10b981;  /* Green + ▲ arrow */
  --color-price-down: #ef4444;  /* Red + ▼ arrow */
  --color-price-stable: #94a3b8; /* Gray + ─ dash */

  /* ═══════════════════════════════════════════════════
     SURFACE — Dark Theme (Default)
     Premium dark mode for outdoor visibility + OLED savings
     ═══════════════════════════════════════════════════ */
  --surface-bg:         #050505;
  --surface-bg-alt:     #0a0a0a;
  --surface-elevated:   #111111;
  --surface-card:       #1a1a1a;
  --surface-card-hover: #222222;
  --surface-overlay:    rgba(0, 0, 0, 0.6);
  
  --border-subtle:      rgba(255, 255, 255, 0.06);
  --border-default:     rgba(255, 255, 255, 0.10);
  --border-strong:      rgba(255, 255, 255, 0.20);

  /* ═══════════════════════════════════════════════════
     TEXT — Readable in all conditions
     ═══════════════════════════════════════════════════ */
  --text-primary:     #f1f5f9;  /* Headings, important text */
  --text-secondary:   #94a3b8;  /* Body text, descriptions */
  --text-muted:       #64748b;  /* Captions, timestamps */
  --text-disabled:    #334155;  /* Disabled state */
  --text-inverse:     #0f172a;  /* Text on light backgrounds */
  --text-link:        #34d399;  /* Clickable links */
}
```

### 2.2 Glassmorphism Effects

```css
:root {
  --glass-bg:         rgba(255, 255, 255, 0.05);
  --glass-bg-strong:  rgba(255, 255, 255, 0.08);
  --glass-border:     rgba(255, 255, 255, 0.10);
  --glass-blur:       12px;
  --glass-blur-heavy: 24px;
  
  /* Usage: Cards, modals, sidebar */
  --glass-card: {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
  }
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  /* Display font — headings, hero text, navigation */
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Body font — paragraphs, UI labels, descriptions */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Mono font — prices, data, code, statistics */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  
  /* Indian language font stack (fallback for Devanagari) */
  --font-devanagari: 'Noto Sans Devanagari', 'Mangal', sans-serif;
}
```

### 3.2 Type Scale

```css
:root {
  /* Size scale (Major Third — 1.25 ratio) */
  --text-2xs:  0.625rem;   /* 10px — Legal text, fine print */
  --text-xs:   0.75rem;    /* 12px — Captions, timestamps */
  --text-sm:   0.875rem;   /* 14px — Secondary body text */
  --text-base: 1rem;       /* 16px — Body text (default) */
  --text-lg:   1.125rem;   /* 18px — Emphasized body */
  --text-xl:   1.25rem;    /* 20px — Section headers */
  --text-2xl:  1.5rem;     /* 24px — Card titles */
  --text-3xl:  1.875rem;   /* 30px — Page headers */
  --text-4xl:  2.25rem;    /* 36px — Hero subheading */
  --text-5xl:  3rem;       /* 48px — Hero heading */
  --text-6xl:  3.75rem;    /* 60px — Landing hero (desktop) */

  /* Weight scale */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;
  --font-extrabold: 800;
  --font-black:     900;

  /* Line height */
  --leading-tight:  1.2;   /* Headings */
  --leading-snug:   1.35;  /* Subheadings */
  --leading-normal: 1.5;   /* Body text */
  --leading-relaxed: 1.625; /* Long-form reading */

  /* Letter spacing */
  --tracking-tighter: -0.05em;  /* Large display text */
  --tracking-tight:   -0.025em; /* Headings */
  --tracking-normal:  0;        /* Body */
  --tracking-wide:    0.025em;  /* Uppercase labels */
  --tracking-wider:   0.05em;   /* Tracking labels */
  --tracking-widest:  0.1em;    /* All-caps badges */
}
```

---

## 4. Spacing Scale

```css
:root {
  /* 4px base grid system */
  --space-0:   0;
  --space-0.5: 0.125rem;  /*  2px */
  --space-1:   0.25rem;   /*  4px */
  --space-1.5: 0.375rem;  /*  6px */
  --space-2:   0.5rem;    /*  8px */
  --space-2.5: 0.625rem;  /* 10px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */

  /* Border radius */
  --radius-sm:   0.375rem;  /*  6px — Small buttons, tags */
  --radius-md:   0.5rem;    /*  8px — Inputs, small cards */
  --radius-lg:   0.75rem;   /* 12px — Cards, modals */
  --radius-xl:   1rem;      /* 16px — Large cards, sections */
  --radius-2xl:  1.5rem;    /* 24px — Hero cards, glass panels */
  --radius-full: 9999px;    /* Pill buttons, avatars */
}
```

---

## 5. Motion Guidelines

### 5.1 Duration Scale

```css
:root {
  --duration-fast:    100ms;  /* Micro-interactions: hover, focus */
  --duration-normal:  200ms;  /* Transitions: color, opacity */
  --duration-slow:    300ms;  /* Animations: slide, expand */
  --duration-slower:  500ms;  /* Complex animations: modal, drawer */
  --duration-slowest: 800ms;  /* Page transitions, splash */
}
```

### 5.2 Easing Functions

```css
:root {
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 5.3 Animation Principles

1. **Performance**: Only animate `transform` and `opacity` (GPU-accelerated)
2. **Purposeful**: Every animation must communicate state change or guide attention
3. **Reduced Motion**: Respect `prefers-reduced-motion` media query
4. **Budget Phone Safe**: No complex particle effects on devices with < 4GB RAM
5. **Touch Feedback**: Immediate haptic-like visual feedback on touch (< 50ms)

---

## 6. Component Library

### 6.1 Button

| Variant | Background | Text | Border | Use Case |
|---------|-----------|------|--------|----------|
| **Primary** | `primary-500` | white | none | Main CTA ("Scan Crop", "Send Message") |
| **Secondary** | `glass-bg` | `primary-400` | `glass-border` | Secondary action ("Compare Markets") |
| **Ghost** | transparent | `text-secondary` | none | Tertiary action ("Cancel", "Back") |
| **Danger** | `error` | white | none | Destructive ("Delete Account") |
| **Icon** | `glass-bg` | `text-primary` | `glass-border` | Icon-only action (Camera, Mic) |

**States:** Default, Hover (+5% brightness), Active (scale 0.97), Disabled (40% opacity), Loading (spinner)

**Sizes:**
| Size | Height | Padding | Font | Touch Target |
|------|--------|---------|------|-------------|
| **sm** | 32px | 12px 16px | text-sm | 44px (pad area) |
| **md** | 40px | 12px 20px | text-base | 44px |
| **lg** | 48px | 16px 24px | text-lg | 48px |
| **xl** | 56px | 16px 32px | text-xl | 56px |

### 6.2 Card

| Variant | Use Case | Features |
|---------|----------|----------|
| **Glass Card** | Dashboard widgets | Glassmorphism, hover glow, rounded-2xl |
| **Data Card** | Market price, weather | Compact, mono font for numbers |
| **Feature Card** | Landing page features | Icon + title + description |
| **Crop Card** | Crop selection grid | Image thumbnail + name + season badge |
| **Scheme Card** | Scheme listing | Category badge + title + benefit summary |

**States:** Default, Hover (border glow + subtle lift), Selected (primary border), Loading (skeleton), Error (error border + retry), Empty (illustration + message)

### 6.3 Input

| Variant | Use Case |
|---------|----------|
| **Text Input** | Name, village, search query |
| **Textarea** | Chat message, feedback |
| **Select** | State, district, crop, language |
| **Search** | Knowledge base, scheme search |
| **Voice Input** | Voice button with listening animation |

**States:** Default (border-subtle), Focus (primary-500 ring), Error (error border + message), Disabled (muted bg), Loading (shimmer)

### 6.4 Voice Orb (Signature Component)

The centerpiece of the voice assistant — a pulsing, emotion-aware orb.

| State | Visual | Audio |
|-------|--------|-------|
| **Idle** | Gentle breathing pulse (green gradient) | None |
| **Listening** | Expanding pulse rings (amplitude reactive) | Mic active indicator |
| **Processing** | Rotating gradient spiral | "Thinking..." |
| **Speaking** | Wave-form visualization (blue-green) | TTS playback |
| **Error** | Red pulse + shake animation | Error tone |
| **Success** | Green burst + checkmark | Success tone |

### 6.5 Navigation

| Component | Desktop | Mobile |
|-----------|---------|--------|
| **Sidebar** | Fixed left, 240px, glass bg | Hidden (hamburger) |
| **Bottom Nav** | Hidden | Fixed bottom, 5 tabs, 56px height |
| **Top Bar** | Logo + search + language + profile | Logo + hamburger |
| **Breadcrumb** | Full path | Truncated (current + parent) |

### 6.6 Data Display

| Component | Use Case | Features |
|-----------|----------|----------|
| **Price Tag** | Market price display | ₹ symbol, trend arrow (▲/▼), color-coded |
| **Stat Card** | Dashboard metrics | Number + label + trend |
| **Chart** | Price trends, weather | Recharts, responsive, dark theme |
| **Table** | Market comparison, FPO data | Sortable, responsive (card view on mobile) |
| **Badge** | Season, category, status | Color-coded, rounded-full |
| **Progress** | Crop growth, scheme status | Segmented bar with phase labels |

---

## 7. Responsive Breakpoints

```css
:root {
  --screen-sm:  640px;   /* Large phones (landscape) */
  --screen-md:  768px;   /* Tablets */
  --screen-lg:  1024px;  /* Small laptops */
  --screen-xl:  1280px;  /* Desktops */
  --screen-2xl: 1536px;  /* Large desktops */
}

/* Mobile-first approach */
/* Default: 320px-639px (small phones — Ramesh's Redmi) */
/* sm: 640px+  (large phones) */
/* md: 768px+  (tablets) */
/* lg: 1024px+ (desktop — Rajesh's laptop) */
```

---

## 8. Accessibility Standards

| Requirement | Standard | Implementation |
|------------|---------|---------------|
| **Contrast Ratio** | WCAG AA (4.5:1 text, 3:1 UI) | All color combinations tested |
| **Touch Targets** | Minimum 44×44px | Larger for primary actions (48px+) |
| **Focus Indicators** | Visible focus ring (2px primary-500) | `focus-visible` selector |
| **Screen Reader** | ARIA labels on all interactive elements | Semantic HTML + aria attributes |
| **Reduced Motion** | Respect `prefers-reduced-motion` | Disable animations when set |
| **Font Scaling** | Support up to 200% zoom | Relative units (rem, em) |
| **Color Independence** | Never use color alone to convey info | Always pair with icon/text (▲/▼ + green/red) |
| **Keyboard Navigation** | Full keyboard access | Tab order, keyboard shortcuts |
| **Outdoor Visibility** | Readable in direct sunlight | High contrast dark theme, bright accent colors |
| **One-Handed Use** | Primary actions reachable with thumb | Bottom-anchored CTAs on mobile |
