// ===============================
// AUTHENTICATION LOGIC
// ===============================

// Check if already logged in
if (UserStorage.isAuthenticated()) {
    window.location.href = 'pages/home.html';
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const guestBtn = document.getElementById('guestBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Error elements
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// Form validation
function validateForm() {
    let isValid = true;

    // Clear previous errors
    usernameError.textContent = '';
    passwordError.textContent = '';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');

    // Validate username
    if (!usernameInput.value.trim()) {
        usernameError.textContent = 'Username is required';
        usernameInput.classList.add('error');
        isValid = false;
    }

    // Validate password
    if (!passwordInput.value) {
        passwordError.textContent = 'Password is required';
        passwordInput.classList.add('error');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordInput.classList.add('error');
        isValid = false;
    }

    return isValid;
}

// Show loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

// Hide loading
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    showLoading();

    try {
        const response = await API.auth.login(username, password);

        if (response.success) {
            // Store user data and token
            UserStorage.setUser(response.data.user);
            UserStorage.setToken(response.data.token);

            // Play success sound
            if (typeof playSound !== 'undefined') {
                playSound('success');
            }

            showToast('Login successful!', 'success');

            // Redirect to home
            setTimeout(() => {
                window.location.href = 'pages/home.html';
            }, 500);
        } else {
            hideLoading();

            // Play error sound
            if (typeof playSound !== 'undefined') {
                playSound('error');
            }

            showToast(response.error || 'Login failed', 'error');
            passwordError.textContent = response.error || 'Invalid credentials';
            passwordInput.classList.add('error');
        }
    } catch (error) {
        hideLoading();
        showToast('An error occurred. Please try again.', 'error');
        console.error('Login error:', error);
    }
});

// Guest mode
guestBtn.addEventListener('click', () => {
    // Create guest user
    const guestUser = {
        id: 'guest_' + Date.now(),
        username: 'Guest' + Math.floor(Math.random() * 1000),
        email: 'guest@pixelarena.com',
        isGuest: true,
    };

    UserStorage.setUser(guestUser);
    UserStorage.setToken('guest_token_' + Date.now());

    // Play click sound
    if (typeof playSound !== 'undefined') {
        playSound('click');
    }

    showToast('Entering as guest...', 'success');

    setTimeout(() => {
        window.location.href = 'pages/home.html';
    }, 500);
});

// Add enter key support
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});
