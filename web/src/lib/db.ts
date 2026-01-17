import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface WafirDB extends DBSchema {
    requestQueue: {
        key: number;
        value: {
            url: string;
            method: string;
            body?: any;
            headers?: any;
            timestamp: number;
        };
    };
    cache: {
        key: string;
        value: {
            data: any;
            timestamp: number;
        };
    };
}

let dbPromise: Promise<IDBPDatabase<WafirDB>>;

export function initDB() {
    if (!dbPromise) {
        dbPromise = openDB<WafirDB>('wafir-db', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('requestQueue')) {
                    db.createObjectStore('requestQueue', { keyPath: 'timestamp' });
                }
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache');
                }
            },
        });
    }
    return dbPromise;
}

export async function addToQueue(request: Omit<WafirDB['requestQueue']['value'], 'timestamp'>) {
    const db = await initDB();
    await db.add('requestQueue', { ...request, timestamp: Date.now() });
}

export async function getQueue() {
    const db = await initDB();
    return db.getAll('requestQueue');
}

export async function removeFromQueue(key: number) {
    const db = await initDB();
    await db.delete('requestQueue', key);
}

export async function cacheResponse(url: string, data: any) {
    const db = await initDB();
    await db.put('cache', { data, timestamp: Date.now() }, url);
}

export async function getCachedResponse(url: string) {
    const db = await initDB();
    const result = await db.get('cache', url);
    // Optional: expire cache after X time
    return result?.data;
}
