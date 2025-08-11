import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import envConfig from "../envConfig";
import { useParams } from "react-router-dom";
import "../assets/css/Transfer.css";
import http from "../api/http";
import type { OrderInProductSKUSnapshotType } from "../models/shared/shared-order.model";
import { toast } from "react-toastify";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";

let socket: Socket;

const TransferPage: React.FC = () => {
  const { user } = useAuthStore();
  const [paymentId, setPaymentId] = useState<number>(0);
  const [amount, setAmount] = useState(0);
  const { orderId } = useParams<{ orderId: string }>();

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
        const order = await http.get(`/orders/${Number(orderId)}`);
        const orderData: OrderInProductSKUSnapshotType = order.data;
        setPaymentId(orderData.paymentId);
        setAmount(getTotalPrice(orderData));
      } catch (error) {
        navigate("/");
        toast.error("Đơn hàng không tồn tại hoặc không phải của bạn");
      }
    };
    takeOrder();
  }, [orderId, navigate]);

  // WebSocket connection - chỉ chạy khi có paymentId
  useEffect(() => {
    if (!paymentId || paymentId === 0) {
      console.log("PaymentId not ready yet:", paymentId);
      return; // Không khởi tạo socket nếu chưa có paymentId
    }

    // Kiểm tra user đã đăng nhập chưa thông qua authStore
    if (!user) {
      console.log("Người dùng chưa đăng nhập, không khởi tạo WebSocket");
      return;
    }

    socket = io(`${envConfig.VITE_API_END_POINT}/payment`, {
      withCredentials: true, // Để gửi HTTP-only cookies
    });

    socket.on("connect", () => {
      console.log(
        "✅ WebSocket connected successfully for payment:",
        paymentId
      );
      socket.emit("joinPaymentRoom", paymentId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err.message);
      if (err.message.includes("Authentication")) {
        toast.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    });

    socket.on("successPaymentId", (receivedPaymentId: number) => {
      if (receivedPaymentId === paymentId) {
        setStatusMessage("Thanh toán thành công");
        toast.success("Thanh toán thành công!");
        setTimeout(() => {
          navigate("/order-success/" + orderId);
        }, 2000);
      }
    });

    // Cleanup function
    return () => {
      if (socket) {
        socket.emit("leavePaymentRoom", paymentId);
        socket.disconnect();
      }
    };
  }, [paymentId, navigate, user, orderId]); // Thêm user vào dependency array

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
