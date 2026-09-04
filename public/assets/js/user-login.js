document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-login-form');
    if (form) {
        form.addEventListener('submit', handleUserLogin);
    }
});

async function handleUserLogin(e) {
    e.preventDefault();

    const nameemailInput = document.getElementById('nameemail');
    const passwordInput = document.getElementById('password');

    const nameemail = nameemailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!nameemail || !password) {
        UTILS.showMessage('Name/Email and password are required.', 'info');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await API.loginUser(nameemail, password);

        // Save session data
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userEmail', response.user.email);

        UTILS.showMessage(`Welcome back, ${response.user.name}!`, 'success');
        setTimeout(() => {
            window.location.href = "modules.html";
        }, 800);
    } catch (error) {
        console.error('User login error:', error);
        const userMsg = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please try again.' 
            : error.message;
        UTILS.showMessage(userMsg, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
