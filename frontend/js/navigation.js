// Navigation Management
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupActiveLinks();
    this.setupSmoothScrolling();
  }

  setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking on a link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }
  }

  setupActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href');
      if (linkPage === currentPage || 
          (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  updateBreadcrumb(items) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.innerHTML = items.map((item, index) => {
      if (index === items.length - 1) {
        return `<span class="breadcrumb-current">${item}</span>`;
      }
      return `<a href="#" class="breadcrumb-link">${item}</a>`;
    }).join('<i class="fas fa-chevron-right breadcrumb-separator"></i>');
  }
}

// Modal Management
class ModalManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupModalTriggers();
    this.setupModalClosing();
  }

  setupModalTriggers() {
    // Generic modal triggers
    document.querySelectorAll('[data-modal]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modal;
        this.openModal(modalId);
      });
    });
  }

  setupModalClosing() {
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close modal on close button click
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = closeBtn.closest('.modal');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.active');
        if (openModal) {
          this.closeModal(openModal.id);
        }
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus first input in modal
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Reset form if present
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
        // Clear error messages
        form.querySelectorAll('.error-message').forEach(error => {
          error.textContent = '';
        });
        form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
          input.classList.remove('error');
        });
      }
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
      this.closeModal(modal.id);
    });
  }
}

// Loading Manager
class LoadingManager {
  static show(element) {
    if (element) {
      const spinner = element.querySelector('.btn-spinner');
      const text = element.querySelector('.btn-text');
      
      if (spinner) spinner.style.display = 'inline-block';
      if (text) text.style.opacity = '0';
      
      element.disabled = true;
    }
  }

  static hide(element) {
    if (element) {
      const spinner = element.querySelector('.btn-spinner');
      const text = element.querySelector('.btn-text');
      
      if (spinner) spinner.style.display = 'none';
      if (text) text.style.opacity = '1';
      
      element.disabled = false;
    }
  }

  static showPageLoader() {
    let loader = document.getElementById('page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.innerHTML = `
        <div class="loader-backdrop">
          <div class="loader-content">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
          </div>
        </div>
      `;
      loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  }

  static hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
}

// Form Utilities
class FormUtils {
  static resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      // Clear error messages
      form.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
      });
      form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.classList.remove('error');
      });
    }
  }

  static populateForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"], #${key}`);
      if (input) {
        if (input.type === 'checkbox') {
          if (Array.isArray(data[key])) {
            input.checked = data[key].includes(input.value);
          } else {
            input.checked = data[key];
          }
        } else if (input.type === 'radio') {
          input.checked = input.value === data[key];
        } else {
          input.value = data[key] || '';
        }
      }
    });
  }

  static getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      // Handle multiple values (checkboxes with same name)
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    // Handle checkboxes that aren't checked
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      if (!checkbox.checked && !data[checkbox.name]) {
        data[checkbox.name] = false;
      }
    });

    return data;
  }

  static validateRequired(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      const value = field.value.trim();
      const errorElement = form.querySelector(`#${field.name}-error, #${field.id}-error`);

      if (!value) {
        if (errorElement) {
          errorElement.textContent = 'This field is required';
        }
        field.classList.add('error');
        isValid = false;
      } else {
        if (errorElement) {
          errorElement.textContent = '';
        }
        field.classList.remove('error');
      }
    });

    return isValid;
  }
}

// Initialize managers
document.addEventListener('DOMContentLoaded', function() {
  window.navigationManager = new NavigationManager();
  window.modalManager = new ModalManager();
  
  // Make utilities globally available
  window.LoadingManager = LoadingManager;
  window.FormUtils = FormUtils;
  
  // Setup password toggle functionality
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const passwordField = this.parentElement.querySelector('input[type="password"], input[type="text"]');
      const icon = this.querySelector('i');
      
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});