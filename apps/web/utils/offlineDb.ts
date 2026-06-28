// Native IndexedDB Wrapper for Offline Storage & Sync Queue

const DB_NAME = 'akm_offline_db';
const DB_VERSION = 1;

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
}
