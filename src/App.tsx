import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryListPage from "./pages/CategoryListPage";
import { useAuthStore } from "./stores/authStore";
import LoadingOverlay from "./components/LoadingOverlay";
import RevenuePage from "./pages/RevenuePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TransferPage from "./pages/TransferPage";
import MenPage from "./pages/MenPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import FindProductPage from "./pages/FindProductPage";
import SalePage from "./pages/SalePage";
import WomenPage from "./pages/WomenPage";
import AccountList from "./pages/Accountlist";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import CSDT from "./pages/CSDT";
import CSTV from "./pages/CSTV";
import CSVC from "./pages/CSVC";
import AdminChat from "./pages/AdminChat";

const App: React.FC = () => {
  const { isLoading, checkAuthStatus } = useAuthStore();

  // Kiểm tra trạng thái đăng nhập khi app khởi động
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <BrowserRouter>
      {isLoading && <LoadingOverlay />}
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* --- Các trang công khai --- */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cart" element={<Cart />} />

          <Route path="chinh-sach-doi-tra" element={<CSDT />} />
          <Route path="chinh-sach-thanh-vien" element={<CSTV />} />
          <Route path="chinh-sach-van-chuyen" element={<CSVC />} />

          <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="transfer/:orderId" element={<TransferPage />} />
          <Route path="/products/men" element={<MenPage />} />
          <Route path="/products/women" element={<WomenPage />} />
          <Route path="/products/accessories" element={<AccessoriesPage />} />
          <Route
            path="/products/find-products/:name"
            element={<FindProductPage />}
          />
          <Route path="/sale" element={<SalePage />} />
          {/* 1. Route cho trang chi tiết sản phẩm với ID động */}
          <Route path="product/:productId" element={<ProductDetailPage />} />

          {/* 2. Các routes dành cho Admin được gom vào một nhóm */}
          <Route path="admin">
            <Route index element={<Admin />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="category" element={<CategoryListPage />} />
            <Route path="account" element={<AccountList />} />
          </Route>

          {/* 3. Route cho trang 404 Not Found */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h1>404 - Not Found</h1>
                <p>Trang bạn tìm kiếm không tồn tại.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
