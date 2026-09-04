document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('counsellor-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleCounsellorLogin);
    }
});

async function handleCounsellorLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        UTILS.showMessage('Please enter your email and password.', 'info');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Verify & Log In';
    if (submitBtn) {
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
    }

    try {
        const data = await API.loginCounsellor(email, password);

        // Store credentials in localStorage
        localStorage.setItem('counsellorEmail', data.user.email);
        localStorage.setItem('counsellorName', data.user.name);
        localStorage.setItem('counsellorType', data.user.ctype);

        UTILS.showMessage(`Welcome back, ${data.user.name}!`, 'success');
        setTimeout(() => {
            window.location.href = "cdashboard.html";
        }, 800);
    } catch (error) {
        console.error('Counsellor login error:', error);
        const userMsg = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please try again.' 
            : error.message;
        UTILS.showMessage(userMsg, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
