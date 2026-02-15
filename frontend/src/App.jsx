import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LoadingScreen } from './components/Common/LoadingScreen';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
// import { ProtectedRoute } from './components/ProtectedRoute'; // Replaced/Inline below
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/Common/ErrorBoundary';

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
import { APIDocsPage } from './pages/ApiDocsPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { ExamsPage } from './pages/ExamsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentLogin } from './pages/Student/StudentLogin';
import { StudentExamPage } from './pages/Student/StudentExamPage';
import { StudentDashboard } from './pages/Student/StudentDashboard';
import { StudentExamsPage } from './pages/Student/StudentExamsPage';
import { StudentReportsPage } from './pages/Student/StudentReportsPage';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { CreatePaperPage } from './pages/Admin/CreatePaperPage';
import { AssignExamPage } from './pages/Admin/AssignExamPage';
import { LiveFeedPage } from './pages/Admin/LiveFeedPage';
import { MobileRestriction } from './components/Common/MobileRestriction';


import { Toaster } from 'react-hot-toast';

// --- Mobile Guard ---
const MobileGuard = ({ children }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <Navigate to="/mobile-restriction" replace />;
  }

  return children || <Outlet />;
};

// --- Protected Route Component ---
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  console.log("ProtectedRoute:", { path: location.pathname, hasUser: !!currentUser, role: userRole });

  if (!currentUser) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no role yet (e.g. fresh Google signup), they must go to signup to select role
  if (!userRole) {
    console.log("User has no role, redirecting to signup");
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

  console.log("PublicRouteGuard:", { currentUser: !!currentUser, userRole });

  // If logged in AND has a role, redirect to dashboard.
  // If no role (new user), allow access to public pages (specifically Signup to finish setup)
  if (currentUser && userRole) {
    return <Navigate to={userRole === 'admin' ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return children ? children : <Outlet />;
};


// Layouts
const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', flexDirection: 'column' }}>
      {/* Background Ambient Glow */}
      <div className="shape shape-1" />
      <div className="shape shape-2" />

      {/* Header handles navigation now */}
      <Header />

      <div className="main-content" style={{ flex: 1, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
      <Header title="SecureEval" />

      <div style={{ marginTop: '2rem', flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};


function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <ErrorBoundary>
          <Routes>
            {/* Public Routes (Redirect to Dashboard if logged in) */}
            <Route element={<PublicRouteGuard><PublicLayout /></PublicRouteGuard>}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/get-started" element={<GetStartedPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              {/* Student Login alias if needed */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/mobile-restriction" element={<MobileRestriction />} />
            </Route>

            {/* Publicly Accessible Routes (with Header/Footer) */}
            <Route element={<DashboardLayout />}>
              {/* Reuse DashboardLayout for consistent Header/Footer, or PublicLayout if prefered. 
                     DashboardLayout check: it renders Header and Footer. 
                     But DashboardLayout doesn't force auth check in itself, the ProtectedRoute wrapper does.
                     So we can use it here for authenticated users, but what about guests?
                     Guests using DashboardLayout might be weird if it has "sidebar" logic or specific user checks?
                     Header.jsx handles user state safely. 
                     Let's use PublicLayout for /docs but make it accessible.
                 */}
            </Route>

            <Route element={<PublicLayout />}>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/docs" element={<APIDocsPage />} />
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
                <Route path="/admin/live-feed" element={<LiveFeedPage />} />
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
              <Route element={<MobileGuard />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/exams" element={<StudentExamsPage />} />
                  <Route path="/student/reports" element={<StudentReportsPage />} />
                  <Route path="/student/exam/:id" element={<StudentExamPage />} />
                </Route>
              </Route>
            </Route>

          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;

