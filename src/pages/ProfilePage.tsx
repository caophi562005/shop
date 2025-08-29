import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/profile.css";
import type {
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from "../models/profile.model";
import http from "../api/http";
import type { UpdateProfileResType } from "../models/shared/shared-user.model";
import axios from "axios";

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

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAvatarUpload = (file: File) => {
    setUploadingAvatar(true);
    setUploadProgress(0);

    http
      .post(
        "/media/images/upload/presigned-url",
        {
          filename: file.name,
          filesize: file.size,
        },
        { withCredentials: false }
      )
      .then((res) => {
        const url = res.data.url;
        const presignedUrl = res.data.presignedUrl;

        return axios
          .put(presignedUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
            withCredentials: false,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(progress);
              }
            },
          })
          .then(() => {
            return url;
          });
      })
      .then((finalUrl) => {
        setFormDataProfile((prev) => ({ ...prev, avatar: finalUrl }));
        setUploadingAvatar(false);
        setUploadProgress(0);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        alert("Upload avatar thất bại! Vui lòng thử lại.");
        setUploadingAvatar(false);
        setUploadProgress(0);
      });
  };

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
              <div className="field-group">
                <input
                  id="f-email"
                  type="text"
                  name="avatar"
                  value={formDataProfile.avatar ?? ""}
                  onChange={handleChangeProfile}
                  disabled={uploadingAvatar}
                  required
                />

                {/* Upload button */}
                <label className="btn-upload">
                  📁 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }}
                    disabled={uploadingAvatar}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Progress bar */}
              {uploadingAvatar && (
                <div className="upload-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              {/* Avatar preview */}
              {formDataProfile.avatar && (
                <div className="avatar-preview" style={{ marginTop: "10px" }}>
                  {formDataProfile.avatar.startsWith("http") ? (
                    <div>
                      <span>Avatar hiện tại:</span>
                      <img
                        src={formDataProfile.avatar}
                        alt="Avatar preview"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginLeft: "10px",
                          border: "3px solid #ff6f00",
                        }}
                      />
                    </div>
                  ) : (
                    <span>Avatar: {formDataProfile.avatar}</span>
                  )}
                </div>
              )}
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
