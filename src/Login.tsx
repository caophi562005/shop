// src/Login.tsx

import { useState } from "react";
import http from "./http";

const Login = () => {
  // State có sẵn để hiển thị lỗi
  const [error, setError] = useState<string | null>(null);

  // --- PHẦN MỚI: State cho form đăng nhập ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- PHẦN MỚI: Hàm xử lý đăng nhập bằng tài khoản/mật khẩu ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    // Ngăn form reload lại trang
    e.preventDefault();
    setError(null); // Xóa lỗi cũ

    // Kiểm tra đầu vào cơ bản
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      // Gọi API đăng nhập của bạn (thay đổi endpoint nếu cần)
      const response = await http.post("/auth/login", {
        email,
        password,
      });

      // Lấy token từ response
      const { accessToken, refreshToken } = response.data;
      if (accessToken && refreshToken) {
        // Lưu token vào localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // Đăng nhập thành công, chuyển hướng về trang chủ
        window.location.href = "/";
      }
    } catch (err: any) {
      // Hiển thị lỗi từ server hoặc một lỗi chung
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không chính xác."
      );
    }
  };

  // Hàm đăng nhập bằng Google (giữ nguyên)
  const handleGoogleLogin = async () => {
    try {
      const response = await http.get("/auth/google-link");
      window.location.href = response.data.url;
    } catch {
      setError("Không thể kết nối với Google");
    }
  };

  return (
    <div className="login-container">
      <h1>Đăng nhập</h1>
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="error" style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      {/* --- PHẦN MỚI: Form đăng nhập --- */}
      <form onSubmit={handlePasswordLogin} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "300px", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Mật khẩu:</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "300px", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>
          Đăng nhập
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* Nút đăng nhập với Google (giữ nguyên) */}
      <button className="google-login-button" onClick={handleGoogleLogin}>
        Đăng nhập với Google
      </button>
    </div>
  );
};

export default Login;
