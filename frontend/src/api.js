// src/api.js
// هذا الملف مسؤول عن إضافة التوكن لجميع الطلبات تلقائياً

const API_BASE_URL = 'http://192.168.1.172:5000/api';

// دالة للحصول على التوكن
const getToken = () => {
  return localStorage.getItem('token');
};

// دالة عامة للطلبات مع إضافة التوكن تلقائياً
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };
  
  // إضافة التوكن إذا كان موجود
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  console.log(`📤 API Request: ${options.method || 'GET'} ${endpoint}`, {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'no token'
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // إذا كان 401، نسجل الخروج
    if (response.status === 401) {
      console.log('🔐 401 Unauthorized - Clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired');
    }
    
    return response;
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    throw error;
  }
};

// دوال مساعدة
export const api = {
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'GET' });
  },
  
  post: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  
  put: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },
  
  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'DELETE' });
  },
  
  patch: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }
};

export default api;