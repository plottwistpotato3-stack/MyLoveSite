// Authentication System
const AUTH_KEY = 'romanticAuth';
const MAX_USERS = 2;

// Check if user is logged in
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

// Get registered users
function getUsers() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
        const auth = JSON.parse(authData);
        return auth.users || [];
    }
    return [];
}

// Save users
function saveUsers(users) {
    const authData = localStorage.getItem(AUTH_KEY);
    let auth = authData ? JSON.parse(authData) : { users: [], isLoggedIn: false, currentUser: null };
    auth.users = users;
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

// Login function
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const authData = localStorage.getItem(AUTH_KEY);
        let auth = authData ? JSON.parse(authData) : { users: [], isLoggedIn: false, currentUser: null };
        auth.isLoggedIn = true;
        auth.currentUser = username;
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
        showMainContent();
        return true;
    }
    return false;
}

// Register function
function register(username, password) {
    const users = getUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists!' };
    }
    
    // Check if max users reached
    if (users.length >= MAX_USERS) {
        return { success: false, message: `Maximum ${MAX_USERS} users allowed (you and your girlfriend)!` };
    }
    
    // Add new user
    users.push({ username, password });
    saveUsers(users);
    
    // Auto login after registration
    login(username, password);
    
    return { success: true, message: 'Registration successful!' };
}

// Logout function
function logout() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
        const auth = JSON.parse(authData);
        auth.isLoggedIn = false;
        auth.currentUser = null;
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    }
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
    
    if (login(username, password)) {
        loginError.textContent = '';
        loginForm.reset();
    } else {
        loginError.textContent = 'Invalid username or password!';
    }
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
    
    const result = register(username, password);
    if (result.success) {
        registerError.textContent = '';
        registerForm.reset();
    } else {
        registerError.textContent = result.message;
    }
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

// DOM Elements (only accessible after auth)
let uploadArea, photoInput, previewContainer, previewImage, removePhotoBtn;
let messageInput, saveMessageBtn, clearAllBtn, displaySection;
let messageCard, cardImage, messageText, timestamp;

// State
let currentPhoto = null;

// Initialize main content (called after authentication)
function loadMainContent() {
    // DOM Elements
    uploadArea = document.getElementById('uploadArea');
    photoInput = document.getElementById('photoInput');
    previewContainer = document.getElementById('previewContainer');
    previewImage = document.getElementById('previewImage');
    removePhotoBtn = document.getElementById('removePhoto');
    messageInput = document.getElementById('messageInput');
    saveMessageBtn = document.getElementById('saveMessage');
    clearAllBtn = document.getElementById('clearAll');
    displaySection = document.getElementById('displaySection');
    messageCard = document.getElementById('messageCard');
    cardImage = document.getElementById('cardImage');
    messageText = document.getElementById('messageText');
    timestamp = document.getElementById('timestamp');
    
    // Initialize event listeners
    initMainContent();
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
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handlePhotoUpload(files[0]);
        }
    });

    // Photo input change handler
    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoUpload(e.target.files[0]);
        }
    });

// Handle photo upload
function handlePhotoUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        currentPhoto = e.target.result;
        previewImage.src = currentPhoto;
        previewContainer.style.display = 'block';
        uploadArea.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

    // Remove photo handler
    removePhotoBtn.addEventListener('click', () => {
        currentPhoto = null;
        previewImage.src = '';
        previewContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        photoInput.value = '';
        
        // Hide display section if no message
        if (!messageInput.value.trim()) {
            displaySection.style.display = 'none';
        }
    });

    // Save message handler
    saveMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    
    if (!message && !currentPhoto) {
        alert('Please add a photo or write a message! 💕');
        return;
    }
    
    // Update display
    if (currentPhoto) {
        cardImage.style.backgroundImage = `url(${currentPhoto})`;
        cardImage.style.display = 'block';
    } else {
        cardImage.style.display = 'none';
    }
    
    if (message) {
        messageText.textContent = message;
    } else {
        messageText.textContent = '';
    }
    
    // Update timestamp
    const now = new Date();
    const dateOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    timestamp.textContent = `Created on ${now.toLocaleDateString('en-US', dateOptions)}`;
    
    // Show display section
    displaySection.style.display = 'block';
    
        // Scroll to display section
        displaySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Clear all handler
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear everything? 💔')) {
            currentPhoto = null;
            previewImage.src = '';
            previewContainer.style.display = 'none';
            uploadArea.style.display = 'block';
            photoInput.value = '';
            messageInput.value = '';
            displaySection.style.display = 'none';
        }
    });

    // Load saved data from localStorage
    const savedPhoto = localStorage.getItem('romanticPhoto');
    const savedMessage = localStorage.getItem('romanticMessage');
    
    if (savedPhoto) {
        currentPhoto = savedPhoto;
        previewImage.src = savedPhoto;
        previewContainer.style.display = 'block';
        uploadArea.style.display = 'none';
    }
    
    if (savedMessage) {
        messageInput.value = savedMessage;
    }
    
    // Auto-display if both exist
    if (savedPhoto || savedMessage) {
        setTimeout(() => {
            if (saveMessageBtn) saveMessageBtn.click();
        }, 100);
    }

    // Auto-save to localStorage
    messageInput.addEventListener('input', () => {
        localStorage.setItem('romanticMessage', messageInput.value);
    });

    // Save photo to localStorage when uploaded
    photoInput.addEventListener('change', () => {
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                localStorage.setItem('romanticPhoto', e.target.result);
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    });

    // Also save when photo is removed
    removePhotoBtn.addEventListener('click', () => {
        localStorage.removeItem('romanticPhoto');
    });
}


