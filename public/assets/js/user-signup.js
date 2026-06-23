document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('user-signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleUserSignup);
    }
});

async function handleUserSignup(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phno = document.getElementById('phno').value.trim();
    const aadhar = document.getElementById('aadhar').value.trim();
    const password = document.getElementById('password').value.trim();
    const cpassword = document.getElementById('cpassword').value.trim();

    // Field requirements check
    if (!name || !email || !phno || !aadhar || !password || !cpassword) {
        alert('All fields are required!');
        return;
    }

    // Password matches check
    if (password !== cpassword) {
        alert('Passwords do not match!');
        return;
    }

    // Phone number format validation (exactly 10 digits)
    if (!/^\d{10}$/.test(phno)) {
        alert('Phone number must be exactly 10 digits.');
        return;
    }

    // Aadhar number format validation (exactly 12 digits)
    if (!/^\d{12}$/.test(aadhar)) {
        alert('Aadhar number must be exactly 12 digits.');
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
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    try {
        await API.signupUser(userData);
        alert('✅ Registration successful! Please log in to continue.');
        window.location.href = "login.html";
    } catch (error) {
        console.error('Registration error:', error);
        alert(`❌ Registration failed: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
