/**
 * user/login.js
 * Uses the centralized API object — no hardcoded URLs.
 */

const form = document.querySelector('#login-form');
const nameemail = document.querySelector('#nameemail');
const password = document.querySelector('#password');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        nameemail: nameemail.value.trim(),
        password: password.value.trim()
    };

    try {
        const data = await API.loginUser(formData.nameemail, formData.password);

        alert(`Login successful! Welcome, ${data.user.name}`);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        window.location.href = 'modules.html';

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});
