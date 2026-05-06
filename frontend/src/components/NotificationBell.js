// src/components/NotificationBell.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://192.168.1.172:5000/api';

const NotificationBell = ({ onNotificationClick }) => {
  const { getToken, userRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const notificationSound = useRef(null);
  const lastNotificationCount = useRef(0);

  // تحميل الصوت
  useEffect(() => {
    notificationSound.current = new Audio('/new_massege_tone.mp3');
    notificationSound.current.load();
  }, []);

  // تشغيل الصوت
  const playSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(err => console.log('Sound error:', err));
    }
  };

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data);
        const newUnreadCount = data.unreadCount;
        
        // إذا كان هناك إشعارات جديدة
        if (newUnreadCount > lastNotificationCount.current) {
          playSound();
        }
        
        setUnreadCount(newUnreadCount);
        lastNotificationCount.current = newUnreadCount;
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [getToken]);

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE}/notifications/mark-read/${notificationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // تحديث القائمة
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // تحديد كل الإشعارات كمقروءة
  const markAllAsRead = async () => {
    const token = getToken();
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

  // تحديث الإشعارات كل 10 ثواني
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_trip': return '📦';
      case 'trip_reviewed': return '✅';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `منذ ${seconds} ثانية`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const styles = {
    container: { position: 'relative', display: 'inline-block' },
    bellButton: { 
      background: 'none', 
      border: 'none', 
      fontSize: '24px', 
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      position: 'relative',
      transition: 'background 0.3s'
    },
    badge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '11px',
      fontWeight: 'bold',
      minWidth: '18px',
      textAlign: 'center'
    },
    dropdown: {
      position: 'absolute',
      top: '45px',
      right: '0',
      width: '380px',
      maxHeight: '500px',
      backgroundColor: '#1e2937',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
      zIndex: 1000,
      overflow: 'hidden'
    },
    header: {
      padding: '12px 16px',
      borderBottom: '1px solid #334155',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: { fontSize: '16px', fontWeight: 'bold', color: '#f1f5f9' },
    markAllBtn: { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px' },
    notificationsList: { maxHeight: '400px', overflowY: 'auto' },
    notificationItem: (isRead) => ({
      padding: '12px 16px',
      borderBottom: '1px solid #334155',
      cursor: 'pointer',
      backgroundColor: isRead ? '#1e2937' : '#2d3a4e',
      transition: 'background 0.2s'
    }),
    notificationIcon: { fontSize: '20px', marginLeft: '12px' },
    notificationTitle: { fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' },
    notificationMessage: { fontSize: '12px', color: '#94a3b8', marginBottom: '4px' },
    notificationTime: { fontSize: '10px', color: '#64748b' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#64748b' },
    reviewButton: {
      background: '#10b981',
      border: 'none',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '11px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔 {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>الإشعارات</span>
            {unreadCount > 0 && (
              <button style={styles.markAllBtn} onClick={markAllAsRead}>
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div style={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                📭 لا توجد إشعارات جديدة
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id}
                  style={styles.notificationItem(notif.isRead)}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    if (onNotificationClick) onNotificationClick(notif);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={styles.notificationIcon}>
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={styles.notificationTitle}>{notif.title}</div>
                      <div style={styles.notificationMessage}>{notif.message}</div>
                      <div style={styles.notificationTime}>
                        {getTimeAgo(notif.createdAt)}
                      </div>
                      
                      {notif.reviewedBy && (
                        <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>
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
  );
};

export default NotificationBell;