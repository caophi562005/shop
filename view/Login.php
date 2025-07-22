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

<style>
.social-login {
    text-align: center;
    margin-top: 20px;
}

.social-login p {
    margin-bottom: 10px;
    font-size: 14px;
    color: #888;
}

.social-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.social-buttons a {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.google-btn {
    background-color: #db4437;
}

.google-btn:hover {
    background-color: #c33d30;
}

.facebook-btn {
    background-color: #3b5998;
}

.facebook-btn:hover {
    background-color: #334b84;
}

.social-buttons i {
    font-size: 16px;
}
</style>

<?php include 'inc/footer.php'; ?>