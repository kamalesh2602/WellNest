/**
 * user/signup.js
 * Uses the centralized API object — no hardcoded URLs.
 */

const form = document.querySelector('#form');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const phno = document.querySelector('#phno');
const aadhar = document.querySelector('#aadhar');
const password = document.querySelector('#password');
const cpassword = document.querySelector('#cpassword');

if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            name: name.value.trim(),
            email: email.value.trim(),
            phno: phno.value.trim(),
            aadhar: aadhar.value.trim(),
            password: password.value.trim(),
        };

        // Validation
        if (!formData.name || !formData.email || !formData.phno || !formData.aadhar || !formData.password || !cpassword.value.trim()) {
            UTILS.showMessage('All fields are required.', 'info');
            return;
        }

        if (formData.password !== cpassword.value.trim()) {
            UTILS.showMessage('Passwords do not match.', 'error');
            return;
        }

        if (!/^\d{10}$/.test(formData.phno)) {
            UTILS.showMessage('Phone number must be exactly 10 digits.', 'info');
            return;
        }

        if (!/^\d{12}$/.test(formData.aadhar)) {
            UTILS.showMessage('Aadhar number must be exactly 12 digits.', 'info');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Sign Up';
        if (submitBtn) {
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;
        }

        try {
            await API.signupUser(formData);
            UTILS.showMessage('Account created successfully! Please log in to continue.', 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
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
    });
}
