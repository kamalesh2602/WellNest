document.addEventListener('DOMContentLoaded', () => {
    // Secure page load checking
    AUTH.checkAdminAuth();

    const form = document.getElementById("add-counsellor-form");
    if (form) {
        form.addEventListener('submit', handleAddCounsellor);
    }
});

async function handleAddCounsellor(e) {
    e.preventDefault();

    const cname = document.getElementById("cname").value.trim();
    const cemail = document.getElementById("cemail").value.trim();
    const ctype = document.getElementById("ctype").value.trim();
    const cpassword = document.getElementById("cpassword").value.trim();

    if (!cname || !cemail || !ctype || !cpassword) {
        alert("All fields are required!");
        return;
    }

    const formData = {
        name: cname,
        email: cemail,
        ctype: ctype,
        password: cpassword
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    try {
        const response = await API.addCounsellor(formData);
        
        // Show success notification and reset form
        UTILS.showSuccessToast('Counsellor Added successfully!');
        document.getElementById("add-counsellor-form").reset();
    } catch (error) {
        console.error('Error adding counsellor:', error);
        alert(`❌ Failed to add counsellor: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
