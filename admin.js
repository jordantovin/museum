// Museum Admin Authentication
// Handles login/logout and shows/hides admin controls

const ADMIN_CONFIG = {
    username: 'jordantovin',
    password: 'EPS-8590'
};

// Initialize admin features
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

function initAdmin() {
    console.log('Initializing admin authentication...');
    
    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('museumAdminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAdminControls();
    } else {
        hideAdminControls();
        showLoginButton();
    }
    
    console.log('Admin authentication initialized. Logged in:', isLoggedIn);
}

function showLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    loginBtn.textContent = 'LOGIN';
    loginBtn.title = 'Admin Login';
    loginBtn.onclick = showLoginModal;
}

function updateLoginButtonToLogout() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    loginBtn.textContent = 'LOGOUT';
    loginBtn.title = 'Logout';
    loginBtn.onclick = logout;
}

function showLoginModal() {
    // Create login modal
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Admin Login</h2>
                <button class="close-modal" onclick="closeLoginModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <label for="adminUsername">Username</label>
                        <input type="text" id="adminUsername" required autocomplete="username" style="margin-bottom: 16px;">
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" required autocomplete="current-password" style="margin-bottom: 16px;">
                    </div>
                    <div id="loginError" style="color: #d32f2f; margin-bottom: 16px; display: none; padding: 8px; background: #ffebee; border-radius: 4px;">
                        Invalid username or password
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeLoginModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add form submit handler
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLoginModal();
        }
    });
    
    // Focus username field
    document.getElementById('adminUsername').focus();
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.remove();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
        // Login successful
        sessionStorage.setItem('museumAdminLoggedIn', 'true');
        closeLoginModal();
        showAdminControls();
        
        // Replace login button with logout button
        // Update login button
        updateLoginButtonToLogout();
    } else {
        // Login failed
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('museumAdminLoggedIn');
        hideAdminControls();
        showLoginButton();
        
        // Reload to reset state
        location.reload();
    }
}

function showAdminControls() {
    // Show add and edit buttons (filter is always visible)
    const addBtn = document.getElementById('addBtn');
    const editBtn = document.getElementById('editBtn');
    
    if (addBtn) addBtn.style.display = 'flex';
    if (editBtn) editBtn.style.display = 'flex';
    
    // Update login button to show logout
    updateLoginButtonToLogout();
}

function hideAdminControls() {
    // Hide add and edit buttons (filter stays visible)
    const addBtn = document.getElementById('addBtn');
    const editBtn = document.getElementById('editBtn');
    
    if (addBtn) addBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
}

function isLoggedIn() {
    return sessionStorage.getItem('museumAdminLoggedIn') === 'true';
}

// Make closeLoginModal globally accessible
window.closeLoginModal = closeLoginModal;

// Export for use in other scripts
window.MUSEUM_ADMIN = {
    isLoggedIn,
    showLoginModal,
    logout
};
