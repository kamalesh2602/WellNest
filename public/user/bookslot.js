document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display available slots
    fetchSlots();
});

function fetchSlots() {
    fetch('http://localhost:3000/getslots')
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
    mainDiv.innerHTML = ''; // Clear previous content

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
    // In a real app, you'd get this from your authentication system
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName")
    
    if (!userId || !userName) {
        alert('Booking cancelled. User information is required.');
        return;
    }

    const bookingData = {
        userId: userId,
        userName: userName,
        counsellorName: slot.counsellorName,
        counsellorEmail: slot.counsellorEmail,
        counsellorType : slot.counsellorType,
        date: slot.slotDate,
        time: slot.slotTime,
        slotId: slot._id
    };

    fetch('http://localhost:3000/bookslot', {
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
            window.location.href = "video.html"
            
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

    emailjs.send('service_ax4bsyj', 'template_2d3vems', templateParams)
        .then(response => {
            console.log('Email sent successfully:', response);
        })
        .catch(error => {
            console.error('Failed to send email:', error);
        });
}