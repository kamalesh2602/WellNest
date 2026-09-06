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
    // Clear error banner when user types
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => UTILS.clearFormError(form));
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        UTILS.clearFormError(form);

        const formData = {
            name: name.value.trim(),
            email: email.value.trim(),
            phno: phno.value.trim(),
            aadhar: aadhar.value.trim(),
            password: password.value.trim(),
        };

        // Validation
        if (!formData.name || !formData.email || !formData.phno || !formData.aadhar || !formData.password || !cpassword.value.trim()) {
            UTILS.showFormError(form, 'All fields are required.');
            return;
        }

        if (formData.password !== cpassword.value.trim()) {
            UTILS.showFormError(form, 'Passwords do not match.');
            return;
        }

        if (!/^\d{10}$/.test(formData.phno)) {
            UTILS.showFormError(form, 'Phone number must be exactly 10 digits.');
            return;
        }

        if (!/^\d{12}$/.test(formData.aadhar)) {
            UTILS.showFormError(form, 'Aadhar number must be exactly 12 digits.');
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
            UTILS.showFormError(form, userMsg);
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}
