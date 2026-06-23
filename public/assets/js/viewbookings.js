document.addEventListener('DOMContentLoaded', () => {
    // Guard counsellor page
    AUTH.checkCounsellorAuth();

    const counsellorEmail = localStorage.getItem('counsellorEmail');
    const counsellorName = localStorage.getItem('counsellorName');

    if (counsellorName) {
        const titleEl = document.getElementById('counsellor-title');
        if (titleEl) {
            titleEl.textContent = `${counsellorName}'s Appointments`;
        }
    }

    fetchBookings(counsellorEmail);
});

async function fetchBookings(counsellorEmail) {
    UTILS.showLoading('bookings-container', 'Loading scheduled appointments...');

    try {
        const response = await API.getCounsellorBookings(counsellorEmail);
        
        if (response.success && response.data && response.data.length > 0) {
            displayBookings(response.data);
        } else {
            UTILS.showEmpty('bookings-container', 'No upcoming appointments found.');
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error.message.includes('404') || error.message.includes('No bookings found')) {
            UTILS.showEmpty('bookings-container', 'No upcoming appointments found.');
        } else {
            UTILS.showError('bookings-container', `Failed to load appointments: ${error.message}`);
        }
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookings-container');
    container.innerHTML = `<ul id="bookingList"></ul>`;
    const bookingList = container.querySelector('#bookingList');

    bookings.forEach(booking => {
        const bookingItem = document.createElement('li');
        bookingItem.className = 'booking-item';
        
        // Check if meetingLink exists, otherwise provide a fallback message
        const meetingAction = booking.meetingLink 
            ? `<button class="btn btn-primary" onclick="openMeeting('${booking.meetingLink}')">Join Consultation</button>`
            : `<span class="badge" style="background-color: var(--text-muted); color: white; padding: 6px 12px; border-radius: var(--border-radius-sm); font-size: 13px;">Waiting for Client to start</span>`;

        bookingItem.innerHTML = `
            <div class="booking-header">
                <span class="client-name">${booking.userName || 'Client'}</span>
                <span class="booking-date">${UTILS.formatDate(booking.date)}</span>
            </div>
            <div class="booking-details">
                <p><strong>Scheduled Time:</strong> ${booking.time || 'Not specified'}</p>
                <p><strong>Counselling Type:</strong> ${booking.counsellorType || 'General'}</p>
                ${booking.userId ? `<p style="font-size: 13px; color: var(--text-muted);"><strong>Client Reference:</strong> ${booking.userId}</p>` : ''}
            </div>
            <div style="margin-top: 15px; text-align: right;">
                ${meetingAction}
            </div>
        `;
        bookingList.appendChild(bookingItem);
    });
}

function openMeeting(url) {
    const frameContainer = document.getElementById("meetingFrameContainer");
    const frame = document.getElementById("meetingFrame");
    
    if (frameContainer && frame) {
        frame.src = url;
        frameContainer.style.display = "block";
        
        // Scroll smoothly to the consultation frame
        frameContainer.scrollIntoView({ behavior: 'smooth' });
    }
}
