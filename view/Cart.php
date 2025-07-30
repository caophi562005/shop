<?php include 'inc/header.php'; ?>

<link href="view/css/Cart2.css" rel="stylesheet" />

<div class="content">
    <div class="cart-wrapper">
        <?php if (!empty($cartItems)): ?>
        <div class="cart-left">
            <div class="title-btn">
                <h2>Giỏ hàng của bạn</h2>
                <button id="btn-open-coupon" class="btn-coupon">Chọn mã giảm giá</button>
            </div>
            <div class="cart-items">
                <table class="table_cart">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Tạm tính</th>
                            <th></th>
                        </tr>
                    </thead>
                    <!-- Thông tin sản phẩm -->
                    <tbody>
                        <?php foreach ($cartItems as $item): ?>
                        <tr data-item-id="<?= $item['id'] ?>">
                            <td class="cart-product">
                                <img src="<?= preg_match('#^(?:/PIXCAM/|https?://)#', $item['imgURL']) ? $item['imgURL'] : '/PIXCAM/' . ltrim($item['imgURL'], '/') ?>"
                                    class="cart-thumb" alt="">
                                <span class="cart-name"><?= htmlspecialchars($item['product_name']) ?></span>
                            </td>
                            <td><?= number_format($item['price'], 0, '.', ',') ?> VNĐ
                            </td>
                            <td>
                                <form action="index.php?controller=cart&action=update" method="post" class="qty-form">
                                    <button name="change_qty" value="minus-<?= $item['id'] ?>" type="submit">−</button>
                                    <span><?= intval($item['quantity']) ?></span>
                                    <button name="change_qty" value="plus-<?= $item['id'] ?>" type="submit">+</button>
                                </form>
                            </td>
                            <td><?= number_format($item['total'],0,'.',',') ?> VNĐ</td>
                            <td>
                                <form action="index.php?controller=cart&action=delete&id=<?= $item['id'] ?>"
                                    method="post">
                                    <button type="submit" class="btn-delete">Xóa</button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <!-- Tổng tiền -->
        <div class="cart-right">
            <h3>Tổng giỏ hàng</h3>
            <div class="summary-line">
                <span>Tạm tính</span>
                <span id="sum-subtotal"><?= number_format($subTotal, 0, '.', ',') ?> VNĐ
                </span>
            </div>

            <?php if (!empty($discount) && $discount > 0): ?>
            <div class="summary-line" style="align-items:center;white-space: nowrap;">
                <span>Giảm (<?= intval($coupon['percent']) ?>%)</span>
                <span style="display:flex; align-items:center;">
                    <span style="margin-left:4px;">−</span>
                    <?= number_format($discount, 0, '.', ',') ?> VNĐ

                    <button type="button" id="btn-remove-coupon"
                        style="margin-left:8px; background:none; border:none; font-size:1.2rem; cursor:pointer;"
                        title="Xóa mã">&times;</button>
                </span>
            </div>
            <?php endif; ?>

            <div class="summary-line total">
                <span>Tổng cộng</span>
                <span id="sum-grand"><?= number_format($grand,0,'.',',') ?> VNĐ
                </span>
            </div>
            <a href="index.php?controller=pay&action=index" class="btn-payment">Tiến hành thanh toán</a>
        </div>
        <?php else: ?>
        <p>Giỏ hàng của bạn đang trống.</p>
        <?php endif; ?>
    </div>
</div>

<!-- Modal -->
<div id="coupon-modal-overlay" class="modal-overlay"></div>
<div id="coupon-modal" class="modal">
    <div class="modal-header">
        <h3>Chọn Mã Giảm Giá</h3>
        <button id="coupon-modal-close" class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
        <table class="modal-table" id="coupon-table">
            <thead>
                <tr>
                    <th>CODE</th>
                    <th>%</th>
                    <th>Đơn tối thiểu</th>
                    <th>Hạn</th>
                    <th>Chọn</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="5" class="text-center text-muted">Đang tải...</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<?php include 'inc/footer.php'; ?>
<script>
document.addEventListener('DOMContentLoaded', () => {
    //modal mã giảm giá
    const btnOpenCoupon = document.getElementById('btn-open-coupon');
    const overlay = document.getElementById('coupon-modal-overlay');
    const modalCoupon = document.getElementById('coupon-modal');
    const btnCloseCoupon = document.getElementById('coupon-modal-close');

    btnOpenCoupon.addEventListener('click', () => {
        overlay.style.display = 'block';
        modalCoupon.style.display = 'block';
        // load list coupon
        fetch('index.php?controller=CouponAdmin&action=getValidAjax')
            .then(r => r.json())
            .then(list => {
                const body = document.querySelector('#coupon-table tbody');
                if (!list.length) {
                    body.innerHTML =
                        '<tr><td colspan="5" class="text-center text-muted">Không có coupon</td></tr>';
                } else {
                    body.innerHTML = list.map(c => `
            <tr>
              <td>${c.code}</td><td>${c.percent}%</td>
              <td>${new Intl.NumberFormat('vi-VN').format(c.min_order)} VNĐ</td>
              <td>${c.expiration
                ? new Date(c.expiration).toLocaleString('vi-VN')
                : 'Không giới hạn'}</td>
              <td><button class="btn-select" data-code="${c.code}">Chọn</button></td>
            </tr>
          `).join('');
                    document.querySelectorAll('.btn-select').forEach(b =>
                        b.addEventListener('click', () => {
                            fetch('index.php?controller=cart&action=applyCoupon', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'X-Requested-With': 'XMLHttpRequest'
                                    },
                                    body: `code=${encodeURIComponent(b.dataset.code)}`
                                })
                                .then(r => r.json())
                                .then(js => js.success ? window.location.reload() : alert(js
                                    .message));
                        })
                    );
                }
            });
    });

    [btnCloseCoupon, overlay].forEach(el =>
        el.addEventListener('click', () => {
            overlay.style.display = 'none';
            modalCoupon.style.display = 'none';
        })
    );

    //ajax cập nhật giỏ hàng
    function ajaxFetch(url, options) {
        return fetch(url, Object.assign({
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }, options))
            .then(r => r.json());
    }

    //Cập nhật số lượng
    document.querySelectorAll('.qty-form button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const formData = new URLSearchParams({
                change_qty: btn.value
            });
            ajaxFetch('index.php?controller=cart&action=update', {
                method: 'POST',
                body: formData
            }).then(data => {
                if (!data.success) return alert('Cập nhật thất bại');
                const row = document.querySelector(`tr[data-item-id="${data.itemId}"]`);
                row.querySelector('.qty-form span').textContent = data.newQty;
                row.querySelector('td:nth-child(4)').textContent =
                    new Intl.NumberFormat('vi-VN').format(data.itemTotal) + ' VNĐ';
                document.getElementById('sum-subtotal').textContent =
                    new Intl.NumberFormat('vi-VN').format(data.subTotal) + ' VNĐ';
                document.getElementById('sum-grand').textContent =
                    new Intl.NumberFormat('vi-VN').format(data.grandTotal) + ' VNĐ';
            });
        });
    });

    //xóa item
    document.querySelectorAll('form[action*="cart&action=delete"] button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const form = btn.closest('form');
            ajaxFetch(form.action, {
                    method: form.method || 'POST'
                })
                .then(data => {
                    if (!data.success) return alert('Xóa thất bại');
                    const row = document.querySelector(
                        `tr[data-item-id="${data.deletedId}"]`);
                    if (row) row.remove();
                    document.getElementById('sum-subtotal').textContent =
                        new Intl.NumberFormat('vi-VN').format(data.subTotal) + ' VNĐ';
                    document.getElementById('sum-grand').textContent =
                        new Intl.NumberFormat('vi-VN').format(data.grandTotal) + ' VNĐ';
                    if (data.subTotal == 0) {
                        document.querySelector('.cart-left').innerHTML =
                            '<p>Giỏ hàng của bạn đang trống.</p>';
                    }
                });
        });
    });

    //gỡ mã giảm giá
    const btnRemoveCoupon = document.getElementById('btn-remove-coupon');
    if (btnRemoveCoupon) {
        btnRemoveCoupon.addEventListener('click', () => {
            ajaxFetch('index.php?controller=cart&action=removeCoupon', {
                    method: 'POST'
                })
                .then(js => js.success ?
                    window.location.reload() :
                    alert('Không thể xóa coupon'));
        });
    }
});
</script>