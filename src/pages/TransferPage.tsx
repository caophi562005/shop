import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import envConfig from "../envConfig";
import { useParams } from "react-router-dom";
import "../assets/css/Transfer.css";
import http from "../api/http";
import type { OrderInProductSKUSnapshotType } from "../models/shared/shared-order.model";
import { toast } from "react-toastify";
import { OrderStatus } from "../constants/order.constant";
import { usePaymentSocket } from "../hooks/usePaymentSocket";

const TransferPage: React.FC = () => {
  const [paymentId, setPaymentId] = useState<number>(0);
  const [amount, setAmount] = useState(0);
  const { orderId } = useParams<{ orderId: string }>();

  // Use payment socket hook
  const { onPaymentSuccess, isConnected } = usePaymentSocket(
    paymentId || undefined
  );

  const qrUrl = `https://qr.sepay.vn/img?acc=${envConfig.VITE_BANK_ACCOUNT}&bank=${envConfig.VITE_BANK_CODE}&amount=${amount}&des=${envConfig.VITE_ORDER_PREFIX}${paymentId}`;
  const [statusMessage, setStatusMessage] = useState("Đang chờ thanh toán...");

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/");
  };

  const getTotalPrice = (order: OrderInProductSKUSnapshotType) => {
    let totalPrice = 0;
    order.items.map((item) => {
      totalPrice += item.skuPrice * item.quantity;
    });
    return totalPrice;
  };

  // Fetch order data
  useEffect(() => {
    const takeOrder = async () => {
      try {
        const response = await http.get(`/orders/${Number(orderId)}`);
        const orderData: OrderInProductSKUSnapshotType = response.data;

        // Kiểm tra status của order
        if (orderData.status === OrderStatus.PENDING_PAYMENT) {
          // Chỉ tiếp tục với transfer page nếu status là PENDING_PAYMENT
          setPaymentId(orderData.paymentId);
          setAmount(getTotalPrice(orderData));
        } else if (orderData.status === OrderStatus.CANCELLED) {
          // Nếu order đã bị cancel
          toast.error("Đơn hàng đã bị hủy");
          navigate("/");
        } else {
          // Nếu order đã thanh toán hoặc có status khác (PENDING_PICKUP, PENDING_DELIVERY, DELIVERED, RETURNED)
          toast.success("Đơn hàng đã được thanh toán thành công");
          navigate(`/order-success/${orderId}`);
        }
      } catch (error) {
        navigate("/");
        toast.error("Đơn hàng không tồn tại hoặc không phải của bạn");
      }
    };
    takeOrder();
  }, [orderId, navigate]);

  // Listen for payment success using the hook
  useEffect(() => {
    if (!isConnected || !paymentId) return;

    const cleanup = onPaymentSuccess((receivedPaymentId: number) => {
      if (receivedPaymentId === paymentId) {
        setStatusMessage("Thanh toán thành công");
        toast.success("Thanh toán thành công!");
        setTimeout(() => {
          navigate("/order-success/" + orderId);
        }, 2000);
      }
    });

    return cleanup;
  }, [isConnected, paymentId, onPaymentSuccess, navigate, orderId]);

  return (
    <div className="transfer-page-container">
      <div className="content">
        <h1 className="inf_title_paycart">Chuyển khoản ngân hàng</h1>
        <p>
          Mã đơn hàng{" "}
          <strong>
            {envConfig.VITE_ORDER_PREFIX}
            {paymentId}
          </strong>
        </p>
        <p>
          Vui lòng chuyển{" "}
          <strong>{new Intl.NumberFormat("vi-VN").format(amount)} VNĐ</strong>
        </p>

        <div className="qr-box">
          <img src={qrUrl} alt="QR chuyển khoản" />
        </div>

        <p
          id="status"
          style={{
            color: statusMessage === "Thanh toán thành công" ? "green" : "red",
            fontWeight: "bold",
            minHeight: "24px",
          }}
        >
          {statusMessage}
        </p>
        <button
          id="cancel-btn"
          className="btn_payOnline"
          onClick={handleCancel}
        >
          ❌ Hủy giao dịch
        </button>
      </div>
    </div>
  );
};

export default TransferPage;
