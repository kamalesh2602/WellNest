document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-login-form') || document.getElementById('login-form');
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => UTILS.clearFormError(form));
        });
        form.addEventListener('submit', handleUserLogin);
    }
});

async function handleUserLogin(e) {
    e.preventDefault();
    const form = e.target;
    UTILS.clearFormError(form);

    const nameemailInput = document.getElementById('nameemail');
    const passwordInput = document.getElementById('password');

    const nameemail = nameemailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!nameemail || !password) {
        UTILS.showFormError(form, 'Name/Email and password are required.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Log In';
    if (submitBtn) {
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
    }

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
        UTILS.showFormError(form, userMsg);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
