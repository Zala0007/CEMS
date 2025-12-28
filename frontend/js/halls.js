// Halls Page Management
class HallsPage {
  constructor() {
    this.selectedHall = null;
    this.currentUser = null;
<<<<<<< HEAD
=======
    this.editingHallId = null;
>>>>>>> recover-last-work
    this.init();
  }

  init() {
    this.currentUser = window.authManager.getCurrentUser();
<<<<<<< HEAD
=======
    this.checkAuthState();
    this.setupHallManagementModal();
>>>>>>> recover-last-work
    this.setupBookingModal();
    this.loadHalls();
    this.loadBookings();
    this.setupBookingFilters();
<<<<<<< HEAD
    this.checkAuthState();
=======
>>>>>>> recover-last-work
  }

  checkAuthState() {
    const bookHallBtn = document.getElementById('book-hall-btn');
<<<<<<< HEAD
=======
    const addHallBtn = document.getElementById('add-hall-btn');
    
    console.log('checkAuthState called');
    console.log('currentUser:', this.currentUser);
    console.log('addHallBtn found:', !!addHallBtn);
    
>>>>>>> recover-last-work
    if (bookHallBtn) {
      if (!window.authManager.isLoggedIn()) {
        bookHallBtn.style.display = 'none';
        // Show login prompt
        const bookingsPanel = document.querySelector('.bookings-panel .panel-title');
        if (bookingsPanel) {
          bookingsPanel.innerHTML = `
            Bookings 
            <span style="font-size: 0.8em; color: var(--gray-500);">
              (Please <a href="login.html">login</a> to view bookings)
            </span>
          `;
        }
      }
    }
<<<<<<< HEAD
=======
    
    // Show add hall button only for admins
    if (addHallBtn) {
      if (this.currentUser && this.currentUser.role === 'admin') {
        console.log('User is admin, showing add hall button');
        addHallBtn.style.display = 'inline-flex';
      } else {
        console.log('User is not admin, hiding add hall button');
        addHallBtn.style.display = 'none';
      }
    }
  }

  setupHallManagementModal() {
    const addHallBtn = document.getElementById('add-hall-btn');
    const hallModal = document.getElementById('hall-modal');
    const hallForm = document.getElementById('hall-form');
    const hallCancelBtn = document.getElementById('hall-cancel-btn');
    const hallModalClose = document.getElementById('hall-modal-close');

    // Open modal for adding new hall
    if (addHallBtn) {
      addHallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Add Hall button clicked');
        this.openHallModal();
      });
    } else {
      console.warn('Add Hall button not found');
    }

    // Close modal
    [hallCancelBtn, hallModalClose].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          window.modalManager.closeModal('hall-modal');
          this.resetHallForm();
        });
      }
    });

    // Handle form submission
    if (hallForm) {
      hallForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleHallSubmit();
      });
    }
  }

  openHallModal(hall = null) {
    console.log('openHallModal called', hall);
    const modalTitle = document.getElementById('hall-modal-title');
    const submitText = document.getElementById('hall-submit-text');
    
    if (!modalTitle || !submitText) {
      console.error('Modal elements not found');
      return;
    }
    
    if (hall) {
      // Edit mode
      this.editingHallId = hall.id;
      modalTitle.textContent = 'Edit Hall';
      submitText.textContent = 'Update Hall';
      this.populateHallForm(hall);
    } else {
      // Add mode
      this.editingHallId = null;
      modalTitle.textContent = 'Add New Hall';
      submitText.textContent = 'Add Hall';
      this.resetHallForm();
    }
    
    if (window.modalManager) {
      console.log('Opening modal via modalManager');
      window.modalManager.openModal('hall-modal');
    } else {
      console.error('modalManager not found, showing modal directly');
      const modal = document.getElementById('hall-modal');
      if (modal) {
        modal.style.display = 'flex';
      }
    }
  }

  populateHallForm(hall) {
    document.getElementById('edit-hall-id').value = hall.id;
    document.getElementById('hall-name').value = hall.name;
    document.getElementById('hall-capacity').value = hall.capacity;
    document.getElementById('hall-location').value = hall.location;
    document.getElementById('hall-availability').value = hall.isAvailable ? '1' : '0';
    
    // Set facilities checkboxes
    const facilityCheckboxes = document.querySelectorAll('input[name="facilities"]');
    facilityCheckboxes.forEach(checkbox => {
      checkbox.checked = hall.facilities.includes(checkbox.value);
    });
  }

  resetHallForm() {
    document.getElementById('hall-form').reset();
    document.getElementById('edit-hall-id').value = '';
    this.editingHallId = null;
  }

  async handleHallSubmit() {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    
    // Check if user is admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      window.authUtils.showAlert('Only administrators can manage halls', 'error');
      return;
    }

    // Gather form data
    const name = document.getElementById('hall-name').value.trim();
    const capacity = parseInt(document.getElementById('hall-capacity').value);
    const location = document.getElementById('hall-location').value.trim();
    const isAvailable = document.getElementById('hall-availability').value === '1';
    
    // Get selected facilities
    const facilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked'))
      .map(cb => cb.value);

    const hallData = {
      name,
      capacity,
      location,
      facilities,
      isAvailable
    };

    console.log('Submitting hall data:', hallData);

    // Show loading
    const submitBtn = document.querySelector('#hall-form button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    try {
      const url = this.editingHallId 
        ? `${API_BASE}/api/halls/${this.editingHallId}`
        : `${API_BASE}/api/halls`;
      
      const method = this.editingHallId ? 'PUT' : 'POST';
      
      console.log(`${method} request to:`, url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hallData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Hall saved successfully:', result);
        window.authUtils.showAlert(
          this.editingHallId ? 'Hall updated successfully!' : 'Hall added successfully!',
          'success'
        );
        window.modalManager.closeModal('hall-modal');
        this.resetHallForm();
        await this.loadHalls();
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to save hall:', error);
        window.authUtils.showAlert(error.message || 'Failed to save hall', 'error');
      }
    } catch (error) {
      console.error('Error saving hall:', error);
      window.authUtils.showAlert('Failed to save hall. Please try again.', 'error');
    } finally {
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  async deleteHall(hallId) {
    if (!confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      return;
    }

    const API_BASE = window.API_BASE || 'http://localhost:8000';
    
    // Check if user is admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      window.authUtils.showAlert('Only administrators can delete halls', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/halls/${hallId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        window.authUtils.showAlert('Hall deleted successfully!', 'success');
        await this.loadHalls();
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        window.authUtils.showAlert(error.message || 'Failed to delete hall', 'error');
      }
    } catch (error) {
      console.error('Error deleting hall:', error);
      window.authUtils.showAlert('Failed to delete hall. Please try again.', 'error');
    }
>>>>>>> recover-last-work
  }

  setupBookingModal() {
    const bookHallBtn = document.getElementById('book-hall-btn');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // Open modal for booking
    if (bookHallBtn) {
<<<<<<< HEAD
      bookHallBtn.addEventListener('click', () => {
=======
      bookHallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Book Hall button clicked');
        console.log('Selected hall:', this.selectedHall);
        
        if (!window.authManager.isLoggedIn()) {
          window.authUtils.showAlert('Please login to book a hall', 'warning');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
          return;
        }
        
>>>>>>> recover-last-work
        if (!this.selectedHall) {
          window.authUtils.showAlert('Please select a hall first', 'warning');
          return;
        }
        this.openBookingModal();
      });
<<<<<<< HEAD
=======
    } else {
      console.warn('Book Hall button not found');
>>>>>>> recover-last-work
    }

    // Close modal
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.modalManager.closeModal('booking-modal');
      });
    }

    // Handle form submission
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit();
      });
    }

    // Date validation
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      // Set minimum date to today
  const today = window.authUtils.toYMD(new Date());
      dateInput.min = today;
      
      dateInput.addEventListener('change', () => {
        this.checkAvailability();
      });
    }

    // Time and duration change handlers
    const timeInput = document.getElementById('booking-time');
    const durationInput = document.getElementById('booking-duration');
    
    if (timeInput && durationInput) {
      [timeInput, durationInput].forEach(input => {
        input.addEventListener('change', () => {
          this.checkAvailability();
        });
      });
    }
  }

<<<<<<< HEAD
  loadHalls() {
    const hallsList = document.getElementById('halls-list');
    if (!hallsList) return;

    const halls = window.dataStorage.getHalls();
=======
  async loadHalls() {
    const hallsList = document.getElementById('halls-list');
    if (!hallsList) return;

    // Try to fetch halls from backend API first
    let halls = [];
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/halls`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          halls = data.map(h => window.dataStorage.serverToHall ? window.dataStorage.serverToHall(h) : h);
          // Update localStorage with fresh data
          localStorage.setItem('cms_halls', JSON.stringify(halls));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch halls from backend, using localStorage:', err);
    }
    
    // Fallback to localStorage if backend failed
    if (halls.length === 0) {
      halls = window.dataStorage.getHalls();
    }
>>>>>>> recover-last-work
    
    if (halls.length === 0) {
      hallsList.innerHTML = `
        <div class="no-halls">
          <i class="fas fa-building"></i>
          <h3>No Halls Available</h3>
          <p>Contact administration for hall availability.</p>
        </div>
      `;
      return;
    }

    hallsList.innerHTML = halls.map(hall => this.createHallCard(hall)).join('');
    this.addHallCardListeners();
  }

  createHallCard(hall) {
    const facilitiesHtml = hall.facilities.map(facility => 
      `<span class="facility-tag">${this.formatFacilityName(facility)}</span>`
    ).join('');

<<<<<<< HEAD
=======
    const isAdmin = this.currentUser && this.currentUser.role === 'admin';
    const adminActionsHtml = isAdmin ? `
      <button class="btn btn-sm btn-warning edit-hall-btn" data-hall-id="${hall.id}" title="Edit Hall">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-danger delete-hall-btn" data-hall-id="${hall.id}" title="Delete Hall">
        <i class="fas fa-trash"></i>
      </button>
    ` : '';

>>>>>>> recover-last-work
    return `
      <div class="hall-card" data-hall-id="${hall.id}">
        <div class="hall-header">
          <h3 class="hall-name">${hall.name}</h3>
          <span class="hall-availability ${hall.isAvailable ? 'available' : 'unavailable'}">
            ${hall.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div class="hall-details">
          <div class="hall-info">
            <i class="fas fa-users"></i>
            <span>Capacity: ${hall.capacity}</span>
          </div>
          <div class="hall-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>${hall.location}</span>
          </div>
        </div>
        <div class="hall-facilities">
          ${facilitiesHtml}
        </div>
        <div class="hall-actions">
          <button class="btn btn-primary btn-sm select-hall-btn" data-hall-id="${hall.id}">
            Select Hall
          </button>
<<<<<<< HEAD
=======
          ${adminActionsHtml}
>>>>>>> recover-last-work
        </div>
      </div>
    `;
  }

  formatFacilityName(facility) {
    return facility.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  addHallCardListeners() {
    // Select hall buttons
    document.querySelectorAll('.select-hall-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hallId = parseInt(btn.dataset.hallId);
        this.selectHall(hallId);
      });
    });

<<<<<<< HEAD
=======
    // Edit hall buttons (admin only)
    document.querySelectorAll('.edit-hall-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const hallId = parseInt(btn.dataset.hallId);
        const hall = await this.getHallById(hallId);
        if (hall) {
          this.openHallModal(hall);
        }
      });
    });

    // Delete hall buttons (admin only)
    document.querySelectorAll('.delete-hall-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hallId = parseInt(btn.dataset.hallId);
        this.deleteHall(hallId);
      });
    });

>>>>>>> recover-last-work
    // Hall card clicks
    document.querySelectorAll('.hall-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const hallId = parseInt(card.dataset.hallId);
          this.selectHall(hallId);
        }
      });
    });
  }

<<<<<<< HEAD
=======
  async getHallById(hallId) {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const response = await fetch(`${API_BASE}/api/halls/${hallId}`);
      if (response.ok) {
        const hall = await response.json();
        return window.dataStorage.serverToHall ? window.dataStorage.serverToHall(hall) : hall;
      }
    } catch (error) {
      console.error('Error fetching hall:', error);
    }
    
    // Fallback to localStorage
    const halls = window.dataStorage.getHalls();
    return halls.find(h => h.id === hallId);
  }

>>>>>>> recover-last-work
  selectHall(hallId) {
    // Remove previous selection
    document.querySelectorAll('.hall-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Add selection to current card
    const selectedCard = document.querySelector(`[data-hall-id="${hallId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    this.selectedHall = window.dataStorage.getHallById(hallId);
    
    // Update book hall button
    const bookHallBtn = document.getElementById('book-hall-btn');
    if (bookHallBtn && this.selectedHall) {
      bookHallBtn.innerHTML = `
        <i class="fas fa-plus"></i>
        Book ${this.selectedHall.name}
      `;
    }

    window.authUtils.showAlert(`${this.selectedHall.name} selected`, 'success', 2000);
  }

  openBookingModal() {
    if (!this.selectedHall) return;

    const hallInfo = document.getElementById('hall-info');
    const facilitiesHtml = this.selectedHall.facilities.map(facility => 
      `<span class="facility-tag">${this.formatFacilityName(facility)}</span>`
    ).join('');

    hallInfo.innerHTML = `
      <div class="selected-hall-info">
        <h4>${this.selectedHall.name}</h4>
        <div class="hall-details">
          <div class="hall-info">
            <i class="fas fa-users"></i>
            <span>Capacity: ${this.selectedHall.capacity}</span>
          </div>
          <div class="hall-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>${this.selectedHall.location}</span>
          </div>
        </div>
        <div class="hall-facilities">
          ${facilitiesHtml}
        </div>
      </div>
    `;

    document.getElementById('hall-id').value = this.selectedHall.id;
    
    window.modalManager.openModal('booking-modal');
  }

  async checkAvailability() {
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const duration = document.getElementById('booking-duration').value;
    
    if (!date || !time || !duration || !this.selectedHall) return;

    // Check for conflicts with approved bookings
    const bookings = window.dataStorage.getBookings()
      .filter(booking => 
        booking.hallId === this.selectedHall.id &&
        booking.date === date &&
        booking.status === 'approved'
      );

    const hasConflict = bookings.some(booking => {
      return this.hasTimeConflict(
        { startTime: time, duration },
        { startTime: booking.startTime, duration: booking.duration }
      );
    });

    const availabilityMsg = document.getElementById('availability-message') || 
                           this.createAvailabilityMessage();
    
    if (hasConflict) {
      availabilityMsg.innerHTML = `
        <div class="availability-warning">
          <i class="fas fa-exclamation-triangle"></i>
          Time slot not available. Please choose a different time.
        </div>
      `;
    } else {
      availabilityMsg.innerHTML = `
        <div class="availability-success">
          <i class="fas fa-check-circle"></i>
          Time slot is available!
        </div>
      `;
    }
  }

  createAvailabilityMessage() {
    const bookingForm = document.getElementById('booking-form');
    const availabilityDiv = document.createElement('div');
    availabilityDiv.id = 'availability-message';
    availabilityDiv.style.margin = '1rem 0';
    
    // Insert after duration field
    const durationGroup = document.getElementById('booking-duration').closest('.form-group');
    durationGroup.parentNode.insertBefore(availabilityDiv, durationGroup.nextSibling);
    
    return availabilityDiv;
  }

  hasTimeConflict(booking1, booking2) {
    const start1 = this.timeToMinutes(booking1.startTime);
    const end1 = start1 + this.getDurationMinutes(booking1.duration);
    
    const start2 = this.timeToMinutes(booking2.startTime);
    const end2 = start2 + this.getDurationMinutes(booking2.duration);
    
    return start1 < end2 && start2 < end1;
  }

  timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':').map(Number);
    const hours = Number.isFinite(parts[0]) ? parts[0] : 0;
    const minutes = Number.isFinite(parts[1]) ? parts[1] : 0;
    return hours * 60 + minutes;
  }

  getDurationMinutes(duration) {
    if (duration === 'full-day') return 8 * 60; // 8 hours
    return parseInt(duration) * 60;
  }

  async handleBookingSubmit() {
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    
<<<<<<< HEAD
    // Validate form
    if (!this.validateBookingForm()) {
=======
    console.log('handleBookingSubmit called');
    
    // Validate form
    if (!this.validateBookingForm()) {
      console.log('Form validation failed');
>>>>>>> recover-last-work
      return;
    }

    window.LoadingManager.show(submitBtn);

    try {
      // Refresh current user in case auth changed since page load
      this.currentUser = window.authManager.getCurrentUser();
      // Ensure user is logged in
      if (!this.currentUser) {
        window.authUtils.showAlert('Please login to submit a booking', 'warning');
        window.location.href = 'login.html';
        return;
      }

      // Build booking payload from form
      const formData = window.FormUtils.getFormData('booking-form');
      const hallIdParsed = parseInt(formData['hall-id']);
<<<<<<< HEAD
=======
      
      console.log('Form data:', formData);
      console.log('Hall ID:', hallIdParsed);
      
>>>>>>> recover-last-work
      // Validate hall id
      if (!hallIdParsed || Number.isNaN(hallIdParsed)) {
        window.authUtils.showAlert('Selected hall is invalid. Please select a hall and try again.', 'error');
        return;
      }

      const payload = {
        hallId: hallIdParsed,
        userId: this.currentUser.id,
        purpose: formData.purpose,
        date: formData.date,
        startTime: formData.time,
        duration: formData.duration,
        attendees: parseInt(formData.attendees),
        requirements: formData.requirements || '',
        status: 'pending'
      };

<<<<<<< HEAD
=======
      console.log('Booking payload:', payload);

>>>>>>> recover-last-work
      // Try to POST to backend if available
      const API_BASE = window.API_BASE || 'http://localhost:8000';
      let backendBooking = null;
      try {
<<<<<<< HEAD
=======
        console.log('Sending booking to backend:', `${API_BASE}/api/bookings`);
>>>>>>> recover-last-work
        const resp = await fetch(`${API_BASE}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
<<<<<<< HEAD
        const json = await resp.json().catch(() => null);
=======
        
        console.log('Response status:', resp.status);
        
        const json = await resp.json().catch(() => null);
        console.log('Response data:', json);
        
>>>>>>> recover-last-work
        if (resp.ok) {
          backendBooking = json;
        } else {
          const msg = json?.error || json?.message || `Booking failed (${resp.status})`;
          window.authUtils.showAlert(msg, 'error');
          return;
        }
      } catch (err) {
        // If backend unreachable, fall back to local storage but warn the user
        console.warn('Backend booking failed, falling back to local storage:', err);
        window.authUtils.showAlert('Backend unavailable — booking saved locally', 'warning');
      }

      // Map backend booking (snake_case) to frontend booking shape and add to local storage
      let bookingData;
      if (backendBooking) {
        bookingData = (window.dataStorage && typeof window.dataStorage.serverToBooking === 'function')
          ? window.dataStorage.serverToBooking(backendBooking)
          : {
              id: backendBooking.id,
              hallId: backendBooking.hall_id || payload.hallId,
              hallName: this.selectedHall.name,
              userId: backendBooking.user_id || payload.userId,
              username: this.currentUser.username,
              purpose: backendBooking.purpose || payload.purpose,
              date: backendBooking.date || payload.date,
              startTime: backendBooking.start_time ? backendBooking.start_time.slice(0,5) : payload.startTime,
              duration: backendBooking.duration || payload.duration,
              attendees: backendBooking.attendees || payload.attendees,
              requirements: backendBooking.requirements || payload.requirements,
              status: backendBooking.status || payload.status,
              createdAt: backendBooking.created_at || new Date().toISOString()
            };
      } else {
        // Fallback local booking
        bookingData = {
          hallId: payload.hallId,
          hallName: this.selectedHall.name,
          userId: payload.userId,
          username: this.currentUser.username,
          purpose: payload.purpose,
          date: payload.date,
          startTime: payload.startTime,
          duration: payload.duration,
          attendees: payload.attendees,
          requirements: payload.requirements,
          status: payload.status,
          createdAt: new Date().toISOString()
        };
      }

      window.dataStorage.addBooking(bookingData);
      window.authUtils.showAlert('Booking request submitted successfully!', 'success');
      window.modalManager.closeModal('booking-modal');
      this.loadBookings();

    } catch (error) {
      // Improved error reporting for debugging
      console.error('Booking submission error:', error);
      const message = error && error.message ? error.message : JSON.stringify(error);
      window.authUtils.showAlert(`An error occurred: ${message}`, 'error');
    } finally {
      window.LoadingManager.hide(submitBtn);
    }
  }

  validateBookingForm() {
    let isValid = true;
    const errors = {};

    const purpose = document.getElementById('booking-purpose').value.trim();
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const duration = document.getElementById('booking-duration').value;
    const attendees = parseInt(document.getElementById('booking-attendees').value);

    // Validate required fields
    if (!purpose) {
      errors.purpose = 'Purpose is required';
      isValid = false;
    }

    if (!date) {
      errors.date = 'Date is required';
      isValid = false;
    } else {
      // Check if date is in the future
      const selectedDate = window.authUtils.parseYMD(date);
      const today = window.authUtils.parseYMD(window.authUtils.toYMD(new Date()));
      
      if (selectedDate < today) {
        errors.date = 'Date must be in the future';
        isValid = false;
      }
    }

    if (!time) {
      errors.time = 'Time is required';
      isValid = false;
    }

    if (!duration) {
      errors.duration = 'Duration is required';
      isValid = false;
    }

    if (!attendees || attendees < 1) {
      errors.attendees = 'Number of attendees is required';
      isValid = false;
    } else if (attendees > this.selectedHall.capacity) {
      errors.attendees = `Maximum capacity is ${this.selectedHall.capacity}`;
      isValid = false;
    }

    // Display errors
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`${field}-error`);
      const inputElement = document.getElementById(`booking-${field}`);
      
      if (errorElement) {
        errorElement.textContent = errors[field];
      }
      
      if (inputElement) {
        inputElement.classList.add('error');
      }
    });

    // Clear errors for valid fields
    ['purpose', 'date', 'time', 'duration', 'attendees'].forEach(field => {
      if (!errors[field]) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(`booking-${field}`);
        
        if (errorElement) {
          errorElement.textContent = '';
        }
        
        if (inputElement) {
          inputElement.classList.remove('error');
        }
      }
    });

    return isValid;
  }

  setupBookingFilters() {
    const bookingFilter = document.getElementById('booking-filter');
    if (bookingFilter) {
      bookingFilter.addEventListener('change', () => {
        this.loadBookings();
      });
    }
  }

  loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    if (!bookingsList) return;

    // Only show bookings for logged-in user
    if (!this.currentUser) {
      bookingsList.innerHTML = `
        <div class="no-bookings">
          <i class="fas fa-sign-in-alt"></i>
          <h3>Please Login</h3>
          <p><a href="login.html">Login</a> to view your bookings.</p>
        </div>
      `;
      return;
    }

    const filter = document.getElementById('booking-filter')?.value || '';
    let bookings = window.dataStorage.getBookings()
      .filter(booking => booking.userId === this.currentUser.id);

    if (filter) {
      bookings = bookings.filter(booking => booking.status === filter);
    }

    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (bookings.length === 0) {
      bookingsList.innerHTML = `
        <div class="no-bookings">
          <i class="fas fa-calendar-times"></i>
          <h3>No Bookings Found</h3>
          <p>You haven't made any bookings yet.</p>
        </div>
      `;
      return;
    }

    bookingsList.innerHTML = bookings.map(booking => this.createBookingCard(booking)).join('');
  }

  createBookingCard(booking) {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dateLabel = window.authUtils.formatDate(booking.date);
    const daysDiff = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) dateLabel = 'Today';
    else if (daysDiff === 1) dateLabel = 'Tomorrow';
    else if (daysDiff === -1) dateLabel = 'Yesterday';

    const durationText = booking.duration === 'full-day' ? 'Full Day' : `${booking.duration} Hour${booking.duration > 1 ? 's' : ''}`;

  // Safely extract created date portion (fall back to booking.date or today if missing)
  const createdAtRaw = booking.createdAt || booking.created_at || booking.date || window.authUtils.toYMD(new Date());
  const createdDatePart = String(createdAtRaw).split('T')[0];

  return `
      <div class="booking-card ${booking.status}">
        <div class="booking-header">
          <h4 class="booking-hall">${booking.hallName}</h4>
          <span class="booking-status ${booking.status}">${booking.status}</span>
        </div>
        <div class="booking-content">
          <div class="booking-info">
            <strong>Purpose:</strong> ${booking.purpose}
          </div>
          <div class="booking-info">
            <strong>Date:</strong> ${dateLabel}
          </div>
          <div class="booking-info">
            <strong>Time:</strong> ${window.authUtils.formatTime(booking.startTime)}
          </div>
          <div class="booking-info">
            <strong>Duration:</strong> ${durationText}
          </div>
          <div class="booking-info">
            <strong>Attendees:</strong> ${booking.attendees}
          </div>
          ${booking.requirements ? `
            <div class="booking-info">
              <strong>Requirements:</strong> ${booking.requirements}
            </div>
          ` : ''}
          <div class="booking-info">
            <strong>Requested:</strong> ${window.authUtils.formatDate(createdDatePart)}
          </div>
        </div>
        ${booking.status === 'pending' ? `
          <div class="booking-actions">
            <button class="btn btn-sm btn-error cancel-booking-btn" data-booking-id="${booking.id}">
              <i class="fas fa-times"></i>
              Cancel Request
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Cancel booking functionality
  setupBookingActions() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.cancel-booking-btn')) {
        const bookingId = e.target.closest('.cancel-booking-btn').dataset.bookingId;
        this.cancelBooking(bookingId);
      }
    });
  }

  async cancelBooking(bookingId) {
    const booking = window.dataStorage.getBookingById(bookingId);
    if (!booking) return;

    const confirmed = confirm(`Are you sure you want to cancel your booking for "${booking.hallName}"?`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteBooking(bookingId);
      window.authUtils.showAlert('Booking cancelled successfully!', 'success');
      this.loadBookings();
    } catch (error) {
      console.error('Cancel booking error:', error);
      window.authUtils.showAlert('Error cancelling booking. Please try again.', 'error');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('halls.html')) {
<<<<<<< HEAD
=======
    console.log('DOMContentLoaded - Initializing HallsPage');
    console.log('modalManager available:', !!window.modalManager);
>>>>>>> recover-last-work
    window.hallsPage = new HallsPage();
    window.hallsPage.setupBookingActions();
  }
});

// Add enhanced styles for halls page
const hallStyles = `
  .no-halls,
  .no-bookings {
    text-align: center;
    padding: var(--spacing-8);
    color: var(--gray-500);
  }

  .no-halls i,
  .no-bookings i {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-4);
  }

  .hall-availability {
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .hall-availability.available {
    background: #dcfce7;
    color: #166534;
  }

  .hall-availability.unavailable {
    background: #fee2e2;
    color: #991b1b;
  }

  .hall-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3);
  }

  .hall-actions {
    margin-top: var(--spacing-4);
    text-align: center;
  }

  .selected-hall-info {
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-4);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-4);
  }

  .selected-hall-info .hall-facilities .facility-tag {
    background: rgba(255, 255, 255, 0.2);
  }

  .availability-warning {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    background: #fef3c7;
    color: #92400e;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
  }

  .availability-success {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    background: #dcfce7;
    color: #166534;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
  }

  .booking-actions {
    margin-top: var(--spacing-3);
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-2);
  }

  .booking-content {
    margin-bottom: var(--spacing-3);
  }

  .booking-info {
    margin-bottom: var(--spacing-2);
    font-size: var(--font-size-sm);
    color: var(--gray-600);
  }

  @media (max-width: 768px) {
    .booking-grid {
      grid-template-columns: 1fr;
    }
    
    .hall-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-2);
    }
    
    .booking-actions {
      justify-content: center;
    }
  }
`;

// Inject styles
if (!document.getElementById('halls-styles')) {
  const style = document.createElement('style');
  style.id = 'halls-styles';
  style.textContent = hallStyles;
  document.head.appendChild(style);
}