import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({ children }) => {
  const { isLoggedIn, isInitialized } = useAuthStore();

  // Chờ auth store khởi tạo xong
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  // Nếu đã đăng nhập, chuyển về trang chủ
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
