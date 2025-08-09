import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/profile.css";
import type {
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from "../models/profile.model";
import http from "../api/http";
import type { UpdateProfileResType } from "../models/shared/shared-user.model";

const ProfilePage: React.FC = () => {
  // State để lưu trữ dữ liệu form
  const [formDataProfile, setFormDataProfile] = useState<UpdateMeBodyType>({
    name: "",
    phoneNumber: "",
    avatar: "",
  });

  const [formDataChangePassword, setFormDataChangePassword] =
    useState<ChangePasswordBodyType>({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await http.get("/profile");
        const profile = response.data as UpdateProfileResType;
        setFormDataProfile({
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          avatar: profile.avatar,
        });
      } catch (error) {}
    };
    fetchProfile();
  }, []);

  const handleChangeProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataProfile({ ...formDataProfile, [e.target.name]: e.target.value });
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataChangePassword({
      ...formDataChangePassword,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.put("/profile", formDataProfile);
      alert("Cập nhật thành công");
    } catch (error) {
      console.error(error);
    }

    if (
      formDataChangePassword.password &&
      formDataChangePassword.newPassword &&
      formDataChangePassword.confirmNewPassword
    ) {
      try {
        await http.put("/profile/change-password", formDataChangePassword);
        alert("Đổi mật khẩu thành công");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="profile-card">
          <h2>Hồ sơ của bạn</h2>
          <form id="profileForm" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="f-username">Username</label>
              <input
                id="f-username"
                type="text"
                name="name"
                value={formDataProfile.name}
                onChange={handleChangeProfile}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-phone">Phone</label>
              <input
                id="f-phone"
                type="text"
                name="phone"
                value={formDataProfile.phoneNumber}
                onChange={handleChangeProfile}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="f-email">Avatar</label>
              <input
                id="f-email"
                type="text"
                name="avatar"
                value={formDataProfile.avatar ?? ""}
                onChange={handleChangeProfile}
                required
              />
            </div>

            <hr />
            <br />

            <div className="field">
              <label htmlFor="f-old">Mật khẩu cũ</label>
              <input
                id="f-old"
                type="password"
                name="password"
                placeholder="Chỉ khi đổi mật khẩu"
                value={formDataChangePassword.password}
                onChange={handleChangePassword}
              />
            </div>
            <div className="field">
              <label htmlFor="f-new">Mật khẩu mới</label>
              <input
                id="f-new"
                type="password"
                name="newPassword"
                placeholder="Để trống nếu không đổi"
                value={formDataChangePassword.newPassword}
                onChange={handleChangePassword}
              />
            </div>

            <div className="field">
              <label htmlFor="f-new">Nhập lại mật khẩu mới</label>
              <input
                id="f-new"
                type="password"
                name="confirmNewPassword"
                placeholder="Nhập lại mật khẩu mới"
                value={formDataChangePassword.confirmNewPassword}
                onChange={handleChangePassword}
              />
            </div>

            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </form>

          <Link to="/" className="back-link">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
