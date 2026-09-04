/**
 * user/bookslot.js
 * Uses centralized API object, AUTH guard, and UTILS helper.
 */

document.addEventListener('DOMContentLoaded', function () {
    AUTH.checkUserAuth();
    fetchSlots();
});

function fetchSlots() {
    UTILS.showLoading('main', 'Loading available slots...');

    API.getSlots()
        .then(slots => displaySlots(slots))
        .catch(error => {
            console.error('Error fetching slots:', error);
            UTILS.showError('main', 'Failed to load available slots. Please try again later.');
        });
}

function displaySlots(slots) {
    const mainDiv = document.getElementById('main');
    mainDiv.innerHTML = '';

    if (!slots || slots.length === 0) {
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
            <h3>Counsellor Type: ${slot.counsellorType}</h3>
            <p>Date: ${UTILS.formatDate(slot.slotDate)}</p>
            <p>Time: ${slot.slotTime}</p>
        `;

        const bookButton = document.createElement('button');
        bookButton.textContent = 'Book Slot';
        bookButton.className = 'book-button';
        bookButton.addEventListener('click', (e) => bookSlot(slot, e.target));

        slotCard.appendChild(counsellorInfo);
        slotCard.appendChild(bookButton);
        slotsContainer.appendChild(slotCard);
    });

    mainDiv.appendChild(slotsContainer);
}

function bookSlot(slot, buttonEl) {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!userId || !userName) {
        alert('Booking cancelled. User session expired. Please log in again.');
        AUTH.logout();
        return;
    }

    // Disable button to prevent repeated clicks while request is in progress
    const originalText = buttonEl ? buttonEl.textContent : 'Book Slot';
    if (buttonEl) {
        buttonEl.textContent = 'Booking...';
        buttonEl.disabled = true;
    }

    const bookingData = {
        userId,
        userName,
        counsellorName: slot.counsellorName,
        counsellorEmail: slot.counsellorEmail,
        counsellorType: slot.counsellorType,
        date: slot.slotDate,
        time: slot.slotTime,
        slotId: slot._id
    };

    API.bookSlot(bookingData)
        .then(data => {
            if (data.message === 'Booking successful!') {
                alert('Booking successful!');
                window.location.href = 'video.html';
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        })
        .catch(error => {
            console.error('Error booking slot:', error);
            alert(`Booking failed: ${error.message}`);
            // Re-fetch slots to reflect current availability
            fetchSlots();
        })
        .finally(() => {
            if (buttonEl) {
                buttonEl.textContent = originalText;
                buttonEl.disabled = false;
            }
        });
}