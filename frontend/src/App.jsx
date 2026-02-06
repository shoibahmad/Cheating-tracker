import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitorPage } from './pages/MonitorPage';
import { MonitorSelectionPage } from './pages/MonitorSelectionPage';
import { ScheduleExamPage } from './pages/ScheduleExamPage';
import { AboutPage } from './pages/AboutPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { ExamsPage } from './pages/ExamsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentLogin } from './pages/Student/StudentLogin';
import { StudentExamPage } from './pages/Student/StudentExamPage';
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { CreatePaperPage } from './pages/Admin/CreatePaperPage';
import { AssignExamPage } from './pages/Admin/AssignExamPage';


import { Toaster } from 'react-hot-toast';

// Layouts
const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Overview';
    if (location.pathname.startsWith('/monitor')) return 'Live Monitoring';
    if (location.pathname.startsWith('/institutions')) return 'Institutions';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    return location.pathname === '/' ? 'Home' : 'SecureEval';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Background Ambient Glow */}
      <div className="shape shape-1" />
      <div className="shape shape-2" />

      {/* Conditionally render Sidebar only for dashboard routes if desired, or always */}
      {!location.pathname.startsWith('/student') && !['/', '/login', '/signup', '/about'].includes(location.pathname) && (
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      )}

      <div className="main-content" style={{ flex: 1, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header title={getTitle()} onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div style={{ paddingBottom: '2rem', flex: 1 }}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

const PublicLayout = () => {
  // We can recycle DashboardLayout style or keep it simple but WITH the Header
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="shape shape-1" />
      <div className="shape shape-2" />

      {/* Reuse Header Component for consistency */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Header title="SecureEval" />
      </div>

      <div style={{ marginTop: '2rem', flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};


function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<ApiDocsPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* ... (in DashboardLayout routes) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule" element={<ScheduleExamPage />} />
          <Route path="/monitor" element={<MonitorSelectionPage />} />
          <Route path="/monitor/:id" element={<MonitorPage />} />

          {/* Fallback for other dashboard links */}
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Student Routes - using PublicLayout for Exam access without full dashboard sidebar sometimes, or DashboardLayout if preferred */}
        {/* Let's keep it in DashboardLayout for now for consistency with sidebar access */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-paper" element={<CreatePaperPage />} />
          <Route path="/admin/assign-exam" element={<AssignExamPage />} />

          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/exam/:id" element={<StudentExamPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

