// Login Page Management
class LoginPage {
  constructor() {
    console.log('LoginPage: constructor');
    this.init();
  }

  init() {
    console.log('LoginPage: init');
    this.setupLoginForm();
    this.setupPasswordToggle();
    this.checkExistingAuth();
  }

  checkExistingAuth() {
    // Redirect if already logged in
    if (window.authManager.isLoggedIn()) {
      const user = window.authManager.getCurrentUser();
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  }

  setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('LoginPage: submit event triggered');
      this.handleLogin();
    });
    console.log('LoginPage: submit listener attached');
  }

  setupPasswordToggle() {
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
      passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = passwordToggle.querySelector('i');
        if (type === 'password') {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        } else {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        }
      });
    }
  }

  async handleLogin() {
    console.log('LoginPage: handleLogin called');
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Clear previous errors
    this.clearErrors();

    // Validate inputs
    if (!this.validateLogin(username, password)) {
      return;
    }

    // Show loading state (guarded in case LoadingManager isn't present on this page)
    if (window.LoadingManager && typeof window.LoadingManager.show === 'function') {
      try { window.LoadingManager.show(submitBtn); } catch (e) { console.warn('LoadingManager.show failed', e); }
    }

    try {
      // Call backend login endpoint
      const API_BASE = window.API_BASE || 'http://localhost:8000';
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let json;
      try {
        json = await resp.json();
      } catch (parseErr) {
        const text = await resp.text().catch(() => '<unreadable>');
        console.warn('Login response is not JSON', resp.status, text);
        window.authUtils.showAlert('Unexpected server response. See console for details.', 'error');
        this.highlightErrors();
        return;
      }
      if (!resp.ok) {
        console.warn('Login failed response:', resp.status, json);
        window.authUtils.showAlert(json.error || `Login failed (status ${resp.status})`, 'error');
        this.highlightErrors();
        return;
      }

  // Save user locally (normalize server response)
  const rawUser = json.user || json;
  const user = window.authUtils.normalizeUser(rawUser) || rawUser;
  localStorage.setItem('cms_current_user', JSON.stringify(user));
  // Update in-memory auth manager so app recognizes the user immediately
  if (window.authManager) window.authManager.currentUser = user;
  console.log('Login successful, user saved:', user);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('cms_remember_user', username);
      } else {
        localStorage.removeItem('cms_remember_user');
      }

      window.authUtils.showAlert('Login successful! Redirecting...', 'success', 1500);
      setTimeout(() => {
        if (user.role === 'admin') window.location.href = 'admin.html'; else window.location.href = 'index.html';
      }, 1200);

    } catch (error) {
      console.error('Login error:', error);
      window.authUtils.showAlert('An error occurred during login. Please try again.', 'error');
    } finally {
      if (window.LoadingManager && typeof window.LoadingManager.hide === 'function') {
        try { window.LoadingManager.hide(submitBtn); } catch (e) { console.warn('LoadingManager.hide failed', e); }
      }
    }
  }

  validateLogin(username, password) {
    let isValid = true;

    if (!username) {
      this.showError('username-error', 'Username is required');
      isValid = false;
    }

    if (!password) {
      this.showError('password-error', 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      this.showError('password-error', 'Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('-error', ''));
    
    if (errorElement) {
      errorElement.textContent = message;
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
      error.textContent = '';
    });
    
    document.querySelectorAll('.form-input').forEach(input => {
      input.classList.remove('error');
    });
  }

  highlightErrors() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.classList.add('error');
    if (passwordInput) passwordInput.classList.add('error');
  }

  // Quick login functionality for demo
  setupQuickLogin() {
    const credentialItems = document.querySelectorAll('.credential-item');
    
    credentialItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const text = item.textContent;
        const [role, credentials] = text.split(': ');
        const [username, password] = credentials.split(' / ');
        
        document.getElementById('username').value = username.trim();
        document.getElementById('password').value = password.trim();
        
        // Optional: Auto-submit after filling
        setTimeout(() => {
          this.handleLogin();
        }, 500);
      });
    });
  }

  // Auto-fill remembered user
  loadRememberedUser() {
    const rememberedUser = localStorage.getItem('cms_remember_user');
    if (rememberedUser) {
      document.getElementById('username').value = rememberedUser;
      document.getElementById('remember-me').checked = true;
      document.getElementById('password').focus();
    }
  }

  // Social login placeholder
  setupSocialLogin() {
    const socialLoginContainer = document.createElement('div');
    socialLoginContainer.className = 'social-login';
    socialLoginContainer.innerHTML = `
      <div class="auth-divider">
        <span>Or continue with</span>
      </div>
      <div class="social-buttons">
        <button type="button" class="btn btn-outline social-btn" data-provider="google">
          <i class="fab fa-google"></i>
          Google
        </button>
        <button type="button" class="btn btn-outline social-btn" data-provider="microsoft">
          <i class="fab fa-microsoft"></i>
          Microsoft
        </button>
      </div>
    `;

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.appendChild(socialLoginContainer);
    }

    // Add event listeners for social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const provider = e.currentTarget.dataset.provider;
        window.authUtils.showAlert(`${provider} login is not implemented in this demo.`, 'info');
      });
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // If the login form exists on the page, initialize regardless of path
  if (document.getElementById('login-form')) {
    window.loginPage = new LoginPage();
    // Load remembered user after a short delay
    setTimeout(() => {
      window.loginPage.loadRememberedUser();
      window.loginPage.setupQuickLogin();
    }, 100);
  }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Alt + Enter to quick login as admin
  if (e.altKey && e.key === 'Enter' && window.location.pathname.endsWith('login.html')) {
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'admin123';
    if (window.loginPage) {
      window.loginPage.handleLogin();
    }
  }
});

// Add dynamic background
function addDynamicBackground() {
  const authContainer = document.querySelector('.auth-container');
  if (!authContainer) return;

  // Create floating elements
  for (let i = 0; i < 50; i++) {
    const floater = document.createElement('div');
    floater.className = 'bg-floater';
    floater.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
      animation-delay: ${Math.random() * 5}s;
    `;
    authContainer.appendChild(floater);
  }

  // Add keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
      50% { transform: translateY(-100px) rotate(180deg); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Initialize dynamic background
document.addEventListener('DOMContentLoaded', addDynamicBackground);