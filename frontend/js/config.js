/**
 * Food in Forest - Environment & API Configuration
 * Automatically resolves the backend API URL for local development vs Render production deployment.
 */

const AppConfig = {
  // Render deployed backend URL
  RENDER_BACKEND_URL: 'https://foodrestaurant-wf24.onrender.com',

  // Get active API base URL
  get apiBaseUrl() {
    if (typeof window !== 'undefined' && window.BACKEND_API_URL) {
      return window.BACKEND_API_URL.replace(/\/+$/, '');
    }
    const hostname = (typeof window !== 'undefined' && window.location.hostname) || '';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000';
    }
    return this.RENDER_BACKEND_URL.replace(/\/+$/, '');
  },

  // Helper to build full endpoint URL
  apiUrl(path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${cleanPath}`;
  }
};

if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
}
