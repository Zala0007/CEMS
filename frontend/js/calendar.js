// Calendar Page Management
class CalendarPage {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.visibleCategories = new Set(['academic', 'cultural', 'sports', 'workshop', 'seminar']);
    this.showEvents = true;
    this.showBookings = true;
    this.init();
  }

  init() {
    this.setupCalendarControls();
    this.setupFilters();
    // Sync both events and bookings from backend first so calendar shows server data
    const syncPromises = [];
    if (window.dataStorage) {
      if (typeof window.dataStorage.syncEventsFromServer === 'function') {
        syncPromises.push(window.dataStorage.syncEventsFromServer({ apiBase: window.API_BASE }));
      }
      if (typeof window.dataStorage.syncBookingsFromServer === 'function') {
        syncPromises.push(window.dataStorage.syncBookingsFromServer({ apiBase: window.API_BASE }));
      }
    }
    
    if (syncPromises.length > 0) {
      Promise.all(syncPromises).then(() => {
        this.renderCalendar();
        this.loadSelectedDateData();
      }).catch(() => {
        // even if sync fails, render with local data
        this.renderCalendar();
        this.loadSelectedDateData();
      });
    } else {
      this.renderCalendar();
      this.loadSelectedDateData();
    }
  }

  setupCalendarControls() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.renderCalendar();
        this.updateSelectedDateDisplay();
      });
    }
  }

  setupFilters() {
    const showEventsCheckbox = document.getElementById('show-events');
    const showBookingsCheckbox = document.getElementById('show-bookings');
    const categoryFilters = document.querySelectorAll('.category-filter');

    if (showEventsCheckbox) {
      showEventsCheckbox.addEventListener('change', (e) => {
        this.showEvents = e.target.checked;
        this.renderCalendar();
        this.loadSelectedDateData();
      });
    }

    if (showBookingsCheckbox) {
      showBookingsCheckbox.addEventListener('change', (e) => {
        this.showBookings = e.target.checked;
        this.renderCalendar();
        this.loadSelectedDateData();
      });
    }

    categoryFilters.forEach(filter => {
      filter.addEventListener('change', (e) => {
        const category = e.target.dataset.category;
        if (e.target.checked) {
          this.visibleCategories.add(category);
        } else {
          this.visibleCategories.delete(category);
        }
        this.renderCalendar();
        this.loadSelectedDateData();
      });
    });
  }

  renderCalendar() {
    this.updateMonthDisplay();
    this.renderCalendarGrid();
  }

  updateMonthDisplay() {
    const monthDisplay = document.getElementById('current-month');
    if (monthDisplay) {
      const options = { year: 'numeric', month: 'long' };
      monthDisplay.textContent = this.currentDate.toLocaleDateString('en-US', options);
    }
  }

  renderCalendarGrid() {
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get starting date (including previous month days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Get events and bookings for this month
    const events = this.showEvents ? window.dataStorage.getEventsForMonth(year, month) : [];
    const bookings = this.showBookings ? window.dataStorage.getBookingsForMonth(year, month) : [];

    // Create calendar days
    const calendarDays = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure full calendar grid
    for (let i = 0; i < 42; i++) {
      const dayData = this.createDayData(currentDate, events, bookings, month);
      calendarDays.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Render calendar days
    calendarBody.innerHTML = calendarDays.map(day => this.createCalendarDay(day)).join('');

    // Add click listeners to calendar days
    this.addCalendarDayListeners();
  }

  createDayData(date, events, bookings, currentMonth) {
  const dateStr = window.authUtils.toYMD(date);
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = this.isToday(date);
    const isSelected = this.selectedDate === dateStr;

    // Filter events for this date and visible categories
    const dayEvents = events.filter(event => 
      event.date === dateStr && this.visibleCategories.has(event.category)
    );

    // Filter bookings for this date
    const dayBookings = bookings.filter(booking => 
      booking.date === dateStr
    );

    return {
      date: new Date(date),
      dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday,
      isSelected,
      events: dayEvents,
      bookings: dayBookings
    };
  }

  createCalendarDay(dayData) {
    const { date, dayNumber, isCurrentMonth, isToday, isSelected, events, bookings } = dayData;
    
    let cssClasses = 'calendar-day';
    if (!isCurrentMonth) cssClasses += ' other-month';
    if (isToday) cssClasses += ' today';
    if (isSelected) cssClasses += ' selected';

    const eventsHtml = events.slice(0, 3).map(event => 
      `<div class="calendar-event event-${event.category}" data-event-id="${event.id}" title="${event.title}">
        ${event.title}
      </div>`
    ).join('');

    const bookingsHtml = bookings.slice(0, 2).map(booking => 
      `<div class="calendar-event booking-${booking.status}" data-booking-id="${booking.id}" title="${booking.purpose} - ${booking.hallName}">
        <i class="fas fa-building"></i> ${booking.hallName}
      </div>`
    ).join('');

    const totalItems = events.length + bookings.length;
    const moreText = totalItems > 5 ? `<div class="calendar-more">+${totalItems - 5} more</div>` : '';

    return `
      <div class="${cssClasses}" data-date="${dayData.dateStr}">
        <div class="day-number">${dayNumber}</div>
        <div class="day-events">
          ${eventsHtml}
          ${bookingsHtml}
          ${moreText}
        </div>
      </div>
    `;
  }

  addCalendarDayList() {
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', (e) => {
        // Don't trigger day selection if clicking on an event
        if (e.target.closest('.calendar-event')) return;

        const dateStr = day.dataset.date;
        this.selectDate(dateStr);
      });
    });

    // Add event click listeners
    document.querySelectorAll('.calendar-event[data-event-id]').forEach(eventEl => {
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.eventId;
        this.showEventDetails(eventId);
      });
    });

    // Add booking click listeners
    document.querySelectorAll('.calendar-event[data-booking-id]').forEach(bookingEl => {
      bookingEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookingId = bookingEl.dataset.bookingId;
        this.showBookingDetails(bookingId);
      });
    });
  }

  selectDate(dateStr) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.classList.remove('selected');
    });

    // Add selection to clicked day
    const selectedDay = document.querySelector(`[data-date="${dateStr}"]`);
    if (selectedDay) {
      selectedDay.classList.add('selected');
    }

    this.selectedDate = dateStr;
    this.updateSelectedDateDisplay();
    this.loadSelectedDateData();
  }

  updateSelectedDateDisplay() {
    const selectedDateEl = document.getElementById('selected-date');
    if (!selectedDateEl) return;

    if (this.selectedDate) {
      const date = new Date(this.selectedDate);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      selectedDateEl.textContent = date.toLocaleDateString('en-US', options);
    } else {
      selectedDateEl.textContent = 'Today';
    }
  }

  loadSelectedDateData() {
    const selectedEventsContainer = document.getElementById('selected-events');
    if (!selectedEventsContainer) return;

  const targetDate = this.selectedDate || window.authUtils.toYMD(new Date());
    
    // Get events and bookings for selected date
    const events = this.showEvents ? 
      window.dataStorage.getEventsForDate(targetDate)
        .filter(event => this.visibleCategories.has(event.category)) : [];
    
    const bookings = this.showBookings ? 
      window.dataStorage.getBookingsForDate(targetDate) : [];

    // Combine and sort by time
    const allItems = [
      ...events.map(event => ({ ...event, type: 'event', sortTime: event.time })),
      ...bookings.map(booking => ({ ...booking, type: 'booking', sortTime: booking.startTime }))
    ].sort((a, b) => a.sortTime.localeCompare(b.sortTime));

    if (allItems.length === 0) {
      selectedEventsContainer.innerHTML = `
        <div class="no-events-day">
          <i class="fas fa-calendar-times"></i>
          <p>No events or bookings for this date</p>
        </div>
      `;
      return;
    }

    selectedEventsContainer.innerHTML = allItems.map(item => {
      if (item.type === 'event') {
        return this.createEventListItem(item);
      } else {
        return this.createBookingListItem(item);
      }
    }).join('');
  }

  createEventListItem(event) {
    return `
      <div class="event-list-item" data-event-id="${event.id}">
        <div class="event-time">
          <i class="fas fa-clock"></i>
          ${window.authUtils.formatTime(event.time)}
        </div>
        <div class="event-details">
          <div class="event-header">
            <h4>${event.title}</h4>
            <span class="event-category ${event.category}">${event.category}</span>
          </div>
          <p class="event-meta">
            <i class="fas fa-map-marker-alt"></i>
            ${event.venue} • ${event.organizer}
          </p>
          <p class="event-description">${event.description}</p>
        </div>
      </div>
    `;
  }

  createBookingListItem(booking) {
    const durationText = booking.duration === 'full-day' ? 'Full Day' : `${booking.duration} Hour${booking.duration > 1 ? 's' : ''}`;
    
    return `
      <div class="booking-list-item" data-booking-id="${booking.id}">
        <div class="event-time">
          <i class="fas fa-building"></i>
          ${window.authUtils.formatTime(booking.startTime)}
        </div>
        <div class="event-details">
          <div class="event-header">
            <h4>${booking.hallName}</h4>
            <span class="booking-status ${booking.status}">${booking.status}</span>
          </div>
          <p class="event-meta">
            <i class="fas fa-user"></i>
            ${booking.username} • ${durationText} • ${booking.attendees} attendees
          </p>
          <p class="event-description">${booking.purpose}</p>
        </div>
      </div>
    `;
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
        </div>
      </div>
    `;

    this.showModal('Event Details', modalContent);
  }

  showBookingDetails(bookingId) {
    const booking = window.dataStorage.getBookingById(bookingId);
    if (!booking) return;

    const durationText = booking.duration === 'full-day' ? 'Full Day' : `${booking.duration} Hour${booking.duration > 1 ? 's' : ''}`;

    const modalContent = `
      <div class="booking-details">
        <div class="booking-detail-header">
          <span class="booking-status ${booking.status}">${booking.status}</span>
        </div>
        <h2>${booking.hallName}</h2>
        <p class="booking-detail-description">${booking.purpose}</p>
        
        <div class="booking-detail-info">
          <div class="info-group">
            <h4><i class="fas fa-calendar-alt"></i> Date & Time</h4>
            <p>${window.authUtils.formatDateTime(booking.date, booking.startTime)} (${durationText})</p>
          </div>
          
          <div class="info-group">
            <h4><i class="fas fa-user"></i> Booked By</h4>
            <p>${booking.username}</p>
          </div>
          
          <div class="info-group">
            <h4><i class="fas fa-users"></i> Expected Attendees</h4>
            <p>${booking.attendees}</p>
          </div>
          
          ${booking.requirements ? `
            <div class="info-group">
              <h4><i class="fas fa-list"></i> Requirements</h4>
              <p>${booking.requirements}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.showModal('Booking Details', modalContent);
  }

  showModal(title, content) {
    // Remove existing modal
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
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Show modal
    setTimeout(() => modal.classList.add('active'), 100);
  }

  isToday(date) {
    const todayYMD = window.authUtils.toYMD(new Date());
    return window.authUtils.toYMD(date) === todayYMD;
  }

  // Navigation helpers
  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.renderCalendar();
    this.updateSelectedDateDisplay();
    this.loadSelectedDateData();
  }

  goToDate(dateStr) {
    const date = new Date(dateStr);
    this.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    this.selectedDate = dateStr;
    this.renderCalendar();
    this.updateSelectedDateDisplay();
    this.loadSelectedDateData();
  }

  // Export calendar data
  exportCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const events = window.dataStorage.getEventsForMonth(year, month);
    const bookings = window.dataStorage.getBookingsForMonth(year, month);
    
    const calendarData = {
      month: this.currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      events: events.length,
      bookings: bookings.length,
      data: [...events, ...bookings]
    };

    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `calendar-${year}-${month + 1}.json`;
    link.click();
  }

  addCalendarDayListeners() {
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', (e) => {
        // Don't trigger day selection if clicking on an event
        if (e.target.closest('.calendar-event')) return;

        const dateStr = day.dataset.date;
        this.selectDate(dateStr);
      });
    });

    // Add event click listeners
    document.querySelectorAll('.calendar-event[data-event-id]').forEach(eventEl => {
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.eventId;
        this.showEventDetails(eventId);
      });
    });

    // Add booking click listeners
    document.querySelectorAll('.calendar-event[data-booking-id]').forEach(bookingEl => {
      bookingEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const bookingId = bookingEl.dataset.bookingId;
        this.showBookingDetails(bookingId);
      });
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('calendar.html')) {
    window.calendarPage = new CalendarPage();
  }
});

// Add calendar-specific styles
const calendarStyles = `
  .calendar-more {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
    font-style: italic;
    margin-top: var(--spacing-1);
  }

  .event-list-item,
  .booking-list-item {
    display: flex;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-3);
    cursor: pointer;
    transition: transform var(--transition-fast);
  }

  .event-list-item:hover,
  .booking-list-item:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .event-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    color: var(--primary-color);
    font-weight: 600;
    font-size: var(--font-size-sm);
  }

  .event-time i {
    margin-bottom: var(--spacing-1);
    font-size: var(--font-size-lg);
  }

  .event-details {
    flex: 1;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2);
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }

  .event-header h4 {
    margin-bottom: 0;
    font-size: var(--font-size-lg);
  }

  .event-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    color: var(--gray-600);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-2);
  }

  .event-description {
    color: var(--gray-700);
    font-size: var(--font-size-sm);
    line-height: 1.4;
    margin-bottom: 0;
  }

  .no-events-day {
    text-align: center;
    padding: var(--spacing-8);
    color: var(--gray-500);
  }

  .no-events-day i {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-3);
  }

  .booking-detail-header {
    margin-bottom: var(--spacing-4);
  }

  .booking-detail-description {
    margin-bottom: var(--spacing-6);
    line-height: 1.6;
    color: var(--gray-700);
  }

  .booking-detail-info {
    display: grid;
    gap: var(--spacing-4);
  }

  @media (max-width: 768px) {
    .event-list-item,
    .booking-list-item {
      flex-direction: column;
      gap: var(--spacing-2);
    }
    
    .event-time {
      flex-direction: row;
      min-width: auto;
      justify-content: flex-start;
    }
    
    .event-time i {
      margin-bottom: 0;
      margin-right: var(--spacing-2);
    }
    
    .event-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

// Inject styles
if (!document.getElementById('calendar-styles')) {
  const style = document.createElement('style');
  style.id = 'calendar-styles';
  style.textContent = calendarStyles;
  document.head.appendChild(style);
}