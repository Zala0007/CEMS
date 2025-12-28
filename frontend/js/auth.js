// Authentication Management
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const userData = sessionStorage.getItem('cms_current_user');
    if (userData) {
      const raw = JSON.parse(userData);
      // If raw has snake_case keys from server, normalize
      if (raw && (raw.full_name || raw.joined_at)) {
        this.currentUser = this.normalizeUser(raw);
      } else {
        this.currentUser = raw;
      }
    }
  }

  login(username, password) {
    const user = window.dataStorage.getUserByCredentials(username, password);
    
    if (user) {
      this.currentUser = user;
      sessionStorage.setItem('cms_current_user', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, message: 'Invalid username or password' };
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('cms_current_user');
    window.location.href = 'login.html';
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateUserProfile(updatedData) {
    if (this.currentUser) {
      const updated = window.dataStorage.updateUser(this.currentUser.id, updatedData);
      if (updated) {
        this.currentUser = { ...this.currentUser, ...updatedData };
        sessionStorage.setItem('cms_current_user', JSON.stringify(this.currentUser));
        return true;
      }
    }
    return false;
  }

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
}

// Create global instance
window.authManager = new AuthManager();

// Auth utilities
window.authUtils = {
  showAlert(message, type = 'info', duration = 5000) {
    const alert = document.getElementById('alert');
    if (!alert) return;

    const icon = alert.querySelector('.alert-icon');
    const messageEl = alert.querySelector('.alert-message');
    
    // Set icon based on type
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    icon.className = `alert-icon ${icons[type] || icons.info}`;
    messageEl.textContent = message;
    
    // Reset classes and add type
    alert.className = `alert ${type}`;
    
    // Show alert
    setTimeout(() => alert.classList.add('show'), 100);
    
    // Auto hide
    setTimeout(() => {
      alert.classList.remove('show');
    }, duration);
  },

  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
      const errorEl = form.querySelector(`#${input.name}-error`) || 
                     form.querySelector(`#${input.id}-error`);
      
      if (!input.value.trim()) {
        if (errorEl) errorEl.textContent = 'This field is required';
        input.classList.add('error');
        isValid = false;
      } else {
        if (errorEl) errorEl.textContent = '';
        input.classList.remove('error');
      }
    });

    // Email validation
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
      const errorEl = form.querySelector(`#${input.name}-error`) || 
                     form.querySelector(`#${input.id}-error`);
      
      if (input.value && !this.isValidEmail(input.value)) {
        if (errorEl) errorEl.textContent = 'Please enter a valid email address';
        input.classList.add('error');
        isValid = false;
      }
    });

    return isValid;
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatTime(timeString) {
    if (!timeString || typeof timeString !== 'string') return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  // Convert a Date (local) to YYYY-MM-DD without timezone shifts
  toYMD(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // Parse YYYY-MM-DD into a local Date (hours set to 0 local time)
  parseYMD(ymd) {
    if (!ymd || typeof ymd !== 'string') return null;
    const parts = ymd.split('-').map(Number);
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  },

  // Normalize server user object (snake_case) to frontend expected shape
  normalizeUser(userObj) {
    if (!userObj) return null;
    return {
      id: userObj.id,
      username: userObj.username,
      fullName: userObj.full_name || userObj.fullName || '',
      email: userObj.email,
      role: userObj.role,
      joinedAt: userObj.joined_at || userObj.joinedAt || new Date().toISOString()
    };
  },

  formatDateTime(dateString, timeString) {
    return `${this.formatDate(dateString)} at ${this.formatTime(timeString)}`;
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', function() {
  // Update navigation based on auth state
  const userMenu = document.querySelector('#user-menu');
  const userNameElements = document.querySelectorAll('#user-name');
  const loginButtons = document.querySelectorAll('.login-btn');
  const adminLinks = document.querySelectorAll('.admin-only');
  
  if (window.authManager.isLoggedIn()) {
    const user = window.authManager.getCurrentUser();
    
    // Update user name in navigation (for pages that have #user-name span)
    userNameElements.forEach(el => {
      el.textContent = user.fullName || user.username;
    });
    
    // Update user menu
    if (userMenu) {
      // If user menu doesn't have a nested span, update the whole link
      if (userNameElements.length === 0) {
        userMenu.innerHTML = `<i class="fas fa-user"></i> ${user.fullName || user.username}`;
      }
      userMenu.href = '#';
      userMenu.classList.remove('login-btn');
      
      // Remove existing listener if any
      const newUserMenu = userMenu.cloneNode(true);
      userMenu.parentNode.replaceChild(newUserMenu, userMenu);
      
      newUserMenu.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          window.authManager.logout();
        }
      });
    }
    
    // Update all login buttons to show username
    loginButtons.forEach(btn => {
      if (btn !== userMenu) {
        btn.innerHTML = `<i class="fas fa-user"></i> ${user.fullName || user.username}`;
        btn.href = '#';
        btn.classList.remove('login-btn');
        
        // Remove existing listener if any
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to logout?')) {
            window.authManager.logout();
          }
        });
      }
    });
    
    // Show admin links if user is admin
    if (window.authManager.isAdmin()) {
      adminLinks.forEach(link => link.style.display = '');
    }
  } else {
    // Hide admin links
    adminLinks.forEach(link => link.style.display = 'none');
    
    // Reset user menu to login
    if (userMenu && userNameElements.length === 0) {
      userMenu.href = 'login.html';
      userMenu.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      userMenu.classList.add('login-btn');
    } else {
      userNameElements.forEach(el => {
        el.textContent = 'Guest';
      });
    }
  }
  
  // Setup alert close functionality
  const alertClose = document.querySelector('.alert-close');
  if (alertClose) {
    alertClose.addEventListener('click', function() {
      document.getElementById('alert').classList.remove('show');
    });
  }
});