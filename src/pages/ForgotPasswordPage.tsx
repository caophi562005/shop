import React, { useState, useEffect } from "react";
import "../assets/css/login.css";
import http from "../api/http";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TypeOfVerificationCode } from "../constants/auth.constant";

interface OtpResponse {
  message: string;
}

interface ForgotPasswordResponse {
  message: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  // Countdown timer for OTP button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCooldown > 0) {
      interval = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCooldown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate code
    if (!formData.code) {
      newErrors.code = "Mã xác thực là bắt buộc";
    } else if (formData.code.length !== 6) {
      newErrors.code = "Mã xác thực phải có 6 ký tự";
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate confirm password
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSendOtp = async () => {
    // Validate email first
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email là bắt buộc" }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
      return;
    }

    setIsOtpLoading(true);
    try {
      const response = await http.post<OtpResponse>("/auth/otp", {
        email: formData.email,
        type: TypeOfVerificationCode.FORGOT_PASSWORD,
      });

      toast.success(
        response.data.message || "Mã xác thực đã được gửi đến email của bạn"
      );
      setOtpCooldown(30); // Start 30 second cooldown
    } catch (error) {
      console.error("Lỗi khi gửi OTP:", error);
      toast.error("Không thể gửi mã xác thực. Vui lòng thử lại.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await http.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        {
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        }
      );

      toast.success(
        response.data.message || "Mật khẩu đã được thay đổi thành công"
      );
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      toast.error(
        "Không thể thay đổi mật khẩu. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box forgot-password-box">
        <h2>Quên mật khẩu</h2>
        <p className="forgot-password-subtitle">
          Nhập email và mã xác thực để tạo mật khẩu mới
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "error" : ""}
              autoComplete="email"
              required
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Code Field with Send OTP Button */}
          <div className="form-group">
            <div className="code-input-container">
              <input
                type="text"
                placeholder="Mã xác thực (6 số)"
                value={formData.code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  handleInputChange("code", value);
                }}
                className={errors.code ? "error" : ""}
                maxLength={6}
              />
              <button
                type="button"
                className="otp-btn"
                onClick={handleSendOtp}
                disabled={isOtpLoading || otpCooldown > 0}
              >
                {isOtpLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : otpCooldown > 0 ? (
                  `${otpCooldown}s`
                ) : (
                  "Nhận mã"
                )}
              </button>
            </div>
            {errors.code && (
              <span className="error-message">{errors.code}</span>
            )}
          </div>

          {/* New Password Field */}
          <div className="form-group">
            <input
              type="password"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              className={errors.newPassword ? "error" : ""}
              autoComplete="new-password"
              required
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={formData.confirmNewPassword}
              onChange={(e) =>
                handleInputChange("confirmNewPassword", e.target.value)
              }
              className={errors.confirmNewPassword ? "error" : ""}
              autoComplete="new-password"
              required
            />
            {errors.confirmNewPassword && (
              <span className="error-message">{errors.confirmNewPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              "Thay đổi mật khẩu"
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="back-to-login">
          <Link to="/login">
            <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
