/**
 * config.js — WellNest V2 Frontend Configuration
 *
 * Simple synchronous config object. Available immediately when the script loads.
 * No async loading, no race conditions.
 *
 * LOCAL DEVELOPMENT (default):
 *   API_BASE_URL = ''  →  fetch(`${CONFIG.API_BASE_URL}/submit`) becomes fetch('/submit')
 *   Works perfectly because Express serves both the API and the HTML from the same port.
 *
 * PRODUCTION (when deploying frontend and backend to different domains):
 *   Change API_BASE_URL to your backend URL, e.g.:
 *   API_BASE_URL: 'https://my-render-app.onrender.com'
 *   No other frontend changes needed.
 */
const CONFIG = {
    API_BASE_URL: '',          // '' = relative URLs, works out-of-the-box on localhost

    // EmailJS — get these from https://www.emailjs.com/docs/
    EMAILJS_SERVICE_ID: '',
    EMAILJS_TEMPLATE_ID: '',
    EMAILJS_BOOKING_TEMPLATE_ID: '',
    EMAILJS_PUBLIC_KEY: '',

    // Jitsi Meet server
    JITSI_DOMAIN: 'meet.jit.si'
};
