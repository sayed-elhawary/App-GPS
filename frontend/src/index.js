
// ========== IMPORTS (لازم تكون في الأول) ==========
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// ========== إعدادات عامة ==========
window.API_BASE_URL = 'http://192.168.1.172:5000';

// ========== حل مشكلة التوكن لـ fetch ==========
(function fixFetchToken() {
  const originalFetch = window.fetch;

  window.fetch = async function (url, options = {}) {
    const token = localStorage.getItem('token');

    let correctedUrl = url;
    if (typeof url === 'string' && url.includes('192.168.127.141')) {
      correctedUrl = url.replace('192.168.127.141', '192.168.1.172');
      console.log('URL corrected:', url, '->', correctedUrl);
    }

    if (
      token &&
      typeof correctedUrl === 'string' &&
      correctedUrl.includes('192.168.1.172:5000/api')
    ) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
      options.headers['Content-Type'] =
        options.headers['Content-Type'] || 'application/json';

      console.log('Token added to fetch:', correctedUrl);
    }

    const response = await originalFetch(correctedUrl, options);

    if (
      response.status === 401 &&
      typeof correctedUrl === 'string' &&
      correctedUrl.includes('192.168.1.172:5000/api')
    ) {
      console.log('401 - Logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return response;
  };
})();

// ========== حل مشكلة التوكن لـ axios ==========
axios.interceptors.request.use(
  (config) => {
    if (config.url && config.url.includes('192.168.127.141')) {
      config.url = config.url.replace('192.168.127.141', '192.168.1.172');
      console.log('Axios URL corrected:', config.url);
    }

    const token = localStorage.getItem('token');
    if (
      token &&
      config.url &&
      config.url.includes('192.168.1.172:5000/api')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to axios:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 - Logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ========== تشغيل التطبيق ==========
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

