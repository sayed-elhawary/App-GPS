// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.172:5000/api';

// إنشاء instance مخصصة
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor لإضافة التوكن لكل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      url: config.url
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الردود
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url}`, {
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, {
        url: error.config?.url,
        message: error.response.data?.message || error.message
      });
      
      // إذا كان 401، نقوم بتسجيل الخروج
      if (error.response.status === 401) {
        console.log('🔐 401 Unauthorized - Need to login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;