function openModal(id) {
    const modal = document.getElementById(id);
    const overlay = document.querySelector('.overlay');
    
    // Show the overlay
    overlay.style.display = 'block';
    
    // Add the active class to trigger the CSS animation
    modal.classList.add('active');
    
    // Prevent the background from scrolling while reading
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.querySelector('.overlay');

    // Remove active class from all modals
    modals.forEach(modal => modal.classList.remove('active'));
    
    // Hide overlay
    overlay.style.display = 'none';
    
    // Restore scrolling
    document.body.style.overflow = 'auto';
}

// Close modal if user presses 'Escape' key
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});