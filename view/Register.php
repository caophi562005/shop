<?php 
// register.php
include 'inc/header.php'; 
?>

<!-- Link CSS chung -->
<link href="view/css/Register2.css" rel="stylesheet" />

<div class="register-wrapper">
    <div class="register-box">
        <h2>Đăng ký</h2>

        <form action="index.php?controller=register&action=handleRegister" method="POST">
            <!-- Username -->
            <input type="text" id="username" name="username" placeholder="Tên đăng nhập" required />
            <small id="usernameError" class="usernameError"></small>

            <!-- Email -->
            <input type="email" name="email" placeholder="Email" required />

            <!-- Phone -->
            <input type="text" name="phone" placeholder="Số điện thoại" required />

            <!-- OTP Group -->
            <div class="otp-group">
                <input type="text" name="otp" class="otp-input" placeholder="Mã OTP" maxlength="6" required />
                <button type="button" class="otp-btn">Gửi OTP</button>
            </div>

            <!-- Password -->
            <input type="password" name="password" placeholder="Mật khẩu" required />

            <!-- Confirm Password -->
            <input type="password" id="cf_pw" name="confirm_password" placeholder="Nhập lại mật khẩu" required />

            <!-- Hiển thị lỗi chung -->
            <div class="error-placeholder">
                <?php if (!empty($register_error)): ?>
                <span class="error-message"><?= htmlspecialchars($register_error) ?></span>
                <?php endif; ?>
            </div>

            <!-- Submit -->
            <button type="submit" class="submit-btn">Đăng ký</button>
        </form>

        <div class="login-link">
            Đã có tài khoản? <a href="index.php?controller=login&action=index">Đăng nhập</a>
        </div>
    </div>
</div>

<!-- JS -->
<script>
// Validate username
document.getElementById('username').addEventListener('input', function() {
    const regex = /^[A-Za-z0-9]{0,20}$/;
    const errorField = document.getElementById('usernameError');
    if (!regex.test(this.value)) {
        errorField.textContent = "Chỉ chữ không dấu & số, tối đa 20 ký tự.";
        this.style.borderColor = '#dc3545';
    } else {
        errorField.textContent = "";
        this.style.borderColor = "#ccc";
    }
});

// Gửi OTP placeholder
document.querySelector('.otp-btn').addEventListener('click', function() {
    alert('Đã gửi mã OTP đến số điện thoại của bạn!');
});
</script>




<?php include 'inc/footer.php'; ?>