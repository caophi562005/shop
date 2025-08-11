import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../assets/css/orderDetail.css";
import http from "../api/http";
import { toast } from "react-toastify";
import { languageUtils } from "../utils/language";
import FeedbackFormComponent from "../components/FeedbackFormComponent";
import FeedbackReadonlyComponent from "../components/FeedbackReadonlyComponent";

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

interface OrderDetail {
  id: number;
  userId: number;
  status: string;
  paymentId: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  paymentMethod?: string;
  note?: string;
}

interface MediaItem {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  reviewId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  avatar: string | null;
}

interface ReviewData {
  id: number;
  content: string;
  rating: number;
  orderId: number;
  productId: number;
  userId: number;
  updateCount: number;
  createdAt: string;
  updatedAt: string;
  medias: MediaItem[];
  user: User;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<{
    [productId: number]: ReviewData | null;
  }>({});
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<{
    [productId: number]: boolean;
  }>({});

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/orders/${orderId}`);

      // Thử nhiều cách truy cập dữ liệu
      let orderData = null;

      if (response.data?.data) {
        orderData = response.data.data;
      } else if (response.data) {
        orderData = response.data;
      }

      if (orderData && orderData.id) {
        setOrder(orderData);

        // If order is delivered, fetch reviews for each product
        if (orderData.status === "DELIVERED") {
          await fetchReviewsForOrder(orderData);
        }
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      toast.error("Không thể tải chi tiết đơn hàng");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForOrder = async (orderData: OrderDetail) => {
    setReviewsLoading(true);
    try {
      const productIds = [
        ...new Set(orderData.items.map((item) => item.productId)),
      ];
      const reviewPromises = productIds.map(async (productId) => {
        try {
          const response = await http.get(`/reviews/${productId}`);
          return {
            productId,
            review: response.data?.data || response.data || null,
          };
        } catch (error) {
          // Review doesn't exist yet
          return {
            productId,
            review: null,
          };
        }
      });

      const reviewResults = await Promise.all(reviewPromises);
      const reviewsMap: { [productId: number]: ReviewData | null } = {};

      reviewResults.forEach(({ productId, review }) => {
        reviewsMap[productId] = review;
      });

      setReviews(reviewsMap);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSuccess = (productId: number) => {
    // Refresh reviews after successful submission
    if (order) {
      fetchReviewsForOrder(order);
    }
    // Hide the form
    setShowReviewForm((prev) => ({
      ...prev,
      [productId]: false,
    }));
  };

  const toggleReviewForm = (productId: number) => {
    setShowReviewForm((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("vi-VN");
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

  const getImageUrl = (imagePath: string): string => {
    if (imagePath?.startsWith("http")) {
      return imagePath;
    }
    return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="cinema-wrapper">
        <div className="cinema-card">
          <div className="loading">Đang tải chi tiết đơn hàng...</div>
        </div>
      </div>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="cinema-wrapper">
        <div className="cinema-card">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle error-icon"></i>
            <p>Không tìm thấy đơn hàng</p>
            <Link to="/order-history" className="btn-back">
              Quay lại lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cinema-wrapper">
      <div className="cinema-card">
        {/* Header */}
        <div className="order-detail-header">
          <div className="header-left">
            <Link to="/order-history" className="btn-back-simple">
              <i className="fas fa-arrow-left"></i>
              Quay lại
            </Link>
            <h2>Chi tiết đơn hàng #{order.id}</h2>
          </div>
          <div className="header-right">
            <span className={`status-badge ${getStatusBadge(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div className="order-info-section">
          <div className="info-grid">
            <div className="info-item">
              <label>Ngày đặt hàng:</label>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Ngày cập nhật:</label>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
            <div className="info-item">
              <label>Mã thanh toán:</label>
              <span>#{order.paymentId}</span>
            </div>
            <div className="info-item">
              <label>Phương thức thanh toán:</label>
              <span>{order.paymentMethod || "Chuyển khoản ngân hàng"}</span>
            </div>
          </div>
        </div>

        {/* Receiver Info */}
        {(order.receiverName ||
          order.receiverPhone ||
          order.receiverAddress) && (
          <div className="receiver-info-section">
            <h3>Thông tin người nhận</h3>
            <div className="info-grid">
              {order.receiverName && (
                <div className="info-item">
                  <label>Tên người nhận:</label>
                  <span>{order.receiverName}</span>
                </div>
              )}
              {order.receiverPhone && (
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  <span>{order.receiverPhone}</span>
                </div>
              )}
              {order.receiverAddress && (
                <div className="info-item full-width">
                  <label>Địa chỉ:</label>
                  <span>{order.receiverAddress}</span>
                </div>
              )}
            </div>
            {order.note && (
              <div className="note-section">
                <label>Ghi chú:</label>
                <p>{order.note}</p>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="order-items-section">
          <h3>Sản phẩm trong đơn hàng</h3>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  <img
                    src={getImageUrl(item.image)}
                    alt={getTranslatedProductName(item)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/src/assets/img/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="item-info">
                  <h4>{getTranslatedProductName(item)}</h4>
                  <p className="item-sku">Phân loại: {item.skuValue}</p>
                  <div className="item-details">
                    <span className="item-price">
                      {formatCurrency(item.skuPrice)}
                    </span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-total">
                      {formatCurrency(item.skuPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Section - Only show for delivered orders */}
        {order.status === "DELIVERED" && (
          <div className="review-section">
            <h3>Đánh giá sản phẩm</h3>
            {reviewsLoading ? (
              <div className="review-loading">Đang tải đánh giá...</div>
            ) : (
              <div className="review-list">
                {[...new Set(order.items.map((item) => item.productId))].map(
                  (productId) => {
                    const productItem = order.items.find(
                      (item) => item.productId === productId
                    );
                    const existingReview = reviews[productId];
                    const showForm = showReviewForm[productId];

                    if (!productItem) return null;

                    return (
                      <div key={productId} className="product-review-container">
                        <div className="product-review-header">
                          <div className="product-info">
                            <img
                              src={getImageUrl(productItem.image)}
                              alt={getTranslatedProductName(productItem)}
                              className="review-product-image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/src/assets/img/placeholder.jpg";
                              }}
                            />
                            <h4>{getTranslatedProductName(productItem)}</h4>
                          </div>

                          {existingReview ? (
                            // Show existing review
                            <FeedbackReadonlyComponent
                              reviewData={existingReview}
                              onEditSuccess={() =>
                                handleReviewSuccess(productId)
                              }
                              isCompact={true}
                            />
                          ) : showForm ? (
                            // Show review form
                            <div className="review-form-container">
                              <FeedbackFormComponent
                                productId={productId}
                                orderId={order.id}
                                onSubmitSuccess={() =>
                                  handleReviewSuccess(productId)
                                }
                                isCompact={true}
                              />
                              <button
                                onClick={() => toggleReviewForm(productId)}
                                className="btn-cancel-review"
                              >
                                Hủy đánh giá
                              </button>
                            </div>
                          ) : (
                            // Show button to create review
                            <div className="review-action">
                              <button
                                onClick={() => toggleReviewForm(productId)}
                                className="btn-create-review"
                              >
                                Viết đánh giá
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Tổng số sản phẩm:</span>
            <span>
              {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
              sản phẩm
            </span>
          </div>
          <div className="summary-row total">
            <span>Tổng tiền:</span>
            <span>{formatCurrency(calculateOrderTotal(order.items))}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          <Link to="/order-history" className="btn-secondary">
            Quay lại danh sách
          </Link>
          {order.status === "PENDING_PAYMENT" && (
            <Link to={`/transfer/${order.paymentId}`} className="btn-primary">
              Tiếp tục thanh toán
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
