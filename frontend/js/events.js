// Events Page Management
class EventsPage {
  constructor() {
    this.currentFilters = {};
    this.sortBy = 'date';
    this.sortOrder = 'asc';
    this.init();
  }

  init() {
    this.setupEventModal();
    this.setupFilters();
    this.setupSearch();
    this.loadEvents();
    this.checkAuthState();
  }

  checkAuthState() {
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) {
      if (!window.authManager.isLoggedIn()) {
        addEventBtn.style.display = 'none';
      }
    }
  }

  setupEventModal() {
    const addEventBtn = document.getElementById('add-event-btn');
    const eventModal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // Open modal for adding new event
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openEventModal();
      });
    }

    // Close modal
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.modalManager.closeModal('event-modal');
      });
    }

    // Handle form submission
    if (eventForm) {
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEventSubmit();
      });
    }
  }

  setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFromFilter = document.getElementById('date-from');
    const dateToFilter = document.getElementById('date-to');

    [categoryFilter, statusFilter, dateFromFilter, dateToFilter].forEach(filter => {
      if (filter) {
        filter.addEventListener('change', () => {
          this.applyFilters();
        });
      }
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const debouncedSearch = window.authUtils.debounce(() => {
        this.applyFilters();
      }, 300);

      searchInput.addEventListener('input', debouncedSearch);
    }
  }

  applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFromFilter = document.getElementById('date-from');
    const dateToFilter = document.getElementById('date-to');
    const searchInput = document.getElementById('search-input');

    this.currentFilters = {
      category: categoryFilter?.value || '',
      status: statusFilter?.value || '',
      dateFrom: dateFromFilter?.value || '',
      dateTo: dateToFilter?.value || '',
      search: searchInput?.value || ''
    };

    this.loadEvents();
  }

  async loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    const noResults = document.getElementById('no-results');

    if (!eventsGrid) return;

    // Build API URL with current filters
    try {
      const base = window.location.origin;
      const apiPath = '/Campus Event Management System/Backend/public/index.php/events';
      const url = new URL(base + apiPath);

      // add supported query params
      const q = this.currentFilters || {};
      if (q.category) url.searchParams.set('category', q.category);
      if (q.status) url.searchParams.set('status', q.status);
      if (q.search) url.searchParams.set('search', q.search);
      if (q.dateFrom) url.searchParams.set('dateFrom', q.dateFrom);
      if (q.dateTo) url.searchParams.set('dateTo', q.dateTo);

      const res = await fetch(encodeURI(url.toString()), { credentials: 'include' });
      if (!res.ok) {
        console.error('Events API returned', res.status);
        if (noResults) noResults.style.display = 'block';
        eventsGrid.style.display = 'none';
        return;
      }

      const events = await res.json();

      // If backend returns an object with error
      if (!Array.isArray(events) || events.length === 0) {
        eventsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
      }

      // Sort events (same logic as before)
      events.sort((a, b) => {
        let aVal = a[this.sortBy];
        let bVal = b[this.sortBy];

        if (this.sortBy === 'date') {
          aVal = new Date((a.date || a.start_date || '') + ' ' + (a.time || ''));
          bVal = new Date((b.date || b.start_date || '') + ' ' + (b.time || ''));
        }

        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      eventsGrid.style.display = 'grid';
      if (noResults) noResults.style.display = 'none';

      eventsGrid.innerHTML = events.map(event => this.createEventCard(event)).join('');
      this.addEventCardListeners();
    } catch (err) {
      console.error('Failed loading events', err);
      if (noResults) noResults.style.display = 'block';
      eventsGrid.style.display = 'none';
    }
  }

  createEventCard(event) {
    const currentUser = window.authManager.getCurrentUser();
    const canEdit = currentUser && (currentUser.role === 'admin' || event.createdBy === currentUser.username);
    
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dateLabel = window.authUtils.formatDate(event.date);
    const daysDiff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) dateLabel = 'Today';
    else if (daysDiff === 1) dateLabel = 'Tomorrow';
    else if (daysDiff === -1) dateLabel = 'Yesterday';

    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-header">
          <span class="event-category ${event.category}">${event.category}</span>
          <span class="event-status status-${event.status}">${event.status}</span>
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description}</p>
        </div>
        <div class="event-meta">
          <div class="event-info">
            <i class="fas fa-calendar-alt"></i>
            <span>${dateLabel}</span>
          </div>
          <div class="event-info">
            <i class="fas fa-clock"></i>
            <span>${window.authUtils.formatTime(event.time)}</span>
          </div>
          <div class="event-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.venue}</span>
          </div>
          <div class="event-info">
            <i class="fas fa-user"></i>
            <span>${event.organizer}</span>
          </div>
          ${canEdit ? `
            <div class="event-actions">
              <button class="btn btn-sm btn-outline edit-event-btn" data-event-id="${event.id}">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button class="btn btn-sm btn-error delete-event-btn" data-event-id="${event.id}">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  addEventCardListeners() {
    // Edit event buttons
    document.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.eventId;
        this.editEvent(eventId);
      });
    });

    // Delete event buttons
    document.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.eventId;
        this.deleteEvent(eventId);
      });
    });

    // Event card click for details
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const eventId = card.dataset.eventId;
          this.showEventDetails(eventId);
        }
      });
    });
  }

  openEventModal(eventId = null) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const eventForm = document.getElementById('event-form');
    
    if (eventId) {
      // Edit mode
      const event = window.dataStorage.getEventById(eventId);
      if (event) {
        modalTitle.textContent = 'Edit Event';
        this.populateEventForm(event);
      }
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Event';
      eventForm.reset();
      document.getElementById('event-id').value = '';
    }
    
    window.modalManager.openModal('event-modal');
  }

  populateEventForm(event) {
    document.getElementById('event-id').value = event.id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = event.time;
    document.getElementById('event-venue').value = event.venue;
    document.getElementById('event-organizer').value = event.organizer;
  }

  async handleEventSubmit() {
    const submitBtn = document.querySelector('#event-form button[type="submit"]');
    
    // Validate form
    if (!window.authUtils.validateForm('event-form')) {
      return;
    }

    window.LoadingManager.show(submitBtn);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const formData = window.FormUtils.getFormData('event-form');
      const eventId = formData['event-id'];
      const currentUser = window.authManager.getCurrentUser();

      const eventData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        organizer: formData.organizer,
        status: 'upcoming'
      };

      if (eventId) {
        // Update existing event
        window.dataStorage.updateEvent(eventId, eventData);
        window.authUtils.showAlert('Event updated successfully!', 'success');
      } else {
        // Create new event
        eventData.createdBy = currentUser.username;
        eventData.createdAt = new Date().toISOString();
        window.dataStorage.addEvent(eventData);
        window.authUtils.showAlert('Event created successfully!', 'success');
      }

      window.modalManager.closeModal('event-modal');
      this.loadEvents();

    } catch (error) {
      console.error('Event submission error:', error);
      window.authUtils.showAlert('An error occurred. Please try again.', 'error');
    } finally {
      window.LoadingManager.hide(submitBtn);
    }
  }

  editEvent(eventId) {
    this.openEventModal(eventId);
  }

  async deleteEvent(eventId) {
    const event = window.dataStorage.getEventById(eventId);
    if (!event) return;

    const confirmed = confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      window.dataStorage.deleteEvent(eventId);
      window.authUtils.showAlert('Event deleted successfully!', 'success');
      this.loadEvents();
    } catch (error) {
      console.error('Delete error:', error);
      window.authUtils.showAlert('Error deleting event. Please try again.', 'error');
    }
  }

  showEventDetails(eventId) {
    const event = window.dataStorage.getEventById(eventId);
    if (!event) return;

    const modalContent = `
      <div class="event-details">
        <div class="event-detail-header">
          <span class="event-category ${event.category}">${event.category}</span>
          <span class="event-status status-${event.status}">${event.status}</span>
        </div>
        <h2>${event.title}</h2>
        <p class="event-detail-description">${event.description}</p>
        
        <div class="event-detail-info">
          <div class="info-group">
            <h4><i class="fas fa-calendar-alt"></i> Date & Time</h4>
            <p>${window.authUtils.formatDateTime(event.date, event.time)}</p>
          </div>
          
          <div class="info-group">
            <h4><i class="fas fa-map-marker-alt"></i> Venue</h4>
            <p>${event.venue}</p>
          </div>
          
          <div class="info-group">
            <h4><i class="fas fa-user"></i> Organizer</h4>
            <p>${event.organizer}</p>
          </div>
          
          <div class="info-group">
            <h4><i class="fas fa-info-circle"></i> Event Details</h4>
            <p><strong>Created by:</strong> ${event.createdBy}</p>
            <p><strong>Created on:</strong> ${window.authUtils.formatDate((event.createdAt ? String(event.createdAt).split('T')[0] : event.date))}</p>
          </div>
        </div>
        
        <div class="event-actions">
          <button class="btn btn-secondary" onclick="window.modalManager.closeModal('event-details-modal')">
            <i class="fas fa-times"></i>
            Close
          </button>
        </div>
      </div>
    `;

    this.showCustomModal('Event Details', modalContent);
  }

  showCustomModal(title, content) {
    // Remove existing custom modal
    const existingModal = document.getElementById('event-details-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create new modal
    const modal = document.createElement('div');
    modal.id = 'event-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // Show modal
    setTimeout(() => modal.classList.add('active'), 100);
  }

  // Export events (placeholder)
  exportEvents() {
    const events = window.dataStorage.filterEvents(this.currentFilters);
    const csv = this.convertToCSV(events);
    this.downloadCSV(csv, 'events.csv');
  }

  convertToCSV(events) {
    const headers = ['Title', 'Category', 'Description', 'Date', 'Time', 'Venue', 'Organizer', 'Status'];
    const csvContent = [
      headers.join(','),
      ...events.map(event => [
        `"${event.title}"`,
        event.category,
        `"${event.description}"`,
        event.date,
        event.time,
        `"${event.venue}"`,
        `"${event.organizer}"`,
        event.status
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('events.html')) {
    window.eventsPage = new EventsPage();
  }
});

// Add enhanced form validation styles
const eventStyles = `
  .form-input.error,
  .form-select.error,
  .form-textarea.error {
    border-color: var(--error-color);
    background-color: #fef2f2;
  }

  .event-actions {
    margin-top: var(--spacing-3);
    display: flex;
    gap: var(--spacing-2);
    justify-content: flex-end;
  }

  .event-details {
    max-width: none;
  }

  .event-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }

  .event-detail-description {
    margin-bottom: var(--spacing-6);
    line-height: 1.6;
    color: var(--gray-700);
  }

  .event-detail-info {
    display: grid;
    gap: var(--spacing-4);
    margin-bottom: var(--spacing-6);
  }

  .info-group h4 {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    color: var(--primary-color);
    margin-bottom: var(--spacing-2);
    font-size: var(--font-size-base);
  }

  .info-group p {
    margin-bottom: var(--spacing-1);
    color: var(--gray-700);
  }

  .event-actions {
    display: flex;
    gap: var(--spacing-3);
    justify-content: center;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .event-actions {
      flex-direction: column;
    }
    
    .event-detail-header {
      text-align: center;
    }
  }
`;

// Inject styles
if (!document.getElementById('events-styles')) {
  const style = document.createElement('style');
  style.id = 'events-styles';
  style.textContent = eventStyles;
  document.head.appendChild(style);
}
