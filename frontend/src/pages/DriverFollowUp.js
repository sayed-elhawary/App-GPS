// frontend/src/pages/DriverFollowUp.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateString;
  } catch {
    return '—';
  }
};

const getTodayDate = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  return `${day} / ${month} / ${year}`;
};

// دالة تصدير PDF مع الحقل الجديد "اتجاهات المندوب"
const exportToPDF = async (drivers) => {
  if (!drivers || drivers.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }

  try {
    const currentDate = getTodayDate();
    const currentYear = new Date().getFullYear();
    let allRows = '';

    drivers.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      allRows += `
        <tr style="background:${rowBg};">
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${index + 1}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;font-size:12px;color:#6b21a8;">${item.code || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${item.carType || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">
            <span style="background:${item.carCategory === 'ملاكي' ? '#dcfce7' : '#fed7aa'};padding:3px 10px;border-radius:14px;font-size:11px;">
              ${item.carCategory || '-'}
            </span>
          </td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${item.management || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${item.delegateName || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${item.delegateDirections || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-size:12px;direction:ltr;">${item.plateNumber || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;font-size:12px;">${item.driverName || 'بدون سائق'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;direction:ltr;font-size:12px;">${item.phoneNumber || '-'}</td>
          <td style="padding:10px 8px;border:1px solid #e2e8f0;text-align:center;">
            <span style="background:${item.status === 'نشطة' ? '#e0f2fe' : item.status === 'تحت الصيانة' ? '#fef3c7' : '#fee2e2'};padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;color:${item.status === 'نشطة' ? '#1e40af' : '#b45309'};">
              ${item.status || 'نشطة'}
            </span>
          </td>
        </tr>`;
    });

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-99999px';
    iframe.style.left = '-99999px';
    iframe.style.width = '1480px';
    iframe.style.height = '10000px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Cairo',sans-serif; background:white; direction:rtl; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #e2e8f0; padding:10px 8px; text-align:center; font-size:12px; }
          #section-header { padding:50px 40px 30px 40px; }
          #section-all { padding:0 40px 40px 40px; }
        </style>
      </head>
      <body>
        <div id="section-header">
          <div style="text-align:center;padding-bottom:25px;border-bottom:4px solid #6b21a8;">
            <h1 style="color:#6b21a8;margin:0;font-size:28px;font-weight:900;">شركة النيل للخرسانة الجاهزة</h1>
            <h2 style="color:#4c1d95;margin:12px 0 8px 0;font-size:20px;font-weight:700;">إدارة العلاقات العامة والأمن</h2>
            <p style="color:#64748b;font-size:15px;margin-top:12px;">التاريخ : ${currentDate}</p>
            <h3 style="color:#6b21a8;margin:20px 0 6px 0;font-size:23px;font-weight:800;">أسماء وأرقام المستلمين لسيارات الشركة</h3>
            <p style="color:#64748b;font-size:13px;margin-top:6px;">إجمالي عدد السيارات: ${drivers.length}</p>
          </div>
        </div>
        <div id="section-all">
          <table style="font-size:12px;">
            <thead>
              <tr style="background:#6b21a8;color:white;">
                <th style="padding:12px 8px;width:45px;">م</th>
                <th style="padding:12px 8px;">كود</th>
                <th style="padding:12px 8px;">النوع</th>
                <th style="padding:12px 8px;">الفئة</th>
                <th style="padding:12px 8px;">الإدارة</th>
                <th style="padding:12px 8px;">اسم المندوب</th>
                <th style="padding:12px 8px;">اتجاهات المندوب</th>
                <th style="padding:12px 8px;">رقم اللوحة</th>
                <th style="padding:12px 8px;">اسم السائق</th>
                <th style="padding:12px 8px;">رقم الموبيل</th>
                <th style="padding:12px 8px;width:90px;">الحالة</th>
              </tr>
            </thead>
            <tbody>${allRows}</tbody>
          </table>
        </div>
        <div style="padding:30px;text-align:center;color:#64748b;font-size:11px;border-top:1px solid #e2e8f0;">
          نظام متابعة سائقين الإدارة - NileMix Management System © ${currentYear}
        </div>
      </body>
      </html>
    `);
    iframeDoc.close();

    await new Promise(resolve => setTimeout(resolve, 900));

    const scale = 2.6;
    const captureSection = async (sectionId) => {
      const el = iframeDoc.getElementById(sectionId);
      if (!el) return null;
      return await html2canvas(el, {
        scale,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        windowWidth: 1480,
      });
    };

    const canvasHeader = await captureSection('section-header');
    const canvasAll = await captureSection('section-all');
    document.body.removeChild(iframe);

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const PAGE_W = pdf.internal.pageSize.getWidth();
    const PAGE_H = pdf.internal.pageSize.getHeight();
    const mmHeight = (canvas) => (canvas.height * PAGE_W) / canvas.width;

    const drawCanvas = (canvas, cursorY) => {
      if (!canvas) return cursorY;
      const imgH_mm = mmHeight(canvas);
      let remaining = imgH_mm;
      let srcY = 0;
      let y = cursorY;

      while (remaining > 0) {
        const spaceLeft = PAGE_H - y;
        if (spaceLeft < 5) {
          pdf.addPage();
          y = 0;
          continue;
        }
        const chunkH = Math.min(remaining, spaceLeft);
        const ratio = chunkH / imgH_mm;
        const chunkPx = Math.ceil(canvas.height * ratio);
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = chunkPx;
        const ctx = tmpCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, canvas.width, chunkPx, 0, 0, canvas.width, chunkPx);
        pdf.addImage(tmpCanvas.toDataURL('image/png'), 'PNG', 0, y, PAGE_W, chunkH);
        y += chunkH;
        srcY += chunkPx;
        remaining -= chunkH;
        if (remaining > 2 && y >= PAGE_H - 2) {
          pdf.addPage();
          y = 0;
        }
      }
      return y;
    };

    let cursorY = 0;
    cursorY = drawCanvas(canvasHeader, cursorY);
    cursorY = drawCanvas(canvasAll, cursorY);

    const fileName = `NileMix_سائقين_الإدارة_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    alert(`✅ تم تصدير PDF بنجاح\nعدد السيارات: ${drivers.length}`);

  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    alert('❌ حدث خطأ أثناء تصدير PDF');
  }
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function DriverFollowUp() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    code: '',
    carType: '',
    management: '',
    delegateName: '',
    delegateDirections: '',     // الحقل الجديد: اتجاهات المندوب
    plateNumber: '',
    driverName: '',
    phoneNumber: '',
    notes: '',
    carCategory: 'ملاكي',
    status: 'نشطة'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('driverFollowUpTheme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('driverFollowUpTheme', newTheme);
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/driver-followup`);
      if (!res.ok) throw new Error('فشل في تحميل البيانات');
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSave = async () => {
    if (!formData.code || !formData.carType || !formData.plateNumber) {
      alert('يرجى ملء الحقول المطلوبة: الكود، نوع السيارة، ورقم اللوحة');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        carType: formData.carType.trim(),
        management: formData.management?.trim() || '',
        delegateName: formData.delegateName?.trim() || '',
        delegateDirections: formData.delegateDirections?.trim() || '',
        plateNumber: formData.plateNumber.trim(),
        driverName: formData.driverName?.trim() || '',
        phoneNumber: formData.phoneNumber?.trim() || '',
        notes: formData.notes?.trim() || '',
        carCategory: formData.carCategory,
        status: formData.status
      };

      const method = editingDriver ? 'PUT' : 'POST';
      const url = editingDriver
        ? `${API_URL}/api/driver-followup/${editingDriver._id}`
        : `${API_URL}/api/driver-followup`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في الحفظ');

      await fetchDrivers();
      setShowModal(false);
      setSuccess(editingDriver ? '✅ تم تعديل البيانات بنجاح' : '✅ تم إضافة السائق بنجاح');
      setTimeout(() => setSuccess(''), 3000);

      setFormData({
        code: '', carType: '', management: '', delegateName: '', delegateDirections: '',
        plateNumber: '', driverName: '', phoneNumber: '', notes: '',
        carCategory: 'ملاكي', status: 'نشطة'
      });
      setEditingDriver(null);
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/driver-followup/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في الحذف');
      await fetchDrivers();
      setDeleteConfirm(null);
      setSuccess('✅ تم الحذف بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('❌ حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (drivers.length === 0) { alert('⚠️ لا توجد بيانات للتصدير'); return; }
    setPdfLoading(true);
    try { await exportToPDF(drivers); } catch (err) { alert('❌ حدث خطأ أثناء تصدير PDF'); } finally { setPdfLoading(false); }
  };

  const openModal = (driver = null) => {
    setError('');
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        code: driver.code || '',
        carType: driver.carType || '',
        management: driver.management || '',
        delegateName: driver.delegateName || '',
        delegateDirections: driver.delegateDirections || '',
        plateNumber: driver.plateNumber || '',
        driverName: driver.driverName || '',
        phoneNumber: driver.phoneNumber || '',
        notes: driver.notes || '',
        carCategory: driver.carCategory || 'ملاكي',
        status: driver.status || 'نشطة'
      });
    } else {
      setEditingDriver(null);
      setFormData({
        code: '', carType: '', management: '', delegateName: '', delegateDirections: '',
        plateNumber: '', driverName: '', phoneNumber: '', notes: '',
        carCategory: 'ملاكي', status: 'نشطة'
      });
    }
    setShowModal(true);
  };

  // إحصائيات
  const activeCars = drivers.filter(d => d.status === 'نشطة').length;
  const maintenanceCars = drivers.filter(d => d.status === 'تحت الصيانة').length;
  const noDriverCars = drivers.filter(d => !d.driverName || d.driverName.trim() === '').length;

  // فلترة حسب التاب
  const filteredDrivers = drivers.filter(d => {
    if (activeTab === 'active') return d.status === 'نشطة';
    if (activeTab === 'maintenance') return d.status === 'تحت الصيانة';
    return true;
  });

  // pagination
  const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); };

  // ثيم
  const isDark = theme === 'dark';

  const T = isDark ? {
    bg: '#0f172a',
    pageBg: '#0f172a',
    cardBg: '#1e2937',
    cardBorder: '#334155',
    text: '#f1f5f9',
    text2: '#cbd5e1',
    text3: '#94a3b8',
    titleColor: '#c4b5fd',
    subtitleColor: '#a5b4fc',
    inputBg: '#334155',
    inputBorder: '#475569',
    tableHeaderBg: '#1e1b4b',
    tableHeaderText: '#e0e7ff',
    tableBorder: '#334155',
    tableRowEven: '#1e2937',
    tableRowOdd: '#243044',
    tableRowHover: 'rgba(139,92,246,0.15)',
    primaryBtn: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    secondaryBtn: '#334155',
    secondaryBtnText: '#cbd5e1',
    tabActiveBg: '#6b21a8',
    tabActiveText: '#ffffff',
    tabInactiveBg: '#1e2937',
    tabInactiveText: '#94a3b8',
    tabBorder: '#334155',
    paginationBorder: '#334155',
    paginationHover: '#334155',
    shadow: 'rgba(0,0,0,0.4)',
    modalBg: '#1e2937',
    modalBorder: '#a78bfa',
    selectBg: '#334155',
  } : {
    bg: '#f1f5f9',
    pageBg: '#f1f5f9',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#1e2937',
    text2: '#475569',
    text3: '#64748b',
    titleColor: '#6b21a8',
    subtitleColor: '#4c1d95',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    tableHeaderBg: '#3730a3',
    tableHeaderText: '#ffffff',
    tableBorder: '#e2e8f0',
    tableRowEven: '#ffffff',
    tableRowOdd: '#f8fafc',
    tableRowHover: '#f3e8ff',
    primaryBtn: 'linear-gradient(135deg, #6b21a8, #8b5cf6)',
    secondaryBtn: '#f1f5f9',
    secondaryBtnText: '#475569',
    tabActiveBg: '#6b21a8',
    tabActiveText: '#ffffff',
    tabInactiveBg: '#ffffff',
    tabInactiveText: '#64748b',
    tabBorder: '#e2e8f0',
    paginationBorder: '#e2e8f0',
    paginationHover: '#f3e8ff',
    shadow: 'rgba(107,33,168,0.08)',
    modalBg: '#ffffff',
    modalBorder: '#a78bfa',
    selectBg: '#ffffff',
  };

  const statusBadge = (status) => {
    const map = {
      'نشطة': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
      'تحت الصيانة': { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
      'موقوفة': { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
      'مباعة': { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
      'بدون سائق': { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' },
    };
    const s = map[status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
        display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  const categoryBadge = (cat) => {
    const map = {
      'ملاكي': { bg: '#dcfce7', color: '#15803d' },
      'نقل': { bg: '#fed7aa', color: '#c2410c' },
      'أجرة': { bg: '#dbeafe', color: '#1d4ed8' },
      'ميني باص': { bg: '#ede9fe', color: '#6d28d9' },
      'أخرى': { bg: '#f1f5f9', color: '#475569' },
    };
    const s = map[cat] || { bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        display: 'inline-block'
      }}>
        {cat}
      </span>
    );
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: `1px solid ${T.inputBorder}`,
    borderRadius: '10px',
    background: T.inputBg,
    color: T.text,
    fontSize: '15px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '7px',
    fontWeight: '700',
    color: T.text2,
    fontSize: '14px',
  };

  return (
    <div style={{
      background: T.pageBg,
      minHeight: '100vh',
      direction: 'rtl',
      padding: '28px',
      fontFamily: "'Cairo', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: isDark ? '#334155' : '#e0e7ff',
              color: T.titleColor,
              border: 'none',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              fontSize: '22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: '1.7rem', fontWeight: '900', color: T.titleColor }}>
              🚗 متابعة سائقين الإدارة
            </div>
            <div style={{ color: T.text3, fontSize: '0.95rem', marginTop: '2px' }}>
              أسماء وأرقام المستلمين لسيارات الشركة
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={toggleTheme} style={{
            background: T.secondaryBtn,
            color: T.secondaryBtnText,
            border: `1px solid ${T.cardBorder}`,
            borderRadius: '10px',
            padding: '10px 18px',
            cursor: 'pointer',
            fontWeight: '600',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '14px',
          }}>
            {isDark ? '☀️ نهاري' : '🌙 ليلي'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || drivers.length === 0}
            style={{
              background: T.primaryBtn,
              color: 'white',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: pdfLoading || drivers.length === 0 ? 'not-allowed' : 'pointer',
              opacity: pdfLoading || drivers.length === 0 ? 0.7 : 1,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
            }}
          >
            {pdfLoading ? '⏳ جاري...' : '📄 تصدير PDF'}
          </button>
          <button
            onClick={() => openModal()}
            style={{
              background: T.primaryBtn,
              color: 'white',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
            }}
          >
            ➕ إضافة سائق جديد
          </button>
        </div>
      </div>

      {/* Company Header */}
      <div style={{
        background: T.cardBg,
        borderRadius: '16px',
        border: `1px solid ${T.cardBorder}`,
        padding: '22px 30px',
        marginBottom: '20px',
        textAlign: 'center',
        boxShadow: `0 2px 12px ${T.shadow}`,
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: T.titleColor }}>شركة النيل للخرسانة الجاهزة</div>
        <div style={{ fontSize: '1rem', color: T.subtitleColor, marginTop: '4px' }}>إدارة العلاقات العامة والأمن</div>
        <div style={{ color: T.text3, fontSize: '0.9rem', marginTop: '4px' }}>التاريخ : {getTodayDate()}</div>
        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: T.titleColor, marginTop: '8px' }}>أسماء وأرقام المستلمين لسيارات الشركة</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { icon: '🚗', label: 'إجمالي السيارات', value: drivers.length, color: T.titleColor },
          { icon: '✅', label: 'سيارات نشطة', value: activeCars, color: '#16a34a' },
          { icon: '🔧', label: 'تحت الصيانة', value: maintenanceCars, color: '#d97706' },
          { icon: '👤', label: 'بدون سائق', value: noDriverCars, color: '#dc2626' },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.cardBg,
            border: `1px solid ${T.cardBorder}`,
            borderRadius: '14px',
            padding: '18px',
            textAlign: 'center',
            boxShadow: `0 2px 8px ${T.shadow}`,
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: T.text3, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', color: '#ef4444', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #fecaca' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', color: '#10b981', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
          {success}
        </div>
      )}

      {/* Table Card */}
      <div style={{
        background: T.cardBg,
        borderRadius: '16px',
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
        boxShadow: `0 4px 16px ${T.shadow}`,
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          borderBottom: `1px solid ${T.tabBorder}`,
          padding: '0 20px',
          background: T.cardBg,
        }}>
          {[
            { key: 'all', label: `🚗 الكل (${drivers.length})` },
            { key: 'active', label: `✅ نشطة (${activeCars})` },
            { key: 'maintenance', label: `🔧 تحت الصيانة (${maintenanceCars})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '16px 22px',
                border: 'none',
                borderBottom: activeTab === tab.key ? `3px solid #6b21a8` : '3px solid transparent',
                background: 'transparent',
                color: activeTab === tab.key ? T.titleColor : T.text3,
                fontWeight: activeTab === tab.key ? '800' : '600',
                fontFamily: 'Cairo, sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1250px' }}>
            <thead>
              <tr style={{ background: T.tableHeaderBg }}>
                {['#', 'نوع السيارة', 'كود السيارة', 'الفئة', 'الإدارة', 'اسم المندوب', 'اتجاهات المندوب', 'رقم اللوحة', 'اسم السائق', 'رقم الموبيل', 'الحالة', 'إجراءات'].map((h, i) => (
                  <th key={i} style={{
                    padding: '15px 12px',
                    color: T.tableHeaderText,
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    borderBottom: `2px solid ${isDark ? '#312e81' : '#4338ca'}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '80px', color: T.text3, fontSize: '16px' }}>
                    ⏳ جاري التحميل...
                  </td>
                </tr>
              ) : paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '80px', color: T.text3, fontSize: '15px' }}>
                    لا توجد بيانات مسجلة
                  </td>
                </tr>
              ) : (
                paginatedDrivers.map((driver, idx) => {
                  const globalIdx = (currentPage - 1) * rowsPerPage + idx;
                  const rowBg = idx % 2 === 0 ? T.tableRowEven : T.tableRowOdd;
                  return (
                    <tr
                      key={driver._id}
                      style={{ background: rowBg, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.tableRowHover}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                    >
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: T.text3, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{globalIdx + 1}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: T.text, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.carType}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 'bold', color: T.titleColor, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.code}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: `1px solid ${T.tableBorder}` }}>{categoryBadge(driver.carCategory)}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: T.text, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.management || '-'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: T.text, fontSize: '14px', fontWeight: driver.delegateName ? '600' : 'normal', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.delegateName || '-'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', color: T.text, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.delegateDirections || '-'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', direction: 'ltr', color: T.text, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.plateNumber}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: driver.driverName ? 'bold' : 'normal', color: driver.driverName ? T.titleColor : T.text3, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.driverName || 'بدون سائق'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', direction: 'ltr', color: T.text, fontSize: '14px', borderBottom: `1px solid ${T.tableBorder}` }}>{driver.phoneNumber || '-'}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: `1px solid ${T.tableBorder}` }}>{statusBadge(driver.status)}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: `1px solid ${T.tableBorder}` }}>
                        <button onClick={() => openModal(driver)} title="تعديل" style={{ background: 'none', border: 'none', fontSize: '1.2rem', marginLeft: '6px', cursor: 'pointer', color: '#8b5cf6', padding: '4px' }}>✏️</button>
                        <button onClick={() => setDeleteConfirm(driver)} title="حذف" style={{ background: 'none', border: 'none', fontSize: '1.2rem', marginLeft: '6px', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredDrivers.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderTop: `1px solid ${T.tableBorder}`,
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: T.text3, fontSize: '14px' }}>
              <span>عرض</span>
              <select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${T.inputBorder}`,
                  background: T.selectBg,
                  color: T.text,
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {ROWS_PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <span>صفوف</span>
            </div>
            <div style={{ color: T.text3, fontSize: '14px' }}>
              صفحة {currentPage} من {totalPages || 1}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: `1px solid ${T.paginationBorder}`,
                  background: T.cardBg,
                  color: currentPage === 1 ? T.text3 : T.titleColor,
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                السابق
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${currentPage === page ? '#6b21a8' : T.paginationBorder}`,
                      background: currentPage === page ? '#6b21a8' : T.cardBg,
                      color: currentPage === page ? '#ffffff' : T.text,
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '14px',
                      fontWeight: currentPage === page ? '800' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: `1px solid ${T.paginationBorder}`,
                  background: T.cardBg,
                  color: currentPage === totalPages ? T.text3 : T.titleColor,
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
                }}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          onClick={() => !loading && setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 200, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.modalBg,
              borderRadius: '20px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: `1px solid ${T.modalBorder}`,
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              padding: '24px 28px',
              borderBottom: `1px solid ${T.cardBorder}`,
              fontSize: '1.3rem',
              fontWeight: '800',
              color: T.titleColor,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>{editingDriver ? '✏️ تعديل بيانات السائق' : '🚗 إضافة سائق جديد'}</span>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: T.text3 }}
              >✕</button>
            </div>

            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {[
                  { label: 'الكود *', key: 'code', placeholder: 'مثال: A-12' },
                  { label: 'نوع السيارة *', key: 'carType', placeholder: 'مثال: هيونداي إلنترا' },
                  { label: 'الإدارة', key: 'management', placeholder: 'مثال: إدارة الحركة' },
                  { label: 'اسم المندوب', key: 'delegateName', placeholder: 'مثال: أحمد محمد' },
                  { label: 'اتجاهات المندوب', key: 'delegateDirections', placeholder: 'مثال: الهرم - فيصل - شارع الهرم الرئيسي' },
                  { label: 'رقم اللوحة *', key: 'plateNumber', placeholder: 'مثال: ط ط 178', ltr: true },
                  { label: 'اسم السائق', key: 'driverName', placeholder: 'مثال: محمد علي' },
                  { label: 'رقم الموبيل', key: 'phoneNumber', placeholder: 'مثال: 0123456789', ltr: true },
                ].map(({ label, key, placeholder, ltr = false }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      style={{ ...inputStyle, direction: ltr ? 'ltr' : 'rtl' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>الفئة</label>
                  <select
                    value={formData.carCategory}
                    onChange={e => setFormData({ ...formData, carCategory: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="ملاكي">🚗 ملاكي</option>
                    <option value="نقل">🚛 نقل</option>
                    <option value="أجرة">🚕 أجرة</option>
                    <option value="ميني باص">🚐 ميني باص</option>
                    <option value="أخرى">🔧 أخرى</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>الحالة</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="نشطة">✅ نشطة</option>
                    <option value="تحت الصيانة">🔧 تحت الصيانة</option>
                    <option value="موقوفة">⏸ موقوفة</option>
                    <option value="مباعة">💰 مباعة</option>
                    <option value="بدون سائق">👤 بدون سائق</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>ملاحظات</label>
                  <textarea
                    placeholder="أدخل أي ملاحظات إضافية..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    style={{ ...inputStyle, minHeight: '85px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              padding: '20px 28px',
              borderTop: `1px solid ${T.cardBorder}`,
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: T.secondaryBtn,
                  color: T.secondaryBtnText,
                  border: `1px solid ${T.cardBorder}`,
                  padding: '11px 26px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  background: T.primaryBtn,
                  color: 'white',
                  border: 'none',
                  padding: '11px 30px',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  fontWeight: '700',
                  fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px',
                }}
              >
                {loading ? '⏳ جاري الحفظ...' : editingDriver ? 'حفظ التعديلات' : 'إضافة السائق'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 200,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: T.modalBg,
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              border: `1px solid ${T.modalBorder}`,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🗑️</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ef4444', marginBottom: '12px' }}>تأكيد الحذف</div>
            <div style={{ marginBottom: '28px', color: T.text2, lineHeight: '1.6' }}>
              هل أنت متأكد من حذف <strong>{deleteConfirm.code} - {deleteConfirm.carType}</strong>؟<br />
              <span style={{ color: T.text3, fontSize: '13px' }}>لا يمكن التراجع عن هذا الإجراء</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, background: T.secondaryBtn, color: T.secondaryBtnText,
                  border: `1px solid ${T.cardBorder}`, padding: '13px',
                  borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px', fontWeight: '600',
                }}
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                style={{
                  flex: 1, background: '#ef4444', color: 'white',
                  border: 'none', padding: '13px',
                  borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                  fontSize: '14px', fontWeight: '700',
                }}
              >
                نعم، حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}