// Admin Authentication script

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => UTILS.clearFormError(loginForm));
        });
        loginForm.addEventListener('submit', handleAdminLogin);
    }
});

async function handleAdminLogin(event) {
    event.preventDefault();
    const loginForm = event.target;
    UTILS.clearFormError(loginForm);
    
    const adminpasswdInput = document.getElementById('adminpasswd');
    const secret = adminpasswdInput.value.trim();

    if (!secret) {
        UTILS.showFormError(loginForm, 'Please enter the Admin Password.');
        return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Verify & Log In';
    if (submitBtn) {
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
    }

    try {
        // Submit secret to server check
        await API.loginAdmin(secret);
        
        // Save secret to session storage
        sessionStorage.setItem('adminSecret', secret);
        
        UTILS.showMessage('Welcome Admin!', 'success');
        setTimeout(() => {
            window.location.href = 'admindashboard.html';
        }, 800);
    } catch (error) {
        console.error('Admin login error:', error);
        const userMsg = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please try again.' 
            : error.message;
        UTILS.showFormError(loginForm, userMsg);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
