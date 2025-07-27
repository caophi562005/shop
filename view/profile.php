<?php include 'inc/header.php'; ?>
<link href="view/css/profile.css" rel="stylesheet" />
<div class="wrapper">
    <div class="main-content">
        <div class="profile-card">
            <h2>Hồ sơ của bạn</h2>

            <?php if (!empty($success)): ?>
            <div class="message success"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>
            <?php if (!empty($errors)): ?>
            <div class="message error">
                <?php foreach ($errors as $e): ?>
                <?= htmlspecialchars($e) ?><br>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <form id="profileForm" method="post" action="index.php?controller=profile&action=update">
                <div class="field">
                    <label for="f-username">Username</label>
                    <input id="f-username" type="text" name="username"
                        value="<?= htmlspecialchars($user['username']) ?>" require>
                </div>
                <div class="field">
                    <label for="f-email">Email</label>
                    <input id="f-email" type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>"
                        required>
                </div>
                <div class="field">
                    <label for="f-phone">Phone</label>
                    <input id="f-phone" type="text" name="phone" value="<?= htmlspecialchars($user['phone']) ?>"
                        required>
                </div>

                <hr>
                <br />

                <div class="field">
                    <label for="f-old">Mật khẩu cũ</label>
                    <input id="f-old" type="password" name="old_password" placeholder="Chỉ khi đổi mật khẩu">
                </div>
                <div class="field">
                    <label for="f-new">Mật khẩu mới</label>
                    <input id="f-new" type="password" name="new_password" placeholder="Để trống nếu không đổi">
                </div>

                <button type="submit" class="btn-save">Lưu thay đổi</button>
            </form>

            <a href="index.php?controller=home&action=index" class="back-link">← Quay về trang chủ</a>
        </div>
    </div>
</div>

<script>
window.addEventListener('DOMContentLoaded', () => {
    // Ẩn thông báo sau 2.5s
    document.querySelectorAll('.message').forEach(el => {
        setTimeout(() => {
            el.style.opacity = 0;
            setTimeout(() => el.remove(), 500);
        }, 2500);
    });

    // JS validation tương tự
    const form = document.getElementById('profileForm');
    const init = {
        u: document.getElementById('f-username').value,
        e: document.getElementById('f-email').value,
        p: document.getElementById('f-phone').value
    };

    form.addEventListener('submit', evt => {
        const u = form.username.value.trim(),
            e = form.email.value.trim(),
            p = form.phone.value.trim(),
            oldP = form.old_password.value,
            newP = form.new_password.value;

        if (u === init.u && e === init.e && p === init.p && !oldP && !newP) {
            evt.preventDefault();
            showMsg('Bạn chưa thay đổi thông tin nào.', 'error');
            return;
        }
        if ((oldP && !newP) || (!oldP && newP)) {
            evt.preventDefault();
            showMsg('Bạn phải nhập cả mật khẩu cũ và mới.', 'error');
        }
    });

    function showMsg(txt, type) {
        const d = document.createElement('div');
        d.className = `message ${type}`;
        d.textContent = txt;
        const card = document.querySelector('.profile-card');
        card.insertBefore(d, form);
        setTimeout(() => {
            d.style.opacity = 0;
            setTimeout(() => d.remove(), 500);
        }, 2500);
    }
});
</script>

<?php include 'inc/footer.php'; ?>