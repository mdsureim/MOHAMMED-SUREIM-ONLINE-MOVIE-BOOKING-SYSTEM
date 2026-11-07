// ====================================================================
// ONLINE MOVIE TICKET BOOKING SYSTEM - BOOKINGS MANAGEMENT SCRIPT
// ====================================================================

let allBookings = [];
let currentFilterStatus = 'All';

document.addEventListener('DOMContentLoaded', () => {
  fetchDbStatus();
  fetchBookings();
  setupEventListeners();
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

// Fetch all bookings with optional query filters
async function fetchBookings(search = '') {
  try {
    let url = '/api/bookings';
    const params = new URLSearchParams();
    if (currentFilterStatus && currentFilterStatus !== 'All') {
      params.append('status', currentFilterStatus);
    }
    if (search) {
      params.append('search', search);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    allBookings = await res.json();
    renderBookingsTable(allBookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    document.getElementById('bookings-table-body').innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Failed to load bookings from server.
        </td>
      </tr>
    `;
  }
}

// Render Table
function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookings-table-body');
  const countBadge = document.getElementById('bookings-count-badge');

  if (countBadge) countBadge.textContent = `${bookings.length} Record${bookings.length === 1 ? '' : 's'}`;

  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          No bookings found matching the criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const isCancelled = b.booking_status.toLowerCase() === 'cancelled';
    const statusClass = isCancelled ? 'status-badge cancelled' : 'status-badge confirmed';
    const formattedPrice = `₹${parseFloat(b.total_amount).toFixed(2)}`;

    return `
      <tr>
        <td><strong>#BK-${b.bookings_id}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${b.movie_title || 'Movie'}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${b.movie_language || ''}</div>
        </td>
        <td>
          <div>${b.theatre_name || 'Theater'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.screen_name || 'Screen 1'}</div>
        </td>
        <td>
          <div>📅 ${b.show_date}</div>
          <div style="font-size: 0.8rem; color: var(--accent-gold);">⏰ ${formatTime(b.show_time)}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${b.seats} Seat(s)</div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan);">${b.seat_numbers || 'N/A'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #fff;">${b.user_name || 'Customer'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.user_email || ''}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--accent-green);">${formattedPrice}</div>
          <span class="${statusClass}">${b.booking_status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-action" onclick="viewTicketReceipt(${b.bookings_id})" title="View Digital Ticket">
              👁️ View
            </button>
            ${!isCancelled ? `
              <button class="btn-action btn-danger" onclick="cancelBooking(${b.bookings_id})" title="Cancel Booking">
                ❌ Cancel
              </button>
            ` : `
              <span style="font-size: 0.75rem; color: var(--text-muted); align-self: center;">Cancelled</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Cancel Booking
async function cancelBooking(bookingId) {
  if (!confirm(`Are you sure you want to cancel Booking #BK-${bookingId}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to cancel');
    alert(result.message);
    fetchBookings(document.getElementById('search-bookings').value.trim());
  } catch (err) {
    console.error('Cancellation error:', err);
    alert('Error cancelling booking: ' + err.message);
  }
}

// View E-Ticket
function viewTicketReceipt(bookingId) {
  const b = allBookings.find(item => item.bookings_id === bookingId);
  if (!b) return;

  document.getElementById('ticket-id').textContent = `#BK-${b.bookings_id}`;
  document.getElementById('ticket-movie').textContent = b.movie_title;
  document.getElementById('ticket-theatre').textContent = b.theatre_name;
  document.getElementById('ticket-screen').textContent = b.screen_name || 'Screen 1';
  document.getElementById('ticket-date').textContent = b.show_date;
  document.getElementById('ticket-time').textContent = formatTime(b.show_time);
  document.getElementById('ticket-seats').textContent = `${b.seat_numbers || 'N/A'} (${b.seats} Seat${b.seats > 1 ? 's' : ''})`;
  document.getElementById('ticket-amount').textContent = `₹${parseFloat(b.total_amount).toFixed(2)}`;
  document.getElementById('ticket-customer').textContent = `${b.user_name} (${b.user_email})`;

  const statusPill = document.getElementById('ticket-status-badge');
  if (statusPill) {
    statusPill.className = b.booking_status.toLowerCase() === 'cancelled' ? 'status-badge cancelled' : 'status-badge confirmed';
    statusPill.textContent = b.booking_status;
  }

  document.getElementById('ticket-modal').classList.add('active');
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

function setupEventListeners() {
  const searchInput = document.getElementById('search-bookings');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchBookings(e.target.value.trim());
      }, 300);
    });
  }

  const filterPills = document.querySelectorAll('.filter-pills .pill-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilterStatus = pill.getAttribute('data-status');
      fetchBookings(searchInput ? searchInput.value.trim() : '');
    });
  });
}
