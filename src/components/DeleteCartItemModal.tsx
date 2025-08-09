import React, { useState } from "react";
import http from "../api/http";
import type { CartItemDetailResType } from "../models/cart.model";

type Props = {
  isOpen: boolean;
  selectedItems: number[];
  cartItems: CartItemDetailResType;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const DeleteCartItemModal: React.FC<Props> = ({
  isOpen,
  selectedItems,
  cartItems,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    setLoading(true);

    try {
      const response = await http.post(`/cart/delete`, {
        cartItemIds: selectedItems,
      });

      if (response.status === 201) {
        onSuccess(
          `Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng thành công`
        );
        onClose();
        onRefresh();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete cart items:", error);
      onSuccess("Xóa sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || selectedItems.length === 0) return null;

  // Get selected item details for display
  const selectedItemDetails = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const isMultiple = selectedItems.length > 1;

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
              {isMultiple
                ? `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn khỏi giỏ hàng?`
                : `Bạn có chắc chắn muốn xóa sản phẩm "${selectedItemDetails[0]?.sku.product.name}" khỏi giỏ hàng?`}
            </p>
            {!isMultiple && selectedItemDetails[0] && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  margin: "16px 0",
                  padding: "12px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={selectedItemDetails[0].sku.product.images[0]}
                  alt={selectedItemDetails[0].sku.product.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                    {selectedItemDetails[0].sku.product.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    Phân loại: {selectedItemDetails[0].sku.value}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    Số lượng: {selectedItemDetails[0].quantity}
                  </div>
                </div>
              </div>
            )}
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

export default DeleteCartItemModal;
