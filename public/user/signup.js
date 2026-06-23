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
        alert('All fields are required!');
        return;
    }

    if (formData.password !== cpassword.value.trim()) {
        alert('Passwords do not match!');
        return;
    }

    if (!/^\d{10}$/.test(formData.phno)) {
        alert('Phone number must be exactly 10 digits.');
        return;
    }

    if (!/^\d{12}$/.test(formData.aadhar)) {
        alert('Aadhar number must be exactly 12 digits.');
        return;
    }

    try {
        await API.signupUser(formData);
        alert('✅ Data submitted successfully!');
        form.reset();
        window.location.href = 'login.html';

    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
});
