import React, { useState } from "react";
import "../assets/css/Register2.css";
import http from "../api/http";
import type { RegisterBodyType } from "../models/auth.model";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterBodyType>({
    name: "",
    email: "",
    phoneNumber: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const [usernameError, setUsernameError] = useState("");

  const navigate = useNavigate();

  // Hàm cập nhật state khi người dùng nhập liệu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Logic kiểm tra username được chuyển từ script cũ vào đây
    if (name === "username") {
      const regex = /^[A-Za-z0-9]{0,20}$/;
      if (!regex.test(value)) {
        setUsernameError("Chỉ chữ không dấu & số, tối đa 20 ký tự.");
      } else {
        setUsernameError("");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn form gửi đi
    try {
      await http.post("/auth/register", formData);

      console.log("Đăng ký thành công.");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
    }
  };

  const handleSendOTP = async () => {
    try {
      await http.post("/auth/otp", {
        email: formData.email, // Giả sử bạn có state cho 'email'
        type: "REGISTER",
      });
    } catch (error) {
      console.error("Lỗi: ", error);
    }
    alert("Đã gửi mã OTP đến email của bạn!");
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2>Đăng ký</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Tên tài khoản"
            required
            value={formData.name}
            onChange={handleChange}
            style={{ borderColor: usernameError ? "#dc3545" : "#ccc" }}
          />
          {usernameError && (
            <small className="usernameError">{usernameError}</small>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Số điện thoại"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <div className="otp-group">
            <input
              type="text"
              name="code"
              className="otp-input"
              placeholder="Mã OTP"
              maxLength={6}
              required
              value={formData.code}
              onChange={handleChange}
            />
            <button type="button" className="otp-btn" onClick={handleSendOTP}>
              Gửi OTP
            </button>
          </div>

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">
            Đăng ký
          </button>
        </form>

        <div className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
