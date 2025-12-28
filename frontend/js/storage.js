// Data Storage Management
class DataStorage {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Initialize users if not exists
    if (!localStorage.getItem('cms_users')) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          fullName: 'Administrator',
          email: 'admin@college.edu',
          role: 'admin',
          joinedDate: new Date().toISOString()
        },
        {
          id: 2,
          username: 'student',
          password: 'student123',
          fullName: 'John Student',
          email: 'student@college.edu',
          role: 'student',
          joinedDate: new Date().toISOString()
        }
      ];
      localStorage.setItem('cms_users', JSON.stringify(defaultUsers));
    }

    // Initialize halls if not exists
    if (!localStorage.getItem('cms_halls')) {
      const defaultHalls = [
        {
          id: 1,
          name: 'Main Auditorium',
          capacity: 500,
          location: 'Annexe Building, Ground Floor',
          facilities: ['projector', 'sound-system', 'air-conditioning', 'stage'],
          isAvailable: true
        },
        {
          id: 2,
          name: 'Conference Hall',
          capacity: 150,
          location: 'Annexe Building, 2nd Floor',
          facilities: ['projector', 'air-conditioning', 'wifi'],
          isAvailable: true
        },
        {
          id: 3,
          name: 'Seminar Room 1',
          capacity: 50,
          location: 'Annexe Building, 1st Floor',
          facilities: ['projector', 'wifi'],
          isAvailable: true
        },
        {
          id: 4,
          name: 'Sports Ground',
          capacity: 300,
          location: 'Sports Ground',
          facilities: ['sound-system', 'lighting'],
          isAvailable: true
        },
        {
          id: 5,
          name: 'Library',
          capacity: 80,
          location: 'Library Building',
          facilities: ['wifi', 'air-conditioning'],
          isAvailable: true
        }
      ];
      localStorage.setItem('cms_halls', JSON.stringify(defaultHalls));
    }

    // Initialize events if not exists
    if (!localStorage.getItem('cms_events')) {
      const currentDate = new Date();
      const defaultEvents = [
        {
          id: 1,
          title: 'Annual Tech Fest',
          description: 'A comprehensive tech conference featuring latest innovations and research presentations.',
          category: 'academic',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7)),
          time: '09:00',
          venue: 'Main Auditorium',
          organizer: 'Computer Department',
          status: 'upcoming',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Cultural Festival 2025',
          description: 'Celebrate diversity with music, dance, and art performances from students across the campus.',
          category: 'cultural',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 14)),
          time: '16:00',
          venue: 'Sports Ground',
          organizer: 'Student Cultural Committee',
          status: 'upcoming',
          createdBy: 'student',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Basketball Championship',
          description: 'Inter-college basketball tournament featuring teams from various departments.',
          category: 'sports',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3)),
          time: '14:00',
          venue: 'Sports Ground',
          organizer: 'Sports Department',
          status: 'upcoming',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Career Development Workshop',
          description: 'Professional development session covering resume writing and interview skills.',
          category: 'workshop',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 21)),
          time: '10:00',
          venue: 'Conference Hall',
          organizer: 'Career Services',
          status: 'upcoming',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          title: 'Research Excellence Seminar',
          description: 'Showcasing outstanding research projects and methodologies from faculty and students.',
          category: 'seminar',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5)),
          time: '11:00',
          venue: 'Seminar Room 1',
          organizer: 'Research Department',
          status: 'completed',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('cms_events', JSON.stringify(defaultEvents));
    }

    // Initialize bookings if not exists
    if (!localStorage.getItem('cms_bookings')) {
      const currentDate = new Date();
      const defaultBookings = [
        {
          id: 1,
          hallId: 2,
          hallName: 'Conference Hall',
          userId: 2,
          username: 'student',
          purpose: 'Project Presentation',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5)),
          startTime: '14:00',
          duration: '2',
          attendees: 25,
          requirements: 'Need projector and sound system',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          hallId: 3,
          hallName: 'Seminar Room 1',
          userId: 2,
          username: 'student',
          purpose: 'Study Group Session',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 12)),
          startTime: '16:00',
          duration: '3',
          attendees: 15,
          requirements: 'None',
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          hallId: 1,
          hallName: 'Main Auditorium',
          userId: 2,
          username: 'student',
          purpose: 'Department Event',
          date: this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)),
          startTime: '10:00',
          duration: 'full-day',
          attendees: 200,
          requirements: 'Full audio-visual setup required',
          status: 'rejected',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('cms_bookings', JSON.stringify(defaultBookings));
    }
  }

  // Map server objects (snake_case) to client-side shapes
  serverToBooking(b) {
    if (!b) return null;
    return {
      id: b.id,
      hallId: b.hall_id || b.hallId,
      hallName: b.hallName || b.hall_name || '',
      userId: b.user_id || b.userId,
      username: b.username || '',
      purpose: b.purpose,
      date: b.date,
      startTime: b.start_time ? String(b.start_time).slice(0,5) : (b.startTime || ''),
      duration: b.duration,
      attendees: b.attendees,
      requirements: b.requirements || '',
      status: b.status,
      createdAt: b.created_at || b.createdAt || new Date().toISOString()
    };
  }

  serverToEvent(e) {
    if (!e) return null;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      date: e.date,
      time: e.time,
      venue: e.venue,
      organizer: e.organizer,
      status: e.status,
      createdAt: e.created_at || e.createdAt || new Date().toISOString()
    };
  }

  serverToHall(h) {
    if (!h) return null;
    return {
      id: h.id,
      name: h.name,
      capacity: h.capacity,
      location: h.location,
      facilities: Array.isArray(h.facilities) ? h.facilities : (h.facilities ? JSON.parse(h.facilities) : []),
      isAvailable: (typeof h.is_available !== 'undefined') ? !!h.is_available : (typeof h.isAvailable !== 'undefined' ? !!h.isAvailable : true)
    };
  }

  formatDate(date) {
    // Prefer authUtils.toYMD which returns local YYYY-MM-DD; fall back to manual local composition
    if (window && window.authUtils && typeof window.authUtils.toYMD === 'function') {
      return window.authUtils.toYMD(date);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Generic CRUD operations
  getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  addItem(key, item) {
    const data = this.getData(key);
    // If server provided an id, use it and avoid creating a duplicate
    if (item.id && Number.isInteger(item.id)) {
      const exists = data.findIndex(i => parseInt(i.id) === parseInt(item.id));
      if (exists !== -1) {
        data[exists] = { ...data[exists], ...item };
        this.setData(key, data);
        return data[exists];
      }
      // push with provided id
      data.push(item);
      this.setData(key, data);
      return item;
    }

    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
    item.id = maxId + 1;
    data.push(item);
    this.setData(key, data);
    return item;
  }

  updateItem(key, id, updatedItem) {
    const data = this.getData(key);
    const index = data.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedItem };
      this.setData(key, data);
      return data[index];
    }
    return null;
  }

  deleteItem(key, id) {
    const data = this.getData(key);
    const filteredData = data.filter(item => item.id !== parseInt(id));
    this.setData(key, filteredData);
    return filteredData.length < data.length;
  }

  // Specific methods for different data types
  getUsers() {
    return this.getData('cms_users');
  }

  addUser(user) {
    return this.addItem('cms_users', user);
  }

  updateUser(id, user) {
    return this.updateItem('cms_users', id, user);
  }

  deleteUser(id) {
    return this.deleteItem('cms_users', id);
  }

  getHalls() {
    return this.getData('cms_halls');
  }

  addHall(hall) {
    return this.addItem('cms_halls', hall);
  }

  updateHall(id, hall) {
    return this.updateItem('cms_halls', id, hall);
  }

  deleteHall(id) {
    return this.deleteItem('cms_halls', id);
  }

  getEvents() {
    return this.getData('cms_events');
  }

  addEvent(event) {
    return this.addItem('cms_events', event);
  }

  updateEvent(id, event) {
    return this.updateItem('cms_events', id, event);
  }

  deleteEvent(id) {
    return this.deleteItem('cms_events', id);
  }

  getBookings() {
    return this.getData('cms_bookings');
  }

  addBooking(booking) {
    return this.addItem('cms_bookings', booking);
  }

  updateBooking(id, booking) {
    return this.updateItem('cms_bookings', id, booking);
  }

  deleteBooking(id) {
    return this.deleteItem('cms_bookings', id);
  }

  // Helper methods
  getUserByCredentials(username, password) {
    const users = this.getUsers();
    return users.find(user => user.username === username && user.password === password);
  }

  getHallById(id) {
    const halls = this.getHalls();
    return halls.find(hall => hall.id === parseInt(id));
  }

  getEventById(id) {
    const events = this.getEvents();
    return events.find(event => event.id === parseInt(id));
  }

  getBookingById(id) {
    const bookings = this.getBookings();
    return bookings.find(booking => booking.id === parseInt(id));
  }

  // Filter methods
  filterEvents(filters) {
    let events = this.getEvents();
    
    if (filters.category) {
      events = events.filter(event => event.category === filters.category);
    }
    
    if (filters.status) {
      events = events.filter(event => event.status === filters.status);
    }
    
    if (filters.dateFrom) {
      events = events.filter(event => event.date >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      events = events.filter(event => event.date <= filters.dateTo);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.organizer.toLowerCase().includes(searchTerm)
      );
    }
    
    return events;
  }

  filterBookings(filters) {
    let bookings = this.getBookings();
    
    if (filters.status) {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }
    
    if (filters.hallId) {
      bookings = bookings.filter(booking => booking.hallId === parseInt(filters.hallId));
    }
    
    if (filters.userId) {
      bookings = bookings.filter(booking => booking.userId === parseInt(filters.userId));
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      bookings = bookings.filter(booking => 
        booking.purpose.toLowerCase().includes(searchTerm) ||
        booking.hallName.toLowerCase().includes(searchTerm) ||
        booking.username.toLowerCase().includes(searchTerm)
      );
    }
    
    return bookings;
  }

  // Statistics methods
  getEventStats() {
    const events = this.getEvents();
    const today = (window && window.authUtils && typeof window.authUtils.toYMD === 'function')
      ? window.authUtils.toYMD(new Date())
      : (new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(new Date().getDate()).padStart(2,'0'));
    
    return {
      total: events.length,
      upcoming: events.filter(e => e.date >= today && e.status === 'upcoming').length,
      ongoing: events.filter(e => e.status === 'ongoing').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length
    };
  }

  getBookingStats() {
    const bookings = this.getBookings();
    
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    };
  }

  getHallStats() {
    const halls = this.getHalls();
    
    return {
      total: halls.length,
      available: halls.filter(h => h.isAvailable).length,
      unavailable: halls.filter(h => !h.isAvailable).length
    };
  }

  // Calendar methods
  getEventsForDate(date) {
    const events = this.getEvents();
    return events.filter(event => event.date === date);
  }

  getBookingsForDate(date) {
    const bookings = this.getBookings();
    // Return bookings for the date regardless of approval status so users can see pending requests
    return bookings.filter(booking => booking.date === date);
  }

  getEventsForMonth(year, month) {
    const events = this.getEvents();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    return events.filter(event => event.date >= startDate && event.date <= endDate);
  }

  getBookingsForMonth(year, month) {
    const bookings = this.getBookings();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    // Include bookings regardless of approval status so calendar shows pending/approved/rejected
    return bookings.filter(booking => 
      booking.date >= startDate && 
      booking.date <= endDate
    );
  }

  // Sync bookings from backend API and store them locally.
  // This will fetch all bookings (optionally filtered) and upsert them into localStorage.
  async syncBookingsFromServer({ apiBase } = {}) {
    const API_BASE = apiBase || window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/bookings`);
      if (!resp.ok) {
        console.warn('Failed to fetch bookings from server:', resp.status);
        return false;
      }
      const bookings = await resp.json();
      if (!Array.isArray(bookings)) return false;

      // Map server booking fields (snake_case) to local booking shape
<<<<<<< HEAD
      const mapped = bookings.map(b => ({
        id: b.id,
        hallId: b.hall_id,
        hallName: b.hallName || b.hall_name || '',
        userId: b.user_id,
        username: b.username || '',
        purpose: b.purpose,
        date: b.date,
        startTime: b.start_time ? b.start_time.slice(0,5) : b.startTime,
        duration: b.duration,
        attendees: b.attendees,
        requirements: b.requirements || '',
        status: b.status,
        createdAt: b.created_at || new Date().toISOString()
      }));

      // Upsert each booking into local storage
      mapped.forEach(b => {
        // Reuse addItem which will preserve provided id
        this.addItem('cms_bookings', b);
      });
=======
      const mapped = bookings.map(b => this.serverToBooking(b));

      // Replace localStorage bookings with server data
      this.setData('cms_bookings', mapped);
>>>>>>> recover-last-work

      return true;
    } catch (err) {
      console.warn('Error syncing bookings from server:', err);
      return false;
    }
  }
<<<<<<< HEAD
=======

  // Sync events from backend API and store them locally.
  async syncEventsFromServer({ apiBase } = {}) {
    const API_BASE = apiBase || window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/events`);
      if (!resp.ok) {
        console.warn('Failed to fetch events from server:', resp.status);
        return false;
      }
      const events = await resp.json();
      if (!Array.isArray(events)) return false;

      // Map server event fields to local event shape
      const mapped = events.map(e => this.serverToEvent(e));

      // Replace localStorage events with server data
      this.setData('cms_events', mapped);

      return true;
    } catch (err) {
      console.warn('Error syncing events from server:', err);
      return false;
    }
  }

  // Sync halls from backend API and store them locally.
  async syncHallsFromServer({ apiBase } = {}) {
    const API_BASE = apiBase || window.API_BASE || 'http://localhost:8000';
    try {
      const resp = await fetch(`${API_BASE}/api/halls`);
      if (!resp.ok) {
        console.warn('Failed to fetch halls from server:', resp.status);
        return false;
      }
      const halls = await resp.json();
      if (!Array.isArray(halls)) return false;

      // Map server hall fields to local hall shape
      const mapped = halls.map(h => this.serverToHall(h));

      // Replace localStorage halls with server data
      this.setData('cms_halls', mapped);

      return true;
    } catch (err) {
      console.warn('Error syncing halls from server:', err);
      return false;
    }
  }
>>>>>>> recover-last-work
}

// Create global instance
window.dataStorage = new DataStorage();