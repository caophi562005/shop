import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryListPage from "./pages/CategoryListPage";
import { useAuthStore } from "./stores/authStore";
import LoadingOverlay from "./components/LoadingOverlay";
import AuthDebugger from "./components/AuthDebugger";
import TitleManager from "./components/TitleManager";
import RevenuePage from "./pages/RevenuePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TransferPage from "./pages/TransferPage";
import MenPage from "./pages/MenPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import FindProductPage from "./pages/FindProductPage";
import SalePage from "./pages/SalePage";
import WomenPage from "./pages/WomenPage";
import AccountList from "./pages/Accountlist";
import AdminOrder from "./pages/AdminOrder";
import Cart from "./pages/Cart";
import CSDT from "./pages/CSDT";
import CSTV from "./pages/CSTV";
import CSVC from "./pages/CSVC";
import AdminChat from "./pages/AdminChat";
import Pay from "./pages/Pay";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import OAuthGoogleCallback from "./pages/OAuthGoogleCallback";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBroadcast from "./pages/AdminBroadcast";

const App: React.FC = () => {
  const {
    isLoading,
    checkAuthStatus,
    resetAuthState,
    handleRefreshTokenFailure,
  } = useAuthStore();

  // Kiểm tra trạng  thái đăng nhập khi app khởi động
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for auth logout events from http interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log("Auth logout event received, resetting auth state");
      resetAuthState();
    };

    const handleRefreshFailed = () => {
      console.log("Refresh token failed, handling auth failure");
      handleRefreshTokenFailure();
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    window.addEventListener("auth:refresh-failed", handleRefreshFailed);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
      window.removeEventListener("auth:refresh-failed", handleRefreshFailed);
    };
  }, [resetAuthState, handleRefreshTokenFailure]);

  return (
    <BrowserRouter>
      <TitleManager />
      {isLoading && <LoadingOverlay />}
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* --- Các trang công khai --- */}
          <Route index element={<HomePage />} />
          <Route
            path="login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="oauth-google-callback"
            element={<OAuthGoogleCallback />}
          />

          <Route path="chinh-sach-doi-tra" element={<CSDT />} />
          <Route path="chinh-sach-thanh-vien" element={<CSTV />} />
          <Route path="chinh-sach-van-chuyen" element={<CSVC />} />

          <Route path="/products/men" element={<MenPage />} />
          <Route path="/products/women" element={<WomenPage />} />
          <Route path="/products/accessories" element={<AccessoriesPage />} />
          <Route path="/products/sale" element={<SalePage />} />
          <Route path="product/:productId" element={<ProductDetailPage />} />
          <Route
            path="/products/find-products/:name"
            element={<FindProductPage />}
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pay"
            element={
              <ProtectedRoute>
                <Pay />
              </ProtectedRoute>
            }
          />
          <Route
            path="transfer/:orderId"
            element={
              <ProtectedRoute>
                <TransferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="order-success/:orderId"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="order-history"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="order-detail/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          {/* 2. Các routes dành cho Admin được gom vào một nhóm */}
          <Route path="admin">
            <Route
              index
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="revenue"
              element={
                <AdminRoute>
                  <RevenuePage />
                </AdminRoute>
              }
            />
            <Route
              path="chat"
              element={
                <AdminRoute>
                  <AdminChat />
                </AdminRoute>
              }
            />
            <Route
              path="category"
              element={
                <AdminRoute>
                  <CategoryListPage />
                </AdminRoute>
              }
            />
            <Route
              path="account"
              element={
                <AdminRoute>
                  <AccountList />
                </AdminRoute>
              }
            />
            <Route
              path="orders"
              element={
                <AdminRoute>
                  <AdminOrder />
                </AdminRoute>
              }
            />
            <Route
              path="broadcast"
              element={
                <AdminRoute>
                  <AdminBroadcast />
                </AdminRoute>
              }
            />
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
      <AuthDebugger />
    </BrowserRouter>
  );
};

export default App;
