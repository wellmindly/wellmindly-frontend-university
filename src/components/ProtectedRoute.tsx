import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    /*
     * Loading state while the auth context rehydrates. The spinner is decorative
     * and is hidden from assistive tech; the visible "Checking your session…"
     * label is what actually conveys the state — necessary because the global
     * reduced-motion rule in index.css collapses the spin, so motion alone
     * cannot be the only signal that something is happening.
     */
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-gray-500">
          Checking your session…
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated users strictly to the public landing page (/)
    // and remember the intended location so we can redirect them back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Render a strict 403 Forbidden message if their role profile is incompatible
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403 Forbidden</h1>
        <p className="text-gray-600 text-lg max-w-md">
          You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
