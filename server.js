// ====================================================================
// ONLINE MOVIE TICKET BOOKING SYSTEM - EXPRESS BACKEND
// ====================================================================
// Technologies: Node.js, Express.js, MySQL (mysql2)
// Database: movie_booking_db (user: root, password: root)
// Tables:
//   - table2: movies: movie_id, title, language, duration, release_data
//   - table3: shows: show_id, movie_id, theatre_name, show_date, show_time, ticket_price
//   - table4: bookings: bookings_id, user_id, seats, total_amount, booking_status
//   - users: user_id, name, email, phone
// ====================================================================

const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let isConnectedToMySQL = false;

// Fallback seed data in case MySQL server is ever temporarily stopped
let mockUsers = [
  { user_id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "9876543210" },
  { user_id: 2, name: "Bob Williams", email: "bob@example.com", phone: "9876543211" },
  { user_id: 3, name: "Charlie Davis", email: "charlie@example.com", phone: "9876543212" }
];

let mockMovies = [
  {
    movie_id: 1,
    title: "Inception",
    language: "English",
    duration: 148,
    release_data: "2024-05-15",
    genre: "Sci-Fi / Thriller",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea."
  },
  {
    movie_id: 2,
    title: "Interstellar",
    language: "English",
    duration: 169,
    release_data: "2024-06-10",
    genre: "Sci-Fi / Adventure",
    poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new planet."
  },
  {
    movie_id: 3,
    title: "RRR: Rise Roar Revolt",
    language: "Telugu",
    duration: 187,
    release_data: "2024-04-20",
    genre: "Action / Drama",
    poster_url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80",
    description: "A fearless warrior and a legendary cop in 1920s British India wage war against British colonial oppression."
  },
  {
    movie_id: 4,
    title: "Jawan",
    language: "Hindi",
    duration: 169,
    release_data: "2024-03-12",
    genre: "Action / Thriller",
    poster_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
    description: "A high-octane action thriller outlining the emotional journey of a man who is set to rectify the wrongs in the society."
  },
  {
    movie_id: 5,
    title: "Leo",
    language: "Tamil",
    duration: 164,
    release_data: "2024-07-01",
    genre: "Action / Crime",
    poster_url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80",
    description: "A mild-mannered cafe owner in Kashmir becomes a hero after an incident, but dark shadows from his past soon catch up."
  },
  {
    movie_id: 6,
    title: "Spider-Man: Beyond The Multiverse",
    language: "English",
    duration: 140,
    release_data: "2024-08-18",
    genre: "Animation / Adventure",
    poster_url: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    description: "Miles Morales catapults across the Multiverse to save every universe of Spider-People from a shadowy existential threat."
  }
];

let mockShows = [
  { show_id: 1, movie_id: 1, theatre_name: "PVR Cinemas - Screen 1", show_date: "2026-11-10", show_time: "10:30:00", ticket_price: 250.00, screen_name: "Audi 1" },
  { show_id: 2, movie_id: 1, theatre_name: "IMAX Mega Cinepolis", show_date: "2026-11-10", show_time: "14:15:00", ticket_price: 380.00, screen_name: "IMAX 3D Laser" },
  { show_id: 3, movie_id: 1, theatre_name: "INOX Grand Multiplex", show_date: "2026-11-10", show_time: "18:45:00", ticket_price: 280.00, screen_name: "Screen 3" },
  { show_id: 4, movie_id: 2, theatre_name: "PVR Cinemas - Screen 2", show_date: "2026-11-10", show_time: "11:00:00", ticket_price: 300.00, screen_name: "Audi 2" },
  { show_id: 5, movie_id: 2, theatre_name: "IMAX Mega Cinepolis", show_date: "2026-11-10", show_time: "19:30:00", ticket_price: 420.00, screen_name: "IMAX 3D Laser" },
  { show_id: 6, movie_id: 3, theatre_name: "Miraj Cinemas Downtown", show_date: "2026-11-10", show_time: "13:00:00", ticket_price: 220.00, screen_name: "Screen 1" },
  { show_id: 7, movie_id: 3, theatre_name: "INOX Grand Multiplex", show_date: "2026-11-10", show_time: "21:00:00", ticket_price: 250.00, screen_name: "Screen 2" },
  { show_id: 8, movie_id: 4, theatre_name: "PVR Cinemas - Screen 3", show_date: "2026-11-11", show_time: "15:30:00", ticket_price: 260.00, screen_name: "Audi 3" },
  { show_id: 9, movie_id: 5, theatre_name: "AGS Cinemas Royal", show_date: "2026-11-11", show_time: "18:00:00", ticket_price: 240.00, screen_name: "Screen 4" },
  { show_id: 10, movie_id: 6, theatre_name: "Cinepolis Mega Mall", show_date: "2026-11-11", show_time: "12:30:00", ticket_price: 320.00, screen_name: "4DX Screen" }
];

let mockBookings = [
  { bookings_id: 101, user_id: 1, show_id: 1, seats: 2, seat_numbers: "C4, C5", total_amount: 500.00, booking_status: "Confirmed", booking_date: "2026-11-06 14:22:00" },
  { bookings_id: 102, user_id: 2, show_id: 2, seats: 3, seat_numbers: "D7, D8, D9", total_amount: 1140.00, booking_status: "Confirmed", booking_date: "2026-11-06 16:45:00" },
  { bookings_id: 103, user_id: 3, show_id: 5, seats: 1, seat_numbers: "B2", total_amount: 420.00, booking_status: "Confirmed", booking_date: "2026-11-07 09:10:00" }
];

// Test MySQL connection from pool
db.getConnection((err, conn) => {
  if (err) {
    console.log(`ℹ️ MySQL connection notice (${err.message}). Dual-mode memory store ready.`);
    isConnectedToMySQL = false;
  } else {
    isConnectedToMySQL = true;
    conn.release();
    initializeDatabaseTables();
  }
});

// Function to auto-create tables and seed data if MySQL is active
function initializeDatabaseTables() {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movies (
      movie_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      language VARCHAR(30) NOT NULL,
      duration INT NOT NULL,
      release_data DATE NOT NULL,
      genre VARCHAR(60) DEFAULT 'Action / Sci-Fi',
      poster_url VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS shows (
      show_id INT AUTO_INCREMENT PRIMARY KEY,
      movie_id INT NOT NULL,
      theatre_name VARCHAR(100) NOT NULL,
      show_date DATE NOT NULL,
      show_time TIME NOT NULL,
      ticket_price DECIMAL(10,2) NOT NULL,
      screen_name VARCHAR(50) DEFAULT 'Screen 1',
      FOREIGN KEY (movie_id) REFERENCES movies (movie_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      bookings_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      show_id INT NOT NULL,
      seats INT NOT NULL,
      seat_numbers VARCHAR(150) DEFAULT '',
      total_amount DECIMAL(10,2) NOT NULL,
      booking_status VARCHAR(30) NOT NULL DEFAULT 'Confirmed',
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
      FOREIGN KEY (show_id) REFERENCES shows (show_id) ON DELETE CASCADE
    );
  `;

  db.query(schemaSQL, (err) => {
    if (err) {
      console.error("Schema creation error:", err.message);
      return;
    }
    console.log("✅ MySQL Tables Verified in movie_booking_db (users, movies, shows, bookings)");

    // Check if movies table has records
    db.query("SELECT COUNT(*) AS count FROM movies", (cntErr, rows) => {
      if (!cntErr && rows[0].count === 0) {
        console.log("ℹ️ Seeding initial demo data to MySQL...");

        // Seed Users
        const userValues = mockUsers.map(u => [u.user_id, u.name, u.email, u.phone]);
        db.query("INSERT INTO users (user_id, name, email, phone) VALUES ?", [userValues], () => {});

        // Seed Movies
        const movieValues = mockMovies.map(m => [m.movie_id, m.title, m.language, m.duration, m.release_data, m.genre, m.poster_url, m.description]);
        db.query("INSERT INTO movies (movie_id, title, language, duration, release_data, genre, poster_url, description) VALUES ?", [movieValues], () => {});

        // Seed Shows
        const showValues = mockShows.map(s => [s.show_id, s.movie_id, s.theatre_name, s.show_date, s.show_time, s.ticket_price, s.screen_name]);
        db.query("INSERT INTO shows (show_id, movie_id, theatre_name, show_date, show_time, ticket_price, screen_name) VALUES ?", [showValues], () => {});

        // Seed Bookings
        const bookingValues = mockBookings.map(b => [b.bookings_id, b.user_id, b.show_id, b.seats, b.seat_numbers, b.total_amount, b.booking_status, b.booking_date]);
        db.query("INSERT INTO bookings (bookings_id, user_id, show_id, seats, seat_numbers, total_amount, booking_status, booking_date) VALUES ?", [bookingValues], () => {
          console.log("✅ Seed data populated successfully in MySQL database!");
        });
      }
    });
  });
}

// Helper to format dates cleanly
function formatDate(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') return dateVal.split('T')[0];
  const d = new Date(dateVal);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

// --------------------------------------------------------------------
// REST API ENDPOINTS
// --------------------------------------------------------------------

// 0. DB STATUS
app.get('/api/db-status', (req, res) => {
  res.json({
    connectedToMySQL: isConnectedToMySQL,
    database: isConnectedToMySQL ? 'movie_booking_db' : 'In-Memory Emulated Database',
    host: 'localhost',
    user: 'root'
  });
});

// 1. GET ALL MOVIES (with optional filter by language or search query)
app.get('/api/movies', (req, res) => {
  const { language, search } = req.query;

  if (isConnectedToMySQL) {
    let sql = 'SELECT * FROM movies WHERE 1=1';
    const params = [];
    if (language && language !== 'All') {
      sql += ' AND LOWER(language) = LOWER(?)';
      params.push(language);
    }
    if (search) {
      sql += ' AND LOWER(title) LIKE LOWER(?)';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY movie_id DESC';

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map(r => ({ ...r, release_data: formatDate(r.release_data) }));
      res.json(formatted);
    });
  } else {
    let results = [...mockMovies];
    if (language && language !== 'All') {
      results = results.filter(m => m.language.toLowerCase() === language.toLowerCase());
    }
    if (search) {
      results = results.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    results.sort((a, b) => b.movie_id - a.movie_id);
    res.json(results);
  }
});

// 2. GET SINGLE MOVIE WITH ITS SHOWS
app.get('/api/movies/:id', (req, res) => {
  const movieId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    db.query('SELECT * FROM movies WHERE movie_id = ?', [movieId], (err, movieRows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (movieRows.length === 0) return res.status(404).json({ error: 'Movie not found' });

      const movie = { ...movieRows[0], release_data: formatDate(movieRows[0].release_data) };
      db.query('SELECT * FROM shows WHERE movie_id = ? ORDER BY show_date, show_time', [movieId], (sErr, showRows) => {
        if (sErr) return res.status(500).json({ error: sErr.message });
        const shows = showRows.map(s => ({ ...s, show_date: formatDate(s.show_date) }));
        res.json({ movie, shows });
      });
    });
  } else {
    const movie = mockMovies.find(m => m.movie_id === movieId);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    const shows = mockShows
      .filter(s => s.movie_id === movieId)
      .sort((a, b) => a.show_date.localeCompare(b.show_date) || a.show_time.localeCompare(b.show_time));
    res.json({ movie, shows });
  }
});

// 3. CREATE NEW MOVIE (TABLE 2: movies)
app.post('/api/movies', (req, res) => {
  const { title, language, duration, release_data, genre, poster_url, description } = req.body;

  if (!title || !language || !duration || !release_data) {
    return res.status(400).json({ error: 'Required fields: title, language, duration, release_data' });
  }

  const durationNum = parseInt(duration);
  const cleanPoster = poster_url && poster_url.trim() !== ''
    ? poster_url.trim()
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
  const cleanGenre = genre || 'Feature Film';
  const cleanDesc = description || `${title} in theaters now.`;

  if (isConnectedToMySQL) {
    const sql = 'INSERT INTO movies (title, language, duration, release_data, genre, poster_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [title, language, durationNum, release_data, cleanGenre, cleanPoster, cleanDesc], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'Movie added successfully!',
        movie_id: result.insertId,
        movie: {
          movie_id: result.insertId,
          title,
          language,
          duration: durationNum,
          release_data,
          genre: cleanGenre,
          poster_url: cleanPoster,
          description: cleanDesc
        }
      });
    });
  } else {
    const nextId = mockMovies.length > 0 ? Math.max(...mockMovies.map(m => m.movie_id)) + 1 : 1;
    const newMovie = {
      movie_id: nextId,
      title,
      language,
      duration: durationNum,
      release_data,
      genre: cleanGenre,
      poster_url: cleanPoster,
      description: cleanDesc
    };
    mockMovies.push(newMovie);
    res.status(201).json({ message: 'Movie added successfully!', movie_id: nextId, movie: newMovie });
  }
});

// 4. UPDATE MOVIE
app.put('/api/movies/:id', (req, res) => {
  const movieId = parseInt(req.params.id);
  const { title, language, duration, release_data, genre, poster_url, description } = req.body;

  if (!title || !language || !duration || !release_data) {
    return res.status(400).json({ error: 'Required fields: title, language, duration, release_data' });
  }

  const durationNum = parseInt(duration);

  if (isConnectedToMySQL) {
    const sql = 'UPDATE movies SET title=?, language=?, duration=?, release_data=?, genre=?, poster_url=?, description=? WHERE movie_id=?';
    db.query(sql, [title, language, durationNum, release_data, genre, poster_url, description, movieId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Movie not found' });
      res.json({ message: 'Movie updated successfully!' });
    });
  } else {
    const idx = mockMovies.findIndex(m => m.movie_id === movieId);
    if (idx === -1) return res.status(404).json({ error: 'Movie not found' });
    mockMovies[idx] = {
      ...mockMovies[idx],
      title,
      language,
      duration: durationNum,
      release_data,
      genre: genre || mockMovies[idx].genre,
      poster_url: poster_url || mockMovies[idx].poster_url,
      description: description || mockMovies[idx].description
    };
    res.json({ message: 'Movie updated successfully!' });
  }
});

// 5. DELETE MOVIE
app.delete('/api/movies/:id', (req, res) => {
  const movieId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    db.query('DELETE FROM movies WHERE movie_id = ?', [movieId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Movie not found' });
      res.json({ message: 'Movie and associated shows deleted successfully!' });
    });
  } else {
    const initialLen = mockMovies.length;
    mockMovies = mockMovies.filter(m => m.movie_id !== movieId);
    if (mockMovies.length === initialLen) return res.status(404).json({ error: 'Movie not found' });
    mockShows = mockShows.filter(s => s.movie_id !== movieId);
    res.json({ message: 'Movie and associated shows deleted successfully!' });
  }
});

// 6. GET ALL SHOWS (TABLE 3: shows) with Movie details
app.get('/api/shows', (req, res) => {
  const { movie_id, theatre_name, date } = req.query;

  if (isConnectedToMySQL) {
    let sql = `
      SELECT s.*, m.title AS movie_title, m.language AS movie_language, m.duration AS movie_duration, m.poster_url
      FROM shows s
      JOIN movies m ON s.movie_id = m.movie_id
      WHERE 1=1
    `;
    const params = [];
    if (movie_id) {
      sql += ' AND s.movie_id = ?';
      params.push(parseInt(movie_id));
    }
    if (theatre_name) {
      sql += ' AND LOWER(s.theatre_name) LIKE LOWER(?)';
      params.push(`%${theatre_name}%`);
    }
    if (date) {
      sql += ' AND s.show_date = ?';
      params.push(date);
    }
    sql += ' ORDER BY s.show_date ASC, s.show_time ASC';

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map(r => ({ ...r, show_date: formatDate(r.show_date) }));
      res.json(formatted);
    });
  } else {
    let results = mockShows.map(s => {
      const movie = mockMovies.find(m => m.movie_id === s.movie_id) || {};
      return {
        ...s,
        movie_title: movie.title || 'Unknown',
        movie_language: movie.language || '',
        movie_duration: movie.duration || 0,
        poster_url: movie.poster_url || ''
      };
    });

    if (movie_id) {
      results = results.filter(s => s.movie_id === parseInt(movie_id));
    }
    if (theatre_name) {
      results = results.filter(s => s.theatre_name.toLowerCase().includes(theatre_name.toLowerCase()));
    }
    if (date) {
      results = results.filter(s => s.show_date === date);
    }

    results.sort((a, b) => a.show_date.localeCompare(b.show_date) || a.show_time.localeCompare(b.show_time));
    res.json(results);
  }
});

// 7. GET SINGLE SHOW
app.get('/api/shows/:id', (req, res) => {
  const showId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    const sql = `
      SELECT s.*, m.title AS movie_title, m.language AS movie_language, m.duration AS movie_duration, m.poster_url
      FROM shows s
      JOIN movies m ON s.movie_id = m.movie_id
      WHERE s.show_id = ?
    `;
    db.query(sql, [showId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0) return res.status(404).json({ error: 'Show not found' });
      res.json({ ...rows[0], show_date: formatDate(rows[0].show_date) });
    });
  } else {
    const show = mockShows.find(s => s.show_id === showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });
    const movie = mockMovies.find(m => m.movie_id === show.movie_id) || {};
    res.json({
      ...show,
      movie_title: movie.title || 'Unknown',
      movie_language: movie.language || '',
      movie_duration: movie.duration || 0,
      poster_url: movie.poster_url || ''
    });
  }
});

// 8. CREATE SHOW (TABLE 3: shows)
app.post('/api/shows', (req, res) => {
  const { movie_id, theatre_name, show_date, show_time, ticket_price, screen_name } = req.body;

  if (!movie_id || !theatre_name || !show_date || !show_time || !ticket_price) {
    return res.status(400).json({ error: 'Required fields: movie_id, theatre_name, show_date, show_time, ticket_price' });
  }

  const movieIdNum = parseInt(movie_id);
  const priceNum = parseFloat(ticket_price);
  const screen = screen_name || 'Standard Screen';

  if (isConnectedToMySQL) {
    const sql = 'INSERT INTO shows (movie_id, theatre_name, show_date, show_time, ticket_price, screen_name) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [movieIdNum, theatre_name, show_date, show_time, priceNum, screen], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Show scheduled successfully!', show_id: result.insertId });
    });
  } else {
    const nextId = mockShows.length > 0 ? Math.max(...mockShows.map(s => s.show_id)) + 1 : 1;
    const newShow = {
      show_id: nextId,
      movie_id: movieIdNum,
      theatre_name,
      show_date,
      show_time,
      ticket_price: priceNum,
      screen_name: screen
    };
    mockShows.push(newShow);
    res.status(201).json({ message: 'Show scheduled successfully!', show_id: nextId, show: newShow });
  }
});

// 9. UPDATE SHOW
app.put('/api/shows/:id', (req, res) => {
  const showId = parseInt(req.params.id);
  const { movie_id, theatre_name, show_date, show_time, ticket_price, screen_name } = req.body;

  if (!movie_id || !theatre_name || !show_date || !show_time || !ticket_price) {
    return res.status(400).json({ error: 'Required fields: movie_id, theatre_name, show_date, show_time, ticket_price' });
  }

  const movieIdNum = parseInt(movie_id);
  const priceNum = parseFloat(ticket_price);

  if (isConnectedToMySQL) {
    const sql = 'UPDATE shows SET movie_id=?, theatre_name=?, show_date=?, show_time=?, ticket_price=?, screen_name=? WHERE show_id=?';
    db.query(sql, [movieIdNum, theatre_name, show_date, show_time, priceNum, screen_name, showId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Show not found' });
      res.json({ message: 'Show updated successfully!' });
    });
  } else {
    const idx = mockShows.findIndex(s => s.show_id === showId);
    if (idx === -1) return res.status(404).json({ error: 'Show not found' });
    mockShows[idx] = {
      ...mockShows[idx],
      movie_id: movieIdNum,
      theatre_name,
      show_date,
      show_time,
      ticket_price: priceNum,
      screen_name: screen_name || mockShows[idx].screen_name
    };
    res.json({ message: 'Show updated successfully!' });
  }
});

// 10. DELETE SHOW
app.delete('/api/shows/:id', (req, res) => {
  const showId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    db.query('DELETE FROM shows WHERE show_id = ?', [showId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Show not found' });
      res.json({ message: 'Show deleted successfully!' });
    });
  } else {
    const initialLen = mockShows.length;
    mockShows = mockShows.filter(s => s.show_id !== showId);
    if (mockShows.length === initialLen) return res.status(404).json({ error: 'Show not found' });
    mockBookings = mockBookings.filter(b => b.show_id !== showId);
    res.json({ message: 'Show deleted successfully!' });
  }
});

// 11. GET OCCUPIED SEATS FOR A SHOW
app.get('/api/shows/:id/booked-seats', (req, res) => {
  const showId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    const sql = "SELECT seat_numbers FROM bookings WHERE show_id = ? AND booking_status != 'Cancelled'";
    db.query(sql, [showId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      let occupiedSeats = [];
      rows.forEach(r => {
        if (r.seat_numbers) {
          const seats = r.seat_numbers.split(',').map(s => s.trim()).filter(Boolean);
          occupiedSeats.push(...seats);
        }
      });
      res.json({ show_id: showId, occupied_seats: [...new Set(occupiedSeats)] });
    });
  } else {
    let occupiedSeats = [];
    mockBookings
      .filter(b => b.show_id === showId && b.booking_status !== 'Cancelled')
      .forEach(b => {
        if (b.seat_numbers) {
          const seats = b.seat_numbers.split(',').map(s => s.trim()).filter(Boolean);
          occupiedSeats.push(...seats);
        }
      });
    res.json({ show_id: showId, occupied_seats: [...new Set(occupiedSeats)] });
  }
});

// 12. GET ALL BOOKINGS (TABLE 4: bookings)
app.get('/api/bookings', (req, res) => {
  const { status, email, search } = req.query;

  if (isConnectedToMySQL) {
    let sql = `
      SELECT b.*, 
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             s.theatre_name, s.show_date, s.show_time, s.ticket_price, s.screen_name,
             m.title AS movie_title, m.language AS movie_language, m.poster_url
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN shows s ON b.show_id = s.show_id
      JOIN movies m ON s.movie_id = m.movie_id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'All') {
      sql += ' AND b.booking_status = ?';
      params.push(status);
    }
    if (email) {
      sql += ' AND LOWER(u.email) = LOWER(?)';
      params.push(email);
    }
    if (search) {
      sql += ' AND (LOWER(m.title) LIKE LOWER(?) OR LOWER(u.name) LIKE LOWER(?) OR CAST(b.bookings_id AS CHAR) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY b.bookings_id DESC';

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map(r => ({
        ...r,
        show_date: formatDate(r.show_date),
        booking_date: r.booking_date ? new Date(r.booking_date).toLocaleString() : ''
      }));
      res.json(formatted);
    });
  } else {
    let results = mockBookings.map(b => {
      const user = mockUsers.find(u => u.user_id === b.user_id) || {};
      const show = mockShows.find(s => s.show_id === b.show_id) || {};
      const movie = mockMovies.find(m => m.movie_id === show.movie_id) || {};
      return {
        ...b,
        user_name: user.name || 'Customer',
        user_email: user.email || '',
        user_phone: user.phone || '',
        theatre_name: show.theatre_name || 'Theater',
        show_date: show.show_date || '',
        show_time: show.show_time || '',
        ticket_price: show.ticket_price || 0,
        screen_name: show.screen_name || 'Screen 1',
        movie_title: movie.title || 'Movie',
        movie_language: movie.language || '',
        poster_url: movie.poster_url || ''
      };
    });

    if (status && status !== 'All') {
      results = results.filter(b => b.booking_status.toLowerCase() === status.toLowerCase());
    }
    if (email) {
      results = results.filter(b => b.user_email.toLowerCase() === email.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(b =>
        b.movie_title.toLowerCase().includes(s) ||
        b.user_name.toLowerCase().includes(s) ||
        String(b.bookings_id).includes(s)
      );
    }
    results.sort((a, b) => b.bookings_id - a.bookings_id);
    res.json(results);
  }
});

// 13. CREATE BOOKING (TABLE 4: bookings_id, user_id, seats, total_amount, booking_status)
app.post('/api/bookings', (req, res) => {
  const { user_name, user_email, user_phone, user_id, show_id, seats, seat_numbers, total_amount } = req.body;

  if ((!user_name && !user_id) || !show_id || !seats || !total_amount) {
    return res.status(400).json({ error: 'Please provide user details, show, seat count, and total amount.' });
  }

  const showIdNum = parseInt(show_id);
  const seatsNum = parseInt(seats);
  const totalAmountNum = parseFloat(total_amount);
  const seatNumbersStr = Array.isArray(seat_numbers) ? seat_numbers.join(', ') : (seat_numbers || '');

  if (isConnectedToMySQL) {
    const insertBookingRecord = (targetUserId) => {
      const sql = `
        INSERT INTO bookings (user_id, show_id, seats, seat_numbers, total_amount, booking_status, booking_date)
        VALUES (?, ?, ?, ?, ?, 'Confirmed', NOW())
      `;
      db.query(sql, [targetUserId, showIdNum, seatsNum, seatNumbersStr, totalAmountNum], (bErr, bResult) => {
        if (bErr) return res.status(500).json({ error: bErr.message });
        res.status(201).json({
          message: 'Tickets Booked Successfully!',
          bookings_id: bResult.insertId,
          user_id: targetUserId,
          seats: seatsNum,
          seat_numbers: seatNumbersStr,
          total_amount: totalAmountNum,
          booking_status: 'Confirmed'
        });
      });
    };

    if (user_id) {
      const uIdNum = parseInt(user_id);
      db.query('SELECT user_id FROM users WHERE user_id = ?', [uIdNum], (chkErr, chkRows) => {
        if (!chkErr && chkRows.length > 0) {
          insertBookingRecord(uIdNum);
        } else {
          db.query(
            'INSERT INTO users (user_id, name, email, phone) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
            [uIdNum, user_name || `Customer ${uIdNum}`, user_email || `customer${uIdNum}@example.com`, user_phone || ''],
            (insErr) => {
              if (insErr) return res.status(500).json({ error: insErr.message });
              insertBookingRecord(uIdNum);
            }
          );
        }
      });
    } else {
      const safeEmail = (user_email || `customer_${Date.now()}@example.com`).trim();
      const safeName = (user_name || 'Customer').trim();
      const safePhone = (user_phone || '').trim();

      db.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)', [safeEmail], (uErr, uRows) => {
        if (uErr) return res.status(500).json({ error: uErr.message });

        if (uRows.length > 0) {
          insertBookingRecord(uRows[0].user_id);
        } else {
          db.query(
            'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
            [safeName, safeEmail, safePhone],
            (insErr, insResult) => {
              if (insErr) return res.status(500).json({ error: insErr.message });
              insertBookingRecord(insResult.insertId);
            }
          );
        }
      });
    }
  } else {
    // In-memory logic
    let user = mockUsers.find(u => u.email.toLowerCase() === (user_email || '').trim().toLowerCase());
    let userId;
    if (user) {
      userId = user.user_id;
    } else {
      userId = user_id ? parseInt(user_id) : (mockUsers.length > 0 ? Math.max(...mockUsers.map(u => u.user_id)) + 1 : 1);
      user = { user_id: userId, name: user_name ? user_name.trim() : `Customer ${userId}`, email: user_email ? user_email.trim() : `user${userId}@example.com`, phone: user_phone ? user_phone.trim() : '' };
      mockUsers.push(user);
    }

    const nextBookingId = mockBookings.length > 0 ? Math.max(...mockBookings.map(b => b.bookings_id)) + 1 : 101;
    const newBooking = {
      bookings_id: nextBookingId,
      user_id: userId,
      show_id: showIdNum,
      seats: seatsNum,
      seat_numbers: seatNumbersStr,
      total_amount: totalAmountNum,
      booking_status: 'Confirmed',
      booking_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    mockBookings.push(newBooking);

    res.status(201).json({
      message: 'Tickets Booked Successfully!',
      bookings_id: nextBookingId,
      user_id: userId,
      seats: seatsNum,
      seat_numbers: seatNumbersStr,
      total_amount: totalAmountNum,
      booking_status: 'Confirmed'
    });
  }
});

// 14. CANCEL BOOKING (Update booking_status)
app.patch('/api/bookings/:id/cancel', (req, res) => {
  const bookingId = parseInt(req.params.id);

  if (isConnectedToMySQL) {
    db.query("UPDATE bookings SET booking_status = 'Cancelled' WHERE bookings_id = ?", [bookingId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
      res.json({ message: 'Booking has been successfully cancelled.' });
    });
  } else {
    const booking = mockBookings.find(b => b.bookings_id === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.booking_status = 'Cancelled';
    res.json({ message: 'Booking has been successfully cancelled.' });
  }
});

// 15. DASHBOARD STATS
app.get('/api/stats', (req, res) => {
  if (isConnectedToMySQL) {
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) FROM movies) AS total_movies,
        (SELECT COUNT(*) FROM shows) AS total_shows,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE booking_status = 'Confirmed') AS total_revenue,
        (SELECT COUNT(*) FROM users) AS total_customers
    `;
    db.query(statsSql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows[0]);
    });
  } else {
    const totalRev = mockBookings
      .filter(b => b.booking_status === 'Confirmed')
      .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
    res.json({
      total_movies: mockMovies.length,
      total_shows: mockShows.length,
      total_bookings: mockBookings.length,
      total_revenue: totalRev,
      total_customers: mockUsers.length
    });
  }
});

// --------------------------------------------------------------------
// START EXPRESS SERVER
// --------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🎬 ONLINE MOVIE TICKET BOOKING SYSTEM RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🗄️ Database: Connected to MySQL (movie_booking_db)`);
  console.log(`🔑 MySQL User: root | Password: root`);
  console.log(`========================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const altPort = 3001;
    console.log(`⚠️ Port ${PORT} occupied. Retrying on port ${altPort}...`);
    app.listen(altPort, () => {
      console.log(`🎬 Online Movie Ticket Booking System running on http://localhost:${altPort}`);
    });
  } else {
    console.error("Server error:", err);
  }
});
