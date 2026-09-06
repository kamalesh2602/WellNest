document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('user-signup-form') || document.getElementById('form');
    if (signupForm) {
        signupForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => UTILS.clearFormError(signupForm));
        });
        signupForm.addEventListener('submit', handleUserSignup);
    }
});

async function handleUserSignup(e) {
    e.preventDefault();
    const signupForm = e.target;
    UTILS.clearFormError(signupForm);

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phno = document.getElementById('phno').value.trim();
    const aadhar = document.getElementById('aadhar').value.trim();
    const password = document.getElementById('password').value.trim();
    const cpassword = document.getElementById('cpassword').value.trim();

    // Field requirements check
    if (!name || !email || !phno || !aadhar || !password || !cpassword) {
        UTILS.showFormError(signupForm, 'All fields are required.');
        return;
    }

    // Password matches check
    if (password !== cpassword) {
        UTILS.showFormError(signupForm, 'Passwords do not match.');
        return;
    }

    // Phone number format validation (exactly 10 digits)
    if (!/^\d{10}$/.test(phno)) {
        UTILS.showFormError(signupForm, 'Phone number must be exactly 10 digits.');
        return;
    }

    // Aadhar number format validation (exactly 12 digits)
    if (!/^\d{12}$/.test(aadhar)) {
        UTILS.showFormError(signupForm, 'Aadhar number must be exactly 12 digits.');
        return;
    }

    const userData = {
        name,
        email,
        phno,
        aadhar,
        password
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Sign Up';
    if (submitBtn) {
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
    }

    try {
        await API.signupUser(userData);
        UTILS.showMessage('Account created successfully! Please log in to continue.', 'success');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
        const userMsg = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please try again.' 
            : error.message;
        UTILS.showFormError(signupForm, userMsg);
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
