import { addToQueue, cacheResponse, getCachedResponse, getQueue, removeFromQueue } from './db';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API_PREFIX = `${API_BASE}/api`;

export async function apiClient(endpoint: string, options: RequestInit = {}) {
    const url = `${API_PREFIX}${endpoint}`;

    // Try to get token from Supabase session
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // If successful GET, cache it
        if (response.ok && (!options.method || options.method === 'GET')) {
            const data = await response.clone().json();
            await cacheResponse(url, data);
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (!navigator.onLine) {
            console.warn('Network offline. Processing offline logic...');

            if (!options.method || options.method === 'GET') {
                // Try to return cached response
                const cached = await getCachedResponse(url);
                if (cached) {
                    return new Response(JSON.stringify(cached), { status: 200, statusText: 'OK (Offline Cache)' });
                }
            } else {
                // Queue write operations
                console.log('Queueing offline request:', url);
                await addToQueue({
                    url: endpoint, // Store relative path to avoid double prefix on retry
                    method: options.method || 'GET',
                    body: options.body,
                    headers: options.headers,
                });
                // Return a fake success for optimistic UI updates (viewer must handle this, or we throw generic offline error)
                // For now, let's throw but catch in UI? Or return null?
                // Returning a mock "Pending" response might be better for some UIs.
                return new Response(JSON.stringify({ offline: true, message: 'Action queued' }), { status: 202 });
            }
        }
        throw error;
    }
}

export async function syncOfflineRequests() {
    if (!navigator.onLine) return;

    const queue = await getQueue();
    console.log(`Syncing ${queue.length} offline requests...`);

    for (const req of queue) {
        try {
            await apiClient(req.url, {
                method: req.method,
                body: req.body,
                headers: req.headers,
            });
            await removeFromQueue(req.timestamp);
            console.log('Synced request:', req.url);
        } catch (err) {
            console.error('Failed to sync request:', req, err);
            // Keep in queue or move to "failed" queue? For now, keep.
        }
    }
}

// Background sync listener
window.addEventListener('online', () => {
    syncOfflineRequests();
});
