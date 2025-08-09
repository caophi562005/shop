import React, { useState } from "react";
import "../assets/css/login.css";
import http from "../api/http";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuthStore();

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
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
    } finally {
      setIsLoading(false);
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
            <a href="#" className="google-btn">
              <i className="fab fa-google"></i> Google
            </a>
            <a href="#" className="facebook-btn">
              <i className="fab fa-facebook-f"></i> Facebook
            </a>
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
