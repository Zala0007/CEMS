// Register page script — posts to backend to create a user
const API_BASE = window.API_BASE || 'http://localhost:8000';

class RegisterPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupForm();
  }

  setupForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
  }

  async handleRegister() {
    const btn = document.querySelector('#register-form button[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // Simple validation
    this.clearErrors();
    if (!username) return this.showError('username-error', 'Username is required');
    if (!fullName) return this.showError('fullName-error', 'Full name is required');
    if (!email) return this.showError('email-error', 'Email is required');
    if (!password || password.length < 6) return this.showError('password-error', 'Password must be 6+ chars');
    if (password !== passwordConfirm) return this.showError('passwordConfirm-error', 'Passwords do not match');

    try {
      btn.classList.add('loading');
  const payload = { username, password, fullName, email, role: 'student' };
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text().catch(() => '<unreadable>');
        console.warn('Register response not JSON', res.status, text);
        alert('Unexpected server response during registration. See console for details.');
        return;
      }
      if (!res.ok) {
        const msg = data.error || data.message || `Registration failed (status ${res.status})`;
        alert(msg);
        return;
      }

      // Auto-login: call backend login
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) { alert(loginData.error || 'Login failed after signup'); return; }

      // Normalize and store
      const rawUser = loginData.user || loginData;
  const user = window.authUtils.normalizeUser(rawUser) || rawUser;
  sessionStorage.setItem('cms_current_user', JSON.stringify(user));
  if (window.authManager) window.authManager.currentUser = user;
  console.log('Registration + login: user saved', user);
  window.location.href = 'index.html';

    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      btn.classList.remove('loading');
    }
  }

  showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  clearErrors() { document.querySelectorAll('.error-message').forEach(e => e.textContent = ''); }
}

if (window.location.pathname.endsWith('register.html')) {
  window.registerPage = new RegisterPage();
}
