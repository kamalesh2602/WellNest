const form = document.querySelector('#form');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const phno = document.querySelector('#phno');
const aadhar = document.querySelector('#aadhar');
const password = document.querySelector('#password');
const cpassword = document.querySelector('#cpassword');

form.addEventListener('submit', async function (e) {
    e.preventDefault(); 

    // Trim values
    const formData = {
        name: name.value.trim(),
        email: email.value.trim(),
        phno: phno.value.trim(),
        aadhar: aadhar.value.trim(),
        password: password.value.trim(),
    };

    // **Validation Checks**
    if (!formData.name || !formData.email || !formData.phno || !formData.aadhar || !formData.password || !cpassword.value.trim()) {
        alert('All fields are required!');
        return;
    }

    // **Check if passwords match**
    if (formData.password !== cpassword.value.trim()) {
        alert('Passwords do not match!');
        return;
    }

    // **Phone Number Validation**
    if (!/^\d{10}$/.test(formData.phno)) {
        alert('Phone number must be exactly 10 digits.');
        return;
    }

    // **Aadhar Number Validation**
    if (!/^\d{12}$/.test(formData.aadhar)) {
        alert('Aadhar number must be exactly 12 digits.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('✅ Data submitted successfully!');
            window.location.href = "login.html";
            form.reset(); // Clear form after successful submission
            
        } else {
            const errorData = await response.json();
            alert(`❌ Error: ${errorData.message}`);
        }
    } catch (error) {
        alert(`❌ Error submitting data: ${error.message}`);
    }
});
