// ================= DYNAMIC CONFIG =================
let EMAILJS_SERVICE_ID;
let EMAILJS_TEMPLATE_BOOKING_ID; // booking template
let EMAILJS_PUBLIC_KEY;
// ==================================================


document.addEventListener('DOMContentLoaded', async function () {
    await loadConfig();
    fetchSlots();
});


async function loadConfig() {
    try {
        const res = await fetch('https://wellnest-2ymx.onrender.com/config');
        const config = await res.json();

        EMAILJS_SERVICE_ID = config.EMAILJS_SERVICE_ID;
        EMAILJS_TEMPLATE_BOOKING_ID = config.EMAILJS_TEMPLATE_ID;
        EMAILJS_PUBLIC_KEY = config.EMAILJS_PUBLIC_KEY;

    } catch (err) {
        console.error("Failed to load config:", err);
    }
}


function fetchSlots() {
    fetch('https://wellnest-2ymx.onrender.com/getslots')
        .then(response => response.json())
        .then(slots => {
            displaySlots(slots);
        })
        .catch(error => {
            console.error('Error fetching slots:', error);
            alert('Failed to load available slots. Please try again later.');
        });
}


function displaySlots(slots) {
    const mainDiv = document.getElementById('main');
    mainDiv.innerHTML = '';

    if (slots.length === 0) {
        mainDiv.innerHTML = '<p>No available slots at the moment. Please check back later.</p>';
        return;
    }

    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'slots-container';

    const heading = document.createElement('h2');
    heading.textContent = 'Available Counselling Slots';
    slotsContainer.appendChild(heading);

    slots.forEach(slot => {
        const slotCard = document.createElement('div');
        slotCard.className = 'slot-card';

        const counsellorInfo = document.createElement('div');
        counsellorInfo.innerHTML = `
            <h3>${slot.counsellorName}</h3>
            <h3>Counsellor Type :${slot.counsellorType}</h3>
            <p>Date: ${slot.slotDate}</p>
            <p>Time: ${slot.slotTime}</p>
        `;

        const bookButton = document.createElement('button');
        bookButton.textContent = 'Book Slot';
        bookButton.className = 'book-button';
        bookButton.addEventListener('click', () => bookSlot(slot));

        slotCard.appendChild(counsellorInfo);
        slotCard.appendChild(bookButton);
        slotsContainer.appendChild(slotCard);
    });

    mainDiv.appendChild(slotsContainer);
}


function bookSlot(slot) {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (!userId || !userName) {
        alert('Booking cancelled. User information is required.');
        return;
    }

    const bookingData = {
        userId: userId,
        userName: userName,
        counsellorName: slot.counsellorName,
        counsellorEmail: slot.counsellorEmail,
        counsellorType: slot.counsellorType,
        date: slot.slotDate,
        time: slot.slotTime,
        slotId: slot._id
    };

    fetch('https://wellnest-2ymx.onrender.com/bookslot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Booking successful!') {
                sendConfirmationEmail(bookingData);
                alert('Booking successful!');
                window.location.href = "video.html";
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        })
        .catch(error => {
            console.error('Error booking slot:', error);
            alert('Booking failed. Please try again.');
        });
}


function sendConfirmationEmail(bookingData) {

    const templateParams = {
        userName: bookingData.userName,
        counsellorEmail: bookingData.counsellorEmail,
        counsellor_name: bookingData.counsellorName,
        date: bookingData.date,
        time: bookingData.time,
    };

    emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_BOOKING_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
    )
        .then(response => {
            console.log('Email sent successfully:', response);
        })
        .catch(error => {
            console.error('Failed to send email:', error);
        });
}