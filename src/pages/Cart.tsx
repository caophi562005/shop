import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Cart2.css";
import DeleteCartItemModal from "../components/DeleteCartItemModal";
import http from "../api/http";
import { toast } from "react-toastify";
import type {
  CartItemDetailResType,
  GetCartResType,
} from "../models/cart.model";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemDetailResType>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemsToDelete, setItemsToDelete] = useState<number[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCartItems();
  }, [currentPage]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await http.get(
        `/cart?page=${currentPage}&limit=${itemsPerPage}`
      );

      const data: GetCartResType = await response.data;
      setCartItems(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
      setSelectedItems([]); // Clear selection when data refreshes
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatVN = (num: number) =>
    new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";

  const updateQuantity = async (
    cartId: number,
    skuId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      const response = await http.put(`/cart/${cartId}`, {
        skuId: skuId,
        quantity: newQuantity,
      });

      if (response.status === 200) {
        await fetchCartItems(); // Refresh cart data
        toast.success("Cập nhật số lượng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  // Open delete modal for selected items
  const openDeleteModal = (itemIds: number[]) => {
    if (itemIds.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm để xóa");
      return;
    }
    setItemsToDelete(itemIds);
    setShowDeleteModal(true);
  };

  // Open delete modal for single item
  const openDeleteSingleItem = (itemId: number) => {
    setItemsToDelete([itemId]);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemsToDelete([]);
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all items
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const calculateSubTotal = () => {
    // Chỉ tính tổng cho các item được chọn
    if (selectedItems.length === 0) {
      return 0;
    }
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.sku.price * item.quantity, 0);
  };

  // Hàm để chuyển đến trang thanh toán
  const handleProceedToPayment = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    // Lấy thông tin chi tiết của các item được chọn
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    // Chuyển đến trang thanh toán với state
    navigate("/pay", {
      state: { selectedItems: selectedCartItems },
    });
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const range = 2;
    const pages: (number | string)[] = [];

    // Previous button
    pages.push("prev");

    // First page and ellipsis
    if (currentPage > range + 1) {
      pages.push(1);
      if (currentPage > range + 2) pages.push("...");
    }

    // Current page range
    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    // Last page and ellipsis
    if (currentPage < totalPages - range) {
      if (currentPage < totalPages - (range + 1)) pages.push("...");
      pages.push(totalPages);
    }

    // Next button
    pages.push("next");

    return (
      <div className="pagination">
        {pages.map((p, index) => {
          if (p === "prev") {
            return currentPage > 1 ? (
              <a
                key={index}
                href="#"
                className="page-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage - 1);
                }}
              >
                <i className="fas fa-angle-left"></i>
              </a>
            ) : (
              <span key={index} className="page-btn disabled">
                <i className="fas fa-angle-left"></i>
              </span>
            );
          }
          if (p === "next") {
            return currentPage < totalPages ? (
              <a
                key={index}
                href="#"
                className="page-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage + 1);
                }}
              >
                <i className="fas fa-angle-right"></i>
              </a>
            ) : (
              <span key={index} className="page-btn disabled">
                <i className="fas fa-angle-right"></i>
              </span>
            );
          }
          if (p === "...") {
            return (
              <span key={index} className="page-btn disabled">
                ...
              </span>
            );
          }
          return p === currentPage ? (
            <span key={index} className="page-btn current">
              {p}
            </span>
          ) : (
            <a
              key={index}
              href="#"
              className="page-btn"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(p as number);
              }}
            >
              {p}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="wrapper">
      <div className="cinema-wrapper">
        <div className="cinema-card">
          <h2>Giỏ hàng của bạn</h2>

          {loading && (
            <div
              className="loading"
              style={{ textAlign: "center", padding: "20px" }}
            >
              Đang tải...
            </div>
          )}

          <div className="filter-info">
            <p>
              Hiển thị {cartItems.length} của {totalItems} sản phẩm
            </p>
          </div>

          {cartItems.length > 0 ? (
            <>
              {/* Action buttons for selected items */}
              {selectedItems.length > 0 && (
                <div
                  className="header-actions"
                  style={{ marginBottom: "20px" }}
                >
                  <button
                    className="btn-create"
                    onClick={() => openDeleteModal(selectedItems)}
                    style={{ background: "#dc3545" }}
                  >
                    <i className="fas fa-trash"></i>
                    Xóa {selectedItems.length} sản phẩm đã chọn
                  </button>
                </div>
              )}

              <div className="cart-content">
                <div className="cart-left">
                  <div className="table-container">
                    <table className="cinema-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={
                                selectedItems.length === cartItems.length &&
                                cartItems.length > 0
                              }
                              onChange={handleSelectAll}
                              className="select-all-checkbox"
                            />
                          </th>
                          <th>Sản phẩm</th>
                          <th>Phân loại</th>
                          <th>Giá</th>
                          <th>Số lượng</th>
                          <th>Tạm tính</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelect(item.id)}
                                className="item-checkbox"
                              />
                            </td>
                            <td>
                              <div className="cart-product">
                                <img
                                  src={item.sku.product.images[0]}
                                  className="cart-thumb"
                                  alt={item.sku.product.name}
                                />
                                <span className="cart-name">
                                  {item.sku.product.name}
                                </span>
                              </div>
                            </td>
                            <td>{item.sku.value}</td>
                            <td>{formatVN(item.sku.price)}</td>
                            <td>
                              <div className="qty-form">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.skuId,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.skuId,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>{formatVN(item.sku.price * item.quantity)}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-delete"
                                  onClick={() => openDeleteSingleItem(item.id)}
                                  title="Xóa"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="cart-right">
                  <h3>Tổng giỏ hàng</h3>
                  <div className="summary-line">
                    <span>Sản phẩm đã chọn: {selectedItems.length}</span>
                  </div>
                  <div className="summary-line">
                    <span>Tạm tính</span>
                    <span>{formatVN(calculateSubTotal())}</span>
                  </div>
                  <div className="summary-line total">
                    <span>Tổng cộng</span>
                    <span>{formatVN(calculateSubTotal())}</span>
                  </div>
                  <button
                    className={`btn-payment ${
                      selectedItems.length === 0 ? "disabled" : ""
                    }`}
                    onClick={handleProceedToPayment}
                    disabled={selectedItems.length === 0}
                  >
                    {selectedItems.length === 0
                      ? "Chọn sản phẩm để thanh toán"
                      : "Tiến hành thanh toán"}
                  </button>
                </div>
              </div>

              {renderPagination()}
            </>
          ) : (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart empty-icon"></i>
              <p>Giỏ hàng của bạn đang trống.</p>
              <a href="/products" className="btn-shopping">
                Tiếp tục mua sắm
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteCartItemModal
        isOpen={showDeleteModal}
        selectedItems={itemsToDelete}
        cartItems={cartItems}
        onClose={closeDeleteModal}
        onSuccess={handleSuccess}
        onRefresh={fetchCartItems}
      />
    </div>
  );
};

export default Cart;
