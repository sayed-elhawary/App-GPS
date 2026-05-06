// src/Dashboard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import logoImage from './logo.png';

const allMenuItems = [
  {
    icon: '📋',
    title: 'بيانات الموظفين',
    sub: 'رفع أكسيل • بحث • حذف',
    route: '/client-data',
    accent: '#4f6ef7',
    light: 'rgba(79, 110, 247, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '📹',
    title: 'بيانات الكاميرات',
    sub: 'المواقع • الشرايح • الروترات',
    route: '/camera-data',
    accent: '#0ea5e9',
    light: 'rgba(14, 165, 233, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '📡',
    title: 'شرايح المعدات',
    sub: 'الأجهزة • التجديد • الملاحظات',
    route: '/equipment-sims',
    accent: '#10b981',
    light: 'rgba(16, 185, 129, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🚨',
    title: 'المخالفات',
    sub: 'تسجيل • صور • خصومات • بيانات',
    route: '/violations',
    accent: '#ef4444',
    light: 'rgba(239, 68, 68, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '📝',
    title: 'محرر المستندات',
    sub: 'تقارير • جداول • طباعة رسمية',
    route: '/document-editor',
    accent: '#f59e0b',
    light: 'rgba(245, 158, 11, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '👮',
    title: 'بيانات موظفي الأمن',
    sub: 'كود • اسم • تاريخ التعيين • موقع • تليفون',
    route: '/security-staff',
    accent: '#7c3aed',
    light: 'rgba(124, 58, 237, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🏭',
    title: 'بيانات تنفيذ المحطة',
    sub: 'كود الموظف • الاسم • التليفون • الموقع',
    route: '/station-execution',
    accent: '#ea580c',
    light: 'rgba(234, 88, 12, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🏠',
    title: 'سكن الموظفين',
    sub: 'صاحب العقار • عقود • صور • تاريخ الانتهاء',
    route: '/employee-housing',
    accent: '#14b8a6',
    light: 'rgba(20, 184, 166, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '📍',
    title: 'أجهزة GPS',
    sub: 'إضافة أجهزة • رصيد • استخدام • محاسبة تلقائية',
    route: '/gps-devices',
    accent: '#f97316',
    light: 'rgba(249, 115, 22, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '💰',
    title: 'حسابات العلاقات العامة والأمن',
    sub: 'إضافة فواتير • تسجيل صرف • متبقي تلقائي • تقارير',
    route: '/pr-accounts',
    accent: '#ec4899',
    light: 'rgba(236, 72, 153, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🚛',
    title: 'معدات الشركة',
    sub: 'إدارة الأسطول • رفع Excel • تواريخ الصلاحية • تقارير',
    route: '/company-equipment',
    accent: '#8b5cf6',
    light: 'rgba(139, 92, 246, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🔧',
    title: 'تقرير الصيانة',
    sub: 'متابعة معدات الصيانة • تقارير PDF • إدارة',
    route: '/maintenance-report',
    accent: '#f97316',
    light: 'rgba(249, 115, 22, 0.1)',
    roles: ['admin', 'gps']
  },
  {
    icon: '🚗',
    title: 'متابعة سائقين الإدارة',
    sub: 'أسماء وأرقام المستلمين • تقارير PDF',
    route: '/driver-followup',
    accent: '#10b981',
    light: 'rgba(16, 185, 129, 0.1)',
    roles: ['admin', 'gps']
  },
  // ==================== كارت حركة التربات ====================
  // ملاحظة: roles تحتوي على ['admin', 'gps', 'employee'] فقط
  // الموظف العادي (user) لا يراه
  {
    icon: '🚚',
    title: 'حركة التربات',
    sub: 'متابعة حركة التربات • تسجيل • تقارير',
    route: '/trib-movement',
    accent: '#06b6d4',
    light: 'rgba(6, 182, 212, 0.1)',
    roles: ['admin', 'gps', 'employee']  // ← فقط الأدمن ومشرف GPS والموظف (employee)
  },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState('dark');
  const [activeNav, setActiveNav] = useState('');
  const navigate = useNavigate();
  const { logout: contextLogout, user: authUser } = useAuth();

  // تحميل الثيم
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme') || 'dark';
    setTheme(savedTheme);
  }, []);

  // تحديث بيانات المستخدم والوقت
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error('Error parsing saved user:', err);
          setUser({ email: 'test@test.com', role: 'user', fullName: 'مستخدم تجريبي' });
        }
      } else {
        setUser({ email: 'test@test.com', role: 'user', fullName: 'مستخدم تجريبي' });
      }
    }
    const tick = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(tick);
  }, [authUser]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
  };

  const handleNavigation = (route) => {
    setActiveNav(route);
    navigate(route);
  };

  const handleLogout = () => {
    contextLogout();
    navigate('/', { replace: true });
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const dateStr = time.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = time.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // تصفية العناصر حسب صلاحية المستخدم
  // المستخدم العادي (user) لا يرى العناصر التي تحتاج employee
  const filteredMenuItems = allMenuItems.filter(item => {
    // إذا كان المستخدم ليس لديه role محدد، استخدم 'user' كقيمة افتراضية
    const userRole = user?.role || 'user';
    
    // إذا كان المستخدم عادي (user) ولا توجد صلاحية employee في الـ roles، لا يظهر
    if (userRole === 'user' && !item.roles.includes('user')) {
      return false;
    }
    
    // إذا كان المستخدم employee، يظهر له العناصر التي تحتوي employee في roles
    if (userRole === 'employee' && !item.roles.includes('employee')) {
      return false;
    }
    
    // الأدمن ومشرف GPS يرون كل شيء
    return item.roles.includes(userRole);
  });

  // ألوان الثيم
  const themeStyles = theme === 'light' ? {
    bg: '#f8fafc',
    headerBg: '#ffffff',
    sidebarBg: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    text2: '#475569',
    text3: '#64748b',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    shadow: 'rgba(15, 23, 42, 0.06)',
    accent: '#4338ca',
  } : {
    bg: '#0a0f1c',
    headerBg: '#111827',
    sidebarBg: '#111827',
    border: '#1e2937',
    text: '#f1f5f9',
    text2: '#cbd5e1',
    text3: '#94a3b8',
    cardBg: '#1e2937',
    cardBorder: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    accent: '#6366f1',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: ${themeStyles.bg};
          font-family: 'Cairo', sans-serif;
        }
        .dashboard-root {
          height: 100vh;
          background: ${themeStyles.bg};
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          display: flex;
          overflow: hidden;
        }
        /* Header */
        .dashboard-header {
          position: fixed;
          top: 0;
          right: 0;
          left: 0;
          height: 76px;
          background: ${themeStyles.headerBg};
          border-bottom: 1px solid ${themeStyles.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 200;
          box-shadow: 0 2px 12px ${themeStyles.shadow};
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-logo-img {
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }
        .header-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: ${themeStyles.text};
        }
        /* Sidebar */
        .dashboard-sidebar {
          width: 285px;
          background: ${themeStyles.sidebarBg};
          border-left: 1px solid ${themeStyles.border};
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          right: 0;
          top: 76px;
          z-index: 100;
          overflow-y: auto;
          box-shadow: -4px 0 15px ${themeStyles.shadow};
        }
        .user-info {
          padding: 28px 24px;
          border-bottom: 1px solid ${themeStyles.border};
        }
        .user-avatar {
          width: 68px;
          height: 68px;
          margin: 0 auto 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        .nav-menu {
          flex: 1;
          padding: 20px 16px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-radius: 14px;
          margin-bottom: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.96rem;
          color: ${themeStyles.text2};
          transition: all 0.25s ease;
        }
        .nav-item:hover {
          background: ${theme === 'light' ? '#f1f5f9' : '#1e2937'};
          color: ${themeStyles.text};
        }
        .nav-item.active {
          background: ${theme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.25)'};
          color: ${themeStyles.accent};
          font-weight: 700;
        }
        .nav-icon {
          font-size: 1.4rem;
          width: 32px;
        }
        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-right: 285px;
          margin-top: 76px;
          overflow-y: auto;
          height: calc(100vh - 76px);
          background: ${themeStyles.bg};
        }
        .main-content {
          padding: 42px 48px;
        }
        .greeting {
          font-size: 2.4rem;
          font-weight: 900;
          color: ${themeStyles.text};
          margin-bottom: 6px;
        }
        /* Service Cards */
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .service-card {
          background: ${themeStyles.cardBg};
          border: 1px solid ${themeStyles.cardBorder};
          border-radius: 20px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px -6px ${themeStyles.shadow};
          position: relative;
          overflow: hidden;
        }
        .service-card:hover {
          box-shadow: 0 15px 35px -8px ${themeStyles.shadow};
          border-color: ${themeStyles.accent};
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .service-card:hover::before {
          opacity: 1;
        }
        .card-icon {
          width: 62px;
          height: 62px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 20px;
          background: var(--light);
          color: var(--accent);
        }
        .card-title {
          font-size: 1.18rem;
          font-weight: 800;
          color: ${themeStyles.text};
          margin-bottom: 8px;
        }
        .card-sub {
          font-size: 0.87rem;
          color: ${themeStyles.text3};
          line-height: 1.6;
        }
        .card-footer {
          margin-top: 28px;
          padding-top: 16px;
          border-top: 1px solid ${themeStyles.cardBorder};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quick-btn {
          font-size: 0.82rem;
          font-weight: 700;
          padding: 7px 20px;
          border-radius: 9999px;
          background: var(--light);
          color: var(--accent);
        }
      `}</style>

      <div className="dashboard-root">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-logo">
              <img src={logoImage} alt="الشعار" className="header-logo-img" />
              <div>
                <div className="header-title">إدارة العلاقات العامة والأمن</div>
                <div style={{ fontSize: '0.78rem', color: themeStyles.text3 }}>نظام متكامل</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              color: themeStyles.text3,
              fontSize: '0.95rem',
              alignItems: 'center'
            }}>
              <span>📅 {dateStr}</span>
              <span>⏰ {timeStr}</span>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '9999px',
                padding: '10px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: themeStyles.text2,
                fontSize: '0.92rem'
              }}
            >
              {theme === 'light' ? '🌙 الليلي' : '☀️ النهاري'}
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 24px',
                background: '#fee2e2',
                color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: '9999px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.92rem'
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || '👤'}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '1.12rem',
              fontWeight: 800,
              color: themeStyles.text
            }}>
              {user?.fullName || user?.email?.split('@')[0] || 'مستخدم'}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              color: themeStyles.text3,
              marginTop: '4px'
            }}>
              {user?.email}
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '16px'
            }}>
              <span style={{
                padding: '5px 20px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: theme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.25)',
                color: themeStyles.accent
              }}>
                {user?.role === 'admin' ? 'مدير النظام' :
                 user?.role === 'gps' ? 'مراقب GPS' :
                 user?.role === 'employee' ? 'موظف' : 'مستخدم'}
              </span>
            </div>
          </div>
          <div className="nav-menu">
            <div style={{
              padding: '0 20px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: themeStyles.text3,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              القائمة الرئيسية
            </div>
            {filteredMenuItems.map((item) => (
              <div
                key={item.route}
                className={`nav-item ${activeNav === item.route ? 'active' : ''}`}
                onClick={() => handleNavigation(item.route)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="main-content">
            <div style={{ marginBottom: '48px' }}>
              <div className="greeting">
                {greeting()} {user?.fullName?.split(' ')[0] || ''} 👋
              </div>
              <div style={{ color: themeStyles.text3, fontSize: '1.05rem' }}>
                مرحبا بك في نظام إدارة العلاقات العامة والأمن
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px'
            }}>
              <div style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: themeStyles.text
              }}>
                الخدمات المتاحة
              </div>
              <div style={{
                fontSize: '0.98rem',
                color: themeStyles.text3,
                fontWeight: 600
              }}>
                {filteredMenuItems.length} خدمة
              </div>
            </div>

            <div className="service-grid">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.route}
                  className="service-card"
                  style={{
                    '--accent': item.accent,
                    '--light': item.light
                  }}
                  onClick={() => handleNavigation(item.route)}
                >
                  <div className="card-icon">
                    {item.icon}
                  </div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-sub">{item.sub}</div>
                 
                  <div className="card-footer">
                    <div className="quick-btn">دخول سريع</div>
                    <div style={{ fontSize: '1.8rem', opacity: 0.4 }}>→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}