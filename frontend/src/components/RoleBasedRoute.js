// src/components/RoleBasedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { userRole, isAuthenticated, loading, token, user } = useAuth();
  
  console.log('🎭 RoleBasedRoute - Debug:', { 
    userRole, 
    allowedRoles, 
    isAuthenticated, 
    loading,
    hasToken: !!token,
    user: user ? { id: user._id, email: user.email, role: user.role } : null
  });

  // أثناء التحميل، نظهر شاشة تحميل
  if (loading) {
    console.log('⏳ RoleBasedRoute - Still loading');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>جاري التحقق من الصلاحيات...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // إذا لم يكن مصادقاً أو لا يوجد توكن، اذهب للوجين
  if (!isAuthenticated || !token) {
    console.log('🚫 RoleBasedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  // إذا كان userRole غير محدد بعد
  if (!userRole) {
    console.log('⚠️ RoleBasedRoute - userRole is undefined, waiting...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  // التحقق من الصلاحية - تأكد من أن userRole موجود في allowedRoles
  const hasAccess = allowedRoles.includes(userRole);
  
  if (!hasAccess) {
    console.log(`🚫 RoleBasedRoute - Access denied for role: ${userRole}, allowed: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log(`✅ RoleBasedRoute - Access granted for role: ${userRole}`);
  return children;
};

export default RoleBasedRoute;