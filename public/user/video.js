// ================= DYNAMIC CONFIG =================
let EMAILJS_SERVICE_ID;
let EMAILJS_TEMPLATE_ID;
let EMAILJS_PUBLIC_KEY;
let JITSI_DOMAIN;
// ==================================================


const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const meetingInfoDiv = document.getElementById('meeting-info');
const meetContainer = document.getElementById('meet');
const joinBtn = document.getElementById('join-btn');
const timeMessage = document.getElementById('time-message');

let activeBooking = null;
let api;


// 🔥 Load config from backend
async function loadConfig() {
  try {
    const res = await fetch('https://wellnest-2ymx.onrender.com/config');
    const config = await res.json();

    EMAILJS_SERVICE_ID = config.EMAILJS_SERVICE_ID;
    EMAILJS_TEMPLATE_ID = config.EMAILJS_TEMPLATE_ID;
    EMAILJS_PUBLIC_KEY = config.EMAILJS_PUBLIC_KEY;
    JITSI_DOMAIN = config.JITSI_DOMAIN;
  } catch (err) {
    console.error("Failed to load config:", err);
  }
}


async function fetchBookings() {
  try {
    const res = await fetch(`https://wellnest-2ymx.onrender.com/getbookings?userId=${userId}`);
    const bookings = await res.json();

    if (bookings.length === 0) {
      meetingInfoDiv.innerHTML = "<p>No bookings found.</p>";
      joinBtn.style.display = "none";
    } else {
      activeBooking = bookings[0];
      displayBooking(activeBooking);
      checkMeetingStart();
      setInterval(checkMeetingStart, 30000);
    }
  } catch (err) {
    console.error("Error fetching bookings:", err);
    meetingInfoDiv.innerHTML = "<p>Failed to load bookings.</p>";
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
    timeMessage.textContent = "Meeting is starting now!";
    joinBtn.disabled = false;

    const meetingLink = `https://${JITSI_DOMAIN}/WellNest-${activeBooking._id}`;

    fetch('https://wellnest-2ymx.onrender.com/send-meeting-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: activeBooking._id })
    })
      .then(res => res.json())
      .then(() => {

        emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email: activeBooking.counsellorEmail,
            counsellor_name: activeBooking.counsellorName,
            user_name: activeBooking.userName,
            meeting_link: meetingLink,
            date_time: `${activeBooking.date} at ${activeBooking.time}`
          },
          EMAILJS_PUBLIC_KEY
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
  const domain = JITSI_DOMAIN;

  const options = {
    roomName: `WellNest-${activeBooking._id}`,
    parentNode: document.getElementById('meet'),
    width: 1000,
    height: 650,
    userInfo: {
      displayName: userName
    }
  };

  api = new JitsiMeetExternalAPI(domain, options);

  api.addEventListener("participantLeft", function () {
    document.getElementById('meet').innerHTML = "";
    setTimeout(() => {
      window.location.href = "feedback.html";
    }, 3000);
  });

  joinBtn.style.display = "none";
}


// 🔥 Start flow only after config loads
loadConfig().then(() => {
  fetchBookings();
});