const form = document.querySelector('#login-form');
const nameemail = document.querySelector('#nameemail');
const password = document.querySelector('#password');

form.addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const formData = {
        nameemail: nameemail.value.trim(), // Now supports both email and name
        password: password.value.trim()
    };

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Login successful! Welcome, ${data.user.name}`);

            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            
            window.location.href = "modules.html";
            
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert(`Error submitting data: ${error.message}`);
    }
});
