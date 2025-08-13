import React, { useState } from "react";
import "../assets/css/login.css";
import http from "../api/http";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-toastify";

interface GoogleOAuthLinkResponse {
  url: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuthStore();

  // Lấy địa chỉ trang trước đó từ state, mặc định là "/"
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await http.post("/auth/login", {
        email, // Giả sử bạn có state cho 'email'
        password,
      });
      await login();
      toast.success(response.data.message);
      // Redirect về trang trước đó hoặc trang chủ
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await http.get<GoogleOAuthLinkResponse>(
        "/auth/google-link"
      );
      const { url } = response.data;

      console.log("Google OAuth URL received:", url);

      // Chuyển hướng đến Google OAuth
      window.location.href = url;
    } catch (error) {
      console.error("Lỗi khi lấy Google OAuth link:", error);
      toast.error("Không thể kết nối với Google. Vui lòng thử lại.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Đăng nhập</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i> // Icon xoay tròn
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
        </form>

        <div className="social-login">
          <p>Hoặc đăng nhập bằng</p>
          <div className="social-buttons">
            <button
              onClick={handleGoogleLogin}
              className="google-btn"
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fab fa-google"></i>
              )}
              {isGoogleLoading ? "Đang kết nối..." : "Google"}
            </button>
          </div>
        </div>

        <div className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
