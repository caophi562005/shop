import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/adminDashboard.css";

const AdminDashboard: React.FC = () => {
  const dashboardCards = [
    {
      title: "Quản Lý Sản Phẩm",
      description: "Thêm, sửa, xóa và quản lý kho sản phẩm",
      icon: "📦",
      link: "/admin/products",
      color: "#ee5022",
    },
    {
      title: "Quản Lý Đơn Hàng",
      description: "Theo dõi và xử lý các đơn hàng",
      icon: "🛒",
      link: "/admin/orders",
      color: "#28a745",
    },
    {
      title: "Quản Lý Danh Mục",
      description: "Tổ chức và phân loại sản phẩm",
      icon: "📂",
      link: "/admin/category",
      color: "#17a2b8",
    },
    {
      title: "Quản Lý Tài Khoản",
      description: "Quản lý người dùng và phân quyền",
      icon: "👥",
      link: "/admin/account",
      color: "#6f42c1",
    },
    {
      title: "Báo Cáo Doanh Thu",
      description: "Thống kê và phân tích doanh thu",
      icon: "📊",
      link: "/admin/revenue",
      color: "#fd7e14",
    },
    {
      title: "Hỗ Trợ Chat",
      description: "Tương tác và hỗ trợ khách hàng",
      icon: "💬",
      link: "/admin/chat",
      color: "#e83e8c",
    },
    {
      title: "Thông Báo Hệ Thống",
      description: "Gửi thông báo đến toàn bộ người dùng",
      icon: "📢",
      link: "/admin/broadcast",
      color: "#20c997",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">⚡</span>
            Bảng Điều Khiển Admin
          </h1>
          <p className="dashboard-subtitle">
            Chào mừng trở lại! Quản lý website PIXCAM của bạn
          </p>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="dashboard-content">
        <h2 className="content-title">Các Chức Năng Quản Lý</h2>
        <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="dashboard-card"
              style={{ "--card-color": card.color } as React.CSSProperties}
            >
              <div className="card-header">
                <div className="card-icon">{card.icon}</div>
              </div>
              <div className="card-body">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
              <div className="card-footer">
                <span className="card-action">
                  Truy cập ngay
                  <span className="action-arrow">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
