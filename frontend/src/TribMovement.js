import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://192.168.1.172:5000/api';

const TribMovement = () => {
  const { user, userRole, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioRef = useRef(null);

  const [activeTab, setActiveTab] = useState('trips');
  const [theme, setTheme] = useState('dark');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const [stations, setStations] = useState([]);
  const [mixers, setMixers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trips, setTrips] = useState([]);

  // حالة الإشعارات
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newStation, setNewStation] = useState('');
  const [newMixer, setNewMixer] = useState({ 
    code: '', 
    name: '', 
    stationId: '', 
    type: 'mobile', 
    capacity: '' 
  });
  const [newEmployee, setNewEmployee] = useState({ 
    email: '', 
    name: '', 
    password: '', 
    stationId: '', 
    role: 'employee' 
  });

  const [newTrip, setNewTrip] = useState({
    stationId: '',
    mixerId: '',
    employeeCode: '',
    driverCode: '',
    driverName: '',
    loadMeters: '',
    pourLocation: '',
    imageData: null
  });

  const [loadingDriverName, setLoadingDriverName] = useState(false);

  const getAuthToken = useCallback(() => {
    const token = getToken();
    if (token) return token;
    const storedToken = localStorage.getItem('token');
    return storedToken;
  }, [getToken]);

  // تحميل الصوت
  useEffect(() => {
    audioRef.current = new Audio('/new_massege_tone.mp3');
    audioRef.current.load();
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Sound error:', err));
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('tribTheme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tribTheme', newTheme);
  };

  const isAdmin = userRole === 'admin';
  const isGPS = userRole === 'gps';
  const isEmployee = userRole === 'employee';
  const canManageAll = isAdmin || isGPS;

  const userStationId = user?.stationId?._id || user?.stationId;
  const userStationName = user?.stationId?.name || user?.stationName;

  useEffect(() => {
    if (user?.email || user?.code) {
      setNewTrip(prev => ({
        ...prev,
        employeeCode: user?.email || user?.code || ''
      }));
    }
  }, [user]);

  const fetchDriverName = useCallback(async (driverCode) => {
    if (!driverCode || driverCode.trim() === '') {
      setNewTrip(prev => ({ ...prev, driverName: '' }));
      return;
    }

    setLoadingDriverName(true);
    const token = getAuthToken();
    
    try {
      const res = await fetch(`${API_BASE}/client-data/employees?employeeCode=${encodeURIComponent(driverCode.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok && Array.isArray(data) && data.length > 0) {
        const employee = data[0];
        setNewTrip(prev => ({ 
          ...prev, 
          driverName: employee.employeeName || employee.name || '' 
        }));
      } else {
        setNewTrip(prev => ({ ...prev, driverName: '⚠️ كود غير موجود' }));
      }
    } catch (err) {
      console.error('Error fetching driver name:', err);
      setNewTrip(prev => ({ ...prev, driverName: '⚠️ خطأ في الاتصال' }));
    } finally {
      setLoadingDriverName(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (newTrip.driverCode && newTrip.driverCode.trim() !== '') {
        fetchDriverName(newTrip.driverCode);
      } else {
        setNewTrip(prev => ({ ...prev, driverName: '' }));
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [newTrip.driverCode, fetchDriverName]);

  const getFilteredMixersByStation = (stationId) => {
    if (!stationId) return [];
    return mixers.filter(m => String(m.stationId) === String(stationId));
  };

  const availableMixers = canManageAll
    ? (newTrip.stationId ? getFilteredMixersByStation(newTrip.stationId) : mixers)
    : (userStationId ? getFilteredMixersByStation(userStationId) : []);

  const getFilteredStations = () => {
    if (canManageAll) return stations;
    if (isEmployee && userStationId) {
      return stations.filter(s => String(s._id || s.id) === String(userStationId));
    }
    return [];
  };

  const getFilteredTrips = () => {
    if (canManageAll) return trips;
    if (isEmployee && userStationId) {
      return trips.filter(t => String(t.stationId) === String(userStationId));
    }
    return trips;
  };

  const filteredStations = getFilteredStations();
  const filteredTrips = getFilteredTrips();

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !canManageAll) return;

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        const newCount = data.unreadCount || 0;
        
        if (newCount > lastNotificationCount) {
          playNotificationSound();
        }
        
        setUnreadCount(newCount);
        setLastNotificationCount(newCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [getAuthToken, canManageAll, lastNotificationCount]);

  const fetchData = useCallback(async (endpoint, setter, label = '') => {
    const token = getAuthToken();
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setError('انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى');
        logout();
        navigate('/');
        return false;
      }

      const data = await res.json();

      if (res.ok) {
        if (data.success && data.data) {
          setter(data.data);
        } else if (Array.isArray(data)) {
          setter(data);
        } else if (data.data && Array.isArray(data.data)) {
          setter(data.data);
        } else {
          setter([]);
        }
        return true;
      } else {
        setError(data.message || `فشل تحميل ${label}`);
        setter([]);
        return false;
      }
    } catch (err) {
      console.error(`❌ Error fetching ${endpoint}:`, err);
      setError(`خطأ في الاتصال: ${err.message}`);
      setter([]);
      return false;
    }
  }, [getAuthToken, logout, navigate]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchData('/trib-movement/stations', setStations, 'المحطات');
      await fetchData('/trib-movement/mixers', setMixers, 'الخلاطات');
      
      if (canManageAll) {
        await fetchData('/trib-movement/employees', setEmployees, 'الموظفين');
        await fetchNotifications();
      }
      
      await fetchData('/trib-movement/trips', setTrips, 'التربات');
    } catch (err) {
      setError("حدث خطأ في تحديث البيانات");
    } finally {
      setLoading(false);
    }
  }, [fetchData, canManageAll, fetchNotifications]);

  useEffect(() => {
    if (getAuthToken()) {
      refreshAll();
    }
  }, [refreshAll, getAuthToken]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (canManageAll) {
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, canManageAll]);

  const handleStationChange = (stationId) => {
    setNewTrip({ ...newTrip, stationId, mixerId: '' });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewTrip({ ...newTrip, imageData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewTrip({ ...newTrip, imageData: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reviewTrip = async (tripId) => {
    if (!isGPS && !isAdmin) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    const notes = prompt('أدخل ملاحظات المراجعة (اختياري):');
    
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/trips/${tripId}/review`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ notes: notes || '' })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('✅ تم تسجيل المراجعة بنجاح');
        await refreshAll();
        playNotificationSound();
      } else {
        setError(data.message || 'فشل في تسجيل المراجعة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/notifications/mark-read/${notificationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const addStation = async () => {
    if (!canManageAll) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    if (!newStation.trim()) {
      setError("يرجى إدخال اسم المحطة");
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newStation.trim() }),
      });

      const data = await res.json();

      if (res.ok || res.status === 201) {
        setNewStation('');
        setSuccess('تم إضافة المحطة بنجاح');
        await refreshAll();
      } else {
        setError(data.message || 'فشل في إضافة المحطة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const deleteStation = async (id) => {
    if (!canManageAll) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذه المحطة؟')) return;

    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/stations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess('تم حذف المحطة بنجاح');
        await refreshAll();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'فشل في حذف المحطة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const addMixer = async () => {
    if (!canManageAll) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    if (!newMixer.code || !newMixer.stationId) {
      setError('يرجى ملء كود الخلاطة واختيار المحطة');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/mixers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          code: newMixer.code.trim(),
          name: newMixer.name?.trim(),
          stationId: newMixer.stationId,
          type: newMixer.type || 'mobile',
          capacity: newMixer.capacity ? parseFloat(newMixer.capacity) : 0
        }),
      });

      const data = await res.json();

      if (res.ok || res.status === 201) {
        setNewMixer({ code: '', name: '', stationId: '', type: 'mobile', capacity: '' });
        setSuccess('تم تكويد الخلاطة بنجاح');
        await refreshAll();
      } else {
        setError(data.message || 'فشل في تكويد الخلاطة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async () => {
    if (!canManageAll) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    if (!newEmployee.email || !newEmployee.name || !newEmployee.password || !newEmployee.stationId) {
      setError('يرجى ملء جميع حقول الموظف (البريد الإلكتروني، الاسم، كلمة المرور، المحطة)');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          email: newEmployee.email.trim(),
          name: newEmployee.name.trim(),
          password: newEmployee.password,
          role: 'employee',
          stationId: newEmployee.stationId
        }),
      });

      const data = await res.json();

      if (res.ok || res.status === 201) {
        setNewEmployee({ email: '', name: '', password: '', stationId: '', role: 'employee' });
        setSuccess('تم تكويد الموظف بنجاح');
        await refreshAll();
      } else {
        setError(data.message || 'فشل في تكويد الموظف');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const registerTrip = async () => {
    const selectedStationId = canManageAll ? newTrip.stationId : userStationId;
    const selectedMixer = mixers.find(m => m._id === newTrip.mixerId);

    if (!selectedStationId) {
      setError('يرجى اختيار المحطة');
      return;
    }
    if (!newTrip.mixerId || !selectedMixer) {
      setError('يرجى اختيار العربية');
      return;
    }
    if (!newTrip.driverCode || newTrip.driverCode.trim() === '') {
      setError('يرجى إدخال كود السائق');
      return;
    }
    if (!newTrip.loadMeters || parseFloat(newTrip.loadMeters) <= 0) {
      setError('يرجى إدخال كمية حمولة صحيحة');
      return;
    }
    if (!newTrip.pourLocation.trim()) {
      setError('يرجى إدخال موقع الصبة');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    setUploadingImage(true);
    setLoading(true);

    try {
      const tripData = {
        stationId: selectedStationId,
        mixerId: newTrip.mixerId,
        employeeCode: canManageAll ? newTrip.employeeCode.trim() : user?.email,
        driverCode: newTrip.driverCode.trim(),
        driverName: newTrip.driverName,
        loadMeters: parseFloat(newTrip.loadMeters),
        pourLocation: newTrip.pourLocation.trim(),
        imageData: newTrip.imageData
      };

      const res = await fetch(`${API_BASE}/trib-movement/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(tripData),
      });

      const responseData = await res.json();

      if (res.ok || res.status === 201) {
        setNewTrip({
          stationId: '',
          mixerId: '',
          employeeCode: user?.email || user?.code || '',
          driverCode: '',
          driverName: '',
          loadMeters: '',
          pourLocation: '',
          imageData: null
        });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccess('تم تسجيل التربة بنجاح');
        await refreshAll();
        playNotificationSound();
      } else {
        setError(responseData.message || 'فشل في تسجيل التربة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!canManageAll) {
      setError("غير مصرح لك بهذه العملية");
      return;
    }

    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذه التربة؟')) return;

    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trib-movement/trips/${tripId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess('✅ تم حذف التربة بنجاح');
        await refreshAll();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'فشل في حذف التربة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const getStationName = (stationId) => {
    if (!stationId) return 'غير محدد';
    const station = stations.find(s => String(s._id || s.id) === String(stationId));
    return station ? station.name : 'محذوفة';
  };

  const getEmployeeName = (employeeCode) => {
    if (!employeeCode) return 'غير محدد';
    const employee = employees.find(e => e.email === employeeCode || e.code === employeeCode);
    return employee ? employee.name : employeeCode;
  };

  const getMixerName = (trip) => {
    if (!trip.truckCode && !trip.mixerId) return 'غير محدد';
    const mixerCode = trip.truckCode;
    const mixer = mixers.find(m => m.code === mixerCode || m._id === trip.mixerId);
    return mixer?.name ? `${mixer.code} - ${mixer.name}` : (mixerCode || trip.mixerId || 'غير محدد');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  const getAvailableTabs = () => {
    if (canManageAll) {
      return [
        { id: 'stations', label: '🏭 إدارة المحطات' },
        { id: 'mixers', label: '🥄 تكويد الخلاطات' },
        { id: 'employees', label: '👥 تكويد الموظفين' },
        { id: 'trips', label: '📦 تسجيل تربات' }
      ];
    } else {
      return [
        { id: 'trips', label: '📦 تسجيل تربات' }
      ];
    }
  };

  const tabs = getAvailableTabs();
  const currentUserName = user?.name || 'الموظف';

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `منذ ${seconds} ثانية`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const themeStyles = theme === 'light' ? {
    bg: '#f8fafc', headerBg: '#ffffff', cardBg: '#ffffff', border: '#e2e8f0', text: '#0f172a',
    text2: '#475569', text3: '#64748b', accent: '#4338ca', inputBg: '#ffffff', inputBorder: '#cbd5e1',
    buttonPrimary: '#4f46e5', buttonSuccess: '#10b981', buttonPurple: '#7c3aed', buttonOrange: '#ea580c',
    buttonDanger: '#ef4444', tableHeader: '#f1f5f9', notificationBg: '#ffffff', notificationHover: '#f1f5f9'
  } : {
    bg: '#0a0f1c', headerBg: '#111827', cardBg: '#1e2937', border: '#1e2937', text: '#f1f5f9',
    text2: '#cbd5e1', text3: '#94a3b8', accent: '#6366f1', inputBg: '#1e2937', inputBorder: '#334155',
    buttonPrimary: '#4f46e5', buttonSuccess: '#10b981', buttonPurple: '#8b5cf6', buttonOrange: '#f97316',
    buttonDanger: '#ef4444', tableHeader: '#1e2937', notificationBg: '#1e2937', notificationHover: '#2d3a4e'
  };

  const styles = {
    container: { padding: 'clamp(16px, 5vw, 48px)', fontFamily: 'Cairo, sans-serif', direction: 'rtl', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: themeStyles.bg, width: '100%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
    title: { margin: 0, color: themeStyles.text, fontSize: 'clamp(1.5rem, 5vw, 2.4rem)' },
    subtitle: { color: themeStyles.text3, margin: '5px 0 0 0', fontSize: 'clamp(0.8rem, 3vw, 1rem)' },
    buttonGroup: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
    themeBtn: { padding: '8px 16px', background: themeStyles.cardBg, color: themeStyles.text2, border: `1px solid ${themeStyles.border}`, borderRadius: '8px', cursor: 'pointer' },
    backBtn: { padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    refreshBtn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    notificationContainer: { position: 'relative', display: 'inline-block' },
    notificationButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px', borderRadius: '50%', position: 'relative' },
    notificationBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', minWidth: '18px', textAlign: 'center' },
    notificationDropdown: { position: 'absolute', top: '45px', right: '0', width: '380px', maxHeight: '500px', backgroundColor: themeStyles.notificationBg, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', zIndex: 1000, overflow: 'hidden' },
    notificationHeader: { padding: '12px 16px', borderBottom: `1px solid ${themeStyles.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    notificationHeaderTitle: { fontSize: '16px', fontWeight: 'bold', color: themeStyles.text },
    markAllBtn: { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px' },
    notificationsList: { maxHeight: '400px', overflowY: 'auto' },
    notificationItem: (isRead) => ({ padding: '12px 16px', borderBottom: `1px solid ${themeStyles.border}`, cursor: 'pointer', backgroundColor: isRead ? themeStyles.notificationBg : themeStyles.notificationHover, transition: 'background 0.2s' }),
    notificationIcon: { fontSize: '20px', marginLeft: '12px' },
    notificationTitle: { fontSize: '14px', fontWeight: '600', color: themeStyles.text, marginBottom: '4px' },
    notificationMessage: { fontSize: '12px', color: themeStyles.text3, marginBottom: '4px' },
    notificationTime: { fontSize: '10px', color: themeStyles.text3 },
    notificationReviewedBy: { fontSize: '11px', color: '#60a5fa', marginTop: '4px' },
    emptyNotifications: { padding: '40px', textAlign: 'center', color: themeStyles.text3 },
    tabsContainer: { display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: `2px solid ${themeStyles.border}`, overflowX: 'auto', flexWrap: 'wrap' },
    tabButton: (isActive) => ({ padding: '12px 20px', border: 'none', background: isActive ? themeStyles.accent : themeStyles.cardBg, color: isActive ? 'white' : themeStyles.text2, borderRadius: '12px 12px 0 0', fontWeight: '700', cursor: 'pointer', fontSize: 'clamp(0.8rem, 3vw, 1rem)', whiteSpace: 'nowrap' }),
    errorMsg: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px' },
    successMsg: { backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px' },
    formCard: { backgroundColor: themeStyles.cardBg, padding: 'clamp(20px, 4vw, 28px)', borderRadius: '20px', marginBottom: '32px', border: `1px solid ${themeStyles.border}` },
    formTitle: { marginBottom: '20px', fontSize: 'clamp(1.1rem, 4vw, 1.3rem)', fontWeight: '700', color: themeStyles.text },
    reviewButton: { background: '#f59e0b', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    reviewedText: { color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' },
    pendingReviewText: { color: '#f59e0b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' },
    inputFlex: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    input: { padding: '12px', borderRadius: '12px', border: `1px solid ${themeStyles.inputBorder}`, flex: 1, minWidth: '200px', background: themeStyles.inputBg, color: themeStyles.text, fontSize: '1rem' },
    inputReadonly: { padding: '12px', borderRadius: '12px', border: `1px solid ${themeStyles.inputBorder}`, flex: 1, minWidth: '200px', background: themeStyles.tableHeader, color: themeStyles.text2, fontSize: '1rem' },
    select: { padding: '12px', borderRadius: '12px', border: `1px solid ${themeStyles.inputBorder}`, flex: 1, minWidth: '200px', background: themeStyles.inputBg, color: themeStyles.text, fontSize: '1rem' },
    primaryBtn: (disabled) => ({ padding: '12px 24px', background: themeStyles.buttonPrimary, color: 'white', border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }),
    successBtn: (disabled) => ({ padding: '12px 24px', background: themeStyles.buttonSuccess, color: 'white', border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }),
    purpleBtn: (disabled) => ({ padding: '12px 24px', background: themeStyles.buttonPurple, color: 'white', border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }),
    orangeBtn: (disabled) => ({ marginTop: '32px', padding: '16px', background: themeStyles.buttonOrange, color: 'white', border: 'none', borderRadius: '12px', width: '100%', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontSize: '1rem', fontWeight: '700' }),
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px', textAlign: 'right', color: themeStyles.text, fontWeight: '700', whiteSpace: 'nowrap' },
    td: { padding: '12px', borderBottom: `1px solid ${themeStyles.border}`, color: themeStyles.text2 },
    deleteBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '8px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' },
    gridTrips: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    statBox: { marginTop: '16px', padding: '12px', backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.border}`, borderRadius: '12px', textAlign: 'center', color: themeStyles.text },
    label: { fontWeight: '600', display: 'block', marginBottom: '8px', color: themeStyles.text2 },
    imageUploadContainer: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
    imageButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    imageButton: { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
    imagePreview: { marginTop: '10px', position: 'relative', display: 'inline-block' },
    previewImg: { maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: `1px solid ${themeStyles.border}` },
    removeImageBtn: { position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    tripImage: { maxWidth: '50px', maxHeight: '50px', borderRadius: '4px', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer' },
    modalImg: { maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' },
    driverNameHint: { fontSize: '12px', marginTop: '4px', color: loadingDriverName ? themeStyles.buttonPrimary : (newTrip.driverName?.includes('⚠️') ? '#ef4444' : '#10b981') }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚛 حركة التربات</h1>
          <p style={styles.subtitle}>
            {isAdmin && 'لوحة تحكم المدير'}
            {isGPS && 'لوحة تحكم مشرف GPS'}
            {isEmployee && `مرحباً ${currentUserName} - ${userStationName || 'محطة غير محددة'}`}
          </p>
        </div>

        <div style={styles.buttonGroup}>
          {canManageAll && (
            <div style={styles.notificationContainer}>
              <button 
                style={styles.notificationButton}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔 {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div style={styles.notificationDropdown}>
                  <div style={styles.notificationHeader}>
                    <span style={styles.notificationHeaderTitle}>الإشعارات</span>
                    {unreadCount > 0 && (
                      <button style={styles.markAllBtn} onClick={markAllNotificationsAsRead}>
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div style={styles.notificationsList}>
                    {notifications.length === 0 ? (
                      <div style={styles.emptyNotifications}>
                        📭 لا توجد إشعارات جديدة
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id}
                          style={styles.notificationItem(notif.isRead)}
                          onClick={() => {
                            if (!notif.isRead) markNotificationAsRead(notif._id);
                            setShowNotifications(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={styles.notificationIcon}>
                              {notif.type === 'new_trip' ? '📦' : notif.type === 'trip_reviewed' ? '✅' : notif.type === 'system' ? '⚙️' : '🔔'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={styles.notificationTitle}>{notif.title}</div>
                              <div style={styles.notificationMessage}>{notif.message}</div>
                              <div style={styles.notificationTime}>{getTimeAgo(notif.createdAt)}</div>
                              {notif.reviewedBy && (
                                <div style={styles.notificationReviewedBy}>
                                  👤 تمت المراجعة بواسطة: {notif.reviewedBy?.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={toggleTheme} style={styles.themeBtn}>
            {theme === 'light' ? '🌙 ليلي' : '☀️ نهاري'}
          </button>
          <button onClick={goBack} style={styles.backBtn}>🔙 رجوع</button>
          <button onClick={refreshAll} disabled={loading} style={styles.refreshBtn}>
            {loading ? 'جاري التحديث...' : '🔄 تحديث'}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>🚪 تسجيل خروج</button>
        </div>
      </div>

      {tabs.length > 1 && (
        <div style={styles.tabsContainer}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={styles.tabButton(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {error && <div style={styles.errorMsg}>❌ {error}</div>}
      {success && <div style={styles.successMsg}>✓ {success}</div>}

      {/* Stations Tab */}
      {canManageAll && activeTab === 'stations' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ إضافة محطة جديدة</h3>
            <div style={styles.inputFlex}>
              <input 
                type="text" 
                placeholder="اسم المحطة" 
                value={newStation} 
                onChange={(e) => setNewStation(e.target.value)} 
                style={styles.input} 
                onKeyPress={(e) => e.key === 'Enter' && addStation()} 
              />
              <button onClick={addStation} disabled={loading} style={styles.primaryBtn(loading)}>
                {loading ? 'جاري الإضافة...' : 'إنشاء محطة'}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: themeStyles.cardBg, borderRadius: '16px', border: `1px solid ${themeStyles.border}` }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: themeStyles.tableHeader }}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>اسم المحطة</th>
                  <th style={styles.th}>تاريخ الإنشاء</th>
                  <th style={styles.th}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {stations.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: themeStyles.text3 }}>📭 لا توجد محطات بعد</td>
                  </tr>
                ) : (
                  stations.map((station, index) => (
                    <tr key={station._id || station.id || index}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{station.name}</td>
                      <td style={styles.td}>{station.createdAt ? new Date(station.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button onClick={() => deleteStation(station._id || station.id)} style={styles.deleteBtn}>🗑️ حذف</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mixers Tab */}
      {canManageAll && activeTab === 'mixers' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ تكويد خلاطة جديدة</h3>
            <div style={styles.grid2}>
              <input placeholder="كود الخلاطة" value={newMixer.code} onChange={(e) => setNewMixer({ ...newMixer, code: e.target.value })} style={styles.input} />
              <input placeholder="اسم الخلاطة" value={newMixer.name} onChange={(e) => setNewMixer({ ...newMixer, name: e.target.value })} style={styles.input} />
              <select value={newMixer.stationId} onChange={(e) => setNewMixer({ ...newMixer, stationId: e.target.value })} style={styles.select}>
                <option value="">اختر المحطة</option>
                {stations.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
              </select>
              <select value={newMixer.type} onChange={(e) => setNewMixer({ ...newMixer, type: e.target.value })} style={styles.select}>
                <option value="mobile">خلاطة متنقلة</option>
                <option value="stationary">خلاطة ثابتة</option>
              </select>
              <input type="number" placeholder="السعة (م³)" value={newMixer.capacity} onChange={(e) => setNewMixer({ ...newMixer, capacity: e.target.value })} style={styles.input} />
            </div>
            <button onClick={addMixer} disabled={loading || stations.length === 0} style={{ ...styles.successBtn(loading || stations.length === 0), marginTop: '20px', width: '100%' }}>
              حفظ الخلاطة
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: themeStyles.cardBg, borderRadius: '16px', border: `1px solid ${themeStyles.border}` }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: themeStyles.tableHeader }}>
                  <th style={styles.th}>الكود</th>
                  <th style={styles.th}>الاسم</th>
                  <th style={styles.th}>المحطة</th>
                  <th style={styles.th}>النوع</th>
                  <th style={styles.th}>السعة</th>
                </tr>
              </thead>
              <tbody>
                {mixers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: themeStyles.text3 }}>🥄 لا توجد خلاطات بعد</td>
                  </tr>
                ) : (
                  mixers.map(mixer => (
                    <tr key={mixer._id || mixer.id}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{mixer.code}</td>
                      <td style={styles.td}>{mixer.name || '-'}</td>
                      <td style={styles.td}>{getStationName(mixer.stationId)}</td>
                      <td style={styles.td}>{mixer.type === 'mobile' ? 'متنقلة' : 'ثابتة'}</td>
                      <td style={styles.td}>{mixer.capacity || '-'} م³</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {canManageAll && activeTab === 'employees' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ تكويد موظف جديد</h3>
            <div style={styles.grid2}>
              <input placeholder="البريد الإلكتروني" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} style={styles.input} />
              <input placeholder="اسم الموظف" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} style={styles.input} />
              <input placeholder="كلمة المرور" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} style={styles.input} />
              <select value={newEmployee.stationId} onChange={(e) => setNewEmployee({ ...newEmployee, stationId: e.target.value })} style={styles.select}>
                <option value="">اختر المحطة</option>
                {stations.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={addEmployee} disabled={loading || stations.length === 0} style={{ ...styles.purpleBtn(loading || stations.length === 0), marginTop: '20px', width: '100%' }}>
              تكويد الموظف
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: themeStyles.cardBg, borderRadius: '16px', border: `1px solid ${themeStyles.border}` }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: themeStyles.tableHeader }}>
                  <th style={styles.th}>البريد الإلكتروني</th>
                  <th style={styles.th}>الاسم</th>
                  <th style={styles.th}>المحطة</th>
                  <th style={styles.th}>الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: themeStyles.text3 }}>👥 لا توجد موظفين بعد</td>
                  </tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp._id || emp.id}>
                      <td style={styles.td}>{emp.email}</td>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{emp.name}</td>
                      <td style={styles.td}>{getStationName(emp.stationId)}</td>
                      <td style={styles.td}>{emp.role === 'admin' ? 'مدير' : emp.role === 'gps' ? 'مشرف GPS' : 'موظف'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trips Tab */}
      {(activeTab === 'trips' || (!canManageAll && tabs[0]?.id === 'trips')) && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ تسجيل تربة جديدة</h3>
            <div style={styles.gridTrips}>
              <div>
                <label style={styles.label}>المحطة *</label>
                {canManageAll ? (
                  <select value={newTrip.stationId} onChange={(e) => handleStationChange(e.target.value)} style={styles.select}>
                    <option value="">اختر المحطة</option>
                    {stations.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <input type="text" value={userStationName || 'محطة غير محددة'} disabled style={styles.inputReadonly} />
                )}
              </div>

              <div>
                <label style={styles.label}>العربية (الخلاطة) *</label>
                <select value={newTrip.mixerId} onChange={(e) => setNewTrip({ ...newTrip, mixerId: e.target.value })} style={styles.select} disabled={!newTrip.stationId && !userStationId}>
                  <option value="">اختر العربية</option>
                  {availableMixers.map(mixer => (
                    <option key={mixer._id} value={mixer._id}>
                      {mixer.code} {mixer.name ? `- ${mixer.name}` : ''} {mixer.capacity ? `(${mixer.capacity} م³)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>كود الموظف المسجل *</label>
                <input type="text" value={newTrip.employeeCode} disabled style={styles.inputReadonly} />
              </div>

              <div>
                <label style={styles.label}>كود السائق *</label>
                <input 
                  type="text"
                  placeholder="أدخل كود السائق"
                  value={newTrip.driverCode}
                  onChange={(e) => setNewTrip({ ...newTrip, driverCode: e.target.value })}
                  style={styles.input}
                />
                {newTrip.driverName && (
                  <div style={styles.driverNameHint}>
                    {loadingDriverName ? '⏳ جاري البحث...' : `👤 ${newTrip.driverName}`}
                  </div>
                )}
              </div>

              <div>
                <label style={styles.label}>الكمية (م³) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="مثال: 12.5" 
                  value={newTrip.loadMeters} 
                  onChange={(e) => setNewTrip({ ...newTrip, loadMeters: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>موقع الصبة *</label>
                <input 
                  placeholder="مثال: مشروع الإسكان" 
                  value={newTrip.pourLocation} 
                  onChange={(e) => setNewTrip({ ...newTrip, pourLocation: e.target.value })} 
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>صورة البون</label>
                <div style={styles.imageUploadContainer}>
                  <div style={styles.imageButtons}>
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ ...styles.imageButton, background: themeStyles.buttonPrimary, color: 'white' }}>📁 رفع صورة</button>
                    <button onClick={openCamera} style={{ ...styles.imageButton, background: '#10b981', color: 'white' }}>📷 تصوير</button>
                    <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                  {imagePreview && (
                    <div style={styles.imagePreview}>
                      <img src={imagePreview} alt="معاينة" style={styles.previewImg} />
                      <button onClick={removeImage} style={styles.removeImageBtn}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={registerTrip} 
              disabled={loading || uploadingImage || (!newTrip.stationId && !userStationId) || !newTrip.mixerId || !newTrip.driverCode} 
              style={styles.orangeBtn(loading || uploadingImage || (!newTrip.stationId && !userStationId) || !newTrip.mixerId || !newTrip.driverCode)}
            >
              {uploadingImage ? '⏳ جاري رفع الصورة...' : loading ? '⏳ جاري التسجيل...' : '📦 تسجيل ترب جديد'}
            </button>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px', fontSize: 'clamp(1.1rem, 4vw, 1.2rem)', fontWeight: '700', color: themeStyles.text }}>
              📋 قائمة التربات المسجلة ({filteredTrips.length})
            </h3>
            <div style={{ overflowX: 'auto', backgroundColor: themeStyles.cardBg, borderRadius: '16px', border: `1px solid ${themeStyles.border}` }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: themeStyles.tableHeader }}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>المحطة</th>
                    <th style={styles.th}>العربية</th>
                    <th style={styles.th}>الموظف المسجل</th>
                    <th style={styles.th}>السائق</th>
                    <th style={styles.th}>الكمية</th>
                    <th style={styles.th}>موقع الصبة</th>
                    <th style={styles.th}>الصورة</th>
                    <th style={styles.th}>التاريخ</th>
                    <th style={styles.th}>المراجعة</th>
                    {canManageAll && <th style={styles.th}>إجراءات</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={canManageAll ? 11 : 10} style={{ textAlign: 'center', padding: '40px', color: themeStyles.text3 }}>
                        📭 لا توجد تربة مسجلة بعد
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((trip, index) => (
                      <tr key={trip._id || trip.id || index}>
                        <td style={styles.td}>{index + 1}</td>
                        <td style={styles.td}>{getStationName(trip.stationId)}</td>
                        <td style={styles.td}>{getMixerName(trip)}</td>
                        <td style={styles.td}>{getEmployeeName(trip.employeeCode)}</td>
                        <td style={styles.td}>
                          {trip.driverCode} {trip.driverName ? `- ${trip.driverName}` : ''}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '600', color: '#059669' }}>{trip.loadMeters} م³</td>
                        <td style={styles.td}>{trip.pourLocation}</td>
                        <td style={styles.td}>
                          {trip.imageUrl ? (
                            <img src={trip.imageUrl} alt="البون" style={styles.tripImage} onClick={() => setModalImage(trip.imageUrl)} />
                          ) : trip.imageData ? (
                            <img src={trip.imageData} alt="البون" style={styles.tripImage} onClick={() => setModalImage(trip.imageData)} />
                          ) : '-'}
                        </td>
                        <td style={{ ...styles.td, fontSize: '0.8rem' }}>
                          {trip.createdAt ? new Date(trip.createdAt).toLocaleString('ar-EG') : 'غير محدد'}
                        </td>
                        <td style={styles.td}>
                          {!trip.reviewedBy ? (
                            isGPS || isAdmin ? (
                              <button 
                                onClick={() => reviewTrip(trip._id)}
                                style={styles.reviewButton}
                                disabled={loading}
                              >
                                ⏳ مراجعة
                              </button>
                            ) : (
                              <span style={styles.pendingReviewText}>⏳ تحت المراجعة</span>
                            )
                          ) : (
                            <span style={styles.reviewedText}>
                              ✅ تمت بواسطة: {trip.reviewedByName || trip.reviewedBy?.name || 'تمت'}
                            </span>
                          )}
                        </td>
                        {canManageAll && (
                          <td style={styles.td}>
                            <button onClick={() => deleteTrip(trip._id)} style={styles.deleteBtn}>🗑️ حذف</button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredTrips.length > 0 && (
              <div style={styles.statBox}>
                📊 إجمالي كمية التربة: <strong>
                  {filteredTrips.reduce((sum, t) => sum + (parseFloat(t.loadMeters) || 0), 0).toFixed(2)}
                </strong> م³
              </div>
            )}
          </div>
        </div>
      )}

      {modalImage && (
        <div style={styles.modal} onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="صورة مكبرة" style={styles.modalImg} />
        </div>
      )}
    </div>
  );
};

export default TribMovement;