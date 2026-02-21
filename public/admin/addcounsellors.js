const form = document.getElementById("form");
const cname = document.getElementById("cname");
const cemail = document.getElementById("cemail");
const cpassword = document.getElementById("cpassword");
const ctype = document.getElementById('ctype')

form.addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const formData = {
        name : cname.value.trim(),
        email : cemail.value.trim(),
        ctype : ctype.value.trim(),
        password : cpassword.value.trim()
    };


    try {
        const response = await fetch('https://wellnest-2ymx.onrender.com/admin/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('✅ Counsellor Added');
            form.reset(); 
            
        } else {
            const errorData = await response.json();
            alert(`❌ Error: ${errorData.message}`);
        }
    } catch (error) {
        alert(`❌ Error submitting data: ${error.message}`);
    }
});


