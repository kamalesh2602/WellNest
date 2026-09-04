const AUTH = {
    logout() {
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to main index page
        const path = window.location.pathname;
        if (path.includes('/admin/') || path.includes('/counsellor/') || path.includes('/user/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    checkUserAuth() {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if (!userId || !userName) {
            alert('Access denied. Please log in first.');
            const path = window.location.pathname;
            if (path.includes('/user/')) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'user/login.html';
            }
        }
    },

    checkCounsellorAuth() {
        const counsellorEmail = localStorage.getItem('counsellorEmail');
        if (!counsellorEmail) {
            alert('Access denied. Please log in first.');
            const path = window.location.pathname;
            if (path.includes('/counsellor/')) {
                window.location.href = 'clogin.html';
            } else {
                window.location.href = 'counsellor/clogin.html';
            }
        }
    },

    checkAdminAuth() {
        const adminSecret = sessionStorage.getItem('adminSecret');
        if (!adminSecret) {
            alert('Access denied. Admin credentials required.');
            const path = window.location.pathname;
            if (path.includes('/admin/')) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'admin/admin.html';
            }
        }
    }
};
