import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isInitialized } = useAuthStore();
  const location = useLocation();

  // Chờ auth store khởi tạo xong
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  // Nếu chưa đăng nhập, chuyển đến trang login với state để redirect lại
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
