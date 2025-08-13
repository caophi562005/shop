import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Cấu hình title cho từng route
const TITLE_CONFIG: Record<string, string> = {
  // Public routes
  "/": "PIXCAM - Thời trang nam nữ",
  "/login": "Đăng nhập - PIXCAM",
  "/register": "Đăng ký - PIXCAM",
  "/forgot-password": "Quên mật khẩu - PIXCAM",

  // User routes
  "/profile": "Thông tin cá nhân - PIXCAM",
  "/cart": "Giỏ hàng - PIXCAM",
  "/pay": "Thanh toán - PIXCAM",
  "/order-history": "Lịch sử đơn hàng - PIXCAM",

  // Product routes
  "/products/men": "Thời trang nam - PIXCAM",
  "/products/women": "Thời trang nữ - PIXCAM",
  "/products/accessories": "Phụ kiện - PIXCAM",
  "/products/sale": "Sale - Khuyến mãi - PIXCAM",

  // Policy routes
  "/chinh-sach-doi-tra": "Chính sách đổi trả - PIXCAM",
  "/chinh-sach-thanh-vien": "Chính sách thành viên - PIXCAM",
  "/chinh-sach-van-chuyen": "Chính sách vận chuyển - PIXCAM",

  // Admin routes
  "/admin": "Bảng điều khiển - Admin PIXCAM",
  "/admin/products": "Quản lý sản phẩm - Admin PIXCAM",
  "/admin/orders": "Quản lý đơn hàng - Admin PIXCAM",
  "/admin/category": "Quản lý danh mục - Admin PIXCAM",
  "/admin/account": "Quản lý tài khoản - Admin PIXCAM",
  "/admin/revenue": "Báo cáo doanh thu - Admin PIXCAM",
  "/admin/chat": "Hỗ trợ chat - Admin PIXCAM",
};

// Default title
const DEFAULT_TITLE = "PIXCAM - Thời trang nam nữ";

// Tạo title cho dynamic routes
const getDynamicTitle = (pathname: string): string => {
  if (pathname.startsWith("/product/")) {
    return "Chi tiết sản phẩm - PIXCAM";
  }

  if (pathname.startsWith("/products/find-products/")) {
    const searchTerm = pathname.split("/").pop();
    return `Tìm kiếm: ${decodeURIComponent(searchTerm || "")} - PIXCAM`;
  }

  if (pathname.startsWith("/order-detail/")) {
    return "Chi tiết đơn hàng - PIXCAM";
  }

  if (pathname.startsWith("/order-success/")) {
    return "Đặt hàng thành công - PIXCAM";
  }

  if (pathname.startsWith("/transfer/")) {
    return "Chuyển khoản - PIXCAM";
  }

  return DEFAULT_TITLE;
};

// Hook chính để quản lý document title
export const useDocumentTitle = (customTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const title =
      customTitle ||
      TITLE_CONFIG[location.pathname] ||
      getDynamicTitle(location.pathname);

    document.title = title;
  }, [location.pathname, customTitle]);
};
