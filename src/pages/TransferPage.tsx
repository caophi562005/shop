import React, { useState, useEffect, useRef } from "react";

import "../assets/css/Transfer.css";

// --- FAKE DATA (replaces data extracted from PHP controller) ---
const mockOrderData = {
  orderCode: "PX20250801",
  name: "Nguyễn Văn An",
  phone: "0987654321",
  email: "nguyenvanan@email.com",
  address: "123 Đường ABC, Q.1, TP.HCM",
  note: "Giao hàng giờ hành chính",
  items: [], // Assuming this would be an array of products
  subtotal: 1500000,
  discount: 0,
  finalTotal: 1500000,
};
// --- END OF FAKE DATA ---

const TransferPage: React.FC = () => {
  // --- Constants and Configuration ---
  const { orderCode, finalTotal } = mockOrderData;

  const BANK_ID = "MB";
  const ACCOUNT_NO = "0336673836";
  const ACCOUNT_NAME = "Hồ Phát Đạt";
  const TEMPLATE = "compact2";
  const AMOUNT = finalTotal;
  const ADD_INFO = orderCode;

  const WAIT_MS = 15 * 60 * 1000; // 15 minutes
  const KEY_DEADLINE = "qr_deadline";
  const KEY_LAST_CHECK = "last_check";
  const POLLING_ENDPOINT =
    "https://script.google.com/macros/s/AKfycby1HXIjwYi8TqwOIydkuyVVy-kyDH-vvlmqeaRB4XAKgUPOj1YD5yl8zWDKNS7kK_JX/exec";

  // Construct the QR Code URL
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${encodeURIComponent(
    ADD_INFO
  )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // --- State and Refs ---
  const [timeLeft, setTimeLeft] = useState("--:--");
  const [statusMessage, setStatusMessage] = useState("");

  // Use refs for values that change but don't need to trigger a re-render
  const isSuccessRef = useRef(false);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  // --- Helper Functions ---
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

  // --- Event Handlers ---
  const handleCancel = () => {
    clearDeadline();
    // In a real React app, you would use React Router's navigate function
    window.location.href = "/";
  };

  // --- Side Effects using useEffect ---
  useEffect(() => {
    // Initialize last_check if it doesn't exist
    if (!localStorage.getItem(KEY_LAST_CHECK)) {
      localStorage.setItem(KEY_LAST_CHECK, Date.now().toString());
    }

    // Countdown Timer Logic
    const tick = () => {
      const seconds = getRemainingSeconds();
      if (seconds <= 0) {
        clearIntervals();
        setStatusMessage("⏰ Hết thời gian – thất bại.");
        setTimeout(() => {
          clearDeadline();
          window.location.href =
            "index.php?controller=pay&action=cancelTransfer";
        }, 2000);
        return;
      }
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setTimeLeft(`${m}:${s}`);
    };

    // Payment Polling Logic
    const poll = async () => {
      if (isSuccessRef.current || getRemainingSeconds() < 0) return;

      const since = localStorage.getItem(KEY_LAST_CHECK);
      const url = `${POLLING_ENDPOINT}?since=${since}`;

      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const { data: recs } = await res.json();

        if (recs.length > 0) {
          const lastRecordTimestamp = new Date(
            recs[recs.length - 1]["Ngày diễn ra"].replace(" ", "T")
          ).getTime();
          localStorage.setItem(KEY_LAST_CHECK, lastRecordTimestamp.toString());
        }

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

            // Confirm payment with the server
            const saveRes = await fetch(
              "index.php?controller=pay&action=transferConfirm",
              { method: "POST" }
            );
            const saveData = await saveRes.json();
            if (saveData.success) {
              window.location.href = saveData.redirect;
            }
            break;
          }
        }
      } catch (e) {
        console.error("Poll error:", e);
        setStatusMessage("⚠️ Lỗi kiểm tra thanh toán.");
      }
    };

    // Start intervals
    tick(); // Initial call
    poll(); // Initial call
    const timerId = setInterval(tick, 1000);
    const pollId = setInterval(poll, 3000);
    intervalsRef.current = [timerId, pollId];

    // Cleanup function to clear intervals when the component unmounts
    const clearIntervals = () => {
      intervalsRef.current.forEach(clearInterval);
    };

    return clearIntervals;
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
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

      <button id="cancel-btn" className="btn_payOnline" onClick={handleCancel}>
        ❌ Hủy giao dịch
      </button>
      <p id="status" style={{ color: isSuccessRef.current ? "green" : "red" }}>
        {statusMessage}
      </p>
    </div>
  );
};

export default TransferPage;
