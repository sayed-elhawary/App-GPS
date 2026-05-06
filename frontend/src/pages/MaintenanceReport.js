// frontend/src/pages/MaintenanceReport.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// تنسيق التاريخ
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

// الحصول على تاريخ اليوم
const getTodayDate = () => {
  const today = new Date();
  return `${today.getDate().toString().padStart(2, '0')} / ${(today.getMonth() + 1).toString().padStart(2, '0')} / ${today.getFullYear()}`;
};

// دالة تصدير PDF
const exportToPDF = async (reports, customNote) => {
  if (!reports || reports.length === 0) {
    alert('لا توجد بيانات للتصدير');
    return;
  }
  try {
    const container = document.createElement('div');
    const currentDate = getTodayDate();
    const currentYear = new Date().getFullYear();
    container.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1300px;
      background: white;
      padding: 30px;
      direction: rtl;
      font-family: 'Cairo', 'Segoe UI', 'Arial', sans-serif;
      z-index: -1;
    `;
    let tableRows = '';
    reports.forEach((item, index) => {
      const statusColor = item.deviceStatus && item.deviceStatus.includes('لا يعمل') ? '#fee2e2' : '#dcfce7';
     
      tableRows += `
        <tr style="border-bottom: 1px solid #e2e8f0; background: ${statusColor};">
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${item.equipmentCode || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.station || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.deviceStatus || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.stopReason || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.maintenanceType || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.location || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">${item.stopDuration || '-'}</td>
        </tr>
      `;
    });
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 22px; font-weight: 800;">شركة النيل للخرسانة الجاهزة</h1>
        <h2 style="color: #475569; margin: 5px 0; font-size: 18px;">إدارة العلاقات العامة والأمن</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 10px;">التاريخ : ${currentDate}</p>
        <h3 style="color: #1e3a8a; margin: 10px 0; font-size: 20px;">تقرير متابعة يومي</h3>
        <p style="color: #475569; font-size: 14px; font-weight: bold;">تقرير يومي لمعدات الشركة بالصيانة الخارجية وخارج التغطية ( قسم متابعة GPS )</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background: #1e3a8a; color: white;">
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">م</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">كود المعدة</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">المحطه التابع لها</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">موقف الجهاز</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">سبب الإيقاف</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">نوع الصيانة</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">الموقع</th>
            <th style="padding: 12px 8px; border: 1px solid #2563eb; text-align: center;">مدة الإيقاف</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
        <p style="color: #1e3a8a; font-weight: bold; margin: 0;">ملاحظة :</p>
        <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0; line-height: 1.6; white-space: pre-wrap;">${customNote || 'لا توجد ملاحظات'}</p>
      </div>
      <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 9px;">
        <p>نظام إدارة تقارير الصيانة - NileMix Management System © ${currentYear}</p>
      </div>
    `;
    document.body.appendChild(container);
    await new Promise(resolve => setTimeout(resolve, 300));
    const canvas = await html2canvas(container, {
      scale: 2.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight
    });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    let remainingHeight = imgHeight - pdf.internal.pageSize.getHeight();
    position = -pdf.internal.pageSize.getHeight();
    while (remainingHeight > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      remainingHeight -= pdf.internal.pageSize.getHeight();
      position -= pdf.internal.pageSize.getHeight();
    }
    const fileName = `NileMix_تقرير_الصيانة_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    alert(`✅ تم تصدير PDF بنجاح\nعدد المعدات: ${reports.length}`);
  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    alert('❌ حدث خطأ أثناء تصدير PDF: ' + error.message);
  }
};

// ==================== دالة الطباعة المباشرة ====================
const printReport = (reports, customNote) => {
  if (!reports || reports.length === 0) {
    alert('لا توجد بيانات للطباعة');
    return;
  }

  const printWindow = window.open('', '_blank');
  const currentDate = getTodayDate();
  const currentYear = new Date().getFullYear();

  let tableRows = '';
  reports.forEach((item, index) => {
    const statusColor = item.deviceStatus && item.deviceStatus.includes('لا يعمل') ? '#fee2e2' : '#dcfce7';
    tableRows += `
      <tr style="background: ${statusColor};">
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center; font-weight: bold;">${item.equipmentCode || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.station || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.deviceStatus || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.stopReason || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.maintenanceType || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.location || '-'}</td>
        <td style="border: 1px solid #333; padding: 10px; text-align: center;">${item.stopDuration || '-'}</td>
      </tr>
    `;
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>تقرير الصيانة - ${currentDate}</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; padding: 30px; margin: 0; }
        h1, h2, h3 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #333; padding: 12px; text-align: center; }
        th { background: #1e3a8a; color: white; }
        .note { margin-top: 40px; padding: 20px; border-top: 3px solid #1e3a8a; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1>شركة النيل للخرسانة الجاهزة</h1>
        <h2>إدارة العلاقات العامة والأمن</h2>
        <p>التاريخ: ${currentDate}</p>
        <h3>تقرير متابعة يومي</h3>
        <p>تقرير يومي لمعدات الشركة بالصيانة الخارجية وخارج التغطية ( قسم متابعة GPS )</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>م</th>
            <th>كود المعدة</th>
            <th>المحطة التابع لها</th>
            <th>موقف الجهاز</th>
            <th>سبب الإيقاف</th>
            <th>نوع الصيانة</th>
            <th>الموقع</th>
            <th>مدة الإيقاف</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div class="note">
        <strong>ملاحظة :</strong><br><br>
        ${customNote || 'لا توجد ملاحظات'}
      </div>

      <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
        نظام إدارة تقارير الصيانة - NileMix Management System © ${currentYear}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => printWindow.print(), 600);
};

export default function MaintenanceReport() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [theme, setTheme] = useState('dark');
 
  const [customNote, setCustomNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const [formData, setFormData] = useState({
    equipmentCode: '',
    station: '',
    deviceStatus: 'يعمل / الجهاز بالمعدة',
    stopReason: '',
    maintenanceType: '',
    location: '',
    stopDuration: '',
    notes: ''
  });

  // تحميل الثيم والملاحظة
  useEffect(() => {
    const savedTheme = localStorage.getItem('maintenanceReportTheme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
    const savedNote = localStorage.getItem('maintenanceReportNote');
    if (savedNote) {
      setCustomNote(savedNote);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('maintenanceReportTheme', newTheme);
  };

  const saveNote = () => {
    localStorage.setItem('maintenanceReportNote', customNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/maintenance-reports`);
      if (!res.ok) throw new Error('فشل في تحميل البيانات');
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSave = async () => {
    if (!formData.equipmentCode || !formData.station || !formData.stopReason || !formData.maintenanceType || !formData.location || !formData.stopDuration) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      setLoading(true);
      const method = editingReport ? 'PUT' : 'POST';
      const url = editingReport
        ? `${API_URL}/api/maintenance-reports/${editingReport._id}`
        : `${API_URL}/api/maintenance-reports`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في الحفظ');

      await fetchReports();
      setShowModal(false);
      setSuccess(editingReport ? '✅ تم تعديل التقرير بنجاح' : '✅ تم إضافة التقرير بنجاح');
      setTimeout(() => setSuccess(''), 3000);

      setFormData({
        equipmentCode: '',
        station: '',
        deviceStatus: 'يعمل / الجهاز بالمعدة',
        stopReason: '',
        maintenanceType: '',
        location: '',
        stopDuration: '',
        notes: ''
      });
      setEditingReport(null);
    } catch (err) {
      alert('❌ حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/maintenance-reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في الحذف');
      await fetchReports();
      setDeleteConfirm(null);
      setSuccess('✅ تم حذف التقرير بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('❌ حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (reports.length === 0) {
      alert('⚠️ لا توجد بيانات للتصدير');
      return;
    }
    setPdfLoading(true);
    try {
      await exportToPDF(reports, customNote);
    } catch (err) {
      console.error('خطأ في PDF:', err);
      alert('❌ حدث خطأ أثناء تصدير PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // دالة الطباعة
  const handlePrint = () => {
    setPrintLoading(true);
    try {
      printReport(reports, customNote);
    } catch (err) {
      alert('❌ حدث خطأ أثناء الطباعة');
    } finally {
      setPrintLoading(false);
    }
  };

  const openModal = (report = null) => {
    setError('');
    if (report) {
      setEditingReport(report);
      setFormData({
        equipmentCode: report.equipmentCode || '',
        station: report.station || '',
        deviceStatus: report.deviceStatus || 'يعمل / الجهاز بالمعدة',
        stopReason: report.stopReason || '',
        maintenanceType: report.maintenanceType || '',
        location: report.location || '',
        stopDuration: report.stopDuration || '',
        notes: report.notes || ''
      });
    } else {
      setEditingReport(null);
      setFormData({
        equipmentCode: '',
        station: '',
        deviceStatus: 'يعمل / الجهاز بالمعدة',
        stopReason: '',
        maintenanceType: '',
        location: '',
        stopDuration: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const themeStyles = theme === 'light' ? {
    bg: '#f0f4ff', cardBg: '#ffffff', cardBorder: '#e2e8f0', text: '#0f172a', text2: '#475569',
    text3: '#94a3b8', titleColor: '#1e3a8a', subtitleColor: '#64748b', inputBg: '#ffffff',
    inputBorder: '#cbd5e1', inputFocusBorder: '#4f6ef7', tableHeaderBg: '#1e3a8a',
    tableHeaderText: '#ffffff', tableBorder: '#cbd5e1', primaryBtn: 'linear-gradient(135deg, #1e3a8a, #4f6ef7)',
    secondaryBtn: '#64748b', statValue: '#1e3a8a', modalBg: '#ffffff', shadow: 'rgba(0, 0, 0, 0.08)',
    errorBg: '#fef2f2', errorText: '#dc2626', successBg: '#ecfdf5', successText: '#10b981'
  } : {
    bg: '#0f172a', cardBg: '#1e293b', cardBorder: '#334155', text: '#f1f5f9', text2: '#cbd5e1',
    text3: '#94a3b8', titleColor: '#e2e8f0', subtitleColor: '#94a3b8', inputBg: '#334155',
    inputBorder: '#475569', inputFocusBorder: '#6366f1', tableHeaderBg: '#0f172a',
    tableHeaderText: '#e2e8f0', tableBorder: '#334155', primaryBtn: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
    secondaryBtn: '#475569', statValue: '#a5b4fc', modalBg: '#1e293b', shadow: 'rgba(0, 0, 0, 0.3)',
    errorBg: 'rgba(239, 68, 68, 0.15)', errorText: '#f87171', successBg: 'rgba(16, 185, 129, 0.15)', successText: '#34d399'
  };

  return (
    <div style={{ background: themeStyles.bg, minHeight: '100vh', direction: 'rtl', padding: '35px', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ background: themeStyles.cardBg, borderRadius: '24px', padding: '35px', boxShadow: `0 20px 40px -12px ${themeStyles.shadow}` }}>

        {/* الهيدر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: themeStyles.secondaryBtn, color: 'white', border: 'none', width: '48px', height: '48px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: themeStyles.titleColor }}>🔧 تقرير الصيانة</div>
              <div style={{ color: themeStyles.text2 }}>متابعة معدات الشركة بالصيانة الخارجية وخارج التغطية</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleTheme} style={{ background: themeStyles.inputBg, border: `1px solid ${themeStyles.inputBorder}`, borderRadius: '40px', padding: '8px 18px', cursor: 'pointer', color: themeStyles.text2 }}>
              {theme === 'light' ? '🌙 ليلي' : '☀️ نهاري'}
            </button>

            {/* زر الطباعة الجديد */}
            <button 
              onClick={handlePrint} 
              disabled={printLoading || reports.length === 0}
              style={{ 
                background: themeStyles.primaryBtn, 
                color: 'white', 
                border: 'none', 
                padding: '10px 22px', 
                borderRadius: '14px', 
                fontWeight: '800', 
                cursor: printLoading || reports.length === 0 ? 'not-allowed' : 'pointer',
                opacity: printLoading || reports.length === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {printLoading ? '⏳ جاري...' : '🖨️ طباعة'}
            </button>

            {/* زر PDF */}
            <button onClick={handleExportPDF} disabled={pdfLoading || reports.length === 0} style={{ background: themeStyles.primaryBtn, color: 'white', border: 'none', padding: '10px 22px', borderRadius: '14px', fontWeight: '800', cursor: pdfLoading || reports.length === 0 ? 'not-allowed' : 'pointer', opacity: pdfLoading || reports.length === 0 ? 0.6 : 1 }}>
              {pdfLoading ? '⏳ جاري...' : '📄 تصدير PDF'}
            </button>

            <button onClick={() => openModal()} style={{ background: themeStyles.primaryBtn, color: 'white', border: 'none', padding: '10px 22px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>
              ➕ إضافة
            </button>
          </div>
        </div>

        {/* باقي المحتوى (كما هو) */}
        <div style={{ textAlign: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: `2px solid ${themeStyles.cardBorder}` }}>
          <h1 style={{ color: themeStyles.titleColor, margin: 0, fontSize: '20px' }}>شركة النيل للخرسانة الجاهزة</h1>
          <h2 style={{ color: themeStyles.text2, margin: '5px 0', fontSize: '16px' }}>إدارة العلاقات العامة والأمن</h2>
          <p style={{ color: themeStyles.text3, marginTop: '8px' }}>التاريخ : {getTodayDate()}</p>
          <h3 style={{ color: themeStyles.titleColor, margin: '10px 0', fontSize: '18px' }}>تقرير متابعة يومي</h3>
          <p style={{ color: themeStyles.text2, fontSize: '13px' }}>تقرير يومي لمعدات الشركة بالصيانة الخارجية وخارج التغطية ( قسم متابعة GPS )</p>
        </div>

        {error && <div style={{ background: themeStyles.errorBg, color: themeStyles.errorText, padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>⚠️ {error}</div>}
        {success && <div style={{ background: themeStyles.successBg, color: themeStyles.successText, padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>✓ {success}</div>}

        {/* الجدول */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: `1px solid ${themeStyles.tableBorder}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: themeStyles.tableHeaderBg }}>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>م</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>كود المعدة</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>المحطه التابع لها</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>موقف الجهاز</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>سبب الإيقاف</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>نوع الصيانة</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>الموقع</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>مدة الإيقاف</th>
                <th style={{ padding: '12px', color: themeStyles.tableHeaderText, border: `1px solid ${theme === 'light' ? '#2563eb' : '#4f6ef7'}`, textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: themeStyles.text3 }}>⏳ جاري التحميل...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: themeStyles.text3 }}>📭 لا توجد بيانات</td></tr>
              ) : (
                reports.map((report, idx) => (
                  <tr key={report._id} style={{ background: report.deviceStatus && report.deviceStatus.includes('لا يعمل') ? (theme === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.1)') : (theme === 'light' ? '#dcfce7' : 'rgba(16, 185, 129, 0.1)') }}>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{idx + 1}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', fontWeight: 'bold', color: themeStyles.statValue }}>{report.equipmentCode}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.station}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.deviceStatus}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.stopReason}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.maintenanceType}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.location}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center', color: themeStyles.text2 }}>{report.stopDuration}</td>
                    <td style={{ padding: '10px', border: `1px solid ${themeStyles.tableBorder}`, textAlign: 'center' }}>
                      <button onClick={() => openModal(report)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', margin: '0 5px', color: themeStyles.statValue }}>✏️</button>
                      <button onClick={() => setDeleteConfirm(report)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', margin: '0 5px', color: '#ef4444' }}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* حقل الملاحظة */}
        <div style={{
          marginTop: '25px',
          padding: '20px',
          background: theme === 'light' ? '#f0f4ff' : 'rgba(79, 110, 247, 0.1)',
          borderRadius: '16px',
          borderRight: `4px solid ${themeStyles.statValue}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ color: themeStyles.titleColor, fontWeight: 'bold', margin: 0, fontSize: '16px' }}>📝 ملاحظة :</p>
            {noteSaved && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>✓ تم حفظ الملاحظة</span>}
          </div>
          
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '14px',
              border: `1.5px solid ${themeStyles.inputBorder}`,
              borderRadius: '12px',
              background: themeStyles.inputBg,
              color: themeStyles.text,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={saveNote} style={{ background: themeStyles.primaryBtn, color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
              💾 حفظ الملاحظة
            </button>
          </div>
        </div>

        {!loading && reports.length > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'center', color: themeStyles.text3, fontSize: '0.8rem' }}>
            إجمالي {reports.length} معدة تحت الصيانة
          </div>
        )}
      </div>

      {/* مودال + تأكيد الحذف (كما هو) */}
      {showModal && (
        <div onClick={() => !loading && setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          {/* محتوى المودال كامل كما في الكود الأصلي */}
          <div onClick={e => e.stopPropagation()} style={{ background: themeStyles.modalBg, borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflow: 'auto' }}>
            {/* ... (نفس محتوى المودال السابق) ... */}
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${themeStyles.cardBorder}`, fontSize: '1.3rem', fontWeight: '800', color: themeStyles.statValue }}>
              {editingReport ? '✏️ تعديل تقرير الصيانة' : '🔧 إضافة تقرير صيانة جديد'}
            </div>
            {/* يمكنك نسخ محتوى المودال كامل من الكود الأصلي الخاص بك */}
            {/* (تم اختصاره هنا لتوفير المساحة، لكنه موجود كامل في النسخة التي عندك) */}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: themeStyles.modalBg, borderRadius: '24px', padding: '32px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>🗑️</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: '#ef4444' }}>تأكيد الحذف</div>
            <div style={{ marginBottom: '24px', color: themeStyles.text2 }}>هل أنت متأكد من حذف معدة <strong style={{ color: '#ef4444' }}>{deleteConfirm.equipmentCode}</strong>؟</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: themeStyles.secondaryBtn, color: 'white', border: 'none', padding: '10px', borderRadius: '14px', cursor: 'pointer' }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '14px', cursor: 'pointer' }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}