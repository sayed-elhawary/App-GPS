// src/context/AuthContext.js - الملف الكامل المعدل
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // تحميل المستخدم من localStorage عند بدء التشغيل
  useEffect(() => {
    const loadStoredUser = async () => {
      const storedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('🔄 Loading stored user data...', {
        hasToken: !!storedToken,
        hasUser: !!savedUser
      });

      if (storedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // التحقق من صحة التوكن مع الباك إند
          try {
            const verifyResponse = await fetch('http://192.168.1.172:5000/api/auth/verify', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              if (verifyData.success) {
                setUser(parsedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
                setUserRole(parsedUser.role);
                console.log("✅ User loaded and verified with role:", parsedUser.role);
              } else {
                console.log("❌ Token verification failed");
                // لا نسجل الخروج هنا، فقط نستخدم التوكن المخزن
                setUser(parsedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
                setUserRole(parsedUser.role);
                console.log("⚠️ Using stored token without verification");
              }
            } else {
              console.log("⚠️ Verification failed with status:", verifyResponse.status);
              setUser(parsedUser);
              setToken(storedToken);
              setIsAuthenticated(true);
              setUserRole(parsedUser.role);
            }
          } catch (verifyError) {
            console.error("❌ Error verifying token:", verifyError);
            // إذا فشل الاتصال بالخادم، نستخدم التوكن المخزن
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
            setUserRole(parsedUser.role);
            console.log("⚠️ Using stored token (server may be offline)");
          }
        } catch (err) {
          console.error('Error parsing saved user:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  const login = async (newToken, userData) => {
    console.log("🔐 Login called");
    console.log("📋 UserData received:", { 
      email: userData?.email, 
      role: userData?.role,
      name: userData?.name 
    });
    
    if (!newToken || !userData) {
      console.error("❌ Login failed: Missing token or user data");
      return false;
    }

    // التأكد من أن userData يحتوي على role
    if (!userData.role) {
      console.warn("⚠️ userData.role is missing! Setting default role 'employee'");
      userData.role = 'employee';
    }

    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);
      setUserRole(userData.role);
      
      console.log("✅ Login successful");
      console.log("📊 Current state:", { 
        userRole: userData.role, 
        isAuthenticated: true,
        userName: userData.name 
      });
      return true;
    } catch (error) {
      console.error("❌ Login error:", error);
      return false;
    }
  };

  const logout = () => {
    console.log("🔐 Logout called");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    console.log("✅ Logout completed");
  };

  // دالة للحصول على التوكن الحالي
  const getToken = () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      console.warn("⚠️ No token available");
    }
    return currentToken;
  };

  // دالة للتحقق من صلاحية الدور
  const hasRole = (allowedRoles) => {
    if (!userRole) {
      console.warn("⚠️ hasRole called but userRole is null");
      return false;
    }
    if (typeof allowedRoles === 'string') {
      const result = userRole === allowedRoles;
      console.log(`🔐 hasRole: userRole=${userRole}, allowed=${allowedRoles}, result=${result}`);
      return result;
    }
    const result = allowedRoles.includes(userRole);
    console.log(`🔐 hasRole: userRole=${userRole}, allowed=${allowedRoles.join(',')}, result=${result}`);
    return result;
  };

  // دالة لتحديث بيانات المستخدم
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (updatedData.role) {
      setUserRole(updatedData.role);
    }
    console.log("✅ User updated:", newUser);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    loading,
    getToken,
    hasRole,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};