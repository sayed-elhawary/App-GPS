// src/App.js - الملف المعدل
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// صفحات النظام
import Login from './Login';
import Dashboard from './Dashboard';
import ClientData from './ClientData';
import CameraData from './CameraData';
import EquipmentSims from './EquipmentSims';
import Violations from './Violations';
import DocumentEditor from './DocumentEditor';

// صفحات داخل مجلد pages
import SecurityStaff from './pages/SecurityStaff';
import EmployeeHousing from './pages/EmployeeHousing';
import GPSDevices from './pages/GPSDevices';
import PRAccounts from './pages/PRAccounts';
import CompanyEquipment from './pages/CompanyEquipment';
import MaintenanceReport from './pages/MaintenanceReport';
import DriverFollowUp from './pages/DriverFollowUp';
import StationExecutionData from './pages/StationExecutionData';
import TribMovement from './TribMovement';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

function App() {
  return (
    <AuthProvider>
      <Router basename="/">
        <Routes>
          {/* صفحة اللوجين - متاحة للجميع */}
          <Route path="/" element={<Login />} />

          {/* كل الصفحات المحمية */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard - متاح للكل */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* صفحات متاحة فقط لـ admin و gps */}
            <Route
              path="/client-data"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <ClientData />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/camera-data"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <CameraData />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/equipment-sims"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <EquipmentSims />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/violations"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <Violations />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/document-editor"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <DocumentEditor />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/security-staff"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <SecurityStaff />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/gps-devices"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <GPSDevices />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/pr-accounts"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <PRAccounts />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/company-equipment"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <CompanyEquipment />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/maintenance-report"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps']}>
                  <MaintenanceReport />
                </RoleBasedRoute>
              }
            />

            {/* الصفحات الجديدة */}
            <Route
              path="/station-execution"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps', 'employee']}>
                  <StationExecutionData />
                </RoleBasedRoute>
              }
            />

            {/* ========== المسار المعدل ========== */}
            {/* تغيير من 'user' إلى 'employee' */}
            <Route
              path="/trib-movement"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps', 'employee']}>
                  <TribMovement />
                </RoleBasedRoute>
              }
            />

            {/* صفحات متاحة للكل (admin + gps + employee) */}
            <Route
              path="/driver-followup"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps', 'employee']}>
                  <DriverFollowUp />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/employee-housing"
              element={
                <RoleBasedRoute allowedRoles={['admin', 'gps', 'employee']}>
                  <EmployeeHousing />
                </RoleBasedRoute>
              }
            />
          </Route>

          {/* أي مسار غير معروف يرجع لصفحة اللوجين */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;