# 🎬 Online Movie Ticket Booking System

A full-stack web application designed for browsing movies, scheduling cinema shows, selecting theater seats, and booking tickets online.

Built strictly using **HTML5, CSS3, JavaScript (ES6+), Express.js (Node.js), and MySQL**.

---

## 📋 Project Specifications & Database Schema

### 🗄️ Database: `movie_booking_db`

#### 1. Table: `users` (Customer Profiles)
- `user_id` INT AUTO_INCREMENT PRIMARY KEY
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(100) NOT NULL UNIQUE
- `phone` VARCHAR(20)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### 2. Table: `movies` (Table 2 in requirements)
- `movie_id` INT AUTO_INCREMENT PRIMARY KEY
- `title` VARCHAR(150) NOT NULL
- `language` VARCHAR(30) NOT NULL
- `duration` INT NOT NULL (duration in minutes)
- `release_data` DATE NOT NULL
- `genre` VARCHAR(60)
- `poster_url` VARCHAR(255)
- `description` TEXT

#### 3. Table: `shows` (Table 3 in requirements)
- `show_id` INT AUTO_INCREMENT PRIMARY KEY
- `movie_id` INT NOT NULL (Foreign Key referencing `movies(movie_id)` ON DELETE CASCADE)
- `theatre_name` VARCHAR(100) NOT NULL
- `show_date` DATE NOT NULL
- `show_time` TIME NOT NULL
- `ticket_price` DECIMAL(10,2) NOT NULL
- `screen_name` VARCHAR(50)

#### 4. Table: `bookings` (Table 4 in requirements)
- `bookings_id` INT AUTO_INCREMENT PRIMARY KEY
- `user_id` INT NOT NULL (Foreign Key referencing `users(user_id)` ON DELETE CASCADE)
- `show_id` INT NOT NULL (Foreign Key referencing `shows(show_id)` ON DELETE CASCADE)
- `seats` INT NOT NULL (Total seat count)
- `seat_numbers` VARCHAR(150) (e.g. `C4, C5`)
- `total_amount` DECIMAL(10,2) NOT NULL
- `booking_status` VARCHAR(30) NOT NULL DEFAULT 'Confirmed'
- `booking_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 🌟 Key Features

1. **Movie Discovery & Filters**:
   - Customers can browse movies with dynamic posters, language badges, runtime, and release date.
   - Filter by language (English, Hindi, Telugu, Tamil, Malayalam) and real-time live search.

2. **Theaters & Showtimes**:
   - Multiple cinema theaters (e.g., PVR Cinemas, IMAX Cinepolis, INOX Multiplex).
   - View show dates, showtimes, and ticket prices per theater.

3. **Interactive Seat Selection Layout**:
   - Curved cinema screen representation ("CINEMA SCREEN THIS WAY").
   - 60-seat visualizer matrix (Rows A to F, Seats 1 to 10 with central aisle).
   - Real-time seat statuses: Available, Selected, and Sold/Reserved.
   - Dynamic price calculation: `total_amount = (seats * ticket_price) + convenience_fee`.

4. **Booking & Instant Digital E-Ticket**:
   - Customer checkout modal.
   - Generates digital e-Ticket receipt with unique `#BK-...` Booking ID, movie title, theater, screen, seat codes, total price, barcode, and one-click print feature.

5. **Customer Bookings Lookup**:
   - Search bookings by Booking ID, customer name, movie title, or email.
   - Cancel booking feature (updates `booking_status` to `'Cancelled'`).

6. **Admin Management Portal (`admin.html`)**:
   - Live metrics: Total Movies, Active Shows, Total Bookings, and Total Revenue.
   - Movie Management (CRUD): Add new movies, edit details, and delete.
   - Shows & Theaters Management (CRUD): Link movies to theater showtimes and ticket prices.
   - Bookings Management: Monitor all reservations and cancel tickets.

7. **Dual-Mode Database Architecture**:
   - Directly connects to **MySQL** via `mysql2`.
   - Automatically executes `database.sql` to initialize database and tables.
   - Includes automatic high-speed in-memory store fallback if MySQL server is not currently running, allowing instant zero-friction demonstration.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+)
- MySQL Server (optional, recommended for persistent database storage)

### 2. Setup Database in MySQL (Optional)
Run the following in MySQL Workbench or MySQL CLI:
```bash
mysql -u root -p < database.sql
```

### 3. Start the Application
Open a terminal in this directory and run:
```bash
node server.js
```

### 4. Access the Application in Your Browser
- **Customer Movie & Seat Booking**: [http://localhost:3000](http://localhost:3000)
- **Bookings Record & Cancellation**: [http://localhost:3000/bookings.html](http://localhost:3000/bookings.html)
- **Admin & Theater Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies` | Get movies (supports `?language=` and `?search=`) |
| `GET` | `/api/movies/:id` | Get single movie with its upcoming shows |
| `POST` | `/api/movies` | Add new movie |
| `PUT` | `/api/movies/:id` | Update movie |
| `DELETE` | `/api/movies/:id` | Delete movie |
| `GET` | `/api/shows` | Get all shows with movie joins |
| `GET` | `/api/shows/:id` | Get show details |
| `GET` | `/api/shows/:id/booked-seats` | Get occupied seats for a show |
| `POST` | `/api/shows` | Schedule a show |
| `PUT` | `/api/shows/:id` | Update show |
| `DELETE` | `/api/shows/:id` | Delete show |
| `GET` | `/api/bookings` | List all bookings |
| `POST` | `/api/bookings` | Create new booking |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking |
| `GET` | `/api/stats` | Summary analytics |
| `GET` | `/api/db-status` | MySQL connection status |
