const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('userName');
const meetingInfoDiv = document.getElementById('meeting-info');
const meetContainer = document.getElementById('meet');
const joinBtn = document.getElementById('join-btn');
const timeMessage = document.getElementById('time-message');

let activeBooking = null;

async function fetchBookings() {
  try {
    const res = await fetch(`http://localhost:3000/getbookings?userId=${userId}`);
    const bookings = await res.json();

    if (bookings.length === 0) {
      meetingInfoDiv.innerHTML = "<p>No bookings found.</p>";
      joinBtn.style.display = "none";
    } else {
      activeBooking = bookings[0]; // Assuming one booking per user
      displayBooking(activeBooking);
      checkMeetingStart(); // Initial check
      setInterval(checkMeetingStart, 30000); // Check every 30 seconds
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

    const meetingLink = `https://meet.jit.si/WellNest-${activeBooking._id}`;

    // Notify the counsellor by email when the user joins
    fetch('http://localhost:3000/send-meeting-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: activeBooking._id })
    })
      .then(res => res.json())
      .then(data => {
        emailjs.send(
          'service_ax4bsyj', // Replace with your service ID
          'template_96idk0d', // Replace with your template ID
          {
            to_email: activeBooking.counsellorEmail, // ⬅️ This sends to counsellor
            counsellor_name: activeBooking.counsellorName,
            user_name: activeBooking.userName,
            meeting_link: `https://meet.jit.si/WellNest-${activeBooking._id}`,
            date_time: `${activeBooking.date} at ${activeBooking.time}`
                  },
          'Uyf-kE1C7m379m9eg' // Replace with your EmailJS public key
        )
          .then(response => {
            console.log('✅ Email sent successfully:', response.status, response.text);
          })
          .catch(error => {
            console.error('❌ Failed to send email:', error);
          });

        console.log('📧 Email sent + meeting started');
        showJitsiMeeting();
        activeBooking = null; // Prevent duplicate joins
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

let api;


function showJitsiMeeting() {
  const domain = "meet.jit.si";
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

  api.addEventListener("participantLeft", function(event) {
    document.getElementById('meet').innerHTML = ""; // Remove Jitsi iframe
        setTimeout(() => {
            window.location.href = "feedback.html"; // Redirect to feedback page
        }, 3000);
    });

  joinBtn.style.display = "none"; // Hide join button after joining
}


// Start the flow
fetchBookings();
