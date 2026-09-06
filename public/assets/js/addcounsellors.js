document.addEventListener('DOMContentLoaded', () => {
    // Secure page load checking
    AUTH.checkAdminAuth();

    const form = document.getElementById("add-counsellor-form");
    if (form) {
        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => UTILS.clearFormError(form));
        });
        form.addEventListener('submit', handleAddCounsellor);
    }
});

async function handleAddCounsellor(e) {
    e.preventDefault();
    const form = e.target;
    UTILS.clearFormError(form);

    const cname = document.getElementById("cname").value.trim();
    const cemail = document.getElementById("cemail").value.trim();
    const ctype = document.getElementById("ctype").value.trim();
    const cpassword = document.getElementById("cpassword").value.trim();

    if (!cname || !cemail || !ctype || !cpassword) {
        UTILS.showFormError(form, "All fields are required!");
        return;
    }

    const formData = {
        name: cname,
        email: cemail,
        ctype: ctype,
        password: cpassword
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Add Counsellor';
    if (submitBtn) {
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;
    }

    try {
        await API.addCounsellor(formData);
        
        // Show success notification and reset form
        UTILS.showSuccessToast('Counsellor added successfully!');
        form.reset();
    } catch (error) {
        console.error('Error adding counsellor:', error);
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
}
