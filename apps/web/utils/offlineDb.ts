// Native IndexedDB Wrapper for Offline Storage & Sync Queue

const DB_NAME = 'akm_offline_db';
const DB_VERSION = 2;

export interface OfflineDiagnostic {
  id?: string;
  imageBase64: string;
  mimeType: string;
  cropType: string;
  lang: string;
  timestamp: number;
}

export class OfflineDB {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is only available in browser environments.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Caches for general endpoints (weather, mandi)
        if (!db.objectStoreNames.contains('weather_cache')) {
          db.createObjectStore('weather_cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('mandi_cache')) {
          db.createObjectStore('mandi_cache', { keyPath: 'key' });
        }

        // Upload Queue for offline diagnostics
        if (!db.objectStoreNames.contains('diagnostic_queue')) {
          db.createObjectStore('diagnostic_queue', { keyPath: 'id' });
        }

        // Pending sync queue (offline-strategy.md §2)
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id' });
        }

        // Conversation cache (system-context.md §4)
        if (!db.objectStoreNames.contains('conversationCache')) {
          db.createObjectStore('conversationCache', { keyPath: 'id' });
        }
      };
    });

    return this.dbPromise;
  }

  // --- GENERAL STORAGE HELPER METHODS ---
  
  public static async setItem(storeName: string, key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getItem<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value as T);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  }

  // --- DIAGNOSTIC QUEUE METHODS ---

  public static async queueDiagnostic(scan: OfflineDiagnostic): Promise<string> {
    const db = await this.getDB();
    const id = scan.id || `offline_scan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const record = { ...scan, id };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('diagnostic_queue', 'readwrite');
      const store = transaction.objectStore('diagnostic_queue');
      const request = store.put(record);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  public static async getQueuedDiagnostics(): Promise<OfflineDiagnostic[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('diagnostic_queue', 'readonly');
      const store = transaction.objectStore('diagnostic_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public static async removeQueuedDiagnostic(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('diagnostic_queue', 'readwrite');
      const store = transaction.objectStore('diagnostic_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- PENDING SYNC QUEUE (offline-strategy.md §2) ---

  public static async queuePendingSync(type: string, payload: any): Promise<string> {
    const db = await this.getDB();
    const id = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pendingSync', 'readwrite');
      const store = tx.objectStore('pendingSync');
      const request = store.put({ id, type, payload, createdAt: Date.now() });
      request.onsuccess = () => {
        // Request background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((reg: any) => {
            reg.sync?.register(`sync-${type === 'diagnostic' ? 'diagnostics' : 'activity-logs'}`);
          }).catch(() => {});
        }
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async getPendingSyncItems(): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pendingSync', 'readonly');
      const store = tx.objectStore('pendingSync');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public static async removePendingSync(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pendingSync', 'readwrite');
      const store = tx.objectStore('pendingSync');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- CONVERSATION CACHE (system-context.md §4) ---

  public static async cacheConversation(conversationId: string, messages: any[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversationCache', 'readwrite');
      const store = tx.objectStore('conversationCache');
      const request = store.put({ id: conversationId, messages, lastSync: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getCachedConversation(conversationId: string): Promise<any | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('conversationCache', 'readonly');
      const store = tx.objectStore('conversationCache');
      const request = store.get(conversationId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }
}
