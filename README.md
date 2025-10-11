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
