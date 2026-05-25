import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/** Auth gate.
 *
 * Two usage modes:
 *   - As a wrapper:  <ProtectedRoute><MyPage/></ProtectedRoute>
 *   - As a layout:   <Route element={<ProtectedRoute/>}><Route .../></Route>
 *
 * When children are passed, they render directly. Otherwise an <Outlet/> is
 * rendered for nested routes.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
