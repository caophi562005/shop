import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import EditProductPage from "./pages/EditProductPage";
import CreateProductPage from "./pages/CreateProductPage";
import CategoryListPage from "./pages/CategoryListPage";
import { useAuthStore } from "./stores/authStore";
import LoadingOverlay from "./components/LoadingOverlay";
import RevenuePage from "./pages/RevenuePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TransferPage from "./pages/TransferPage";
import MenPage from "./pages/MenPage";
import WomanPage from "./pages/WomenPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import FindProductPage from "./pages/FindProductPage";
import SalePage from "./pages/SalePage";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackReadonly from "./pages/FeedbackReadonly";
import OrderHistory from "./pages/oderHistory";

const App: React.FC = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
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

          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="/products/men" element={<MenPage />} />
          <Route path="/products/women" element={<WomanPage />} />
          <Route path="/products/accessories" element={<AccessoriesPage />} />
          <Route path="/products/find-products" element={<FindProductPage />} />
          <Route path="/sale" element={<SalePage />} />
          {/* 1. Route cho trang chi tiết sản phẩm với ID động */}
          <Route path="product/:productId" element={<ProductDetailPage />} />

          {/* 2. Các routes dành cho Admin được gom vào một nhóm */}
          <Route path="admin">
            <Route path="product/create" element={<CreateProductPage />} />
            <Route
              path="product/edit/:productId"
              element={<EditProductPage />}
            />
            <Route path="revenue" element={<RevenuePage />} />

            <Route path="category" element={<CategoryListPage />} />
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

