import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
// import { ProtectedRoute } from './components/ProtectedRoute'; // Replaced/Inline below
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentManagementPage } from './pages/Admin/StudentManagementPage';
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

// --- Protected Route Component ---
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  if (!currentUser) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no role yet (e.g. fresh Google signup), they must go to signup to select role
  if (!userRole) {
    return <Navigate to="/signup" replace />;
  }

  // Strict Role Check
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User is logged in but doesn't have permission for this route
    // Redirect them to their appropriate dashboard
    return <Navigate to={userRole === 'admin' ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return <Outlet />;
};

// --- Public Route Guard (Redirect if logged in AND has role) ---
const PublicRouteGuard = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If logged in AND has a role, redirect to dashboard.
  // If no role (new user), allow access to public pages (specifically Signup to finish setup)
  if (currentUser && userRole) {
    return <Navigate to={userRole === 'admin' ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return children ? children : <Outlet />;
};


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
    <AuthProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Routes (Redirect to Dashboard if logged in) */}
          <Route element={<PublicRouteGuard><PublicLayout /></PublicRouteGuard>}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/docs" element={<ApiDocsPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* Student Login alias if needed */}
            <Route path="/student/login" element={<StudentLogin />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Shared routes? */}
            </Route>
          </Route>

          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/create-paper" element={<CreatePaperPage />} />
              <Route path="/admin/assign-exam" element={<AssignExamPage />} />
              <Route path="/admin/students" element={<StudentManagementPage />} />
              <Route path="/schedule" element={<ScheduleExamPage />} />
              <Route path="/monitor" element={<MonitorSelectionPage />} />
              <Route path="/monitor/:id" element={<MonitorPage />} />
              <Route path="/institutions" element={<InstitutionsPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Student Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exam/:id" element={<StudentExamPage />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

