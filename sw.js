// Service Worker for Van Fleet Calendar
const CACHE_NAME = 'van-calendar-v1.2.3';
const STATIC_CACHE_NAME = 'van-calendar-static-v1.2.3';
const API_CACHE_NAME = 'van-calendar-api-v1.2.3';

// Resources to cache immediately
const STATIC_RESOURCES = [
    './',
    './calendar-production.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// API endpoints to cache (will be dynamically determined from config.js)
const API_ENDPOINTS = [
    'https://script.google.com/macros/s/AKfycbyoO-GlsISkbsD1kBWv0wnIXGKXja_VS0VVBei0aAikAJ2dIaCmjtj-1sGRRn1RCPN_/exec'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        Promise.all([
            // Cache static resources with error handling
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('Service Worker: Caching static resources');
                return Promise.allSettled(
                    STATIC_RESOURCES.map(url =>
                        fetch(url, { cache: 'no-cache' })
                            .then(response => {
                                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                return cache.put(url, response);
                            })
                            .catch(error => {
                                console.warn(`Service Worker: Failed to cache ${url}:`, error);
                                // Don't fail the entire operation for one resource
                            })
                    )
                );
            }),
            // Cache API endpoint
            caches.open(API_CACHE_NAME).then(cache => {
                console.log('Service Worker: Preparing API cache');
                return Promise.resolve();
            })
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            // Force activation
            return self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Installation failed:', error);
            // Still allow installation to complete
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== API_CACHE_NAME && 
                        cacheName.startsWith('van-calendar-')) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            // Take control of all clients
            return self.clients.claim();
        })
    );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Skip JSONP requests (they use script tags and need to bypass service worker)
    if (requestUrl.hostname === 'script.google.com' && 
        (requestUrl.searchParams.has('callback') || requestUrl.pathname.includes('Jsonp'))) {
        // Let JSONP requests pass through without interception
        return;
    }
    
    // Handle different types of requests
    if (requestUrl.hostname === 'script.google.com') {
        // API requests - Network First with API cache fallback
        event.respondWith(handleApiRequest(event.request));
    } else if (requestUrl.hostname === 'fonts.googleapis.com' || 
               requestUrl.hostname === 'fonts.gstatic.com') {
        // Font requests - Cache First
        event.respondWith(handleFontRequest(event.request));
    } else if (event.request.destination === 'document' || 
               event.request.destination === 'script' || 
               event.request.destination === 'style') {
        // Static resources - Cache First with Network Fallback
        event.respondWith(handleStaticRequest(event.request));
    } else {
        // Other requests - Network First
        event.respondWith(handleNetworkFirst(event.request));
    }
});

// API Request Handler - Network First with fallback
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE_NAME);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful response for 5 minutes
            const responseClone = networkResponse.clone();
            const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: {
                    ...Object.fromEntries(responseClone.headers.entries()),
                    'sw-cache-timestamp': Date.now().toString(),
                    'Cache-Control': 'max-age=300' // 5 minutes
                }
            });
            cache.put(request, cachedResponse);
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache for API request');
        
        // Try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // Check if cache is still valid (5 minutes)
            const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
            const cacheAge = Date.now() - parseInt(cacheTimestamp || '0');
            
            if (cacheAge < 300000) { // 5 minutes
                return cachedResponse;
            }
        }
        
        // Return offline response
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Unable to fetch data. Please check your connection.',
            offline: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Static Request Handler - Cache First
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Failed to fetch static resource:', request.url);
        
        // Return offline page for HTML requests
        if (request.destination === 'document') {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Offline - Van Fleet Calendar</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        .offline-container { max-width: 500px; margin: 0 auto; }
                        .icon { font-size: 64px; margin-bottom: 20px; }
                        h1 { color: #333; margin-bottom: 20px; }
                        p { color: #666; line-height: 1.6; }
                        .retry-btn { background: #7DBB35; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 20px; }
                        .retry-btn:hover { background: #5a8827; }
                    </style>
                </head>
                <body>
                    <div class="offline-container">
                        <div class="icon">📱</div>
                        <h1>You're Offline</h1>
                        <p>The Van Fleet Calendar is not available right now. Please check your internet connection and try again.</p>
                        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                    </div>
                </body>
                </html>
            `, {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        throw error;
    }
}

// Font Request Handler - Cache First (fonts rarely change)
async function handleFontRequest(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Failed to fetch font:', request.url);
        throw error;
    }
}

// Network First Handler
async function handleNetworkFirst(request) {
    try {
        return await fetch(request);
    } catch (error) {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Sync any pending actions when connection is restored
    console.log('Service Worker: Performing background sync');
    
    // Here you could sync any offline actions
    // For example, queued calendar updates, analytics events, etc.
}

// Push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="%237DBB35" rx="20"/><text x="96" y="120" font-size="120" text-anchor="middle" fill="white">🚐</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="%237DBB35" rx="10"/><text x="48" y="60" font-size="60" text-anchor="middle" fill="white">🚐</text></svg>',
            vibrate: [200, 100, 200],
            data: data
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/calendar-production.html')
    );
});

// Message handler for communication with main app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('Service Worker: Loaded successfully');
