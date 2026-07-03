import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineDB, OfflineDiagnostic } from '../utils/offlineDb';

// Custom Mock for IndexedDB async request objects
class MockIDBRequest {
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: any = null;
  error: any = null;

  constructor(result: any = null) {
    this.result = result;
    setTimeout(() => {
      if (this.onsuccess) this.onsuccess();
    }, 0);
  }
}

const mockStores: Record<string, Record<string, any>> = {};

// Spy on OfflineDB's database initializers to direct actions to the mock transaction stores
vi.spyOn(OfflineDB as any, 'getDB').mockImplementation(async () => {
  return {
    transaction: (storeName: string) => {
      if (!mockStores[storeName]) mockStores[storeName] = {};
      const storeRef = mockStores[storeName];

      return {
        objectStore: () => ({
          put: (record: any) => {
            const key = record.id || record.key;
            storeRef[key] = record;
            return new MockIDBRequest(key);
          },
          get: (key: string) => {
            return new MockIDBRequest(storeRef[key] || null);
          },
          getAll: () => {
            return new MockIDBRequest(Object.values(storeRef));
          },
          delete: (key: string) => {
            delete storeRef[key];
            return new MockIDBRequest();
          }
        })
      };
    }
  } as any;
});

describe('OfflineDB Caching & Queue Utility', () => {
  beforeEach(() => {
    // Clear mock storage
    for (const key of Object.keys(mockStores)) {
      delete mockStores[key];
    }
  });

  it('correctly caches and retrieves generic key-value items', async () => {
    await OfflineDB.setItem('weather_cache', 'pune_coord_321', { temp: '32C', condition: 'Sunny' });
    const cached = await OfflineDB.getItem<any>('weather_cache', 'pune_coord_321');
    expect(cached).not.toBeNull();
    expect(cached.temp).toBe('32C');
    expect(cached.condition).toBe('Sunny');
  });

  it('correctly queues local diagnostic leaf scans', async () => {
    const scan: OfflineDiagnostic = {
      imageBase64: 'data:image/png;base64,mockImageData',
      mimeType: 'image/png',
      cropType: 'onion',
      lang: 'mr',
      timestamp: Date.now()
    };

    const id = await OfflineDB.queueDiagnostic(scan);
    expect(id).toBeDefined();
    expect(id).toContain('offline_scan_');

    const queue = await OfflineDB.getQueuedDiagnostics();
    expect(queue.length).toBe(1);
    expect(queue[0].cropType).toBe('onion');
    expect(queue[0].lang).toBe('mr');
  });

  it('correctly removes diagnostic entries from queue', async () => {
    const scan: OfflineDiagnostic = {
      id: 'test_scan_id_123',
      imageBase64: 'data:image/png;base64,mockImageData',
      mimeType: 'image/png',
      cropType: 'cotton',
      lang: 'en',
      timestamp: Date.now()
    };

    await OfflineDB.queueDiagnostic(scan);
    let queue = await OfflineDB.getQueuedDiagnostics();
    expect(queue.length).toBe(1);

    await OfflineDB.removeQueuedDiagnostic('test_scan_id_123');
    queue = await OfflineDB.getQueuedDiagnostics();
    expect(queue.length).toBe(0);
  });
});
