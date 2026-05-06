// src/index.js - أضف هذا في البداية
// ========== إجبار الرابط الصحيح ==========
window.API_BASE_URL = 'http://192.168.1.172:5000';
// ========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// ========== حل مشكلة التوكن لـ fetch ==========
(function fixFetchToken() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // تصحيح الرابط إذا كان خاطئاً
    let correctedUrl = url;
    if (typeof url === 'string' && url.includes('192.168.127.141')) {
      correctedUrl = url.replace('192.168.127.141', '192.168.1.172');
      console.log('🔄 URL corrected:', url, '->', correctedUrl);
    }
    
    if (token && (typeof correctedUrl === 'string' && correctedUrl.includes('192.168.1.172:5000/api'))) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
      console.log('✅ Token added to fetch:', correctedUrl);
    }
    
    const response = await originalFetch(correctedUrl, options);
    
    if (response.status === 401 && (typeof correctedUrl === 'string' && correctedUrl.includes('192.168.1.172:5000/api'))) {
      console.log('🔐 401 - Logging out');
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
    // تصحيح الرابط إذا كان خاطئاً
    if (config.url && config.url.includes('192.168.127.141')) {
      config.url = config.url.replace('192.168.127.141', '192.168.1.172');
      console.log('🔄 Axios URL corrected:', config.url);
    }
    
    const token = localStorage.getItem('token');
    if (token && config.url && config.url.includes('192.168.1.172:5000/api')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to axios:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 401 - Logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
// ===================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);