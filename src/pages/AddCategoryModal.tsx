import React, { useState } from "react";
import "../assets/css/modal.css";
import type { CategoryType } from "../models/shared/shared-category.model";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    console.log("Saving category:", {
      name: name.trim(),
      logo: logo.trim(),
      parentCategoryId: parentCategoryId || null,
    });
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
              Thêm mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
