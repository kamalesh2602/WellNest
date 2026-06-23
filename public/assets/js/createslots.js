document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    AUTH.checkCounsellorAuth();

    const form = document.getElementById('createslots-form');
    if (form) {
        form.addEventListener('submit', handleCreateSlot);
    }
});

async function handleCreateSlot(e) {
    e.preventDefault();

    const slotDate = document.getElementById('slotdate').value;
    const slotTime = document.getElementById('slottime').value;

    if (!slotDate || !slotTime) {
        alert('Please specify a date and time for the slot.');
        return;
    }

    // Retrieve counsellor details from localStorage
    const counsellorName = localStorage.getItem('counsellorName');
    const counsellorEmail = localStorage.getItem('counsellorEmail');
    const counsellorType = localStorage.getItem('counsellorType');

    if (!counsellorName || !counsellorEmail) {
        alert('Counsellor session expired. Please log in again.');
        window.location.href = 'clogin.html';
        return;
    }

    const slotData = {
        counsellorName,
        counsellorEmail,
        counsellorType,
        slotDate,
        slotTime
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;

    try {
        await API.addSlot(slotData);
        UTILS.showSuccessToast(`Slot created successfully for ${UTILS.formatDate(slotDate)} at ${slotTime}`);
        document.getElementById('createslots-form').reset();
    } catch (error) {
        console.error('Error creating slot:', error);
        alert(`❌ Failed to create slot: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
