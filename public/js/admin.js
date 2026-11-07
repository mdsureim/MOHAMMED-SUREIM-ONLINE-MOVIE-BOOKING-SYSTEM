// ====================================================================
// ONLINE MOVIE TICKET BOOKING SYSTEM - ADMIN & THEATER MANAGEMENT SCRIPT
// ====================================================================

let adminMovies = [];
let adminShows = [];
let adminBookings = [];
let currentTab = 'movies';

document.addEventListener('DOMContentLoaded', () => {
  fetchDbStatus();
  fetchAdminStats();
  loadTabData('movies');
  setupAdminListeners();
});

// Fetch DB Status
async function fetchDbStatus() {
  try {
    const res = await fetch('/api/db-status');
    const data = await res.json();
    const pill = document.getElementById('db-status-pill');
    if (pill) {
      if (data.connectedToMySQL) {
        pill.className = 'db-pill';
        pill.innerHTML = `<span class="db-dot"></span> MySQL Connected (${data.database})`;
      } else {
        pill.className = 'db-pill fallback';
        pill.innerHTML = `<span class="db-dot"></span> In-Memory Dual-Store Active`;
      }
    }
  } catch (err) {
    console.error('Error fetching DB status:', err);
  }
}

// Fetch Admin Stats
async function fetchAdminStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('stat-total-movies').textContent = data.total_movies || 0;
    document.getElementById('stat-total-shows').textContent = data.total_shows || 0;
    document.getElementById('stat-total-bookings').textContent = data.total_bookings || 0;
    document.getElementById('stat-total-revenue').textContent = `₹${parseFloat(data.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }
}

// Switch Tabs
function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(panel => panel.style.display = 'none');
  document.getElementById(`panel-${tabName}`).style.display = 'block';

  loadTabData(tabName);
}

// Load Tab Data
function loadTabData(tabName) {
  if (tabName === 'movies') fetchAdminMovies();
  else if (tabName === 'shows') fetchAdminShows();
  else if (tabName === 'bookings') fetchAdminBookings();
}

// ====================================================================
// 1. MOVIES CRUD (TABLE 2: movies)
// ====================================================================
async function fetchAdminMovies() {
  try {
    const res = await fetch('/api/movies');
    adminMovies = await res.json();
    renderAdminMoviesTable(adminMovies);
  } catch (err) {
    console.error('Error fetching movies:', err);
  }
}

function renderAdminMoviesTable(movies) {
  const tbody = document.getElementById('admin-movies-tbody');
  if (!tbody) return;

  if (movies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No movies available.</td></tr>`;
    return;
  }

  tbody.innerHTML = movies.map(m => `
    <tr>
      <td><strong>#${m.movie_id}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <img src="${m.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'}" 
               style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;" 
               onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'">
          <div>
            <div style="font-weight: 700; color: #fff;">${m.title}</div>
            <div style="font-size: 0.75rem; color: var(--accent-cyan);">${m.genre || 'Film'}</div>
          </div>
        </div>
      </td>
      <td><span class="badge-lang">${m.language}</span></td>
      <td>${m.duration} mins (${Math.floor(m.duration/60)}h ${m.duration%60}m)</td>
      <td>${m.release_data}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-action" onclick="openEditMovieModal(${m.movie_id})">✏️ Edit</button>
          <button class="btn-action btn-danger" onclick="deleteMovie(${m.movie_id}, '${m.title.replace(/'/g, "\\'")}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddMovieModal() {
  document.getElementById('movie-modal-title').textContent = 'Add New Movie';
  document.getElementById('movie-form').reset();
  document.getElementById('movie-id-input').value = '';
  document.getElementById('movie-modal').classList.add('active');
}

function openEditMovieModal(movieId) {
  const m = adminMovies.find(item => item.movie_id === movieId);
  if (!m) return;

  document.getElementById('movie-modal-title').textContent = 'Edit Movie Details';
  document.getElementById('movie-id-input').value = m.movie_id;
  document.getElementById('movie-title').value = m.title;
  document.getElementById('movie-language').value = m.language;
  document.getElementById('movie-duration').value = m.duration;
  document.getElementById('movie-release-data').value = m.release_data;
  document.getElementById('movie-genre').value = m.genre || '';
  document.getElementById('movie-poster').value = m.poster_url || '';
  document.getElementById('movie-description').value = m.description || '';

  document.getElementById('movie-modal').classList.add('active');
}

function closeMovieModal() {
  document.getElementById('movie-modal').classList.remove('active');
}

async function handleMovieFormSubmit(event) {
  event.preventDefault();

  const movieId = document.getElementById('movie-id-input').value;
  const payload = {
    title: document.getElementById('movie-title').value.trim(),
    language: document.getElementById('movie-language').value.trim(),
    duration: parseInt(document.getElementById('movie-duration').value),
    release_data: document.getElementById('movie-release-data').value,
    genre: document.getElementById('movie-genre').value.trim(),
    poster_url: document.getElementById('movie-poster').value.trim(),
    description: document.getElementById('movie-description').value.trim()
  };

  const isEdit = Boolean(movieId);
  const url = isEdit ? `/api/movies/${movieId}` : '/api/movies';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save movie');

    alert(data.message || 'Movie saved successfully!');
    closeMovieModal();
    fetchAdminMovies();
    fetchAdminStats();
  } catch (err) {
    console.error('Error saving movie:', err);
    alert('Error saving movie: ' + err.message);
  }
}

async function deleteMovie(movieId, title) {
  if (!confirm(`Are you sure you want to delete "${title}"? This will also remove all scheduled shows for this movie.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    alert(data.message);
    fetchAdminMovies();
    fetchAdminStats();
  } catch (err) {
    console.error('Error deleting movie:', err);
    alert('Error deleting movie: ' + err.message);
  }
}

// ====================================================================
// 2. SHOWS & THEATERS CRUD (TABLE 3: shows)
// ====================================================================
async function fetchAdminShows() {
  try {
    const res = await fetch('/api/shows');
    adminShows = await res.json();
    renderAdminShowsTable(adminShows);
  } catch (err) {
    console.error('Error fetching shows:', err);
  }
}

function renderAdminShowsTable(shows) {
  const tbody = document.getElementById('admin-shows-tbody');
  if (!tbody) return;

  if (shows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No shows scheduled.</td></tr>`;
    return;
  }

  tbody.innerHTML = shows.map(s => `
    <tr>
      <td><strong>#${s.show_id}</strong></td>
      <td>
        <div style="font-weight: 700; color: #fff;">${s.movie_title || `Movie ID: ${s.movie_id}`}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${s.movie_language || ''}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${s.theatre_name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${s.screen_name || 'Screen 1'}</div>
      </td>
      <td>📅 ${s.show_date}</td>
      <td>⏰ ${formatTime(s.show_time)}</td>
      <td><span style="font-weight: 700; color: var(--accent-gold);">₹${parseFloat(s.ticket_price).toFixed(2)}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-action" onclick="openEditShowModal(${s.show_id})">✏️ Edit</button>
          <button class="btn-action btn-danger" onclick="deleteShow(${s.show_id})">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function populateMovieDropdown(selectedMovieId = null) {
  const select = document.getElementById('show-movie-id');
  if (!select) return;

  // Make sure adminMovies has data
  if (adminMovies.length === 0) {
    const res = await fetch('/api/movies');
    adminMovies = await res.json();
  }

  select.innerHTML = '<option value="">-- Choose Movie --</option>' + adminMovies.map(m => `
    <option value="${m.movie_id}" ${selectedMovieId && selectedMovieId === m.movie_id ? 'selected' : ''}>
      ${m.title} (${m.language})
    </option>
  `).join('');
}

async function openAddShowModal() {
  document.getElementById('show-modal-title').textContent = 'Schedule New Show';
  document.getElementById('show-form').reset();
  document.getElementById('show-id-input').value = '';
  await populateMovieDropdown();
  document.getElementById('show-modal').classList.add('active');
}

async function openEditShowModal(showId) {
  const s = adminShows.find(item => item.show_id === showId);
  if (!s) return;

  document.getElementById('show-modal-title').textContent = 'Edit Show Schedule';
  document.getElementById('show-id-input').value = s.show_id;
  await populateMovieDropdown(s.movie_id);
  document.getElementById('show-theatre-name').value = s.theatre_name;
  document.getElementById('show-screen-name').value = s.screen_name || 'Screen 1';
  document.getElementById('show-date').value = s.show_date;
  document.getElementById('show-time').value = s.show_time;
  document.getElementById('show-price').value = s.ticket_price;

  document.getElementById('show-modal').classList.add('active');
}

function closeShowModal() {
  document.getElementById('show-modal').classList.remove('active');
}

async function handleShowFormSubmit(event) {
  event.preventDefault();

  const showId = document.getElementById('show-id-input').value;
  const payload = {
    movie_id: parseInt(document.getElementById('show-movie-id').value),
    theatre_name: document.getElementById('show-theatre-name').value.trim(),
    screen_name: document.getElementById('show-screen-name').value.trim(),
    show_date: document.getElementById('show-date').value,
    show_time: document.getElementById('show-time').value,
    ticket_price: parseFloat(document.getElementById('show-price').value)
  };

  const isEdit = Boolean(showId);
  const url = isEdit ? `/api/shows/${showId}` : '/api/shows';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save show');

    alert(data.message || 'Show saved successfully!');
    closeShowModal();
    fetchAdminShows();
    fetchAdminStats();
  } catch (err) {
    console.error('Error saving show:', err);
    alert('Error saving show: ' + err.message);
  }
}

async function deleteShow(showId) {
  if (!confirm(`Are you sure you want to delete Show #${showId}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/shows/${showId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    alert(data.message);
    fetchAdminShows();
    fetchAdminStats();
  } catch (err) {
    console.error('Error deleting show:', err);
    alert('Error deleting show: ' + err.message);
  }
}

// ====================================================================
// 3. BOOKINGS MANAGEMENT (TABLE 4: bookings)
// ====================================================================
async function fetchAdminBookings() {
  try {
    const res = await fetch('/api/bookings');
    adminBookings = await res.json();
    renderAdminBookingsTable(adminBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
  }
}

function renderAdminBookingsTable(bookings) {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No bookings recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const isCancelled = b.booking_status.toLowerCase() === 'cancelled';
    const statusClass = isCancelled ? 'status-badge cancelled' : 'status-badge confirmed';

    return `
      <tr>
        <td><strong>#BK-${b.bookings_id}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${b.user_name || 'Customer'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.user_email || ''}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${b.movie_title || 'Movie'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.theatre_name || ''}</div>
        </td>
        <td>
          <div>${b.show_date}</div>
          <div style="font-size: 0.8rem; color: var(--accent-gold);">${formatTime(b.show_time)}</div>
        </td>
        <td>
          <div>${b.seats} Seat(s)</div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan);">${b.seat_numbers || ''}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--accent-green);">₹${parseFloat(b.total_amount).toFixed(2)}</div>
          <span class="${statusClass}">${b.booking_status}</span>
        </td>
        <td>
          ${!isCancelled ? `
            <button class="btn-action btn-danger" onclick="cancelAdminBooking(${b.bookings_id})">
              Cancel
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: var(--text-muted);">Cancelled</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

async function cancelAdminBooking(bookingId) {
  if (!confirm(`Cancel Booking #BK-${bookingId}?`)) return;

  try {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert(data.message);
    fetchAdminBookings();
    fetchAdminStats();
  } catch (err) {
    alert('Error cancelling booking: ' + err.message);
  }
}

function setupAdminListeners() {
  const movieForm = document.getElementById('movie-form');
  if (movieForm) movieForm.addEventListener('submit', handleMovieFormSubmit);

  const showForm = document.getElementById('show-form');
  if (showForm) showForm.addEventListener('submit', handleShowFormSubmit);
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0]);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
