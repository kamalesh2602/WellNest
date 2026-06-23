const API = {
    async fetchJSON(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Automatically append admin secret token if stored in sessionStorage
        const adminSecret = sessionStorage.getItem('adminSecret');
        if (adminSecret) {
            headers['x-admin-secret'] = adminSecret;
            headers['Authorization'] = `Bearer ${adminSecret}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // 401 Unauthorized check for admin portal
        if (response.status === 401 && endpoint.startsWith('/admin') && !endpoint.endsWith('/login')) {
            sessionStorage.removeItem('adminSecret');
            alert('Your admin session has expired or is invalid. Redirecting to login...');
            window.location.href = '../admin.html';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Request failed with status ${response.status}`);
        }

        return response.json();
    },

    // Auth APIs
    async loginUser(nameemail, password) {
        return this.fetchJSON('/login', {
            method: 'POST',
            body: JSON.stringify({ nameemail, password })
        });
    },

    async signupUser(userData) {
        return this.fetchJSON('/submit', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async loginCounsellor(email, password) {
        return this.fetchJSON('/counsellor/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async loginAdmin(secret) {
        return this.fetchJSON('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ secret })
        });
    },

    // Admin Management APIs
    async fetchUsers() {
        return this.fetchJSON('/admin/users');
    },

    async deleteUser(id) {
        return this.fetchJSON(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    async fetchCounsellors() {
        return this.fetchJSON('/admin/counsellors');
    },

    async addCounsellor(counsellorData) {
        return this.fetchJSON('/admin/submit', {
            method: 'POST',
            body: JSON.stringify(counsellorData)
        });
    },

    async deleteCounsellor(id) {
        return this.fetchJSON(`/admin/counsellors/${id}`, {
            method: 'DELETE'
        });
    },

    // Slot & Booking APIs
    async getSlots() {
        return this.fetchJSON('/getslots');
    },

    async addSlot(slotData) {
        return this.fetchJSON('/counsellor/addslot', {
            method: 'POST',
            body: JSON.stringify(slotData)
        });
    },

    async bookSlot(bookingData) {
        return this.fetchJSON('/bookslot', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    async getUserBookings(userId) {
        return this.fetchJSON(`/getbookings?userId=${userId}`);
    },

    async getCounsellorBookings(counsellorEmail) {
        return this.fetchJSON(`/counsellor/getbookings?counsellorEmail=${counsellorEmail}`);
    },

    async sendMeetingLink(bookingId) {
        return this.fetchJSON('/send-meeting-link', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
    },

    async getConfig() {
        return this.fetchJSON('/config');
    }
};
