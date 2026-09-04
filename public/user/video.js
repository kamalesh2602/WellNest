/**
 * user/video.js
 * Handles user consultation room and Jitsi Meet initialization.
 */

let userId = null;
let userName = null;
let activeBooking = null;
let jitsiApi = null;

document.addEventListener('DOMContentLoaded', () => {
    AUTH.checkUserAuth();
    userId = localStorage.getItem('userId');
    userName = localStorage.getItem('userName');
    
    if (userId) {
        fetchBookings();
    }
});

async function fetchBookings() {
    const meetingInfoDiv = document.getElementById('meeting-info');
    const joinBtn = document.getElementById('join-btn');
    
    if (meetingInfoDiv) {
        UTILS.showLoading('meeting-info', 'Loading appointment details...');
    }

    try {
        const bookings = await API.getUserBookings(userId);

        if (!bookings || bookings.length === 0) {
            if (meetingInfoDiv) UTILS.showEmpty('meeting-info', 'No active consultation bookings found.');
            if (joinBtn) joinBtn.style.display = 'none';
        } else {
            activeBooking = bookings[0];
            displayBooking(activeBooking);
            checkMeetingStart();
            setInterval(checkMeetingStart, 15000);
        }
    } catch (err) {
        console.error('Error fetching bookings:', err);
        if (meetingInfoDiv) UTILS.showError('meeting-info', 'Failed to load consultation details.');
    }
}

function displayBooking(booking) {
    const meetingInfoDiv = document.getElementById('meeting-info');
    if (meetingInfoDiv) {
        meetingInfoDiv.innerHTML = `
            <p><strong>Counsellor:</strong> ${booking.counsellorName} (${booking.counsellorType || 'General'})</p>
            <p><strong>Date:</strong> ${UTILS.formatDate(booking.date)}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
        `;
    }
}

function checkMeetingStart() {
    if (!activeBooking) return;

    const joinBtn = document.getElementById('join-btn');
    const timeMessage = document.getElementById('time-message');
    if (!joinBtn || !timeMessage) return;

    // Parse meeting time
    let meetingTime = new Date(`${activeBooking.date}T${activeBooking.time}:00`);
    if (isNaN(meetingTime.getTime())) {
        meetingTime = new Date(`${activeBooking.date} ${activeBooking.time}`);
    }

    if (isNaN(meetingTime.getTime())) {
        timeMessage.textContent = 'Invalid meeting schedule.';
        joinBtn.disabled = true;
        return;
    }

    const now = new Date();
    const diffMinutes = (meetingTime - now) / (1000 * 60);

    if (diffMinutes <= 5 && diffMinutes >= -30) {
        timeMessage.textContent = 'Meeting is ready! Click below to join.';
        joinBtn.disabled = false;
    } else if (diffMinutes < -30) {
        timeMessage.textContent = 'This consultation session has ended.';
        joinBtn.disabled = true;
    } else {
        const minutesLeft = Math.ceil(diffMinutes);
        timeMessage.textContent = `Meeting will start in ${minutesLeft} minute(s).`;
        joinBtn.disabled = true;
    }
}

const joinBtn = document.getElementById('join-btn');
if (joinBtn) {
    joinBtn.addEventListener('click', () => {
        if (activeBooking) {
            API.sendMeetingLink(activeBooking._id)
                .then(() => showJitsiMeeting())
                .catch(err => {
                    console.error('Error initiating meeting link:', err);
                    showJitsiMeeting(); // Proceed to Jitsi room anyway so meeting is not blocked
                });
        }
    });
}

function showJitsiMeeting() {
    if (!activeBooking) return;

    const domain = CONFIG.JITSI_DOMAIN || 'meet.jit.si';

    const options = {
        roomName: `WellNest-${activeBooking._id}`,
        parentNode: document.getElementById('meet'),
        width: '100%',
        height: 650,
        userInfo: {
            displayName: userName || 'Client'
        }
    };

    jitsiApi = new JitsiMeetExternalAPI(domain, options);

    jitsiApi.addEventListener('participantLeft', function () {
        const meetDiv = document.getElementById('meet');
        if (meetDiv) meetDiv.innerHTML = '';
        setTimeout(() => {
            window.location.href = 'feedback.html';
        }, 2000);
    });

    const btn = document.getElementById('join-btn');
    if (btn) btn.style.display = 'none';
}