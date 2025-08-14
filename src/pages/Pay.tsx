import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/css/PayCart.css";
import http from "../api/http";

interface SelectedCartItem {
  id: number;
  quantity: number;
  sku: {
    id: number;
    value: string;
    price: number;
    image: string;
    product: {
      id: number;
      name: string;
      images: string[];
    };
  };
}

interface ReceiverInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
}

interface CreateOrderRequest {
  cartItemIds: number[];
  receiver: ReceiverInfo;
  isCOD?: boolean; // Optional field for COD payment
}

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems =
    (location.state?.selectedItems as SelectedCartItem[]) || [];

  const [formData, setFormData] = useState<ReceiverInfo>({
    name: "",
    phone: "",
    address: "",
    email: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect nếu không có selectedItems
  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  // Tính tổng tiền
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.sku?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(e.target.value);
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (formData.name.trim().length < 2) {
      newErrors.push("Họ tên phải có ít nhất 2 ký tự");
    }

    if (!/^\d{9,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.push("Số điện thoại phải từ 9-11 chữ số");
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.push("Email không hợp lệ");
    }

    if (formData.address.trim() === "") {
      newErrors.push("Địa chỉ không được để trống");
    }

    if (!paymentMethod) {
      newErrors.push("Vui lòng chọn phương thức thanh toán");
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cartItemIds = selectedItems.map((item) => item.id);

      // Tạo request body với logic COD
      const requestBody: CreateOrderRequest = {
        cartItemIds,
        receiver: formData,
      };

      // Thêm trường isCOD nếu phương thức thanh toán là COD
      if (paymentMethod === "cod") {
        requestBody.isCOD = true;
      }

      console.log("Creating order with payload:", requestBody);
      const response = await http.post("/orders", requestBody);
      const orderId = response.data.data.id;

      if (paymentMethod === "bank") {
        // Chuyển đến trang chuyển khoản
        navigate(`/transfer/${orderId}`);
      } else if (paymentMethod === "cod") {
        // Thanh toán khi nhận hàng - chuyển đến trang thành công
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors(["Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return (
      <div className="content">
        <div className="pay-container">
          <p>Không có sản phẩm nào được chọn để thanh toán.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="pay-container">
        <h1 className="pay-title">Thông tin thanh toán</h1>

        {errors.length > 0 && (
          <div className="error-message">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <div className="pay-content">
          {/* Form thông tin */}
          <div className="pay-form-section">
            <h2>Thông tin người nhận</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Họ và tên *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="0xxxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa chỉ giao hàng *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>

              <div className="form-group">
                <label htmlFor="note">Ghi chú</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  rows={4}
                ></textarea>
              </div>

              <div className="payment-method-section">
                <h3>Phương thức thanh toán *</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span className="payment-option-text">
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                      <small>Thanh toán bằng tiền mặt khi nhận hàng</small>
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span className="payment-option-text">
                      <strong>Chuyển khoản ngân hàng</strong>
                      <small>Chuyển khoản qua ngân hàng hoặc ví điện tử</small>
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="pay-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </form>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="pay-summary-section">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="order-summary">
              <div className="selected-items">
                {selectedItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <img
                      src={
                        item.sku?.image ||
                        item.sku?.product?.images?.[0] ||
                        "/placeholder.jpg"
                      }
                      alt={item.sku?.product?.name || "Sản phẩm"}
                      className="summary-item-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                    <div className="summary-item-info">
                      <h4>{item.sku?.product?.name || "Tên sản phẩm"}</h4>
                      <p>Phân loại: {item.sku?.value || "N/A"}</p>
                      <p>Số lượng: {item.quantity || 0}</p>
                      <p className="summary-item-price">
                        {formatCurrency(
                          (item.sku?.price || 0) * (item.quantity || 0)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="total-row final-total">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;
