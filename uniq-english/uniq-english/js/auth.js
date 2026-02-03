// ============================================
// Uniq English - Authentication JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initLogin();
    initRegister();
    initTogglePassword();
});

// Helper function to get user by email (works with both Firebase and localStorage)
async function getUserByEmail(email) {
    if (typeof window.getUsers === 'function') {
        const users = await window.getUsers();
        return users.find(u => u.email === email);
    }
    return null;
}

// Login
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const spinner = loginBtn.querySelector('.spinner');
        const btnText = loginBtn.querySelector('.btn-text');

        // Show loading
        spinner.style.display = 'block';
        btnText.textContent = 'Signing in...';
        loginBtn.disabled = true;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get user from Firebase
        const user = await getUserByEmail(email);
        console.log('User found:', user);

        if (!user) {
            showToast('User not found', 'error');
            resetLoginBtn();
            return;
        }

        if (user.password !== password) {
            showToast('Invalid password', 'error');
            console.log('Password mismatch. Expected:', user.password, 'Got:', password);
            resetLoginBtn();
            return;
        }

        // Success
        setCurrentUser(user);
        console.log('Login successful for:', user.email);
        showToast('Login successful!', 'success');

        setTimeout(() => {
            window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        }, 1000);
    });

    function resetLoginBtn() {
        const loginBtn = document.getElementById('loginBtn');
        const spinner = loginBtn.querySelector('.spinner');
        const btnText = loginBtn.querySelector('.btn-text');
        spinner.style.display = 'none';
        btnText.textContent = 'Sign In';
        loginBtn.disabled = false;
    }
}

// Register
function initRegister() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const registerBtn = document.getElementById('registerBtn');
        const spinner = registerBtn.querySelector('.spinner');
        const btnText = registerBtn.querySelector('.btn-text');

        if (!agreeTerms) {
            showToast('Please agree to the terms and conditions', 'warning');
            return;
        }

        // Show loading
        spinner.style.display = 'block';
        btnText.textContent = 'Creating account...';
        registerBtn.disabled = true;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if email exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            showToast('Email already registered', 'error');
            resetRegisterBtn();
            return;
        }

        // Create user
        const newUser = {
            id: window.generateId('user'),
            name,
            email,
            password,
            role: 'student',
            avatar: '',
            phone: '',
            bio: '',
            createdAt: new Date().toISOString()
        };

        await window.addUser(newUser);
        window.setCurrentUser(newUser);

        showToast('Registration successful!', 'success');

        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1000);
    });

    function resetRegisterBtn() {
        const registerBtn = document.getElementById('registerBtn');
        const spinner = registerBtn.querySelector('.spinner');
        const btnText = registerBtn.querySelector('.btn-text');
        spinner.style.display = 'none';
        btnText.textContent = 'Create Account';
        registerBtn.disabled = false;
    }
}

// Toggle Password
function initTogglePassword() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}