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
        UTILS.showMessage('Please specify a date and time for the slot.', 'info');
        return;
    }

    // Validate that selected date and time are in the future
    const selectedDateTime = new Date(`${slotDate}T${slotTime}:00`);
    if (!isNaN(selectedDateTime.getTime()) && selectedDateTime.getTime() <= Date.now()) {
        UTILS.showMessage('Cannot create a slot in the past. Please select a future date and time.', 'error');
        return;
    }

    // Retrieve counsellor details from localStorage
    const counsellorName = localStorage.getItem('counsellorName');
    const counsellorEmail = localStorage.getItem('counsellorEmail');
    const counsellorType = localStorage.getItem('counsellorType');

    if (!counsellorName || !counsellorEmail) {
        UTILS.showMessage('Counsellor session expired. Please log in again.', 'info');
        setTimeout(() => {
            AUTH.logout();
        }, 1000);
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
    const originalText = submitBtn ? submitBtn.textContent : 'Create Slot';
    if (submitBtn) {
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
    }

    try {
        await API.addSlot(slotData);
        UTILS.showMessage(`Slot created successfully for ${UTILS.formatDate(slotDate)} at ${slotTime}`, 'success');
        document.getElementById('createslots-form').reset();
    } catch (error) {
        console.error('Error creating slot:', error);
        const userMsg = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please try again.' 
            : error.message;
        UTILS.showMessage(`Failed to create slot: ${userMsg}`, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
