// frontend/src/pages/StationExecutionData.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function StationExecutionData() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/station-execution`);
      const result = res.data;
      const list = result.success ? result.data || [] : [];
      setData(list);
      setFilteredData(list);
    } catch (err) {
      console.error(err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    setFilteredData(data.filter(item =>
      item.employeeName?.toLowerCase().includes(term) ||
      item.employeeCode?.toLowerCase().includes(term) ||
      item.location?.toLowerCase().includes(term)
    ));
  }, [searchTerm, data]);

  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeName: '',
    phone: '',
    location: ''
  });

  const openModal = (item = null) => {
    setError('');
    setSuccess('');
    if (item) {
      setEditingItem(item);
      setFormData({
        employeeCode: item.employeeCode || '',
        employeeName: item.employeeName || '',
        phone: item.phone || '',
        location: item.location || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ employeeCode: '', employeeName: '', phone: '', location: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingItem) {
        await axios.put(`${API_URL}/api/station-execution/${editingItem._id}`, formData);
        setSuccess('✅ تم تعديل البيانات بنجاح');
      } else {
        await axios.post(`${API_URL}/api/station-execution`, formData);
        setSuccess('✅ تم إضافة السجل بنجاح');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/station-execution/${id}`);
      setSuccess('✅ تم الحذف بنجاح');
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      setError('فشل في عملية الحذف');
    }
  };

  const themeStyles = theme === 'light' ? {
    bg: '#f0f4ff',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    text2: '#475569',
    text3: '#94a3b8',
    titleColor: '#1e3a8a',
    statValue: '#4f6ef7',
    shadow: 'rgba(0, 0, 0, 0.08)',
  } : {
    bg: '#060818',
    cardBg: '#1e293b',
    cardBorder: '#334155',
    text: '#f1f5f9',
    text2: '#cbd5e1',
    text3: '#94a3b8',
    titleColor: '#e2e8f0',
    statValue: '#a5b4fc',
    shadow: 'rgba(0, 0, 0, 0.3)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${themeStyles.bg}; font-family: 'Cairo', sans-serif; }
       
        .camera-root {
          min-height: 100vh;
          background: ${themeStyles.bg};
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          padding: 35px 45px;
        }
        .content-card {
          background: ${themeStyles.cardBg};
          border: 1px solid ${themeStyles.cardBorder};
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px ${themeStyles.shadow};
          padding: 35px;
          min-height: 85vh;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid ${themeStyles.cardBorder}; 
          flex-wrap: wrap; 
          gap: 15px; 
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .back-btn {
          background: ${theme === 'light' ? '#64748b' : '#475569'};
          color: white; 
          border: none; 
          width: 48px; 
          height: 48px; 
          border-radius: 50%; 
          font-size: 22px;
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.25s ease;
        }
        .back-btn:hover { transform: scale(1.05); }
        .title { 
          font-size: 1.8rem; 
          font-weight: 900; 
          color: ${themeStyles.titleColor}; 
        }
        .subtitle { 
          color: ${themeStyles.text3}; 
          font-size: 0.9rem; 
          margin-top: 4px; 
        }
        .header-actions { 
          display: flex; 
          gap: 12px; 
          flex-wrap: wrap; 
        }
        .theme-toggle {
          background: ${themeStyles.cardBg}; 
          border: 1px solid ${themeStyles.cardBorder}; 
          border-radius: 40px;
          padding: 8px 18px; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          cursor: pointer;
          font-weight: 700; 
          color: ${themeStyles.text2};
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f6ef7, #7c3aed); 
          color: white; 
          border: none;
          padding: 10px 22px; 
          border-radius: 14px; 
          font-weight: 800; 
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .btn-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 20px rgba(79, 110, 247, 0.3); 
        }
        .search-wrapper { 
          position: relative; 
          margin-bottom: 24px; 
        }
        .search-input {
          width: 100%; 
          padding: 14px 20px 14px 50px; 
          border: 1.5px solid ${themeStyles.cardBorder};
          border-radius: 16px; 
          background: ${themeStyles.cardBg}; 
          color: ${themeStyles.text};
          font-size: 0.9rem; 
          outline: none;
        }
        .search-input:focus { 
          border-color: #4f6ef7; 
          box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.1); 
        }
        .search-icon { 
          position: absolute; 
          left: 18px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: ${themeStyles.text3}; 
          font-size: 1.1rem; 
        }
        .table-container { 
          overflow-x: auto; 
          border-radius: 16px; 
          border: 1px solid ${themeStyles.cardBorder}; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          min-width: 900px; 
        }
        th {
          background: ${theme === 'light' ? '#4f6ef7' : '#0f172a'}; 
          color: white; 
          padding: 14px 12px;
          text-align: center; 
          font-weight: 800; 
          font-size: 0.85rem;
        }
        td { 
          padding: 12px 10px; 
          text-align: center; 
          border: 1px solid ${themeStyles.cardBorder}; 
          color: ${themeStyles.text2}; 
        }
        tr:hover td { 
          background: ${theme === 'light' ? '#f8fafc' : 'rgba(99, 102, 241, 0.1)'}; 
        }
        .action-buttons { 
          display: flex; 
          gap: 8px; 
          justify-content: center; 
        }
        .edit-btn, .delete-btn {
          width: 32px; 
          height: 32px; 
          border: none; 
          border-radius: 10px; 
          cursor: pointer; 
          font-size: 1rem;
        }
        .edit-btn { 
          background: rgba(79, 110, 247, 0.12); 
          color: #4f6ef7; 
        }
        .delete-btn { 
          background: rgba(239, 68, 68, 0.12); 
          color: #ef4444; 
        }
        .modal-overlay, .delete-overlay {
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.7); 
          backdrop-filter: blur(8px);
          z-index: 200; 
          display: flex; 
          align-items: center; 
          justify-content: center;
        }
        .modal {
          background: ${themeStyles.cardBg}; 
          border: 1px solid ${theme === 'light' ? '#4f6ef7' : '#6366f1'};
          border-radius: 24px; 
          width: 100%; 
          max-width: 800px; 
          max-height: 90vh; 
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .modal-header {
          font-size: 1.3rem; 
          font-weight: 800; 
          padding: 24px 28px; 
          border-bottom: 1px solid ${themeStyles.cardBorder};
          color: ${themeStyles.statValue};
        }
        .modal-body { padding: 28px; }
        .form-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 20px; 
        }
        .form-label { 
          display: block; 
          margin-bottom: 8px; 
          font-weight: 700; 
          color: ${themeStyles.text2}; 
        }
        .form-input {
          width: 100%; 
          padding: 12px 16px; 
          border: 1.5px solid ${themeStyles.cardBorder};
          border-radius: 12px; 
          background: ${themeStyles.cardBg}; 
          color: ${themeStyles.text};
        }
        .modal-footer {
          padding: 20px 28px; 
          background: ${theme === 'light' ? '#4f6ef7' : '#0f172a'};
          border-top: 1px solid ${themeStyles.cardBorder}; 
          display: flex; 
          gap: 15px; 
          justify-content: flex-end;
        }
        .btn-secondary { 
          background: #64748b; 
          color: white; 
          border: none; 
          padding: 10px 22px; 
          border-radius: 14px; 
          font-weight: 800; 
        }
        .error-message, .success-message {
          padding: 14px 20px; 
          border-radius: 14px; 
          margin-bottom: 20px; 
          font-weight: 600;
        }
        .error-message { 
          background: #fef2f2; 
          color: #dc2626; 
          border-right: 4px solid #dc2626; 
        }
        .success-message { 
          background: #ecfdf5; 
          color: #10b981; 
          border-right: 4px solid #10b981; 
        }
        .empty-state { 
          text-align: center; 
          padding: 80px 20px; 
          color: ${themeStyles.text3}; 
        }
      `}</style>

      <div className="camera-root">
        <div className="content-card">
          <div className="header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
              <div>
                <div className="title">📍 بيانات تنفيذ المحطة</div>
                <div className="subtitle">إدارة بيانات الموظفين المنفذين في المحطات</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 وضع ليلي' : '☀️ وضع نهاري'}
              </button>
              <button className="btn-primary" onClick={() => openModal()}>➕ إضافة سجل جديد</button>
            </div>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          <div className="search-wrapper">
            <input
              className="search-input"
              type="text"
              placeholder="ابحث باسم الموظف أو الكود أو الموقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔎</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>كود الموظف</th>
                  <th>اسم الموظف</th>
                  <th>رقم التلفون</th>
                  <th>الموقع / المحطة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="empty-state">جاري تحميل البيانات...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">
                    {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد بيانات حتى الآن'}
                  </td></tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.employeeCode}</td>
                      <td>{item.employeeName}</td>
                      <td>{item.phone}</td>
                      <td>{item.location}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => openModal(item)} title="تعديل">✏️</button>
                          <button className="delete-btn" onClick={() => setDeleteConfirm(item)} title="حذف">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              {editingItem ? '✏️ تعديل بيانات الموظف' : '➕ إضافة موظف جديد'}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div>
                    <label className="form-label">كود الموظف *</label>
                    <input 
                      className="form-input" 
                      required 
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="form-label">اسم الموظف *</label>
                    <input 
                      className="form-input" 
                      required 
                      value={formData.employeeName}
                      onChange={(e) => setFormData({...formData, employeeName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="form-label">رقم التلفون *</label>
                    <input 
                      className="form-input" 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="form-label">الموقع / المحطة *</label>
                    <input 
                      className="form-input" 
                      required 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : editingItem ? '💾 حفظ التعديلات' : '➕ إضافة السجل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="delete-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="delete-modal" style={{background: themeStyles.cardBg, border: '1px solid #ef4444'}}>
            <div className="delete-icon">🗑️</div>
            <div className="delete-title">تأكيد الحذف</div>
            <div className="delete-message">
              هل أنت متأكد من حذف <span style={{color: '#ef4444', fontWeight: 'bold'}}>{deleteConfirm.employeeName}</span>؟
            </div>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>إلغاء</button>
              <button 
                className="btn-primary" 
                style={{background: '#ef4444'}}
                onClick={() => handleDelete(deleteConfirm._id)}
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}