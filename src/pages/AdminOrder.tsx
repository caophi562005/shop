import React, { useEffect, useState } from "react";
import "../assets/css/accountlist.css";
import http from "../api/http";
import { OrderStatus } from "../constants/order.constant";
import { toast } from "react-toastify";
import { z } from "zod";
import { OrderStatusSchema } from "../models/shared/shared-order.model";

// Define types based on the API response
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productTranslation: Array<{
    id: number;
    name: string;
    description: string;
    languageId: string;
  }>;
  skuPrice: number;
  image: string;
  skuValue: string;
  skuId: number;
  orderId: number;
  quantity: number;
  createdAt: string;
}

interface OrderReceiver {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  receiver: OrderReceiver;
  paymentId: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  data: Order[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Update order schema
export const UpdateOrderBodySchema = z.object({
  status: OrderStatusSchema.optional(),
  receiver: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      email: z.string().email().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

type UpdateOrderData = z.infer<typeof UpdateOrderBodySchema>;

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form state
  const [editForm, setEditForm] = useState<UpdateOrderData>({});

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await http.get<OrdersResponse>(
        `/manage-orders?page=${currentPage}&limit=${ordersPerPage}`
      );

      const data = response.data;
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status as any,
      receiver: {
        name: order.receiver.name,
        phone: order.receiver.phone,
        address: order.receiver.address,
        email: order.receiver.email,
        note: order.receiver.note,
      },
    });
    setShowEditModal(true);
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedOrder(null);
    setEditForm({});
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      // Remove undefined values
      const cleanedData: UpdateOrderData = {};
      if (editForm.status && editForm.status !== selectedOrder.status) {
        cleanedData.status = editForm.status;
      }
      if (editForm.receiver) {
        const receiverChanges: any = {};
        Object.entries(editForm.receiver).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== (selectedOrder.receiver as any)[key]
          ) {
            receiverChanges[key] = value;
          }
        });
        if (Object.keys(receiverChanges).length > 0) {
          cleanedData.receiver = receiverChanges;
        }
      }

      if (Object.keys(cleanedData).length === 0) {
        toast.info("Không có thay đổi nào để cập nhật");
        closeModals();
        return;
      }

      await http.patch(`/manage-orders/${selectedOrder.id}`, cleanedData);

      toast.success("Cập nhật đơn hàng thành công");
      closeModals();
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Không thể cập nhật đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING_PAYMENT: "pending-payment",
      PENDING_PICKUP: "pending-pickup",
      PENDING_DELIVERY: "pending-delivery",
      DELIVERED: "delivered",
      RETURNED: "returned",
      CANCELLED: "cancelled",
    };

    const statusLabels: Record<string, string> = {
      PENDING_PAYMENT: "Chờ thanh toán",
      PENDING_PICKUP: "Chờ lấy hàng",
      PENDING_DELIVERY: "Đang giao",
      DELIVERED: "Đã giao",
      RETURNED: "Trả hàng",
      CANCELLED: "Đã hủy",
    };

    return (
      <span className={`status ${statusClasses[status] || ""}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalAmount = (items: OrderItem[]) => {
    return items.reduce(
      (total, item) => total + item.skuPrice * item.quantity,
      0
    );
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
          <h2>Quản lý đơn hàng</h2>
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
              Hiển thị {orders.length} của {totalItems} đơn hàng
            </p>
          </div>

          <div className="table-container">
            <table className="cinema-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="customer-info">
                        <div>
                          <strong>{order.receiver.name}</strong>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {order.receiver.email}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {order.receiver.phone}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{formatCurrency(calculateTotalAmount(order.items))}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatDate(order.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => openDetailModal(order)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(order)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa đơn hàng #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Trạng thái:</label>
                  <select
                    value={editForm.status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as any,
                      })
                    }
                  >
                    <option value={OrderStatus.PENDING_PAYMENT}>
                      Chờ thanh toán
                    </option>
                    <option value={OrderStatus.PENDING_PICKUP}>
                      Chờ lấy hàng
                    </option>
                    <option value={OrderStatus.PENDING_DELIVERY}>
                      Đang giao
                    </option>
                    <option value={OrderStatus.DELIVERED}>Đã giao</option>
                    <option value={OrderStatus.RETURNED}>Trả hàng</option>
                    <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                  </select>
                </div>

                <h4>Thông tin người nhận:</h4>
                <div className="form-group">
                  <label>Tên:</label>
                  <input
                    type="text"
                    value={editForm.receiver?.name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receiver: {
                          ...editForm.receiver,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    value={editForm.receiver?.phone || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receiver: {
                          ...editForm.receiver,
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ:</label>
                  <input
                    type="text"
                    value={editForm.receiver?.address || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receiver: {
                          ...editForm.receiver,
                          address: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.receiver?.email || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receiver: {
                          ...editForm.receiver,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    value={editForm.receiver?.note || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        receiver: {
                          ...editForm.receiver,
                          note: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={closeModals}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
                Hủy
              </button>
              <button
                className="btn-save"
                onClick={handleUpdateOrder}
                disabled={loading}
              >
                <i className="fas fa-save"></i>
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModals}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={closeModals}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-section">
                  <h4>Thông tin đơn hàng</h4>
                  <p>
                    <strong>ID:</strong> #{selectedOrder.id}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <strong>Cập nhật:</strong>{" "}
                    {formatDate(selectedOrder.updatedAt)}
                  </p>
                  <p>
                    <strong>Payment ID:</strong> {selectedOrder.paymentId}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Thông tin người nhận</h4>
                  <p>
                    <strong>Tên:</strong> {selectedOrder.receiver.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.receiver.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong>{" "}
                    {selectedOrder.receiver.phone}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {selectedOrder.receiver.address}
                  </p>
                  <p>
                    <strong>Ghi chú:</strong>{" "}
                    {selectedOrder.receiver.note || "Không có"}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Sản phẩm ({selectedOrder.items.length} mặt hàng)</h4>
                  <div className="items-list">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="item-row">
                        <div className="item-info">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="item-image"
                            />
                          )}
                          <div>
                            <p>
                              <strong>{item.productName}</strong>
                            </p>
                            <p>SKU: {item.skuValue}</p>
                            {item.productTranslation.length > 0 && (
                              <p>Bản dịch: {item.productTranslation[0].name}</p>
                            )}
                          </div>
                        </div>
                        <div className="item-price">
                          <p>Số lượng: {item.quantity}</p>
                          <p>Đơn giá: {formatCurrency(item.skuPrice)}</p>
                          <p>
                            <strong>
                              Thành tiền:{" "}
                              {formatCurrency(item.skuPrice * item.quantity)}
                            </strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="total-section">
                    <h4>
                      Tổng cộng:{" "}
                      {formatCurrency(
                        calculateTotalAmount(selectedOrder.items)
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel detail-close" onClick={closeModals}>
                <i className="fas fa-times"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;
