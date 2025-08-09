import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../assets/css/accesPay.css";
import http from "../api/http";
import { toast } from "react-toastify";

interface Receiver {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productTranslation: any[];
  skuPrice: number;
  image: string;
  skuValue: string;
  skuId: number;
  orderId: number;
  quantity: number;
  createdAt: string;
}

interface OrderData {
  id: number;
  userId: number;
  status: string;
  receiver: Receiver;
  paymentId: number;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items: OrderItem[];
}

// Hàm tiện ích để định dạng tiền tệ VNĐ
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
};

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order data from API
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        if (!orderId) {
          setError("Order ID không hợp lệ");
          setLoading(false);
          return;
        }

        const response = await http.get(`/orders/${orderId}`);

        const data: OrderData = await response.data;
        setOrderData(data);

        // Kiểm tra nếu status là PENDING_PAYMENT thì redirect
        if (data.status === "PENDING_PAYMENT") {
          toast.error("Đơn hàng đang chờ thanh toán");
          navigate(`/transfer/${orderId}`);
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Calculate totals
  const calculateTotals = () => {
    if (!orderData) return { subtotal: 0, discount: 0, finalTotal: 0 };

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.skuPrice * item.quantity,
      0
    );
    const discount = 0; // Có thể thêm logic tính discount từ API nếu cần
    const finalTotal = subtotal - discount;

    return { subtotal, discount, finalTotal };
  };

  const { subtotal, discount, finalTotal } = calculateTotals();

  if (loading) {
    return (
      <div className="wrapper">
        <div className="order-success-wrapper">
          <h1>Đang tải thông tin đơn hàng...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper">
        <div className="order-success-wrapper">
          <h1>Có lỗi xảy ra</h1>
          <p>{error}</p>
          <div className="return-home">
            <a href="/" className="button-like">
              Quay lại trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="wrapper">
        <div className="order-success-wrapper">
          <h1>Không tìm thấy đơn hàng</h1>
          <div className="return-home">
            <a href="/" className="button-like">
              Quay lại trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="order-success-wrapper">
        <h1>Thông báo đơn hàng đã đặt thành công!</h1>

        <div className="thank-you-message">
          <p>
            Cảm ơn bạn đã mua sắm tại <strong>PIXCAM</strong>!
          </p>
          <p className="additional-message">
            Đơn hàng #{orderData.id} của bạn đã được xác nhận và chúng tôi sẽ xử
            lý ngay lập tức.
          </p>
        </div>

        <div className="customer-info-wrapper">
          <h2>Thông tin khách hàng</h2>
          <div className="info-item">
            <span className="info-label">Họ và tên:</span>
            <span className="info-value">{orderData.receiver.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Địa chỉ:</span>
            <span className="info-value">{orderData.receiver.address}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Số điện thoại:</span>
            <span className="info-value">{orderData.receiver.phone}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{orderData.receiver.email}</span>
          </div>
          {orderData.receiver.note && (
            <div className="info-item">
              <span className="info-label">Ghi chú:</span>
              <span className="info-value">{orderData.receiver.note}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Trạng thái:</span>
            <span className="info-value">{orderData.status}</span>
          </div>
        </div>

        <div className="order-details">
          <h2>Chi tiết đơn hàng</h2>
          {orderData.items && orderData.items.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.skuValue}</td>
                    <td>{formatCurrency(item.skuPrice)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.skuPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="order-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="summary-item">
            <span>Tạm tính:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-item">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="summary-item total">
            <span>Tổng cộng:</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div className="return-home">
          <a href="/" className="button-like">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
