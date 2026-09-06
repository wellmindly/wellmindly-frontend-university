import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AdminDashboard } from './pages/AdminDashboard';
import { UniversityDashboard } from './pages/UniversityDashboard';
import { useAuth } from './context/AuthContext';

function DashboardSwitcher() {
  const { user } = useAuth();
  
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  
  return <UniversityDashboard />;
}

function App() {
  return (
    /*
     * reducedMotion="user" makes every motion.* element in this app honour the
     * OS "reduce motion" setting: transform and layout animations are dropped
     * while opacity still cross-fades, so entrances and hovers stay legible
     * without moving. Applied once here rather than per-component so no future
     * screen can forget it. The CSS side (Tailwind animate-*) is in index.css.
     */
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'UNIVERSITY']}>
                  <DashboardSwitcher />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
