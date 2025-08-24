import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { RoleName } from "../constants/role.constant";
import "../assets/css/accessDenied.css";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLoggedIn, user, isInitialized } = useAuthStore();

  // Chờ auth store khởi tạo xong
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  // Nếu chưa đăng nhập hoặc không phải admin
  if (!isLoggedIn || !user || user.role.name !== RoleName.ADMIN) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <div className="access-denied-decoration decoration-1"></div>
          <div className="access-denied-decoration decoration-2"></div>

          <span className="access-denied-icon">🚫</span>

          <h1 className="access-denied-title">Truy cập bị từ chối</h1>

          <p className="access-denied-subtitle">
            Bạn không có quyền truy cập vào khu vực này.
          </p>

          <p className="access-denied-description">
            Chỉ có quản trị viên mới có thể truy cập trang quản lý. Vui lòng
            liên hệ với quản trị viên nếu bạn cần hỗ trợ.
          </p>

          <div className="access-denied-actions">
            <button onClick={() => window.history.back()} className="btn-back">
              <span>←</span>
              Quay lại
            </button>

            <Link to="/" className="btn-home">
              <span>🏠</span>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
