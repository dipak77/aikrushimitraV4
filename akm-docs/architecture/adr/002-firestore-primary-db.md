# Architectural Decision Record — Cloud Firestore as Primary Database

## Context & Problem
We require a real-time, low-latency, and scale-ready database to record farmer diagnostic history, weather preferences, and price alerts. The system must support robust offline persistence since target farmers operate in low-bandwidth rural locations.

## Proposed Strategy
Select **Cloud Firestore** as our primary database:
*   Standard offline data sync is supported natively by the Firebase SDK (via IndexedDB/Service Workers).
*   Flexible schema matching for polymorphic crop and diagnostic records.

## Consequences
*   **Pros:** Native offline cache persistence, real-time reactive sync indicators, and zero server maintenance overhead.
*   **Cons:** No native complex SQL joining capabilities. Mitigated by denormalizing collections.
