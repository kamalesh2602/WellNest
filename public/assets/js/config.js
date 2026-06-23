const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://wellnest-2ymx.onrender.com' // Fallback to original Render backend URL
};
