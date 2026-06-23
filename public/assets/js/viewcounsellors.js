document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    AUTH.checkAdminAuth();

    // Fetch lists
    fetchCounsellors();
});

async function fetchCounsellors() {
    UTILS.showLoading('table-container', 'Loading counsellors list...');

    try {
        const data = await API.fetchCounsellors();
        displayCounsellors(data);
    } catch (error) {
        console.error('Error fetching counsellors:', error);
        UTILS.showError('table-container', `Failed to load counsellors: ${error.message}`);
    }
}

function displayCounsellors(counsellors) {
    const container = document.getElementById('table-container');
    
    if (!counsellors || counsellors.length === 0) {
        UTILS.showEmpty('table-container', 'No counsellors found in the system.');
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table id="counsellorTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type / Specialization</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const tbody = container.querySelector('tbody');

    counsellors.forEach(counsellor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${counsellor.name}</strong></td>
            <td>${counsellor.email}</td>
            <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary-color); padding: 4px 10px; border-radius: var(--border-radius-sm); font-size: 13px; font-weight: 600;">${counsellor.ctype || 'General'}</span></td>
            <td>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteCounsellor('${counsellor._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteCounsellor(id) {
    if (!confirm('Are you sure you want to delete this counsellor?')) {
        return;
    }

    try {
        await API.deleteCounsellor(id);
        UTILS.showSuccessToast('Counsellor deleted successfully!');
        fetchCounsellors(); // Reload list
    } catch (error) {
        console.error('Error deleting counsellor:', error);
        alert(`❌ Failed to delete counsellor: ${error.message}`);
    }
}
