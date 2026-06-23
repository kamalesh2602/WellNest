// Admin Authentication script

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
});

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const adminpasswdInput = document.getElementById('adminpasswd');
    const secret = adminpasswdInput.value.trim();

    if (!secret) {
        alert('Please enter the Admin Password.');
        return;
    }

    try {
        // Submit secret to server check
        const response = await API.loginAdmin(secret);
        
        // Save secret to session storage
        sessionStorage.setItem('adminSecret', secret);
        
        alert('✅ Login successful! Welcome Admin.');
        window.location.href = 'admindashboard.html';
    } catch (error) {
        console.error('Admin login error:', error);
        alert(`❌ Invalid Admin credentials: ${error.message}`);
    }
}
