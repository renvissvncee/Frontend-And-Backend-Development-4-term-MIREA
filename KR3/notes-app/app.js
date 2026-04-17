const socket = io('http://localhost:3001');

const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
    try {
        const response = await fetch(`/content/${page}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;

        if (page === 'home') {
            console.log('я тут');
            initNotes();
        }
    } catch (error) {
        contentDiv.innerHTML = `<p class="is-center text-error">Ошибка загрузки страницы.</p>`;
        console.error(error);
    }
}

homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

loadContent('home');

// Глобальная переменная для функции обновления списка
let globalLoadNotes = null;

function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const list = document.getElementById('notes-list');

    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');

        list.innerHTML = notes.map(note => {
            let reminderInfo = '';
            if (note.reminder) {
                const date = new Date(note.reminder);
                reminderInfo = `<br><small>🔔 Напоминание: ${date.toLocaleString()}</small>`;
            }
            
            const createdDate = note.datetime ? new Date(note.datetime).toLocaleString() : 'только что';
            
            return `
                <li class="card" style="margin-bottom: 0.5rem; padding: 0.5rem;"> 
                    <strong>${escapeHtml(note.text)}</strong>
                    <br><small>📅 Создано: ${createdDate}</small>
                    ${reminderInfo}
                </li>
            `;
        }).join('');
    }
    
    // Сохраняем для глобального доступа
    globalLoadNotes = loadNotes;

    function addNote(text, reminderTimestamp = null) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const newNote = { 
            id: Date.now(), 
            text: text, 
            datetime: new Date().toISOString(),
            reminder: reminderTimestamp 
        };
        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        
        if (reminderTimestamp) {
            socket.emit('newReminder', {
                id: newNote.id,
                text: text,
                reminderTime: reminderTimestamp
            });
        } else {
            socket.emit('newTask', { text: text });
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addNote(text);
            input.value = '';
        }
    });

    reminderForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = reminderText.value.trim();
        const datetime = reminderTime.value;

        if (text && datetime) {
            const timestamp = new Date(datetime).getTime();
            if (timestamp > Date.now()) {
                addNote(text, timestamp);
                reminderText.value = '';
                reminderTime.value = '';
            } else {
                alert('Дата напоминания должна быть в будущем');
            }
        }
    });

    loadNotes();
}

// ========== PUSH УВЕДОМЛЕНИЯ ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered');

            const enableBtn = document.getElementById('enable-push');
            const disableBtn = document.getElementById('disable-push');

            if (enableBtn && disableBtn) {
                const subscription = await reg.pushManager.getSubscription();
                if (subscription) {
                    enableBtn.style.display = 'none';
                    disableBtn.style.display = 'inline-block';
                }

                enableBtn.addEventListener('click', async () => {
                    if (Notification.permission === 'denied') {
                        alert('Уведомления запрещены. Разрешите их в настройках браузера.');
                        return;
                    }
                    if (Notification.permission === 'default') {
                        const permission = await Notification.requestPermission();
                        if (permission !== 'granted') {
                            alert('Необходимо разрешить уведомления.');
                            return;
                        }
                    }

                    await subscribeToPush();
                    enableBtn.style.display = 'none';
                    disableBtn.style.display = 'inline-block';
                });

                disableBtn.addEventListener('click', async () => {
                    await unsubscribeFromPush();
                    disableBtn.style.display = 'none';
                    enableBtn.style.display = 'inline-block';
                });
            }
        } catch (error) {
            console.log('SW registration failed:', error);
        }
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscriptions = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 
                urlBase64ToUint8Array('BIeDnZz1kfVJ0mmty8YUZ5fvPz_uvXEJlSsLQymk7LuAfvdF-WoZ1iZrIoPhQDwa9IpcZyaKDWLQu8_ejTv_Q5M')
        });

        await fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptions)
        });

        console.log('Подписка на push отправлена');
    } catch (error) {
        console.error('Ошибка подписки на push:', error);
    }
}

async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        await fetch('http://localhost:3001/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
        console.log('Отписка выполнена');
    }
}

// ========== WEBSOCKET ОБРАБОТЧИКИ ==========
socket.on('taskAdded', (task) => {
    console.log('Задача от другого клиента:', task);
    
    // Обновляем список заметок
    if (globalLoadNotes) {
        globalLoadNotes();
    }
    
    // Показываем уведомление
    const notification = document.createElement('div');
    notification.textContent = `✨ Новая задача: ${task.text}`;
    notification.style.cssText = `
        position: fixed; top: 10px; right: 10px;
        background: #4285f4; color: white; padding: 1rem;
        border-radius: 5px; z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
});

// Вспомогательная функция для безопасности
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}