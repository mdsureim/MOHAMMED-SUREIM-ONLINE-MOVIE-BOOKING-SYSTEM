// ====================================================================
// ONLINE MOVIE TICKET BOOKING SYSTEM - CUSTOMER PORTAL SCRIPT
// ====================================================================

let allMovies = [];
let selectedMovie = null;
let selectedShow = null;
let selectedSeats = [];
let currentFilterLang = 'All';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  fetchDbStatus();
  fetchStats();
  fetchMovies();
  setupEventListeners();
});

// 1. Fetch DB Status for Navbar Pill
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

// 2. Fetch Hero Statistics
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    const statMovies = document.getElementById('stat-movies');
    const statShows = document.getElementById('stat-shows');
    const statBookings = document.getElementById('stat-bookings');
    if (statMovies) statMovies.textContent = data.total_movies || 0;
    if (statShows) statShows.textContent = data.total_shows || 0;
    if (statBookings) statBookings.textContent = data.total_bookings || 0;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// 3. Fetch Movies
async function fetchMovies(search = '') {
  try {
    let url = '/api/movies';
    const params = new URLSearchParams();
    if (currentFilterLang && currentFilterLang !== 'All') {
      params.append('language', currentFilterLang);
    }
    if (search) {
      params.append('search', search);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    allMovies = await res.json();
    renderMovies(allMovies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    document.getElementById('movies-grid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        Failed to load movies. Please check if the server is running.
      </div>
    `;
  }
}

// 4. Render Movies Grid
function renderMovies(movies) {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <h3>No movies found</h3>
        <p>Try clearing filters or search terms.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = movies.map(movie => {
    // Format duration e.g. 148 mins -> 2h 28m
    const hours = Math.floor(movie.duration / 60);
    const mins = movie.duration % 60;
    const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return `
      <div class="movie-card" data-id="${movie.movie_id}">
        <div class="poster-wrapper">
          <img src="${movie.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'}" 
               alt="${movie.title}" 
               class="movie-poster"
               onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'" />
          <div class="poster-badges">
            <span class="badge-lang">${movie.language}</span>
            <span class="badge-duration">${durationText}</span>
          </div>
        </div>
        <div class="movie-content">
          <div class="movie-genre">${movie.genre || 'Action / Drama'}</div>
          <h3 class="movie-title">${movie.title}</h3>
          <div class="movie-meta">
            <span>📅 Rel: ${movie.release_data || 'Available Now'}</span>
            <span>⏱️ ${movie.duration} mins</span>
          </div>
          <p class="movie-desc">${movie.description || 'Watch now in nearest theaters. Experience supreme Dolby sound & 4K visuals.'}</p>
          <button class="btn-book" onclick="openBookingModal(${movie.movie_id})">
            <span>🎟️ Book Tickets</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Open Booking Modal & Fetch Shows
async function openBookingModal(movieId) {
  try {
    const res = await fetch(`/api/movies/${movieId}`);
    const data = await res.json();
    selectedMovie = data.movie;
    selectedShow = null;
    selectedSeats = [];

    document.getElementById('booking-movie-title').textContent = selectedMovie.title;
    document.getElementById('booking-movie-info').textContent = `${selectedMovie.language} • ${selectedMovie.duration} mins • ${selectedMovie.genre || 'Cinematic Release'}`;

    renderShowsList(data.shows);

    // Hide seat selection and checkout until a show is clicked
    document.getElementById('seat-selection-container').style.display = 'none';
    document.getElementById('checkout-container').style.display = 'none';

    document.getElementById('booking-modal').classList.add('active');
  } catch (err) {
    console.error('Error opening booking modal:', err);
    alert('Unable to load shows for this movie.');
  }
}

// 6. Render Shows grouped by Theater
function renderShowsList(shows) {
  const container = document.getElementById('shows-container');
  if (!shows || shows.length === 0) {
    container.innerHTML = `
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 2rem; text-align: center; color: var(--text-muted);">
        <p>No active shows scheduled for this movie yet.</p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Admins can add shows in the Admin Portal.</p>
      </div>
    `;
    return;
  }

  // Group shows by theatre_name
  const grouped = {};
  shows.forEach(show => {
    if (!grouped[show.theatre_name]) grouped[show.theatre_name] = [];
    grouped[show.theatre_name].push(show);
  });

  container.innerHTML = Object.keys(grouped).map(theatre => {
    const theatreShows = grouped[theatre];
    return `
      <div class="show-theatre-card">
        <div class="theatre-header">
          <div class="theatre-name">🏛️ ${theatre}</div>
          <span class="theatre-screen">${theatreShows[0].screen_name || 'Screen 1'}</span>
        </div>
        <div class="timing-buttons">
          ${theatreShows.map(s => {
            const timeFormatted = formatTime(s.show_time);
            return `
              <button type="button" 
                      class="timing-btn ${selectedShow && selectedShow.show_id === s.show_id ? 'selected' : ''}" 
                      data-show-id="${s.show_id}"
                      onclick="selectShowTiming(${s.show_id}, this)">
                <span class="timing-time">${timeFormatted}</span>
                <span class="timing-price">₹${parseFloat(s.ticket_price).toFixed(2)}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${s.show_date}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// 7. Select a Show Timing and Load Seat Map
async function selectShowTiming(showId, btnElement) {
  try {
    // 1. Immediately highlight the selected button safely
    document.querySelectorAll('.timing-btn').forEach(btn => btn.classList.remove('selected'));
    if (btnElement) {
      btnElement.classList.add('selected');
    } else {
      const match = document.querySelector(`.timing-btn[data-show-id="${showId}"]`);
      if (match) match.classList.add('selected');
    }

    // 2. Fetch show details
    const res = await fetch(`/api/shows/${showId}`);
    if (!res.ok) throw new Error('Show details not found');
    selectedShow = await res.json();
    selectedSeats = [];

    // 3. Fetch occupied seats for this show
    const seatsRes = await fetch(`/api/shows/${showId}/booked-seats`);
    const seatsData = await seatsRes.json();
    const occupiedSeats = seatsData.occupied_seats || [];

    // 4. Render interactive seat map
    renderSeatMap(occupiedSeats);

    // 5. Show seat selection and checkout panel
    document.getElementById('seat-selection-container').style.display = 'block';
    document.getElementById('checkout-container').style.display = 'block';

    updateBookingSummary();
    
    // 6. Smooth scroll down to seat map
    document.getElementById('seat-selection-container').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Error selecting show timing:', err);
    alert('Unable to load seat map for this show: ' + err.message);
  }
}

// 8. Render Interactive Seat Map (Rows A to F, Seats 1 to 10)
function renderSeatMap(occupiedSeats) {
  const seatGrid = document.getElementById('seat-grid');
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = 10;

  seatGrid.innerHTML = rows.map(row => {
    let seatsHtml = '';
    for (let c = 1; c <= cols; c++) {
      const seatCode = `${row}${c}`;
      const isBooked = occupiedSeats.includes(seatCode);
      const isSelected = selectedSeats.includes(seatCode);

      // Add aisle gap after seat 5
      const aisle = c === 5 ? '<div class="seat-aisle"></div>' : '';

      seatsHtml += `
        <div class="seat-item ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}" 
             data-seat="${seatCode}"
             ${isBooked ? 'title="Already Booked"' : `onclick="toggleSeatSelection('${seatCode}')"`}>
          ${c}
        </div>
        ${aisle}
      `;
    }

    return `
      <div class="seat-row">
        <div class="row-label">${row}</div>
        ${seatsHtml}
        <div class="row-label">${row}</div>
      </div>
    `;
  }).join('');
}

// 9. Toggle Seat Selection
function toggleSeatSelection(seatCode) {
  const index = selectedSeats.indexOf(seatCode);
  if (index > -1) {
    selectedSeats.splice(index, 1);
  } else {
    // Limit to max 8 tickets per booking
    if (selectedSeats.length >= 8) {
      alert('You can select a maximum of 8 seats per booking.');
      return;
    }
    selectedSeats.push(seatCode);
  }

  // Update visual state of seat
  const seatEl = document.querySelector(`.seat-item[data-seat="${seatCode}"]`);
  if (seatEl) {
    seatEl.classList.toggle('selected');
  }

  updateBookingSummary();
}

// 10. Update Summary & Total Amount
function updateBookingSummary() {
  const count = selectedSeats.length;
  const price = selectedShow ? parseFloat(selectedShow.ticket_price) : 0;
  const subtotal = count * price;
  const fee = count > 0 ? 30.00 : 0.00; // Convenience fee
  const grandTotal = subtotal + fee;

  document.getElementById('summary-seat-count').textContent = count;
  document.getElementById('summary-seats-list').textContent = count > 0 ? selectedSeats.join(', ') : 'None';
  document.getElementById('summary-price-per-seat').textContent = `₹${price.toFixed(2)}`;
  document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('summary-fee').textContent = `₹${fee.toFixed(2)}`;
  document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;

  const bookBtn = document.getElementById('btn-confirm-booking');
  if (bookBtn) {
    bookBtn.disabled = count === 0;
    bookBtn.style.opacity = count === 0 ? '0.5' : '1';
    bookBtn.textContent = count > 0 ? `Pay & Confirm ₹${grandTotal.toFixed(2)}` : 'Select Seats to Book';
  }
}

// 11. Submit Booking
async function submitBooking(event) {
  event.preventDefault();

  if (!selectedShow) {
    alert('Please select a show timing first.');
    return;
  }

  if (selectedSeats.length === 0) {
    alert('Please select at least one seat.');
    return;
  }

  const nameInput = document.getElementById('customer-name');
  const emailInput = document.getElementById('customer-email');
  const phoneInput = document.getElementById('customer-phone');

  const customerName = nameInput.value.trim();
  const customerEmail = emailInput.value.trim();
  const customerPhone = phoneInput.value.trim();

  if (!customerName || !customerEmail) {
    alert('Please enter your full name and email address.');
    return;
  }

  const count = selectedSeats.length;
  const price = parseFloat(selectedShow.ticket_price);
  const totalAmount = (count * price) + 30.00;

  const payload = {
    user_name: customerName,
    user_email: customerEmail,
    user_phone: customerPhone,
    show_id: selectedShow.show_id,
    seats: count,
    seat_numbers: selectedSeats,
    total_amount: totalAmount
  };

  const submitBtn = document.getElementById('btn-confirm-booking');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing Booking...';

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to place booking.');
    }

    // Close booking modal
    closeBookingModal();

    // Show E-Ticket Receipt Modal
    showTicketReceipt({
      bookings_id: result.bookings_id,
      customer_name: customerName,
      customer_email: customerEmail,
      movie_title: selectedMovie.title,
      theatre_name: selectedShow.theatre_name,
      show_date: selectedShow.show_date,
      show_time: formatTime(selectedShow.show_time),
      screen_name: selectedShow.screen_name || 'Audi 1',
      seats: count,
      seat_numbers: selectedSeats.join(', '),
      total_amount: totalAmount,
      booking_status: 'Confirmed'
    });

    // Refresh stats
    fetchStats();
  } catch (err) {
    console.error('Booking submission error:', err);
    alert('Error placing booking: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book Tickets';
  }
}

// 12. Show Digital E-Ticket Receipt Modal
function showTicketReceipt(ticket) {
  document.getElementById('ticket-id').textContent = `#BK-${ticket.bookings_id}`;
  document.getElementById('ticket-movie').textContent = ticket.movie_title;
  document.getElementById('ticket-theatre').textContent = ticket.theatre_name;
  document.getElementById('ticket-screen').textContent = ticket.screen_name;
  document.getElementById('ticket-date').textContent = ticket.show_date;
  document.getElementById('ticket-time').textContent = ticket.show_time;
  document.getElementById('ticket-seats').textContent = `${ticket.seat_numbers} (${ticket.seats} Seat${ticket.seats > 1 ? 's' : ''})`;
  document.getElementById('ticket-amount').textContent = `₹${parseFloat(ticket.total_amount).toFixed(2)}`;
  document.getElementById('ticket-customer').textContent = `${ticket.customer_name} (${ticket.customer_email})`;

  document.getElementById('ticket-modal').classList.add('active');
}

// 13. Event Listeners Setup
function setupEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById('search-movie');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchMovies(e.target.value.trim());
      }, 300);
    });
  }

  // Language filter pills
  const filterPills = document.querySelectorAll('.filter-pills .pill-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilterLang = pill.getAttribute('data-lang');
      fetchMovies(searchInput ? searchInput.value.trim() : '');
    });
  });

  // Booking Form Submit
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', submitBooking);
  }
}

// Modal helper closures
function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('active');
}

function closeTicketModal() {
  document.getElementById('ticket-modal').classList.remove('active');
}

function printTicket() {
  window.print();
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
