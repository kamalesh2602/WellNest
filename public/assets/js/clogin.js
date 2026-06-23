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
        alert('Please fill in all credentials.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        const data = await API.loginCounsellor(email, password);

        // Store credentials in localStorage
        localStorage.setItem('counsellorEmail', data.user.email);
        localStorage.setItem('counsellorName', data.user.name);
        localStorage.setItem('counsellorType', data.user.ctype);

        alert(`✅ Login successful! Welcome, ${data.user.name}`);
        window.location.href = "cdashboard.html";
    } catch (error) {
        console.error('Counsellor login error:', error);
        alert(`❌ Invalid credentials: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
