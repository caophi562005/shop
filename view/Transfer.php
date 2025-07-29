<?php
// file: view/Transfer.php
// Đã extract từ controller:
//   $orderCode, $name, $phone, $email, $address, $note,
//   $items, $subtotal, $discount, $finalTotal

$bankId      = 'MB';
$accountNo   = '0336673836';
$accountName = 'Hồ Phát Đạt';
$amount      = $finalTotal;
$template    = 'compact2';
$addInfo     = $orderCode; // đúng chuỗi không dấu '-'

$qrUrl = sprintf(
  'https://img.vietqr.io/image/%s-%s-%s.png?amount=%s&addInfo=%s&accountName=%s',
  $bankId, $accountNo, $template,
  $amount, urlencode($addInfo), urlencode($accountName)
);
?>
<link rel="shortcut icon" href="/PIXCAM/view/img/home/logo.png" />
<title>Thanh Toán - <?= htmlspecialchars($orderCode) ?></title>

<link href="view/css/Transfer.css" rel="stylesheet" />
<div class="content">
    <h1 class="inf_title_paycart">Chuyển khoản ngân hàng</h1>
    <p>Mã đơn hàng <strong><?= htmlspecialchars($orderCode) ?></strong></p>
    <p>Vui lòng chuyển <strong><?= number_format($amount,0,'.',',') ?> VNĐ</strong> trong <span id="timer">--:--</span>
    </p>

    <div class="qr-box">
        <img src="<?= htmlspecialchars($qrUrl) ?>" alt="QR chuyển khoản">
    </div>

    <button id="cancel-btn" class="btn_payOnline">❌ Hủy giao dịch</button>
    <p id="status"></p>
</div>

<script>
const WAIT_MS = 15 * 60 * 1000;
const KEY_DEAD = 'qr_deadline';
const KEY_LAST = 'last_check';
const PRICE = <?= $amount ?>;
const ORDER_CODE = <?= json_encode($orderCode) ?>.toLowerCase();
const ENDPOINT =
    'https://script.google.com/macros/s/AKfycby1HXIjwYi8TqwOIydkuyVVy-kyDH-vvlmqeaRB4XAKgUPOj1YD5yl8zWDKNS7kK_JX/exec';

function getDeadline() {
    let dl = localStorage.getItem(KEY_DEAD);
    if (!dl) {
        dl = Date.now() + WAIT_MS;
        localStorage.setItem(KEY_DEAD, dl);
    }
    return +dl;
}

function clearDeadline() {
    localStorage.removeItem(KEY_DEAD);
    localStorage.removeItem(KEY_LAST);
}

function getRemaining() {
    return Math.floor((getDeadline() - Date.now()) / 1000);
}

// khởi tạo last_check = giờ hiện tại để lần đầu không fetch toàn bộ lịch sử
if (!localStorage.getItem(KEY_LAST)) {
    localStorage.setItem(KEY_LAST, Date.now());
}

const timerEl = document.getElementById('timer'),
    statusEl = document.getElementById('status'),
    cancelBtn = document.getElementById('cancel-btn');
let isSuccess = false;

// đồng hồ
function tick() {
    const sec = getRemaining();
    if (sec <= 0) {
        clearInterval(tmr);
        statusEl.textContent = '⏰ Hết thời gian – thất bại.';
        setTimeout(() => {
            clearDeadline();
            window.location = 'index.php?controller=pay&action=cancelTransfer';
        }, 2000);
        return;
    }
    const m = String(Math.floor(sec / 60)).padStart(2, '0'),
        s = String(sec % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
}
const tmr = setInterval(tick, 1000);
tick();

// polling mỗi 3s
async function poll() {
    if (isSuccess || getRemaining() < 0) return;

    const since = localStorage.getItem(KEY_LAST),
        url = `${ENDPOINT}?since=${since}`;
    try {
        const res = await fetch(url, {
            mode: 'cors'
        });
        if (!res.ok) throw new Error(res.status);
        const {
            data: recs
        } = await res.json();

        // cập nhật last_check về mốc thực của bản ghi cuối
        if (recs.length) {
            const ts = new Date(recs[recs.length - 1]['Ngày diễn ra'].replace(' ', 'T')).getTime();
            localStorage.setItem(KEY_LAST, ts);
        }

        for (let i = recs.length - 1; i >= 0; i--) {
            const r = recs[i],
                paid = parseFloat(r['Giá trị']),
                desc = (r['Mô tả'] || '').toLowerCase(),
                dtMs = new Date(r['Ngày diễn ra'].replace(' ', 'T')).getTime(),
                elapsed = Date.now() - dtMs;

            if (paid >= PRICE &&
                desc.includes(ORDER_CODE) &&
                elapsed <= WAIT_MS
            ) {
                isSuccess = true;
                statusEl.style.color = 'green';
                statusEl.textContent = '✅ Thanh toán thành công, đang xử lý...';
                clearDeadline();
                const save = await fetch('index.php?controller=pay&action=transferConfirm', {
                    method: 'POST'
                });
                const j = await save.json();
                if (j.success) window.location = j.redirect;
                break;
            }
        }
    } catch (e) {
        console.error('Poll error:', e);
        statusEl.textContent = '⚠️ Lỗi kiểm tra thanh toán.';
    }
}
setInterval(poll, 3000);
poll();

cancelBtn.addEventListener('click', e => {
    e.preventDefault();
    clearDeadline();
    window.location = 'index.php?controller=pay&action=cancelTransfer';
});
</script>