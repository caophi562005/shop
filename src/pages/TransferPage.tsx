import React, { useState, useEffect, useRef, useCallback } from "react";
// BEST PRACTICE: Import useNavigate để điều hướng trang thay vì tải lại toàn bộ trang
import { useNavigate } from "react-router-dom";

import "../assets/css/Transfer.css";

// --- FAKE DATA ---
const mockOrderData = {
  orderCode: "PX20250802",
  finalTotal: 1500000,
};

const TransferPage: React.FC = () => {
  // --- Constants and Configuration ---
  const { orderCode, finalTotal } = mockOrderData;

  const BANK_ID = "MB";
  const ACCOUNT_NO = "0336673836";
  const ACCOUNT_NAME = "Hồ Phát Đạt";
  const TEMPLATE = "compact2";
  const AMOUNT = finalTotal;
  const ADD_INFO = orderCode;

  const WAIT_MS = 15 * 60 * 1000;
  const KEY_DEADLINE = "qr_deadline";
  const KEY_LAST_CHECK = "last_check";
  const POLLING_ENDPOINT =
    "https://script.google.com/macros/s/AKfycby1HXIjwYi8TqwOIydkuyVVy-kyDH-vvlmqeaRB4XAKgUPOj1YD5yl8zWDKNS7kK_JX/exec";

  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${encodeURIComponent(
    ADD_INFO
  )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // --- State and Refs ---
  const [timeLeft, setTimeLeft] = useState("--:--");
  const [statusMessage, setStatusMessage] = useState("Đang chờ thanh toán...");

  // BEST PRACTICE: Sử dụng hook useNavigate
  const navigate = useNavigate();
  const isSuccessRef = useRef(false);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  // --- Helper Functions (Không thay đổi) ---
  const getDeadline = (): number => {
    let dl = localStorage.getItem(KEY_DEADLINE);
    if (!dl) {
      dl = (Date.now() + WAIT_MS).toString();
      localStorage.setItem(KEY_DEADLINE, dl);
    }
    return +dl;
  };

  const clearDeadline = () => {
    localStorage.removeItem(KEY_DEADLINE);
    localStorage.removeItem(KEY_LAST_CHECK);
  };

  const getRemainingSeconds = (): number => {
    return Math.floor((getDeadline() - Date.now()) / 1000);
  };

  // --- Logic Functions (Refactored using useCallback) ---

  // REFACTORED: Định nghĩa hàm clearIntervals ở ngoài và bọc trong useCallback.
  // Hàm này không có phụ thuộc nên mảng dependencies là rỗng.
  const clearIntervals = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = []; // Xóa các ID đã lưu
  }, []);

  // REFACTORED: Đưa logic `tick` ra ngoài và dùng useCallback.
  // Phụ thuộc vào `clearIntervals` và `Maps` để không bị stale closure.
  const tick = useCallback(() => {
    const seconds = getRemainingSeconds();
    if (seconds <= 0) {
      clearIntervals();
      setStatusMessage("⏰ Hết thời gian – giao dịch đã bị hủy.");
      setTimeout(() => {
        clearDeadline();
        // BEST PRACTICE: Dùng navigate để chuyển trang
        navigate("/"); // Giả sử đây là route cho trang hủy
      }, 2000);
      return;
    }
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    setTimeLeft(`${m}:${s}`);
  }, [clearIntervals, navigate]);

  // REFACTORED: Đưa logic `poll` ra ngoài và dùng useCallback.
  const poll = useCallback(async () => {
    if (isSuccessRef.current || getRemainingSeconds() < 0) return;

    const since = localStorage.getItem(KEY_LAST_CHECK);
    const url = `${POLLING_ENDPOINT}?since=${since}`;

    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const { data: recs } = await res.json();

      if (recs && recs.length > 0) {
        // Cập nhật last_check với bản ghi mới nhất
        const lastRecordTimestamp = new Date(
          recs[recs.length - 1]["Ngày diễn ra"].replace(" ", "T")
        ).getTime();
        localStorage.setItem(
          KEY_LAST_CHECK,
          (lastRecordTimestamp + 1).toString()
        ); // +1ms để không lấy lại bản ghi cũ

        for (let i = recs.length - 1; i >= 0; i--) {
          const r = recs[i];
          const paid = parseFloat(r["Giá trị"]);
          const desc = (r["Mô tả"] || "").toLowerCase();
          const dtMs = new Date(r["Ngày diễn ra"].replace(" ", "T")).getTime();
          const elapsed = Date.now() - dtMs;

          if (
            paid >= AMOUNT &&
            desc.includes(orderCode.toLowerCase()) &&
            elapsed <= WAIT_MS
          ) {
            isSuccessRef.current = true;
            setStatusMessage("✅ Thanh toán thành công, đang xử lý...");
            clearDeadline();
            clearIntervals();

            // Giả lập confirm với server và chuyển hướng
            setTimeout(() => {
              navigate(`/payment/success?orderCode=${orderCode}`);
            }, 1500);
            break;
          }
        }
      }
    } catch (e) {
      console.error("Poll error:", e);
      // Không hiển thị lỗi mạng cho người dùng, chỉ log ra
    }
  }, [AMOUNT, orderCode, clearIntervals, navigate]);

  // --- Side Effects using useEffect ---
  // REFACTORED: useEffect giờ chỉ còn nhiệm vụ thiết lập và dọn dẹp intervals.
  useEffect(() => {
    if (!localStorage.getItem(KEY_LAST_CHECK)) {
      localStorage.setItem(KEY_LAST_CHECK, (Date.now() - WAIT_MS).toString());
    }

    // Chạy lần đầu ngay lập tức
    tick();
    poll();

    // Thiết lập intervals
    const timerId = setInterval(tick, 1000);
    const pollId = setInterval(poll, 3000);
    intervalsRef.current = [timerId, pollId];

    // Cleanup function trả về sẽ được gọi khi component unmount
    return () => {
      clearIntervals();
    };
  }, [tick, poll, clearIntervals]); // Phụ thuộc vào các hàm đã được memoize

  const handleCancel = () => {
    clearDeadline();
    clearIntervals();
    navigate("/"); // Chuyển về trang chủ hoặc trang giỏ hàng
  };

  return (
    <div className="transfer-page-container">
      <div className="content">
        <h1 className="inf_title_paycart">Chuyển khoản ngân hàng</h1>
        <p>
          Mã đơn hàng <strong>{orderCode}</strong>
        </p>
        <p>
          Vui lòng chuyển{" "}
          <strong>{new Intl.NumberFormat("vi-VN").format(AMOUNT)} VNĐ</strong>{" "}
          trong <span id="timer">{timeLeft}</span>
        </p>

        <div className="qr-box">
          <img src={qrUrl} alt="QR chuyển khoản" />
        </div>

        <p
          id="status"
          style={{
            color: isSuccessRef.current ? "green" : "red",
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
