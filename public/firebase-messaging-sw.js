/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: 'AIzaSyBpiiulDStoYL_mmoVHhqPUHzCfWYR0CzI',
    authDomain: 'salem-rr-briyani-930ab.firebaseapp.com',
    projectId: 'salem-rr-briyani-930ab',
    storageBucket: 'salem-rr-briyani-930ab.firebasestorage.app',
    messagingSenderId: '704172164663',
    appId: '1:704172164663:android:de680f9d4cd093549d61b2',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification ? .title || 'Al-Arafa Restaurant';
    const notificationOptions = {
        body: payload.notification ? .body || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: payload.data ? .type || 'default',
        data: payload.data,
        requireInteraction: false,
        actions: [{
                action: 'view',
                title: 'View',
            },
            {
                action: 'close',
                title: 'Close',
            },
        ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);

    event.notification.close();

    if (event.action === 'view' || !event.action) {
        // Open the app or focus existing tab
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Check if there's already a window/tab open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }

                // If no window/tab is open, open a new one
                if (clients.openWindow) {
                    const urlToOpen = event.notification.data ? .orderNumber ?
                        `/orders/${event.notification.data.orderNumber}` :
                        '/';

                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
});