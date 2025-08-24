import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-toastify";

const OAuthGoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      console.log("OAuth Callback - success:", success, "error:", error);

      if (success === "true") {
        try {
          console.log("OAuth success, calling login...");
          // Gọi login để cập nhật auth state từ cookies
          await login();
          toast.success("Đăng nhập Google thành công!");
          navigate("/");
        } catch (err) {
          console.error("Error updating auth state:", err);
          toast.error("Có lỗi xảy ra khi đăng nhập");
          navigate("/login");
        }
      } else if (error) {
        console.error("OAuth error:", error);
        toast.error(`Lỗi đăng nhập Google: ${decodeURIComponent(error)}`);
        navigate("/login");
      } else {
        console.warn("OAuth callback without success or error params");
        // Không có success hoặc error parameter
        toast.error("Đăng nhập Google không thành công");
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "18px", color: "#666" }}>
        Đang xử lý đăng nhập Google...
      </div>
      <i
        className="fas fa-spinner fa-spin"
        style={{ fontSize: "24px", color: "#ff9800" }}
      ></i>
    </div>
  );
};

export default OAuthGoogleCallback;
