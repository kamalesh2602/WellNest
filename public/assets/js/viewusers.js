document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    AUTH.checkAdminAuth();

    // Fetch lists
    fetchUsers();
});

async function fetchUsers() {
    UTILS.showLoading('table-container', 'Loading users list...');

    try {
        const data = await API.fetchUsers();
        displayUsers(data);
    } catch (error) {
        console.error('Error fetching users:', error);
        UTILS.showError('table-container', `Failed to load users: ${error.message}`);
    }
}

function displayUsers(users) {
    const container = document.getElementById('table-container');
    
    if (!users || users.length === 0) {
        UTILS.showEmpty('table-container', 'No registered users found.');
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table id="userTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Aadhar Number</th>
                        <th>Phone Number</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const tbody = container.querySelector('tbody');

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.aadhar || 'N/A'}</td>
            <td>${user.phno || 'N/A'}</td>
            <td>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteUser('${user._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        await API.deleteUser(id);
        UTILS.showSuccessToast('User account deleted successfully!');
        fetchUsers(); // Reload list
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`❌ Failed to delete user: ${error.message}`);
    }
}
