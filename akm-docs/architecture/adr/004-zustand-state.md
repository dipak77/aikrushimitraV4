# Architectural Decision Record — Zustand State Management

## Context & Problem
The interactive React dashboard must handle various fast-changing states (voice assistant recording volume meters, chat list additions, APMC comparisons, and cached user credentials). Standard React `useState` prop-drilling causes redundant component re-renders, impacting performance on low-end budget smartphones.

## Proposed Strategy
Select **Zustand** as our state management tool:
*   Extremely lightweight (~1KB bundle footprint).
*   No boilerplate or providers required.
*   Built-in middleware support for `localStorage` persistence.

## Consequences
*   **Pros:** Minimal bundle size, reactive components re-render only when selective keys update, and simple setup structure.
*   **Cons:** No built-in debugging dashboard tools equivalent to Redux DevTools (though standard console loggers work fine).
