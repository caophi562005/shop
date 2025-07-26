<?php include 'inc/header.php'; ?>
<link href="view/css/accesPay.css" rel="stylesheet" />
<div class="wrapper">
    <div class="order-success-wrapper">
        <h1>Thông báo đơn hàng đã đặt thành công!</h1>

        <div class="thank-you-message">
            <p>Cảm ơn bạn đã mua sắm tại <strong>PIXCAM</strong>!</p>
            <p class="additional-message">Đơn hàng của bạn đã được xác nhận và chúng tôi sẽ xử lý ngay lập tức.</p>
        </div>

        <div class="customer-info-wrapper">
            <h2>Thông tin khách hàng</h2>
            <?php if (isset($paymentInfo) && is_array($paymentInfo)): ?>
            <div class="info-item">
                <span class="info-label">Họ và tên:</span>
                <span class="info-value"><?= htmlspecialchars($paymentInfo['name'] ?? '') ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value"><?= htmlspecialchars($paymentInfo['address'] ?? '') ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Số điện thoại:</span>
                <span class="info-value"><?= htmlspecialchars($paymentInfo['phone'] ?? '') ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value"><?= htmlspecialchars($paymentInfo['Email'] ?? '') ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value"><?= htmlspecialchars($paymentInfo['note'] ?? '') ?></span>
            </div>
            <?php endif; ?>
        </div>

        <div class="order-details">
            <h2>Chi tiết đơn hàng</h2>
            <?php if (!empty($orderDetails)): ?>
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
                    <?php foreach ($orderDetails as $item): ?>
                    <tr>
                        <td><?= htmlspecialchars($item['productName']) ?></td>
                        <td><?= number_format($item['price'],0,'.',',') ?> VNĐ</td>
                        <td><?= intval($item['quantity']) ?></td>
                        <td><?= number_format($item['total'],0,'.',',') ?> VNĐ</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>

        <div class="order-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div class="summary-item">
                <span>Tạm tính:</span>
                <span><?= number_format($paymentInfo['total'] ?? 0,0,'.',',') ?> VNĐ</span>
            </div>
            <div class="summary-item">
                <span>Giảm giá:</span>
                <span>-<?= number_format($paymentInfo['discount_amount'] ?? 0,0,'.',',') ?> VNĐ</span>
            </div>
            <div class="summary-item total">
                <span>Tổng cộng:</span>
                <span><?= number_format($paymentInfo['finalTotal'] ?? 0,0,'.',',') ?> VNĐ</span>
            </div>
        </div>

        <div class="return-home">
            <button onclick="window.location.href='index.php'">Quay lại trang chủ</button>
        </div>
    </div>
</div>
<?php include 'inc/footer.php'; ?>