// Firebase Cloud Messaging Service Worker
// This file handles background push notifications from FCM

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5gJx0AxA_pEkJVr7Bm7GsqP_h4FqR4Lc",
    authDomain: "van-booking-3bf10.firebaseapp.com",
    projectId: "van-booking-3bf10",
    storageBucket: "van-booking-3bf10.firebasestorage.app",
    messagingSenderId: "618584843462",
    appId: "1:618584843462:web:a1b2c3d4e5f6g7h8i9j0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('📱 Background message received:', payload);
    
    const { title, body } = payload.notification || {};
    const data = payload.data || {};
    
    const notificationOptions = {
        body: body || '',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" fill="%237DBB35" rx="20"/><text x="96" y="120" font-size="120" text-anchor="middle" fill="white">🚐</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="%237DBB35" rx="10"/><text x="48" y="60" font-size="60" text-anchor="middle" fill="white">🚐</text></svg>',
        vibrate: [200, 100, 200],
        tag: data.type || 'general',
        renotify: true,
        requireInteraction: true,
        data: data,
        actions: [
            { action: 'open', title: '📅 Apri Calendario' },
            { action: 'dismiss', title: '✕ Chiudi' }
        ]
    };
    
    return self.registration.showNotification(title || 'Van Fleet', notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event);
    event.notification.close();
    
    const data = event.notification.data || {};
    let url = '/calendar-production.html';
    
    // Open specific view based on notification type
    if (data.type === 'new_booking' && data.bookingId) {
        url = `/calendar-production.html?highlight=${data.bookingId}`;
    } else if (data.type === 'new_request' && data.requestId) {
        url = `/calendar-production.html?tab=requests&id=${data.requestId}`;
    }
    
    if (event.action === 'dismiss') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url.includes('calendar-production') && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});

console.log('📱 Firebase Messaging SW loaded');
