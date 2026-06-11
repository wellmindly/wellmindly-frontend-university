import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  );
}

export default App;
