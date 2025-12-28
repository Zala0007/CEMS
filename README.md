<<<<<<< HEAD
# Campus Event Management System — Full run instructions

This repository contains a small campus event management system with a PHP backend (no framework) and a static frontend. This README explains how to run the project locally on Windows (XAMPP) and provides quick development alternatives using the PHP built-in server.

Target audience: developers on Windows who want to run the backend + frontend locally for development and testing.

---

## Table of contents
- Overview
- Prerequisites
- Quick checklist
- 1) Database setup (automated)
- 2) Run the backend (recommended: XAMPP/Apache)
- 3) Quick dev alternative (PHP built-in server)
- 4) Serve the frontend (avoid CORS)
- 5) Run the included integration test
- Troubleshooting & tips
- Useful commands

---

## Overview

The backend lives in `Backend/` and exposes a small JSON API under `/api/*`. The frontend is in `frontend/` and is primarily static HTML/CSS/JS that talks to the backend via fetch() calls.

Files of interest
- `Backend/public/` — backend front controller and public assets
- `Backend/src/` — backend PHP source (Controllers, Core, DB wrapper)
- `Backend/schema.sql` — SQL schema to import into MySQL
- `Backend/backend-setup.ps1` — helper PowerShell script to create the DB and import `schema.sql`
- `Backend/quick_tests/booking_flow_test.ps1` — small integration PowerShell test that creates and approves a booking
- `frontend/` — static frontend files (HTML/CSS/JS)

---

## Prerequisites

- Windows with administrative access (for hosts file/Apache changes)
- XAMPP (recommended) — provides Apache, PHP, and MySQL/MariaDB
- PowerShell (built-in on Windows)
- PHP CLI (if you want to use the PHP built-in server) — included with XAMPP
- Optional: Node.js + npm if you want to run a static server (e.g. `http-server`)

If you don't use XAMPP, ensure you can run `php` and have a MySQL server ready.

---

## Quick checklist

1. Start Apache and MySQL via XAMPP Control Panel (if using XAMPP)
2. Run `Backend/backend-setup.ps1` (as Administrator) to create the `college_events_db` and import `schema.sql`
3. Start the backend (Apache vhost or PHP built-in server)
4. Serve frontend from the same host or run a static server
5. Open the app in the browser and test

---

## 1) Database setup (automated)

There's a helper script to create the database and import the schema.

Important: run these commands in an elevated PowerShell (Run as Administrator).

From the repository `Backend` folder:

```powershell
cd 'C:\xampp\htdocs\Campus Event Management System\Backend'
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\backend-setup.ps1
```

Notes:
- The script assumes XAMPP is installed in `C:\xampp` and MySQL's root user has no password. If your MySQL root user has a password or XAMPP is installed in a different path, open `backend-setup.ps1` and edit the variables near the top (`$xamppPath`, `$mysqlRootPass`).

---

## 2) Run the backend (recommended: Apache + XAMPP)

This is the recommended approach during development because it mirrors production behavior (mod_rewrite, .htaccess, virtual hosts).

1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. (Optional) Create an Apache VirtualHost so you can use a friendly host (e.g., `cem.local`). Add a vhost entry referencing `Backend/public` as the DocumentRoot and add the hosts file mapping.

Example vhost (add to `C:\xampp\apache\conf\extra\httpd-vhosts.conf`):

```xml
<VirtualHost *:80>
    ServerName cem.local
    DocumentRoot "C:/xampp/htdocs/Campus Event Management System/Backend/public"
    <Directory "C:/xampp/htdocs/Campus Event Management System/Backend/public">
        Require all granted
        AllowOverride All
        Options Indexes FollowSymLinks
    </Directory>
</VirtualHost>
```

Then add to your hosts file (`C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1    cem.local
```

Restart Apache and visit:

```
http://cem.local/api/health
```

If you prefer not to set up a vhost you can use the URL with `index.php` in the path (this avoids relying on mod_rewrite):

```
http://localhost/Campus%20Event%20Management%20System/Backend/public/index.php/api/health
```

---

## 3) Quick dev alternative: PHP built-in server (no Apache config required)

This is convenient for quick testing and development. It will serve the backend from `Backend/public` and honor the project's router file.

Open PowerShell in the repository root and run:

```powershell
php -S localhost:8000 -t "C:/xampp/htdocs/Campus Event Management System/Backend/public" "C:/xampp/htdocs/Campus Event Management System/Backend/public/router.php"
```

Visit the health endpoint:

```
http://localhost:8000/api/health
```

Notes:
- This dev server is single-threaded and intended for development only.
- I used this server in local debugging and it works with the project's router (`router.php`).

---

## 4) Serve the frontend (avoid CORS)

The frontend makes fetch() calls to the backend API. To avoid CORS headaches it's simplest to serve the frontend from the same origin as the backend.

Options:

- (Recommended when using Apache) Serve the frontend pages through the same Apache instance (configure another vhost or copy `frontend/` contents into a subfolder under `Backend/public`).
- (Quick) Start a local static server from `frontend/`:

If you have Node installed:

```powershell
cd "C:/xampp/htdocs/Campus Event Management System/frontend"
npx http-server -c-1 -p 8080
# or install globally: npm install -g http-server; http-server -c-1 -p 8080
```

Then open: http://localhost:8080

If you serve frontend and backend from different origins you may need to update the front-end `window.API_BASE` to point to the backend URL (for example `http://localhost:8000`) and handle CORS in the backend (not currently enabled by default).

---

## 5) Run the included integration test (quick check)

There's a small PowerShell test at `Backend/quick_tests/booking_flow_test.ps1` which:
- POSTs a booking
- PUTs the booking to approved
- GETs the booking back to verify

Run it (PowerShell):

```powershell
cd 'C:\xampp\htdocs\Campus Event Management System\Backend\quick_tests'
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
..\booking_flow_test.ps1
```

It expects the backend to be reachable at `http://localhost:8000` or the dev URL used in the script. Edit the script if you need to change host/port.

---

## Configuration notes

- Database connection: `Backend/src/config.php`. If your MySQL host/user/password are different, update this file.
- API base on frontend: JavaScript uses `window.API_BASE` if set. Otherwise it defaults to `http://localhost:8000` in many dev helpers. If you change the server host/port, update the frontend accordingly.

---

## Troubleshooting

- 404s when using pretty URLs: ensure Apache `mod_rewrite` is enabled and `AllowOverride All` is set for the public directory so the included `.htaccess` can handle rewrites.
- PHP errors: enable `display_errors` in `php.ini` while debugging, or check Apache/PHP error logs in XAMPP.
- Database errors: run `backend-setup.ps1` manually or import `Backend/schema.sql` into your MySQL instance using phpMyAdmin or the mysql CLI.
- CORS errors: serve frontend from the same origin as backend or add CORS headers in backend Response (simple change in `Backend/src/Core/Response.php`).

If you run into an issue I can add a small PowerShell script that starts the backend dev server and opens the frontend URL in your default browser.

---

## Quick command summary

Start PHP dev server (from repository root):

```powershell
php -S localhost:8000 -t "C:/xampp/htdocs/Campus Event Management System/Backend/public" "C:/xampp/htdocs/Campus Event Management System/Backend/public/router.php"
```

Import DB (run as admin):

```powershell
cd 'C:\xampp\htdocs\Campus Event Management System\Backend'
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\backend-setup.ps1
```

Run integration test:

```powershell
cd 'C:\xampp\htdocs\Campus Event Management System\Backend\quick_tests'
..\booking_flow_test.ps1
```

Serve frontend quickly (Node http-server):

```powershell
cd 'C:\xampp\htdocs\Campus Event Management System\frontend'
npx http-server -c-1 -p 8080
```

---

If you want, I can:

- Add a single `run-dev.ps1` script that starts the PHP dev server and opens the frontend page in your browser (I'll create it so it uses default ports and can be customized).
- Add a `frontend/README.md` with quick-start instructions for serving the frontend.

Which would you prefer me to add next? (I can implement `run-dev.ps1` now if you want a single-click start.)
=======
# Campus Event Management System

A comprehensive web-based platform for managing college events, hall bookings, and event calendars. Built with PHP backend and vanilla JavaScript frontend.

## 📋 Features

### User Features
- **User Authentication**: Secure login and registration system with role-based access (Admin/Student)
- **Event Management**: Browse, view, and filter college events by category, date, and status
- **Hall Booking System**: 
  - View available halls with facilities and capacity information
  - Book halls for events with date/time validation
  - Track booking status (Pending/Approved/Rejected)
  - View personal booking history
- **Interactive Calendar**: Visual calendar view of all upcoming events and bookings
- **Responsive Design**: Mobile-friendly interface with modern UI/UX

### Admin Features
- **Hall Management**: 
  - Add new halls with detailed information
  - Edit existing hall details (capacity, location, facilities, availability)
  - Delete halls
  - Manage hall facilities (Projector, WiFi, AC, Stage, etc.)
- **Booking Management**: 
  - Approve or reject hall booking requests
  - View all bookings with filtering options
  - Monitor booking conflicts
- **Event Management**: Create, edit, and manage campus events
- **User Management**: View and manage user accounts
- **Dashboard**: Comprehensive overview of system statistics

## 🚀 Technologies Used

### Backend
- **PHP 8.1+**: Server-side programming
- **MySQL**: Database management
- **RESTful API**: Clean API architecture with proper HTTP methods
- **MVC Pattern**: Organized code structure with Controllers, Models, and Routing

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **Vanilla JavaScript**: ES6+ features with class-based architecture
- **Font Awesome**: Icon library
- **CSS Variables**: Theme-based styling system
- **Responsive Design**: Mobile-first approach

### Server
- **PHP Built-in Server**: Development server
- **XAMPP**: Local development environment (Apache/MySQL)

## 📦 Installation

### Prerequisites
- PHP 8.1 or higher
- MySQL 5.7 or higher
- XAMPP (or any web server with PHP and MySQL)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Setup Instructions

1. **Clone or Download the Project**
   ```bash
   # Place the project in your XAMPP htdocs directory
   cd c:\xampp\htdocs
   # Your project should be in: c:\xampp\htdocs\Campus Event Management System
   ```

2. **Start XAMPP Services**
   - Start Apache (for phpMyAdmin)
   - Start MySQL

3. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create a new database named: `college_events_db`
   - Or use MySQL command:
     ```sql
     CREATE DATABASE college_events_db;
     ```

4. **Import Database Schema**
   ```bash
   # Navigate to project directory
   cd "c:\xampp\htdocs\Campus Event Management System"
   
   # Import schema
   php import_schema.php
   ```
   
   Or import manually via phpMyAdmin:
   - Import file: `Backend/schema.sql`

5. **Start Backend Server**
   ```bash
   cd "Backend/public"
   php -S localhost:8000 router.php
   ```

6. **Start Frontend Server**
   ```bash
   # Open a new terminal
   cd frontend
   php -S localhost:3000
   ```

7. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

## 🔑 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `password`
- **Access**: Full system access including hall management, booking approvals, and user management

### Student Account
- **Username**: `student`
- **Password**: `password`
- **Access**: View events, book halls, manage personal bookings

## 📁 Project Structure

```
Campus Event Management System/
├── Backend/
│   ├── public/
│   │   ├── index.php              # Frontend controller
│   │   └── router.php             # Backend router
│   ├── src/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── EventsController.php
│   │   │   ├── HallsController.php
│   │   │   ├── BookingsController.php
│   │   │   └── UsersController.php
│   │   ├── Core/
│   │   │   ├── DB.php            # Database connection
│   │   │   ├── Router.php        # Request routing
│   │   │   ├── Request.php       # HTTP request handler
│   │   │   └── Response.php      # HTTP response handler
│   │   ├── bootstrap.php         # Application bootstrap
│   │   └── config.php            # Database configuration
│   ├── schema.sql                # Database schema
│   └── setup_db.php              # Database setup script
├── frontend/
│   ├── css/
│   │   └── styles.css            # Global styles
│   ├── js/
│   │   ├── auth.js               # Authentication logic
│   │   ├── storage.js            # Data management
│   │   ├── navigation.js         # Navigation & modals
│   │   ├── events.js             # Events page logic
│   │   ├── halls.js              # Halls booking logic
│   │   ├── calendar.js           # Calendar view
│   │   ├── admin.js              # Admin dashboard
│   │   ├── login.js              # Login page
│   │   ├── register.js           # Registration page
│   │   └── home.js               # Homepage logic
│   ├── index.html                # Homepage
│   ├── login.html                # Login page
│   ├── register.html             # Registration page
│   ├── events.html               # Events listing
│   ├── halls.html                # Hall booking
│   ├── calendar.html             # Calendar view
│   └── admin.html                # Admin dashboard
├── import_schema.php             # Schema import utility
├── package.json                  # Project metadata
└── README.md                     # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get event by ID
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Halls
- `GET /api/halls` - Get all halls
- `POST /api/halls` - Create new hall (Admin only)
- `GET /api/halls/{id}` - Get hall by ID
- `PUT /api/halls/{id}` - Update hall (Admin only)
- `DELETE /api/halls/{id}` - Delete hall (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking by ID
- `PUT /api/bookings/{id}` - Update booking (Admin approval)
- `DELETE /api/bookings/{id}` - Delete booking

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## 📖 Usage Guide

### For Students

1. **Registration & Login**
   - Register with username, email, and password
   - Login with credentials
   - Access student dashboard

2. **Browse Events**
   - View all upcoming campus events
   - Filter by category (Academic, Cultural, Sports, Workshop, Seminar)
   - View event details including date, time, venue, and description

3. **Book a Hall**
   - Navigate to "Halls" page
   - Browse available halls
   - Click "Select Hall" on desired hall
   - Click "Book Hall" button
   - Fill in booking details:
     - Purpose of booking
     - Date and time
     - Duration
     - Expected attendees
     - Special requirements
   - Submit booking request
   - Track booking status in "My Bookings" section

4. **View Calendar**
   - See all events and bookings in calendar view
   - Navigate between months
   - Click on events for details

### For Administrators

1. **Login as Admin**
   - Use admin credentials to access admin features

2. **Manage Halls**
   - Navigate to "Halls" page
   - Click "Add New Hall" to create hall
   - Enter hall details:
     - Name
     - Capacity
     - Location
     - Facilities (checkboxes)
     - Availability status
   - Edit existing halls using edit button
   - Delete halls using delete button

3. **Manage Bookings**
   - Navigate to "Admin" dashboard
   - View pending booking requests
   - Approve or reject bookings
   - View all bookings with filters

4. **Manage Events**
   - Create, edit, or delete campus events
   - Set event status (Upcoming, Ongoing, Completed, Cancelled)

## 🎨 Features Highlights

### Hall Booking System
- **Smart Validation**: Prevents double-booking with conflict detection
- **Facility Filtering**: Select halls based on required facilities
- **Real-time Availability**: See hall availability status
- **Booking History**: Track all your past and current bookings

### Event Management
- **Category-based Organization**: Events organized by type
- **Status Tracking**: Monitor event lifecycle
- **Rich Details**: Comprehensive event information
- **Search & Filter**: Quick event discovery

### Admin Dashboard
- **Booking Approvals**: Efficient workflow for hall booking requests
- **Hall Management**: Complete CRUD operations for halls
- **User Management**: Monitor and manage user accounts
- **Statistics**: Overview of system usage

## 🛠️ Development

### Database Configuration
Edit `Backend/src/config.php` to update database credentials:
```php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'college_events_db');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Adding New Halls via Database
```sql
INSERT INTO halls (name, capacity, location, facilities, is_available) 
VALUES ('New Hall', 200, 'Building A, Floor 2', 
        JSON_ARRAY('projector','wifi','ac'), 1);
```

### API Base URL Configuration
Update in JavaScript files if needed:
```javascript
const API_BASE = window.API_BASE || 'http://localhost:8000';
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running in XAMPP
- Check database credentials in `config.php`
- Ensure database `college_events_db` exists

### Port Already in Use
- Backend: Change port in start command: `php -S localhost:8001 router.php`
- Frontend: Change port: `php -S localhost:3001`
- Update API_BASE in JavaScript files accordingly

### CORS Issues
- Backend is configured to allow all origins for development
- For production, update CORS headers in `Backend/public/index.php`

### Server Not Starting
- Kill existing PHP processes:
  ```bash
  Get-Process php | Stop-Process -Force
  ```
- Restart servers with background jobs:
  ```powershell
  Start-Job -ScriptBlock { Set-Location "path\to\Backend\public"; php -S localhost:8000 router.php }
  ```

## 📝 Sample Data

The system comes pre-loaded with:
- **5 Halls**: Main Auditorium, Conference Hall, Seminar Rooms, Sports Ground, Library
- **8 Sample Events**: Tech symposiums, cultural fests, sports tournaments, workshops
- **2 User Accounts**: Admin and Student (both password: "password")

## 🔐 Security Notes

**Important for Production:**
1. Change default passwords immediately
2. Use environment variables for sensitive data
3. Implement proper JWT or session-based authentication
4. Enable HTTPS
5. Update CORS policy to restrict origins
6. Add input sanitization and validation
7. Implement rate limiting
8. Use prepared statements (already implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is created for educational purposes.

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review API endpoint documentation
- Check browser console for JavaScript errors
- Verify backend server logs

## 🎯 Future Enhancements

- Email notifications for booking approvals
- Event registration system
- File upload for event posters
- Advanced reporting and analytics
- Mobile app integration
- Payment gateway for paid events
- QR code generation for event tickets
- Social media integration

---

**Built with ❤️ for Campus Event Management**
>>>>>>> recover-last-work
