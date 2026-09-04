/**
 * user/login.js
 * Uses the centralized API object — no hardcoded URLs.
 */

const form = document.querySelector('#login-form');
const nameemail = document.querySelector('#nameemail');
const password = document.querySelector('#password');

if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const inputNameEmail = nameemail.value.trim();
        const inputPassword = password.value.trim();

        if (!inputNameEmail || !inputPassword) {
            UTILS.showMessage('Please enter your name or email and password.', 'info');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const data = await API.loginUser(inputNameEmail, inputPassword);

            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);

            UTILS.showMessage(`Welcome back, ${data.user.name}!`, 'success');
            setTimeout(() => {
                window.location.href = 'modules.html';
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
    });
}
