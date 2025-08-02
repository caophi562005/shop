import React from "react";

import "../assets/css/accesPay.css";

// --- Định nghĩa kiểu dữ liệu với TypeScript ---
interface PaymentInfo {
  name: string;
  address: string;
  phone: string;
  Email: string; // Giữ nguyên chữ 'E' viết hoa như trong code PHP
  note: string;
  total: number;
  discount_amount: number;
  finalTotal: number;
}

interface OrderDetail {
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

// --- DỮ LIỆU GIẢ (thay thế cho biến PHP) ---
const paymentInfo: PaymentInfo = {
  name: "Nguyễn Văn An",
  address: "123 Đường ABC, Phường 10, Quận 3, TP. Hồ Chí Minh",
  phone: "0987 654 321",
  Email: "nguyenvanan@email.com",
  note: "Vui lòng gọi trước khi giao hàng.",
  total: 78490000,
  discount_amount: 500000,
  finalTotal: 77990000,
};

const orderDetails: OrderDetail[] = [
  {
    productName: "Máy ảnh Sony Alpha A7 IV",
    price: 58990000,
    quantity: 1,
    total: 58990000,
  },
  {
    productName: "Ống kính Sigma 35mm f/1.4",
    price: 19500000,
    quantity: 1,
    total: 19500000,
  },
];
// --- KẾT THÚC DỮ LIỆU GIẢ ---

// Hàm tiện ích để định dạng tiền tệ VNĐ
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
};

const OrderSuccessPage: React.FC = () => {
  return (
    <div className="wrapper">
      <div className="order-success-wrapper">
        <h1>Thông báo đơn hàng đã đặt thành công!</h1>

        <div className="thank-you-message">
          <p>
            Cảm ơn bạn đã mua sắm tại <strong>PIXCAM</strong>!
          </p>
          <p className="additional-message">
            Đơn hàng của bạn đã được xác nhận và chúng tôi sẽ xử lý ngay lập
            tức.
          </p>
        </div>

        <div className="customer-info-wrapper">
          <h2>Thông tin khách hàng</h2>
          {/* Thay thế câu lệnh if của PHP bằng toán tử && trong JSX */}
          {paymentInfo && (
            <>
              <div className="info-item">
                <span className="info-label">Họ và tên:</span>
                <span className="info-value">{paymentInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{paymentInfo.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Số điện thoại:</span>
                <span className="info-value">{paymentInfo.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{paymentInfo.Email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{paymentInfo.note}</span>
              </div>
            </>
          )}
        </div>

        <div className="order-details">
          <h2>Chi tiết đơn hàng</h2>
          {/* Thay thế câu lệnh if và foreach của PHP bằng .map() trong JSX */}
          {orderDetails && orderDetails.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <tr key={index}>
                    {" "}
                    {/* Thêm key prop cho mỗi phần tử trong vòng lặp */}
                    <td>{item.productName}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.total)}</td>
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
            <span>{formatCurrency(paymentInfo.total)}</span>
          </div>
          <div className="summary-item">
            <span>Giảm giá:</span>
            <span>-{formatCurrency(paymentInfo.discount_amount)}</span>
          </div>
          <div className="summary-item total">
            <span>Tổng cộng:</span>
            <span>{formatCurrency(paymentInfo.finalTotal)}</span>
          </div>
        </div>

        <div className="return-home">
          {/* Trong React, thường dùng <Link> của react-router-dom hoặc thẻ <a> */}
          <a href="/" className="button-like">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
