// Home Page Management
class HomePage {
  constructor() {
    this.init();
  }

  init() {
    this.loadStats();
    this.loadUpcomingEvents();
    this.startPeriodicUpdates();
  }

  loadStats() {
    const eventStats = window.dataStorage.getEventStats();
    const bookingStats = window.dataStorage.getBookingStats();
    const hallStats = window.dataStorage.getHallStats();

    // Update stat counters with animation
    this.animateCounter('total-events', eventStats.total);
    this.animateCounter('available-halls', hallStats.available);
    this.animateCounter('active-bookings', bookingStats.approved);
    this.animateCounter('upcoming-events', eventStats.upcoming);
  }

  animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const startValue = 0;
    const increment = targetValue / (duration / 16);
    let currentValue = startValue;

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

  loadUpcomingEvents() {
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    const today = new Date().toISOString().split('T')[0];
    const events = window.dataStorage.getEvents()
      .filter(event => event.date >= today && event.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6); // Show only 6 events on homepage

    if (events.length === 0) {
      eventsGrid.innerHTML = `
        <div class="no-events">
          <i class="fas fa-calendar-times"></i>
          <h3>No Upcoming Events</h3>
          <p>Check back later for new events or <a href="events.html">view all events</a>.</p>
        </div>
      `;
      return;
    }

    eventsGrid.innerHTML = events.map(event => this.createEventCard(event)).join('');
    
    // Add hover animations
    this.addEventCardAnimations();
  }

  createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = window.authUtils.formatDate(event.date);
    const formattedTime = window.authUtils.formatTime(event.time);
    
    // Determine if event is today, tomorrow, or later
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateOnly = new Date(event.date);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((eventDateOnly - today) / (1000 * 60 * 60 * 24));
    let dateLabel = formattedDate;
    
    if (daysDiff === 0) dateLabel = 'Today';
    else if (daysDiff === 1) dateLabel = 'Tomorrow';
    else if (daysDiff <= 7) dateLabel = `In ${daysDiff} days`;

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
            <span>${formattedTime}</span>
          </div>
          <div class="event-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.venue}</span>
          </div>
          <div class="event-info">
            <i class="fas fa-user"></i>
            <span>${event.organizer}</span>
          </div>
        </div>
      </div>
    `;
  }

  addEventCardAnimations() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach((card, index) => {
      // Staggered entrance animation
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);

      // Hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });

      // Click handler for event details
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        this.showEventDetails(eventId);
      });
    });
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
        
        <div class="event-actions">
          <a href="events.html" class="btn btn-primary">
            <i class="fas fa-calendar-plus"></i>
            View All Events
          </a>
        </div>
      </div>
    `;

    // Create and show modal
    this.showCustomModal('Event Details', modalContent);
  }

  showCustomModal(title, content) {
    // Remove existing custom modal
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create new modal
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
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

  startPeriodicUpdates() {
    // Update stats every 5 minutes
    setInterval(() => {
      this.loadStats();
    }, 5 * 60 * 1000);

    // Update events every 10 minutes
    setInterval(() => {
      this.loadUpcomingEvents();
    }, 10 * 60 * 1000);
  }

  // Weather Widget (placeholder)
  addWeatherWidget() {
    const weatherContainer = document.createElement('div');
    weatherContainer.className = 'weather-widget';
    weatherContainer.innerHTML = `
      <div class="weather-info">
        <i class="fas fa-sun weather-icon"></i>
        <div class="weather-details">
          <div class="weather-temp">22°C</div>
          <div class="weather-desc">Sunny</div>
          <div class="weather-location">Campus</div>
        </div>
      </div>
    `;

    const header = document.querySelector('.hero-content');
    if (header) {
      header.appendChild(weatherContainer);
    }
  }

  // Quick Stats Animation
  addStatsScrollAnimation() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadStats();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(statsSection);
  }
}

// News Feed Feature (optional)
class NewsFeed {
  constructor() {
    this.addNewsFeedSection();
  }

  addNewsFeedSection() {
    const newsSection = document.createElement('section');
    newsSection.className = 'news-section';
    newsSection.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Latest Updates</h2>
          <button class="btn btn-outline" id="view-all-news">View All</button>
        </div>
        <div class="news-grid" id="news-grid">
          ${this.generateSampleNews()}
        </div>
      </div>
    `;

    // Insert before events section
    const eventsSection = document.querySelector('.events-section');
    if (eventsSection) {
      eventsSection.parentNode.insertBefore(newsSection, eventsSection);
    }
  }

  generateSampleNews() {
    const newsItems = [
      {
        title: 'New Library Hours Extended',
        summary: 'The library will now be open 24/7 during exam periods.',
        date: new Date().toISOString(),
        category: 'announcement'
      },
      {
        title: 'Student Parking Updates',
        summary: 'New parking regulations effective from next month.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: 'notice'
      },
      {
        title: 'Campus Wi-Fi Upgrade',
        summary: 'Faster internet speeds coming to all buildings.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'announcement'
      }
    ];

    return newsItems.map(item => {
      const dateRaw = item.date || new Date().toISOString();
      const datePart = String(dateRaw).split('T')[0];
      return `
      <div class="news-card">
        <div class="news-header">
          <span class="news-category ${item.category}">${item.category}</span>
          <span class="news-date">${window.authUtils.formatDate(datePart)}</span>
        </div>
        <h4 class="news-title">${item.title}</h4>
        <p class="news-summary">${item.summary}</p>
        <a href="#" class="news-link">Read More <i class="fas fa-arrow-right"></i></a>
      </div>
    `}).join('');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize on home page
  if (window.location.pathname.endsWith('index.html') || 
      window.location.pathname === '/' ||
      window.location.pathname === '/index.html' ||
      document.title.includes('College Event Management')) {
    
    window.homePage = new HomePage();
    
    // Uncomment to add news feed
    // window.newsFeed = new NewsFeed();
  }
});

// Add some nice CSS for the news section
const newsStyles = `
  .news-section {
    padding: var(--spacing-16) 0;
    background: var(--gray-50);
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-6);
  }

  .news-card {
    background: white;
    padding: var(--spacing-6);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-fast);
  }

  .news-card:hover {
    transform: translateY(-2px);
  }

  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3);
  }

  .news-category {
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .news-category.announcement {
    background: #dbeafe;
    color: #1e40af;
  }

  .news-category.notice {
    background: #fef3c7;
    color: #92400e;
  }

  .news-date {
    font-size: var(--font-size-xs);
    color: var(--gray-500);
  }

  .news-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-2);
    color: var(--gray-800);
  }

  .news-summary {
    color: var(--gray-600);
    margin-bottom: var(--spacing-4);
    line-height: 1.5;
  }

  .news-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2);
    color: var(--primary-color);
    font-weight: 500;
    font-size: var(--font-size-sm);
    transition: color var(--transition-fast);
  }

  .news-link:hover {
    color: var(--primary-dark);
  }

  .no-events {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-12);
    color: var(--gray-500);
  }

  .no-events i {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-4);
  }

  .event-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
  }

  .event-detail-description {
    margin-bottom: var(--spacing-6);
    line-height: 1.6;
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
  }

  .info-group p {
    margin-bottom: 0;
    color: var(--gray-700);
  }

  .event-actions {
    display: flex;
    gap: var(--spacing-3);
    justify-content: center;
  }
`;

// Inject styles
if (!document.getElementById('home-styles')) {
  const style = document.createElement('style');
  style.id = 'home-styles';
  style.textContent = newsStyles;
  document.head.appendChild(style);
}