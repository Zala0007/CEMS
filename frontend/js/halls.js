// Halls Page Management
class HallsPage {
  constructor() {
    this.selectedHall = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    this.currentUser = window.authManager.getCurrentUser();
    this.setupBookingModal();
    this.loadHalls();
    this.loadBookings();
    this.setupBookingFilters();
    this.checkAuthState();
  }

  checkAuthState() {
    const bookHallBtn = document.getElementById('book-hall-btn');
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
  }

  setupBookingModal() {
    const bookHallBtn = document.getElementById('book-hall-btn');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // Open modal for booking
    if (bookHallBtn) {
      bookHallBtn.addEventListener('click', () => {
        if (!this.selectedHall) {
          window.authUtils.showAlert('Please select a hall first', 'warning');
          return;
        }
        this.openBookingModal();
      });
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

  loadHalls() {
    const hallsList = document.getElementById('halls-list');
    if (!hallsList) return;

    const halls = window.dataStorage.getHalls();
    
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
    
    // Validate form
    if (!this.validateBookingForm()) {
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

      // Try to POST to backend if available
      const API_BASE = window.API_BASE || 'http://localhost:8000';
      let backendBooking = null;
      try {
        const resp = await fetch(`${API_BASE}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await resp.json().catch(() => null);
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