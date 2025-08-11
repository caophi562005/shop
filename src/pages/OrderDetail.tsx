import React from 'react';
import './orderDetail.css';

const OrderDetail: React.FC = () => {
  // Fake data thay cho PHP $orderDetails
  const orderDetails = {
    payment_id: 'ORD123456',
    createAt: '2025-08-10',
    paymentMethod: 'Thanh toán khi nhận hàng',
    total: 1500000,
    discount_amount: 50000,
    finalTotal: 1450000,
    name: 'Nguyễn Văn A',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    note: 'Giao hàng ngoài giờ hành chính',
    products: [
      { id: 1, name: 'Sản phẩm 1', price: 500000, quantity: 1 },
      { id: 2, name: 'Sản phẩm 2', price: 1000000, quantity: 1 },
    ],
  };

  return (
    <div>
      <h1>Chi tiết đơn hàng</h1>
      <div className="order-detail-container">
        <h2>Mã đơn hàng: {orderDetails.payment_id}</h2>
        <p><strong>Ngày đặt hàng:</strong> {new Date(orderDetails.createAt).toLocaleDateString('vi-VN')}</p>
        <p><strong>Phương thức thanh toán:</strong> {orderDetails.paymentMethod}</p>
        <p><strong>Tạm tính:</strong> {orderDetails.total.toLocaleString()} VNĐ</p>
        <p><strong>Giảm giá :</strong> -{orderDetails.discount_amount.toLocaleString()} VNĐ</p>
        <p><strong>Tổng cộng:</strong> {orderDetails.finalTotal.toLocaleString()} VNĐ</p>

        {/* Thông tin giao hàng */}
        <div className="shipping-info">
          <h3>Thông tin giao hàng</h3>
          <p><strong>Họ và tên:</strong> {orderDetails.name || 'Không có thông tin'}</p>
          <p><strong>Địa chỉ giao hàng:</strong> {orderDetails.address || 'Không có thông tin'}</p>
          <p><strong>Số điện thoại:</strong> {orderDetails.phone || 'Không có thông tin'}</p>
          <p><strong>Email:</strong> {orderDetails.email || 'Không có thông tin'}</p>
        </div>

        {/* Ghi chú */}
        <h3>Ghi chú</h3>
        <table className="note-table">
          <thead>
            <tr>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="note-cell">
                {orderDetails.note || 'Không có ghi chú'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Chi tiết sản phẩm */}
        <h3>Chi tiết sản phẩm</h3>
        <table className="order-detail-table">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString()} VNĐ</td>
                <td>{product.quantity}</td>
                <td>{(product.price * product.quantity).toLocaleString()} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;
