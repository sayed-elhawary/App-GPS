// src/Login.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import logoImage from './logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  const navigate = useNavigate();
  const { login: contextLogin, isAuthenticated } = useAuth();

  // الحصول على API_URL بطريقة آمنة
  const getApiUrl = () => {
    const envUrl = process.env.REACT_APP_API_URL;
    console.log('REACT_APP_API_URL from env:', envUrl);
   
    if (envUrl && envUrl !== 'undefined' && envUrl !== '') {
      return envUrl;
    }
    return 'http://localhost:5000';
  };

  const API_URL = getApiUrl();
  console.log('Final API_URL:', API_URL);

  // التحقق من المصادقة عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // تحميل الإيميل المحفوظ والثيم
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    const savedTheme = localStorage.getItem('loginTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('loginTheme', newTheme);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('=== STARTING LOGIN PROCESS ===');
    console.log('Email:', email);
    console.log('API_URL:', API_URL);

    if (!API_URL || API_URL === 'undefined' || API_URL === '') {
      setError('حدث خطأ في تكوين الاتصال بالسيرفر');
      setLoading(false);
      return;
    }

    const loginUrl = `${API_URL}/api/auth/login`;

    try {
      const response = await axios.post(loginUrl, {
        email,
        password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      console.log('=== LOGIN RESPONSE ===', response.data);

      const token = response.data.token;
      const userData = response.data.user;

      if (!token) {
        throw new Error('لم يتم استلام التوكن');
      }

      console.log('Token received:', token.substring(0, 20) + '...');
      console.log('User data:', userData);

      // حفظ التوكن في localStorage أولاً
      localStorage.setItem('token', token);
      
      // IMPORTANT: ترتيب المعاملات حسب AuthContext
      // AuthContext.login يتوقع (token, userData)
      contextLogin(token, userData);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      console.log('Login successful, redirecting to dashboard...');
      
      // تأخير صغير للسماح بحفظ البيانات
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
      
    } catch (err) {
      console.error('=== LOGIN ERROR ===', err);
     
      if (err.code === 'ECONNABORTED') {
        setError('انتهت مهلة الاتصال. تأكد من تشغيل السيرفر');
      } else if (err.response) {
        setError(err.response.data?.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
      } else if (err.request) {
        setError(`لا يمكن الاتصال بالسيرفر (${API_URL}). تأكد من تشغيل السيرفر`);
      } else {
        setError('حدث خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  };

  // ألوان احترافية راقية (غير فاقعة)
  const themeStyles = theme === 'light' ? {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    titleColor: '#0f172a',
    subtitleColor: '#475569',
    labelColor: '#334155',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    inputText: '#1e293b',
    checkboxColor: '#475569',
    forgotColor: '#475569',
    btnBg: 'linear-gradient(135deg, #334155, #1e293b)',
    btnHover: 'linear-gradient(135deg, #1e293b, #0f172a)',
    errorBg: '#fef2f2',
    errorText: '#b91c1c',
    adminLinkColor: '#64748b',
    adminLinkColor2: '#334155',
    shadow: 'rgba(15, 23, 42, 0.06)',
    toggleBg: '#ffffff',
    toggleBorder: '#e2e8f0',
    toggleText: '#334155',
    inputFocusBorder: '#334155',
    inputFocusShadow: 'rgba(51, 65, 85, 0.12)',
    linkHover: '#1e293b',
    placeholderColor: '#94a3b8'
  } : {
    bg: '#0a0f1c',
    cardBg: '#121a2e',
    cardBorder: '#1e2937',
    titleColor: '#f1f5f9',
    subtitleColor: '#94a3b8',
    labelColor: '#cbd5e1',
    inputBg: '#1e2937',
    inputBorder: '#334155',
    inputText: '#f1f5f9',
    checkboxColor: '#94a3b8',
    forgotColor: '#94a3b8',
    btnBg: 'linear-gradient(135deg, #475569, #334155)',
    btnHover: 'linear-gradient(135deg, #334155, #1e2937)',
    errorBg: '#431407',
    errorText: '#fda4af',
    adminLinkColor: '#94a3b8',
    adminLinkColor2: '#cbd5e1',
    shadow: 'rgba(0, 0, 0, 0.4)',
    toggleBg: '#121a2e',
    toggleBorder: '#1e2937',
    toggleText: '#e2e8f0',
    inputFocusBorder: '#64748b',
    inputFocusShadow: 'rgba(100, 116, 139, 0.15)',
    linkHover: '#cbd5e1',
    placeholderColor: '#64748b'
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
          font-family: 'Cairo', sans-serif;
          background: ${themeStyles.bg};
          transition: background 0.4s ease;
        }

        .login-root {
          min-height: 100vh;
          background: ${themeStyles.bg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          transition: background 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .login-card {
          background: ${themeStyles.cardBg};
          border: 1px solid ${themeStyles.cardBorder};
          width: 100%;
          max-width: 440px;
          min-height: 580px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px ${themeStyles.shadow};
          padding: 48px 40px 40px;
          margin: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .login-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 60px -15px ${theme === 'light' ? 'rgba(15, 23, 42, 0.1)' : 'rgba(0, 0, 0, 0.5)'};
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        .logo {
          width: 110px;
          height: 110px;
          border-radius: 22px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px -10px rgba(51, 65, 85, 0.25);
          transition: all 0.3s ease;
          border: 1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'};
        }

        .logo:hover {
          transform: scale(1.06);
          box-shadow: 0 15px 40px -8px rgba(51, 65, 85, 0.3);
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .title {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          color: ${themeStyles.titleColor};
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .subtitle {
          text-align: center;
          color: ${themeStyles.subtitleColor};
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
          margin-bottom: 36px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: ${themeStyles.labelColor};
        }

        .input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid ${themeStyles.inputBorder};
          border-radius: 16px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          background: ${themeStyles.inputBg};
          color: ${themeStyles.inputText};
          font-family: 'Cairo', sans-serif;
          text-align: right;
        }

        .input::placeholder {
          color: ${themeStyles.placeholderColor};
        }

        .input:focus {
          border-color: ${themeStyles.inputFocusBorder};
          box-shadow: 0 0 0 4px ${themeStyles.inputFocusShadow};
        }

        .options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 0 28px;
          font-size: 14px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${themeStyles.checkboxColor};
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox input {
          width: 17px;
          height: 17px;
          cursor: pointer;
          accent-color: #475569;
        }

        .forgot {
          color: ${themeStyles.forgotColor};
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .forgot:hover {
          color: ${themeStyles.linkHover};
          text-decoration: underline;
        }

        .login-btn {
          width: 100%;
          background: ${themeStyles.btnBg};
          color: white;
          border: none;
          padding: 15px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Cairo', sans-serif;
          margin-top: 8px;
        }

        .login-btn:hover:not(:disabled) {
          background: ${themeStyles.btnHover};
          transform: translateY(-2px);
          box-shadow: 0 12px 25px -5px rgba(51, 65, 85, 0.35);
        }

        .login-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .error {
          background: ${themeStyles.errorBg};
          color: ${themeStyles.errorText};
          padding: 12px 16px;
          border-radius: 14px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 13.5px;
          font-weight: 600;
        }

        .admin-link {
          text-align: center;
          font-size: 13.5px;
          color: ${themeStyles.adminLinkColor};
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid ${themeStyles.cardBorder};
        }

        .admin-link a {
          color: ${themeStyles.adminLinkColor2};
          font-weight: 700;
          text-decoration: none;
        }

        .admin-link a:hover {
          text-decoration: underline;
        }

        .theme-toggle {
          position: fixed;
          top: 24px;
          left: 24px;
          background: ${themeStyles.toggleBg};
          border: 1px solid ${themeStyles.toggleBorder};
          border-radius: 50px;
          padding: 9px 22px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: ${themeStyles.toggleText};
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div className="login-root">
        <div className="theme-toggle" onClick={toggleTheme}>
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? 'داكن' : 'فاتح'}</span>
        </div>

        <div className="login-card">
          <div className="logo-container">
            <div className="logo">
              <img
                src={logoImage}
                alt="شعار إدارة العلاقات العامة والأمن"
                className="logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="width:100%;height:100%;background:#ffffff;display:flex;align-items:center;justify-content:center;border-radius:22px;">
                      <span style="color:#1e293b;font-size:42px;font-weight:900;">إدارة</span>
                    </div>
                  `;
                }}
              />
            </div>
          </div>

          <h1 className="title">مرحباً بك</h1>
          <p className="subtitle">إدارة العلاقات العامة والأمن</p>

          {error && <div className="error">{error}</div>}

          <div className="form-content" style={{ flex: 1 }}>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>كلمة المرور</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="options">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  تذكرني
                </label>
                <a href="#!" className="forgot" onClick={(e) => e.preventDefault()}>
                  نسيت كلمة المرور؟
                </a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>

          <div className="admin-link">
            ليس لديك حساب؟ <a href="#!" onClick={(e) => e.preventDefault()}>تواصل مع المسؤول</a>
          </div>
        </div>
      </div>
    </>
  );
}