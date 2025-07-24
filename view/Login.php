<?php 
include 'inc/header.php'; 
?>

<link href="view/css/login.css" rel="stylesheet" />

<div class="login-wrapper">
    <div class="login-box">
        <h2>Đăng nhập</h2>

        <form action="index.php?controller=login&action=handleLogin" method="POST">
            <input type="text" name="username" placeholder="Tên đăng nhập" required
                value="<?= htmlspecialchars($old_username ?? '') ?>" />
            <input type="password" name="password" placeholder="Mật khẩu" required />

            <!-- Vùng hiển thị thông báo lỗi -->
            <div class="error-placeholder">
                <?php if (!empty($login_error)): ?>
                <span class="error-message"><?php echo $login_error; ?></span>
                <?php endif; ?>
            </div>

            <button type="submit">Đăng nhập</button>

            <!-- Liên kết Quên mật khẩu -->
            <div class="forgot-password">
                <a href="index.php?controller=login&action=forgotPassword">Quên mật khẩu?</a>
            </div>
        </form>

        <!-- Hoặc đăng nhập bằng -->
        <div class="social-login">
            <p>Hoặc đăng nhập bằng</p>
            <div class="social-buttons">
                <a href="#" class="google-btn"><i class="fab fa-google"></i> Google</a>
                <a href="#" class="facebook-btn"><i class="fab fa-facebook-f"></i> Facebook</a>
            </div>
        </div>

        <div class="register-link">
            Chưa có tài khoản? <a href="index.php?controller=register&action=index">Đăng ký</a>
        </div>
    </div>
</div>

<?php include 'inc/footer.php'; ?>