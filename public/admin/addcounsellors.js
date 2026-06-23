/**
 * admin/addcounsellors.js
 * Uses the centralized API object — no hardcoded URLs.
 */

const form = document.getElementById('add-counsellor-form') || document.getElementById('form');
const cname = document.getElementById('cname');
const cemail = document.getElementById('cemail');
const cpassword = document.getElementById('cpassword');
const ctype = document.getElementById('ctype');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        name: cname.value.trim(),
        email: cemail.value.trim(),
        ctype: ctype.value.trim(),
        password: cpassword.value.trim()
    };

    try {
        await API.addCounsellor(formData);
        alert('✅ Counsellor Added');
        form.reset();

    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
});
