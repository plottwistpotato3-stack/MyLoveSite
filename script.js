// Authentication System with Firebase
const AUTH_KEY = 'romanticAuth';
const USERS_KEY = 'users';
const MAX_USERS = 2;

// Check if user is logged in (session stored in localStorage)
function checkAuth() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
        const auth = JSON.parse(authData);
        if (auth.isLoggedIn && auth.currentUser) {
            showMainContent();
            return true;
        }
    }
    showAuthForm();
    return false;
}

// Show authentication form
function showAuthForm() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
}

// Show main content
function showMainContent() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
}

// Get registered users from Firebase
function getUsers(callback) {
    database.ref(USERS_KEY).once('value', (snapshot) => {
        const data = snapshot.val();
        const users = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        callback(users);
    }, (error) => {
        console.error('Error getting users:', error);
        callback([]);
    });
}

// Save users to Firebase
function saveUsers(users) {
    database.ref(USERS_KEY).set(users);
}

// Login function
function login(username, password, callback) {
    getUsers((users) => {
        // Check if user exists in the registered users list
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Save session in localStorage (for current browser session)
            const auth = {
                isLoggedIn: true,
                currentUser: username
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
            showMainContent();
            if (callback) callback(true);
            return true;
        } else {
            // User not found or wrong password
            if (callback) callback(false);
            return false;
        }
    });
}

// Register function
function register(username, password, callback) {
    getUsers((users) => {
        // Check if max users reached FIRST (before checking username)
        if (users.length >= MAX_USERS) {
            if (callback) callback({ 
                success: false, 
                message: `❌ Maximum ${MAX_USERS} users allowed! Only you and your girlfriend can register.` 
            });
            return;
        }
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            if (callback) callback({ 
                success: false, 
                message: '❌ Username already exists! Please choose another username.' 
            });
            return;
        }
        
        // Validate username
        if (!username || username.length < 2) {
            if (callback) callback({ 
                success: false, 
                message: '❌ Username must be at least 2 characters!' 
            });
            return;
        }
        
        // Add new user
        users.push({ username, password });
        saveUsers(users);
        
        // Auto login after registration
        login(username, password, (success) => {
            if (success && callback) {
                callback({ success: true, message: '✅ Registration successful! Welcome! 💕' });
            } else {
                if (callback) callback({ success: false, message: 'Registration failed. Please try again.' });
            }
        });
    });
}

// Logout function
function logout() {
    const auth = {
        isLoggedIn: false,
        currentUser: null
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    showAuthForm();
}

// Auth form handlers
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const logoutBtn = document.getElementById('logoutBtn');

// Tab switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginError.textContent = '';
    registerError.textContent = '';
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    loginError.textContent = '';
    registerError.textContent = '';
});

// Login form submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    loginError.textContent = 'Loading...';
    
    login(username, password, (success) => {
        if (success) {
            loginError.textContent = '';
            loginForm.reset();
        } else {
            loginError.textContent = '❌ Invalid username or password! Only registered users can login.';
        }
    });
});

// Register form submit
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    registerError.textContent = '';
    
    if (password !== passwordConfirm) {
        registerError.textContent = 'Passwords do not match!';
        return;
    }
    
    if (password.length < 4) {
        registerError.textContent = 'Password must be at least 4 characters!';
        return;
    }
    
    registerError.textContent = 'Loading...';
    
    register(username, password, (result) => {
        if (result.success) {
            registerError.textContent = '';
            registerForm.reset();
        } else {
            registerError.textContent = result.message;
        }
    });
});

// Logout button
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout? 💔')) {
        logout();
    }
});

// Check authentication on page load
window.addEventListener('load', () => {
    if (!checkAuth()) {
        return; // Don't load main content if not authenticated
    }
    // Continue with existing load logic
    loadMainContent();
});

// Messages System
const MESSAGES_KEY = 'romanticMessages';

// DOM Elements (only accessible after auth)
let uploadArea, photoInput, previewContainer;
let messageInput, saveMessageBtn, clearFormBtn, displaySection, messagesContainer;

// State
let currentPhotos = [];
let currentUser = null;

// Get current user
function getCurrentUser() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
        const auth = JSON.parse(authData);
        return auth.currentUser;
    }
    return null;
}

// Real-time listener for messages (set up once)
let messagesListener = null;

// Set up real-time listener for messages
function setupMessagesListener() {
    if (messagesListener) {
        return; // Already set up
    }
    
    messagesListener = database.ref(MESSAGES_KEY).on('value', (snapshot) => {
        const data = snapshot.val();
        let messages = [];
        
        if (data) {
            // Convert object to array if needed
            if (Array.isArray(data)) {
                messages = data;
            } else {
                messages = Object.values(data);
            }
            // Sort by timestamp (newest first)
            messages.sort((a, b) => {
                const timeA = new Date(a.timestamp || 0).getTime();
                const timeB = new Date(b.timestamp || 0).getTime();
                return timeB - timeA;
            });
        }
        
        renderMessagesList(messages);
    }, (error) => {
        console.error('Firebase error:', error);
        alert('Помилка підключення до бази даних. Перевірте консоль браузера.');
    });
}

// Get messages once (for immediate use)
function getMessagesOnce(callback) {
    database.ref(MESSAGES_KEY).once('value', (snapshot) => {
        const data = snapshot.val();
        let messages = [];
        
        if (data) {
            if (Array.isArray(data)) {
                messages = data;
            } else {
                messages = Object.values(data);
            }
            messages.sort((a, b) => {
                const timeA = new Date(a.timestamp || 0).getTime();
                const timeB = new Date(b.timestamp || 0).getTime();
                return timeB - timeA;
            });
        }
        
        callback(messages);
    }, (error) => {
        console.error('Firebase error:', error);
        callback([]);
    });
}

// Save messages to Firebase
function saveMessages(messages) {
    database.ref(MESSAGES_KEY).set(messages);
}

// Add new message to Firebase
function addMessage(message, photos) {
    getMessagesOnce((currentMessages) => {
        const newMessage = {
            id: Date.now(),
            author: getCurrentUser(),
            message: message,
            photos: photos || [],
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning
        const updatedMessages = [newMessage, ...currentMessages];
        saveMessages(updatedMessages);
    });
}

// Delete message from Firebase
function deleteMessage(messageId) {
    getMessagesOnce((messages) => {
        const filtered = messages.filter(m => m.id !== messageId);
        saveMessages(filtered);
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render messages list (called by real-time listener)
function renderMessagesList(messages) {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p class="no-messages">Ще немає повідомлень. Створіть перше! 💕</p>';
        return;
    }
    
    messages.forEach(message => {
        const messageCard = createMessageCard(message);
        messagesContainer.appendChild(messageCard);
    });
}

// Initial render (for compatibility)
function renderMessages() {
    getMessagesOnce((messages) => {
        renderMessagesList(messages);
    });
}

// Create message card element
function createMessageCard(message) {
    const card = document.createElement('div');
    card.className = 'card message-card';
    card.dataset.messageId = message.id;
    
    let photosHTML = '';
    if (message.photos && message.photos.length > 0) {
        photosHTML = '<div class="card-photos">';
        message.photos.forEach(photo => {
            photosHTML += `<img src="${photo}" alt="Photo" class="card-photo">`;
        });
        photosHTML += '</div>';
    }
    
    const deleteBtn = message.author === getCurrentUser() 
        ? `<button class="delete-btn" onclick="deleteMessage(${message.id})" title="Видалити">🗑️</button>`
        : '';
    
    card.innerHTML = `
        ${photosHTML}
        <div class="card-content">
            <div class="message-header">
                <span class="message-author">${message.author}</span>
                ${deleteBtn}
            </div>
            <p class="message-text">${message.message || ''}</p>
            <div class="card-footer">
                <span class="timestamp">${formatDate(message.timestamp)}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize main content (called after authentication)
function loadMainContent() {
    currentUser = getCurrentUser();
    
    // DOM Elements
    uploadArea = document.getElementById('uploadArea');
    photoInput = document.getElementById('photoInput');
    previewContainer = document.getElementById('previewContainer');
    messageInput = document.getElementById('messageInput');
    saveMessageBtn = document.getElementById('saveMessage');
    clearFormBtn = document.getElementById('clearForm');
    displaySection = document.getElementById('displaySection');
    messagesContainer = document.getElementById('messagesContainer');
    
    // Initialize event listeners
    initMainContent();
    
    // Set up real-time listener for messages
    setupMessagesListener();
    
    // Initial render
    renderMessages();
}

// Initialize main content event listeners
function initMainContent() {
    // Upload area click handler
    uploadArea.addEventListener('click', () => {
        photoInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#d63384';
        uploadArea.style.background = 'linear-gradient(135deg, #ffeef0 0%, #fff5f5 100%)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#f5576c';
        uploadArea.style.background = 'linear-gradient(135deg, #fff5f5 0%, #ffeef0 100%)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#f5576c';
        uploadArea.style.background = 'linear-gradient(135deg, #fff5f5 0%, #ffeef0 100%)';
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            handleMultiplePhotos(files);
        }
    });

    // Photo input change handler (multiple files)
    photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            handleMultiplePhotos(files);
        }
    });

    // Save message handler
    saveMessageBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        
        if (!message && currentPhotos.length === 0) {
            alert('Будь ласка, додайте фото або напишіть повідомлення! 💕');
            return;
        }
        
        // Add message
        addMessage(message, currentPhotos);
        
        // Clear form
        clearForm();
        
        // Scroll to top (messages will update automatically via real-time listener)
        setTimeout(() => {
            messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    });

    // Clear form handler
    clearFormBtn.addEventListener('click', () => {
        clearForm();
    });
}

// Handle multiple photos upload
function handleMultiplePhotos(files) {
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            currentPhotos.push(e.target.result);
            renderPhotoPreviews();
        };
        
        reader.onerror = () => {
            alert('Помилка при завантаженні фото! Спробуйте інше зображення.');
        };
        
        reader.readAsDataURL(file);
    });
}

// Render photo previews
function renderPhotoPreviews() {
    previewContainer.innerHTML = '';
    
    if (currentPhotos.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'block';
    
    currentPhotos.forEach((photo, index) => {
        const photoWrapper = document.createElement('div');
        photoWrapper.className = 'photo-preview-wrapper';
        
        const img = document.createElement('img');
        img.src = photo;
        img.className = 'photo-preview';
        img.alt = 'Preview';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-photo-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.title = 'Видалити фото';
        removeBtn.onclick = () => {
            currentPhotos.splice(index, 1);
            renderPhotoPreviews();
        };
        
        photoWrapper.appendChild(img);
        photoWrapper.appendChild(removeBtn);
        previewContainer.appendChild(photoWrapper);
    });
}

// Clear form
function clearForm() {
    messageInput.value = '';
    currentPhotos = [];
    photoInput.value = '';
    renderPhotoPreviews();
}

// Make deleteMessage available globally
window.deleteMessage = deleteMessage;


