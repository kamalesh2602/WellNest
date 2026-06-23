/**
 * user/video.js
 * Uses the centralized API object and CONFIG for EmailJS/Jitsi values.
 * No hardcoded URLs anywhere.
 */

const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const meetingInfoDiv = document.getElementById('meeting-info');
const meetContainer = document.getElementById('meet');
const joinBtn = document.getElementById('join-btn');
const timeMessage = document.getElementById('time-message');

let activeBooking = null;
let jitsiApi;


async function fetchBookings() {
    try {
        const bookings = await API.getUserBookings(userId);

        if (bookings.length === 0) {
            meetingInfoDiv.innerHTML = '<p>No bookings found.</p>';
            joinBtn.style.display = 'none';
        } else {
            activeBooking = bookings[0];
            displayBooking(activeBooking);
            checkMeetingStart();
            setInterval(checkMeetingStart, 30000);
        }
    } catch (err) {
        console.error('Error fetching bookings:', err);
        meetingInfoDiv.innerHTML = '<p>Failed to load bookings.</p>';
    }
}


function displayBooking(booking) {
    meetingInfoDiv.innerHTML = `
        <p><strong>Counsellor:</strong> ${booking.counsellorName}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
    `;
}


function checkMeetingStart() {
    if (!activeBooking) return;

    const meetingTime = new Date(`${activeBooking.date}T${activeBooking.time}`);
    const now = new Date();
    const diffMinutes = (meetingTime - now) / (1000 * 60);

    if (diffMinutes <= 3 && diffMinutes >= -30) {
        timeMessage.textContent = 'Meeting is starting now!';
        joinBtn.disabled = false;

        const jitsiDomain = CONFIG.JITSI_DOMAIN || 'meet.jit.si';
        const meetingLink = `https://${jitsiDomain}/WellNest-${activeBooking._id}`;

        API.sendMeetingLink(activeBooking._id)
            .then(() => {
                emailjs.send(
                    CONFIG.EMAILJS_SERVICE_ID,
                    CONFIG.EMAILJS_TEMPLATE_ID,
                    {
                        to_email: activeBooking.counsellorEmail,
                        counsellor_name: activeBooking.counsellorName,
                        user_name: activeBooking.userName,
                        meeting_link: meetingLink,
                        date_time: `${activeBooking.date} at ${activeBooking.time}`
                    },
                    CONFIG.EMAILJS_PUBLIC_KEY
                )
                    .then(response => {
                        console.log('✅ Email sent successfully:', response.status, response.text);
                    })
                    .catch(error => {
                        console.error('❌ Failed to send email:', error);
                    });

                console.log('📧 Email sent + meeting started');
                showJitsiMeeting();
                activeBooking = null;
            })
            .catch(err => {
                console.error('❌ Meeting trigger failed:', err);
            });

    } else {
        const minutesLeft = Math.floor(diffMinutes);
        timeMessage.textContent = `Meeting will start in ${minutesLeft} minute(s).`;
        joinBtn.disabled = true;
    }
}


joinBtn.addEventListener('click', showJitsiMeeting);


function showJitsiMeeting() {
    const domain = CONFIG.JITSI_DOMAIN || 'meet.jit.si';

    const options = {
        roomName: `WellNest-${activeBooking._id}`,
        parentNode: document.getElementById('meet'),
        width: 1000,
        height: 650,
        userInfo: {
            displayName: userName
        }
    };

    jitsiApi = new JitsiMeetExternalAPI(domain, options);

    jitsiApi.addEventListener('participantLeft', function () {
        document.getElementById('meet').innerHTML = '';
        setTimeout(() => {
            window.location.href = 'feedback.html';
        }, 3000);
    });

    joinBtn.style.display = 'none';
}


// Start immediately — CONFIG is a plain sync object, no loading needed
fetchBookings();