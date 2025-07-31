import React, { useState, useEffect } from "react";
import "../assets/css/modal.css";
import type { CategoryType } from "../models/shared/shared-category.model";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryType | null;
  onSave: (
    id: number,
    parentCategoryId: number | null,
    name: string,
    logo: string
  ) => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setLogo(category.logo);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    if (category) {
      onSave(category.id, category.parentCategoryId, name.trim(), logo.trim());
      onClose();
    }
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
          <h3>Chỉnh sửa danh mục</h3>
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
            <input
              type="text"
              id="categoryLogo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="Nhập emoji hoặc URL logo"
            />
            {logo && (
              <div className="logo-preview">
                <span>Xem trước: {logo}</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
