import React, { useState } from "react";
import type { ProductIncludeTranslationType } from "../models/product.model";
import http from "../api/http";

type Props = {
  isOpen: boolean;
  product: ProductIncludeTranslationType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const DeleteProductModal: React.FC<Props> = ({
  isOpen,
  product,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);

    try {
      await http.delete(`/manage-product/products/${product.id}`);

      onSuccess("Xóa sản phẩm thành công");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Xác nhận xóa</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="delete-confirmation">
            <i className="fas fa-exclamation-triangle warning-icon"></i>
            <p>
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong>
                #{product.id} - {product.name}
              </strong>
              ?
            </p>
            <p className="warning-text">Hành động này không thể hoàn tác!</p>
          </div>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
