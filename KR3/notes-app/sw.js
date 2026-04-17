const CACHE_NAME = 'notes-cache-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/favicons/favicon.ico',
    '/icons/favicons/favicon-16x16.png',
    '/icons/favicons/favicon-32x32.png',
    '/icons/favicons/favicon-48x48.png',
    '/icons/favicons/favicon-64x64.png',
    '/icons/favicons/favicon-128x128.png',
    '/icons/favicons/favicon-256x256.png',
    '/icons/favicons/favicon-512x512.png'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ========== АКТИВАЦИЯ (очистка старых кэшей) ==========
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// ========== ПЕРЕХВАТ ЗАПРОСОВ (FETCH) ==========
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // ✅ ИСПРАВЛЕНО: self.location.origin вместо location.origin
    if (url.origin !== self.location.origin) return;

    // Динамические страницы content/* → сначала сеть, потом кэш
    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request)
                .then(networkRes => {
                    // Клонируем ответ
                    const resClone = networkRes.clone();

                    // Сохраняем свежую версию в кэш
                    caches.open(DYNAMIC_CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, resClone);
                        });

                    return networkRes;
                })
                .catch(() => {
                    // Если сети нет → берем из кэша
                    return caches.match(event.request)
                        .then(cached => {
                            return cached || caches.match('/content/home.html');
                        });
                })
        );
    }
});

// ========== PUSH-УВЕДОМЛЕНИЯ ==========
self.addEventListener('push', (event) => {
    let data = { title: 'Новое уведомление', body: '', reminderId: null };
    
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body,
        icon: '/icons/favicons/favicon-128x128.png',
        badge: '/icons/favicons/favicon-48x48.png',
        data: { reminderId: data.reminderId }
    };

    // Только для напоминаний добавляем кнопку "Отложить"
    if (data.reminderId) {
        options.actions = [
            { action: 'snooze', title: 'Отложить на 5 минут' }
        ];
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ========== КЛИК ПО УВЕДОМЛЕНИЮ ==========
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    if (action === 'snooze') {
        const reminderId = notification.data.reminderId;
        
        event.waitUntil(
            fetch(`/snooze?reminderId=${reminderId}`, { method: 'POST' })
                .then(() => notification.close())
                .catch(err => console.error('Snooze failed:', err))
        );
    } else {
        notification.close();
    }
});