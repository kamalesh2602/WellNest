const UTILS = {
    // Elegant date formatter
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return isNaN(date) ? dateString : date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    },

    // Insert loading spinner state
    showLoading(containerId, message = 'Loading details...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p class="loading-text">${message}</p>
                </div>
            `;
        }
    },

    // Insert error state card
    showError(containerId, message = 'An error occurred. Please try again.') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-banner">
                    <span class="error-icon">⚠️</span>
                    <p class="error-text">${message}</p>
                </div>
            `;
        }
    },

    // Insert empty state card
    showEmpty(containerId, message = 'No data available.') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📁</span>
                    <p class="empty-text">${message}</p>
                </div>
            `;
        }
    },

    // Reusable message toast notification ('success', 'error', 'info')
    showMessage(message, type = 'info', duration = 3500) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const icons = {
            success: '✅',
            error: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        `;
        toastContainer.appendChild(toast);

        // Animate
        setTimeout(() => toast.classList.add('show'), 50);

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    },

    // Legacy alias for success toast notification
    showSuccessToast(message) {
        this.showMessage(message, 'success');
    }
};

// Global helper alias
function showMessage(message, type, duration) {
    UTILS.showMessage(message, type, duration);
}
