// Admin Dashboard Management
class AdminDashboard {
  constructor() {
    this.currentTab = 'dashboard';
    this.init();
  }

  init() {
    this.checkAdminAccess();
    this.setupNavigation();
    this.setupLogout();
    this.setupTabContent();
    this.loadDashboardData();
  }

  checkAdminAccess() {
    if (!window.authManager.requireAdmin()) {
      return;
    }
    
    // Update admin name
    const adminName = document.getElementById('admin-name');
    if (adminName) {
      const user = window.authManager.getCurrentUser();
      adminName.textContent = user.fullName || user.username;
    }
  }

  setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = item.dataset.tab;
        this.switchTab(tabName);
      });
    });
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          window.authManager.logout();
        }
      });
    }
  }

  switchTab(tabName) {
    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content active state
    document.querySelectorAll('.admin-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    this.currentTab = tabName;
    this.loadTabContent(tabName);
  }

  setupTabContent() {
    this.setupEventsTab();
    this.setupBookingsTab();
    this.setupHallsTab();
    this.setupUsersTab();
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'events':
        this.loadEventsTable();
        break;
      case 'bookings':
        this.loadBookingsTable();
        break;
      case 'halls':
        this.loadHallsGrid();
        break;
      case 'users':
        this.loadUsersTable();
        break;
    }
  }

  loadDashboardData() {
    // Load statistics
    const eventStats = window.dataStorage.getEventStats();
    const bookingStats = window.dataStorage.getBookingStats();
    const hallStats = window.dataStorage.getHallStats();
    const userStats = { total: window.dataStorage.getUsers().length };

    // Update dashboard stats
    this.animateCounter('dash-total-events', eventStats.total);
    this.animateCounter('dash-approved-bookings', bookingStats.approved);
    this.animateCounter('dash-pending-bookings', bookingStats.pending);
    this.animateCounter('dash-total-halls', hallStats.total);

    // Load recent events
    this.loadRecentEvents();
    
    // Load pending bookings
    this.loadPendingBookings();
  }

  animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const increment = targetValue / (duration / 16);
    let currentValue = 0;

    const counter = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        element.textContent = targetValue;
        clearInterval(counter);
      } else {
        element.textContent = Math.floor(currentValue);
      }
    }, 16);
  }

  loadRecentEvents() {
    const recentEventsContainer = document.getElementById('recent-events');
    if (!recentEventsContainer) return;

    const events = window.dataStorage.getEvents()
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5);

    if (events.length === 0) {
      recentEventsContainer.innerHTML = '<p class="text-muted">No recent events</p>';
      return;
    }

    recentEventsContainer.innerHTML = events.map(event => `
      <div class="dashboard-item">
        <div class="item-info">
          <h5>${event.title}</h5>
          <p class="item-meta">
            <span class="category-badge ${event.category}">${event.category}</span>
            <span class="date">${window.authUtils.formatDate(event.date)}</span>
          </p>
        </div>
        <div class="item-status">
          <span class="status-badge ${event.status}">${event.status}</span>
        </div>
      </div>
    `).join('');
  }

  loadPendingBookings() {
    const pendingBookingsContainer = document.getElementById('pending-bookings');
    if (!pendingBookingsContainer) return;

    const bookings = window.dataStorage.getBookings()
      .filter(booking => booking.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (bookings.length === 0) {
      pendingBookingsContainer.innerHTML = '<p class="text-muted">No pending bookings</p>';
      return;
    }

    pendingBookingsContainer.innerHTML = bookings.map(booking => `
      <div class="dashboard-item">
        <div class="item-info">
          <h5>${booking.hallName}</h5>
          <p class="item-meta">
            <span>${booking.username}</span>
            <span class="date">${window.authUtils.formatDate(booking.date)}</span>
          </p>
        </div>
        <div class="item-actions">
          <button class="action-btn approve" onclick="window.adminDashboard.approveBooking(${booking.id})">
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn reject" onclick="window.adminDashboard.rejectBooking(${booking.id})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Events Tab
  setupEventsTab() {
    const addEventBtn = document.getElementById('add-admin-event');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openEventModal();
      });
    }

    // Setup filters
    const eventsSearch = document.getElementById('events-search');
    const eventsCategoryFilter = document.getElementById('events-category-filter');
    const eventsStatusFilter = document.getElementById('events-status-filter');

    if (eventsSearch) {
      const debouncedSearch = window.authUtils.debounce(() => {
        this.loadEventsTable();
      }, 300);
      eventsSearch.addEventListener('input', debouncedSearch);
    }

    [eventsCategoryFilter, eventsStatusFilter].forEach(filter => {
      if (filter) {
        filter.addEventListener('change', () => {
          this.loadEventsTable();
        });
      }
    });
  }

  loadEventsTable() {
    const tableBody = document.getElementById('events-table-body');
    if (!tableBody) return;

    // Get filters
    const search = document.getElementById('events-search')?.value || '';
    const category = document.getElementById('events-category-filter')?.value || '';
    const status = document.getElementById('events-status-filter')?.value || '';

    const filters = { search, category, status };
    const events = window.dataStorage.filterEvents(filters);

    // Sort by date (newest first)
    events.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    if (events.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No events found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = events.map(event => `
      <tr>
        <td>
          <div class="table-cell-main">
            <strong>${event.title}</strong>
            <small class="text-muted">${event.organizer}</small>
          </div>
        </td>
        <td>
          <span class="category-badge ${event.category}">${event.category}</span>
        </td>
        <td>${window.authUtils.formatDate(event.date)}</td>
        <td>${event.venue}</td>
        <td>
          <span class="status-badge ${event.status}">${event.status}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit" onclick="window.adminDashboard.editEvent(${event.id})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="window.adminDashboard.deleteEvent(${event.id})" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
            ${event.status === 'upcoming' ? `
              <button class="action-btn approve" onclick="window.adminDashboard.updateEventStatus(${event.id}, 'ongoing')" title="Mark as Ongoing">
                <i class="fas fa-play"></i>
              </button>
            ` : ''}
            ${event.status === 'ongoing' ? `
              <button class="action-btn" onclick="window.adminDashboard.updateEventStatus(${event.id}, 'completed')" title="Mark as Completed">
                <i class="fas fa-check"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Bookings Tab
  setupBookingsTab() {
    // Setup filters
    const bookingsSearch = document.getElementById('bookings-search');
    const bookingsStatusFilter = document.getElementById('bookings-status-filter');
    const bookingsHallFilter = document.getElementById('bookings-hall-filter');

    // Populate hall filter
    if (bookingsHallFilter) {
      const halls = window.dataStorage.getHalls();
      bookingsHallFilter.innerHTML = `
        <option value="">All Halls</option>
        ${halls.map(hall => `<option value="${hall.id}">${hall.name}</option>`).join('')}
      `;
    }

    if (bookingsSearch) {
      const debouncedSearch = window.authUtils.debounce(() => {
        this.loadBookingsTable();
      }, 300);
      bookingsSearch.addEventListener('input', debouncedSearch);
    }

    [bookingsStatusFilter, bookingsHallFilter].forEach(filter => {
      if (filter) {
        filter.addEventListener('change', () => {
          this.loadBookingsTable();
        });
      }
    });
  }

  loadBookingsTable() {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    // Update status counts
    const bookingStats = window.dataStorage.getBookingStats();
    const pendingCount = document.getElementById('pending-count');
    const approvedCount = document.getElementById('approved-count');
    
    if (pendingCount) pendingCount.textContent = `${bookingStats.pending} Pending`;
    if (approvedCount) approvedCount.textContent = `${bookingStats.approved} Approved`;

    // Get filters
    const search = document.getElementById('bookings-search')?.value || '';
    const status = document.getElementById('bookings-status-filter')?.value || '';
    const hallId = document.getElementById('bookings-hall-filter')?.value || '';

    const filters = { search, status };
    if (hallId) filters.hallId = parseInt(hallId);

    const bookings = window.dataStorage.filterBookings(filters);

    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (bookings.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No bookings found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = bookings.map(booking => `
      <tr>
        <td>
          <div class="table-cell-main">
            <strong>${booking.username}</strong>
            <small class="text-muted">${booking.purpose}</small>
          </div>
        </td>
        <td>${booking.hallName}</td>
        <td>
          <div class="table-cell-main">
            <strong>${booking.purpose}</strong>
            <small class="text-muted">${booking.attendees} attendees</small>
          </div>
        </td>
        <td>
          <div class="table-cell-main">
            <strong>${window.authUtils.formatDate(booking.date)}</strong>
            <small class="text-muted">${window.authUtils.formatTime(booking.startTime)} - ${booking.duration === 'full-day' ? 'Full Day' : booking.duration + 'h'}</small>
          </div>
        </td>
        <td>
          <span class="status-badge ${booking.status}">${booking.status}</span>
        </td>
        <td>
          <div class="table-actions">
            ${booking.status === 'pending' ? `
              <button class="action-btn approve" onclick="window.adminDashboard.approveBooking(${booking.id})" title="Approve">
                <i class="fas fa-check"></i>
              </button>
              <button class="action-btn reject" onclick="window.adminDashboard.rejectBooking(${booking.id})" title="Reject">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
            <button class="action-btn delete" onclick="window.adminDashboard.deleteBooking(${booking.id})" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Halls Tab
  setupHallsTab() {
    const addHallBtn = document.getElementById('add-hall');
    if (addHallBtn) {
      addHallBtn.addEventListener('click', () => {
        this.openHallModal();
      });
    }

    // Setup hall modal
    const hallForm = document.getElementById('hall-form');
    if (hallForm) {
      hallForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleHallSubmit();
      });
    }
  }

  loadHallsGrid() {
    const hallsGrid = document.getElementById('admin-halls-grid');
    if (!hallsGrid) return;

    const halls = window.dataStorage.getHalls();

    if (halls.length === 0) {
      hallsGrid.innerHTML = `
        <div class="no-data">
          <i class="fas fa-building"></i>
          <h3>No Halls Found</h3>
          <p>Add halls to get started.</p>
        </div>
      `;
      return;
    }

    hallsGrid.innerHTML = halls.map(hall => `
      <div class="admin-hall-card">
        <div class="hall-card-header">
          <h4>${hall.name}</h4>
          <span class="hall-availability ${hall.isAvailable ? 'available' : 'unavailable'}">
            ${hall.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div class="hall-card-body">
          <div class="hall-detail">
            <i class="fas fa-users"></i>
            <span>Capacity: ${hall.capacity}</span>
          </div>
          <div class="hall-detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>${hall.location}</span>
          </div>
          <div class="hall-facilities">
            ${hall.facilities.map(facility => `
              <span class="facility-tag">${this.formatFacilityName(facility)}</span>
            `).join('')}
          </div>
        </div>
        <div class="hall-card-actions">
          <button class="btn btn-sm btn-outline" onclick="window.adminDashboard.editHall(${hall.id})">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button class="btn btn-sm btn-error" onclick="window.adminDashboard.deleteHall(${hall.id})">
            <i class="fas fa-trash"></i>
            Delete
          </button>
          <button class="btn btn-sm ${hall.isAvailable ? 'btn-warning' : 'btn-success'}" 
                  onclick="window.adminDashboard.toggleHallAvailability(${hall.id})">
            <i class="fas fa-${hall.isAvailable ? 'pause' : 'play'}"></i>
            ${hall.isAvailable ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    `).join('');
  }

  formatFacilityName(facility) {
    return facility.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Users Tab
  setupUsersTab() {
    const usersSearch = document.getElementById('users-search');
    const usersRoleFilter = document.getElementById('users-role-filter');

    if (usersSearch) {
      const debouncedSearch = window.authUtils.debounce(() => {
        this.loadUsersTable();
      }, 300);
      usersSearch.addEventListener('input', debouncedSearch);
    }

    if (usersRoleFilter) {
      usersRoleFilter.addEventListener('change', () => {
        this.loadUsersTable();
      });
    }
  }

  loadUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    const totalUsersEl = document.getElementById('total-users');
    
    if (!tableBody) return;

    // Get filters
    const search = document.getElementById('users-search')?.value.toLowerCase() || '';
    const role = document.getElementById('users-role-filter')?.value || '';

    let users = window.dataStorage.getUsers();

    // Apply filters
    if (search) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (role) {
      users = users.filter(user => user.role === role);
    }

    // Update total count
    if (totalUsersEl) {
      totalUsersEl.textContent = `${users.length} Users`;
    }

    if (users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No users found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div class="table-cell-main">
            <strong>${user.username}</strong>
            ${user.id === window.authManager.getCurrentUser().id ? '<small class="text-primary">(You)</small>' : ''}
          </div>
        </td>
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>
          <span class="role-badge ${user.role}">${user.role}</span>
        </td>
  <td>${window.authUtils.formatDate((user.joinedDate ? String(user.joinedDate).split('T')[0] : new Date().toISOString().split('T')[0]))}</td>
        <td>
          <div class="table-actions">
            ${user.id !== window.authManager.getCurrentUser().id ? `
              <button class="action-btn edit" onclick="window.adminDashboard.editUser(${user.id})" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" onclick="window.adminDashboard.deleteUser(${user.id})" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Modal and Action Handlers
  openEventModal(eventId = null) {
    // This would open the same modal as in events.js
    // For simplicity, we'll redirect to events page for now
    window.location.href = 'events.html';
  }

  openHallModal(hallId = null) {
    const modal = document.getElementById('hall-modal');
    const modalTitle = document.getElementById('hall-modal-title');
    const hallForm = document.getElementById('hall-form');
    
    if (hallId) {
      // Edit mode
      const hall = window.dataStorage.getHallById(hallId);
      if (hall) {
        modalTitle.textContent = 'Edit Hall';
        this.populateHallForm(hall);
      }
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Hall';
      hallForm.reset();
      document.getElementById('hall-edit-id').value = '';
    }
    
    window.modalManager.openModal('hall-modal');
  }

  populateHallForm(hall) {
    document.getElementById('hall-edit-id').value = hall.id;
    document.getElementById('hall-name').value = hall.name;
    document.getElementById('hall-capacity').value = hall.capacity;
    document.getElementById('hall-location').value = hall.location;
    
    // Set facilities checkboxes
    const checkboxes = document.querySelectorAll('#hall-form input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = hall.facilities.includes(checkbox.value);
    });
  }

  async handleHallSubmit() {
    const submitBtn = document.querySelector('#hall-form button[type="submit"]');
    
    // Validate form
    if (!window.authUtils.validateForm('hall-form')) {
      return;
    }

    window.LoadingManager.show(submitBtn);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const formData = window.FormUtils.getFormData('hall-form');
      const hallId = formData['hall-edit-id'];

      // Get selected facilities
      const facilities = [];
      document.querySelectorAll('#hall-form input[type="checkbox"]:checked').forEach(checkbox => {
        facilities.push(checkbox.value);
      });

      const hallData = {
        name: formData['hall-name'],
        capacity: parseInt(formData['hall-capacity']),
        location: formData['hall-location'],
        facilities: facilities,
        isAvailable: true
      };

      if (hallId) {
        // Update existing hall
        window.dataStorage.updateHall(hallId, hallData);
        window.authUtils.showAlert('Hall updated successfully!', 'success');
      } else {
        // Create new hall
        window.dataStorage.addHall(hallData);
        window.authUtils.showAlert('Hall created successfully!', 'success');
      }

      window.modalManager.closeModal('hall-modal');
      this.loadHallsGrid();

    } catch (error) {
      console.error('Hall submission error:', error);
      window.authUtils.showAlert('An error occurred. Please try again.', 'error');
    } finally {
      window.LoadingManager.hide(submitBtn);
    }
  }

  // Action Methods
  async approveBooking(bookingId) {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.warn('Approve booking failed', resp.status, json);
        const msg = json?.error || json?.message || `Failed to approve booking (${resp.status})`;
        window.authUtils.showAlert(msg, 'error');
        return;
      }

      const mapped = (window.dataStorage && typeof window.dataStorage.serverToBooking === 'function')
        ? window.dataStorage.serverToBooking(json)
        : (json || {});

      if (window.dataStorage && typeof window.dataStorage.addBooking === 'function') {
        window.dataStorage.addBooking(mapped);
      }

      window.authUtils.showAlert('Booking approved successfully!', 'success');

      // Refresh admin tables and calendar
      if (this.currentTab === 'dashboard') {
        this.loadDashboardData();
      } else {
        this.loadBookingsTable();
      }
      if (window.dataStorage && typeof window.dataStorage.syncBookingsFromServer === 'function') {
        await window.dataStorage.syncBookingsFromServer({ apiBase: window.API_BASE });
        if (window.calendarPage && typeof window.calendarPage.renderCalendar === 'function') {
          window.calendarPage.renderCalendar();
          if (typeof window.calendarPage.loadSelectedDateData === 'function') window.calendarPage.loadSelectedDateData();
        }
      }
    } catch (error) {
      console.error('Error approving booking', error);
      window.authUtils.showAlert('Error approving booking', 'error');
    }
  }

  async rejectBooking(bookingId) {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.warn('Reject booking failed', resp.status, json);
        const msg = json?.error || json?.message || `Failed to reject booking (${resp.status})`;
        window.authUtils.showAlert(msg, 'error');
        return;
      }

      const mapped = (window.dataStorage && typeof window.dataStorage.serverToBooking === 'function')
        ? window.dataStorage.serverToBooking(json)
        : (json || {});

      if (window.dataStorage && typeof window.dataStorage.addBooking === 'function') {
        window.dataStorage.addBooking(mapped);
      }

      window.authUtils.showAlert('Booking rejected', 'success');

      if (this.currentTab === 'dashboard') {
        this.loadDashboardData();
      } else {
        this.loadBookingsTable();
      }

      if (window.dataStorage && typeof window.dataStorage.syncBookingsFromServer === 'function') {
        await window.dataStorage.syncBookingsFromServer({ apiBase: window.API_BASE });
        if (window.calendarPage && typeof window.calendarPage.renderCalendar === 'function') {
          window.calendarPage.renderCalendar();
          window.calendarPage.loadSelectedDateData();
        }
      }
    } catch (error) {
      console.error('Error rejecting booking', error);
      window.authUtils.showAlert('Error rejecting booking', 'error');
    }
  }

  async deleteBooking(bookingId) {
    const booking = window.dataStorage.getBookingById(bookingId);
    if (!booking) return;

    const confirmed = confirm(`Are you sure you want to delete the booking for "${booking.hallName}"?`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteBooking(bookingId);
      window.authUtils.showAlert('Booking deleted successfully!', 'success');
      this.loadBookingsTable();
    } catch (error) {
      window.authUtils.showAlert('Error deleting booking', 'error');
    }
  }

  async updateEventStatus(eventId, status) {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.warn('Update event status failed', resp.status, json);
        const msg = json?.error || json?.message || `Failed to update event status (${resp.status})`;
        window.authUtils.showAlert(msg, 'error');
        return;
      }

      const mapped = (window.dataStorage && typeof window.dataStorage.serverToEvent === 'function')
        ? window.dataStorage.serverToEvent(json)
        : (json || {});

      if (window.dataStorage && typeof window.dataStorage.updateEvent === 'function') {
        window.dataStorage.updateEvent(eventId, mapped);
      }
      window.authUtils.showAlert(`Event status updated to ${status}!`, 'success');
      this.loadEventsTable();

      // Optionally sync events on other views
    } catch (error) {
      console.error('Error updating event status', error);
      window.authUtils.showAlert('Error updating event status', 'error');
    }
  }

  async deleteEvent(eventId) {
    const event = window.dataStorage.getEventById(eventId);
    if (!event) return;

    const confirmed = confirm(`Are you sure you want to delete "${event.title}"?`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteEvent(eventId);
      window.authUtils.showAlert('Event deleted successfully!', 'success');
      this.loadEventsTable();
    } catch (error) {
      window.authUtils.showAlert('Error deleting event', 'error');
    }
  }

  editEvent(eventId) {
    // Store event ID and redirect to events page
    sessionStorage.setItem('edit_event_id', eventId);
    window.location.href = 'events.html';
  }

  editHall(hallId) {
    this.openHallModal(hallId);
  }

  async deleteHall(hallId) {
    const hall = window.dataStorage.getHallById(hallId);
    if (!hall) return;

    const confirmed = confirm(`Are you sure you want to delete "${hall.name}"?`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteHall(hallId);
      window.authUtils.showAlert('Hall deleted successfully!', 'success');
      this.loadHallsGrid();
    } catch (error) {
      window.authUtils.showAlert('Error deleting hall', 'error');
    }
  }

  async toggleHallAvailability(hallId) {
    const hall = window.dataStorage.getHallById(hallId);
    if (!hall) return;
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/halls/${hallId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: hall.isAvailable ? 0 : 1 })
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.warn('Toggle hall availability failed', resp.status, json);
        const msg = json?.error || json?.message || `Failed to update hall (${resp.status})`;
        window.authUtils.showAlert(msg, 'error');
        return;
      }

      const mapped = (window.dataStorage && typeof window.dataStorage.serverToHall === 'function')
        ? window.dataStorage.serverToHall(json)
        : (json || {});

      // Update local storage using normalized shape
      if (window.dataStorage && typeof window.dataStorage.updateHall === 'function') {
        window.dataStorage.updateHall(hallId, { isAvailable: mapped.isAvailable });
      }
      window.authUtils.showAlert(`Hall ${hall.isAvailable ? 'disabled' : 'enabled'} successfully!`, 'success');
      this.loadHallsGrid();
    } catch (error) {
      console.error('Error toggling hall availability', error);
      window.authUtils.showAlert('Error updating hall availability', 'error');
    }
  }

  editUser(userId) {
    window.authUtils.showAlert('User editing feature coming soon!', 'info');
  }

  async deleteUser(userId) {
    const user = window.dataStorage.getUserById ? window.dataStorage.getUserById(userId) : 
                  window.dataStorage.getUsers().find(u => u.id === userId);
    if (!user) return;

    const confirmed = confirm(`Are you sure you want to delete user "${user.username}"?`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteUser(userId);
      window.authUtils.showAlert('User deleted successfully!', 'success');
      this.loadUsersTable();
    } catch (error) {
      window.authUtils.showAlert('Error deleting user', 'error');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('admin.html')) {
    window.adminDashboard = new AdminDashboard();
  }
});

// Add admin-specific styles
const adminStyles = `
  .dashboard-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-3);
    border-bottom: 1px solid var(--gray-200);
  }

  .dashboard-item:last-child {
    border-bottom: none;
  }

  .item-info h5 {
    margin-bottom: var(--spacing-1);
    font-size: var(--font-size-sm);
  }

  .item-meta {
    display: flex;
    gap: var(--spacing-2);
    align-items: center;
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    margin-bottom: 0;
  }

  .category-badge, .status-badge, .role-badge {
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
  }

  .category-badge.academic, .role-badge.admin { background: #dbeafe; color: #1e40af; }
  .category-badge.cultural { background: #dcfce7; color: #166534; }
  .category-badge.sports { background: #fee2e2; color: #991b1b; }
  .category-badge.workshop { background: #fef3c7; color: #92400e; }
  .category-badge.seminar { background: #e0e7ff; color: #3730a3; }
  .role-badge.student { background: #f3f4f6; color: #374151; }

  .status-badge.upcoming, .status-badge.pending { background: #fef3c7; color: #92400e; }
  .status-badge.ongoing, .status-badge.approved { background: #dcfce7; color: #166534; }
  .status-badge.completed { background: #f3f4f6; color: #374151; }
  .status-badge.cancelled, .status-badge.rejected { background: #fee2e2; color: #991b1b; }

  .item-actions {
    display: flex;
    gap: var(--spacing-1);
  }

  .table-cell-main {
    display: flex;
    flex-direction: column;
  }

  .table-cell-main small {
    color: var(--gray-500);
    font-size: var(--font-size-xs);
  }

  .text-center {
    text-align: center;
  }

  .text-muted {
    color: var(--gray-500);
  }

  .text-primary {
    color: var(--primary-color);
  }

  .admin-hall-card {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: transform var(--transition-fast);
  }

  .admin-hall-card:hover {
    transform: translateY(-2px);
  }

  .hall-card-header {
    padding: var(--spacing-4);
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hall-card-body {
    padding: var(--spacing-4);
  }

  .hall-detail {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-2);
    font-size: var(--font-size-sm);
  }

  .hall-card-actions {
    padding: var(--spacing-4);
    border-top: 1px solid var(--gray-200);
    display: flex;
    gap: var(--spacing-2);
    flex-wrap: wrap;
  }

  .no-data {
    text-align: center;
    padding: var(--spacing-12);
    color: var(--gray-500);
    grid-column: 1 / -1;
  }

  .no-data i {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-4);
  }

  @media (max-width: 768px) {
    .hall-card-actions {
      flex-direction: column;
    }
    
    .item-info h5 {
      font-size: var(--font-size-xs);
    }
    
    .dashboard-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-2);
    }
  }
`;

// Inject styles
if (!document.getElementById('admin-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-styles';
  style.textContent = adminStyles;
  document.head.appendChild(style);
}