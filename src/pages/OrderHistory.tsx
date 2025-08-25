import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/orderHistory.css";
import http from "../api/http";
import { toast } from "react-toastify";
import { languageUtils } from "../utils/language";

// Type definitions
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

interface Order {
  id: number;
  userId: number;
  status: string;
  paymentId: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderHistoryResponse {
  data: Order[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await http.get(
        `/orders?page=${currentPage}&limit=${ordersPerPage}`
      );
      const data: OrderHistoryResponse = response.data;

      setOrders(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      toast.error("Không thể tải lịch sử đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      PENDING_PAYMENT: "Chờ thanh toán",
      PENDING_PICKUP: "Chờ lấy hàng",
      PENDING_DELIVERY: "Đang giao hàng",
      DELIVERED: "Đã giao hàng",
      RETURNED: "Đã trả hàng",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string): string => {
    const statusClasses: { [key: string]: string } = {
      PENDING_PAYMENT: "status-pending-payment",
      PENDING_PICKUP: "status-pending-pickup",
      PENDING_DELIVERY: "status-pending-delivery",
      DELIVERED: "status-delivered",
      RETURNED: "status-returned",
      CANCELLED: "status-cancelled",
    };
    return statusClasses[status] || "status-default";
  };

  const calculateOrderTotal = (items: OrderItem[]): number => {
    return items.reduce(
      (total, item) => total + item.skuPrice * item.quantity,
      0
    );
  };

  const getTranslatedProductName = (item: OrderItem): string => {
    const currentLang = languageUtils.getCurrentLanguage();
    const translation = item.productTranslation.find(
      (trans) => trans.languageId === currentLang
    );
    return translation?.name || item.productName;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const range = 2;
    const pages: (number | string)[] = [];

    pages.push("prev");

    if (currentPage > range + 1) {
      pages.push(1);
      if (currentPage > range + 2) pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - range) {
      if (currentPage < totalPages - (range + 1)) pages.push("...");
      pages.push(totalPages);
    }

    pages.push("next");

    return (
      <div className="pagination">
        {pages.map((p, index) => {
          if (p === "prev") {
            return currentPage > 1 ? (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage - 1);
                }}
              >
                <i className="fas fa-angle-left"></i>
              </a>
            ) : (
              <span key={index} className="disabled">
                <i className="fas fa-angle-left"></i>
              </span>
            );
          }

          if (p === "next") {
            return currentPage < totalPages ? (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage + 1);
                }}
              >
                <i className="fas fa-angle-right"></i>
              </a>
            ) : (
              <span key={index} className="disabled">
                <i className="fas fa-angle-right"></i>
              </span>
            );
          }

          if (p === "...") {
            return (
              <span key={index} className="disabled">
                ...
              </span>
            );
          }

          return p === currentPage ? (
            <span key={index} className="active">
              {p}
            </span>
          ) : (
            <a
              key={index}
              href="#"
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
    <div className="cinema-wrapper">
      <div className="cinema-card">
        <h2>Lịch sử đơn hàng</h2>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-shopping-bag empty-icon"></i>
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/products/sale" className="btn-shopping">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <div className="filter-info">
              <span>
                Hiển thị {orders.length} của {totalItems} đơn hàng
              </span>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="order-items">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={item.id} className="order-item-preview">
                              <span>{getTranslatedProductName(item)}</span>
                              {index === 0 && order.items.length > 1 && (
                                <small>
                                  +{order.items.length - 1} sản phẩm khác
                                </small>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        {formatCurrency(calculateOrderTotal(order.items))}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/order-detail/${order.id}`}
                            className="btn-view"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                            Chi tiết
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
