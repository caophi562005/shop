import React, { useState } from "react";
import "../assets/css/modal.css";
import http from "../api/http";
import axios from "axios";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategoryId?: number | null;
  onSave: (name: string, logo: string, parentCategoryId: number | null) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  parentCategoryId,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogoUpload = (file: File) => {
    setUploadingLogo(true);
    setUploadProgress(0);

    // Follow exact same flow as Upload.tsx
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
        setLogo(finalUrl);
        setUploadingLogo(false);
        setUploadProgress(0);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        alert("Upload logo thất bại! Vui lòng thử lại.");
        setUploadingLogo(false);
        setUploadProgress(0);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    onSave(name.trim(), logo.trim(), parentCategoryId || null);

    handleClose();
  };

  const handleClose = () => {
    setName("");
    setLogo("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {parentCategoryId ? "Thêm danh mục con" : "Thêm danh mục mới"}
          </h3>
          <button className="modal-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="categoryName">Tên danh mục *</label>
            <input
              type="text"
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryLogo">Logo</label>
            <div className="field-group">
              <input
                type="text"
                id="categoryLogo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Nhập emoji hoặc URL logo"
                disabled={uploadingLogo}
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
                      handleLogoUpload(file);
                    }
                  }}
                  disabled={uploadingLogo}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Progress bar */}
            {uploadingLogo && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}

            {logo && (
              <div className="logo-preview">
                {logo.startsWith("http") ? (
                  <div>
                    <span>Xem trước:</span>
                    <img
                      src={logo}
                      alt="Logo preview"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginLeft: "10px",
                        border: "2px solid #ddd",
                      }}
                    />
                  </div>
                ) : (
                  <span>Xem trước: {logo}</span>
                )}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Thêm mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
