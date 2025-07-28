<?php
require_once __DIR__ . '/../models/AccountModel.php';

class AccountController {
    private $model;
    private $meRoles;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['user_id'])) {
            $_SESSION['login_required'] = "Vui lòng đăng nhập trước.";
            header('Location: index.php?controller=login&action=index');
            exit;
        }

        $this->model   = new AccountModel();
        $rawRoles      = $this->model->getRolesByAccount($_SESSION['user_id']);
        $this->meRoles = array_map('strtolower', $rawRoles);
    }

    public function index() {
        if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
        // 1. Phân trang
        $limit      = 10;
        $page       = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
        $page       = max(1, $page);
        $offset     = ($page - 1) * $limit;
        $totalUsers = $this->model->countAllUsers();
        $totalPages = (int)ceil($totalUsers / $limit);

        // 2. Lấy dữ liệu trang hiện tại
        $users = $this->model->getUsers($limit, $offset);

        // 3. Map roles cho mỗi user
        $rolesMap = [];
        foreach ($users as $u) {
            $raw = $this->model->getRolesByAccount($u['id']);
            $rolesMap[$u['id']] = array_map('strtolower', $raw);
        }

        // 4. Truyền xuống view
        $meRoles     = $this->meRoles;
        // $users, $rolesMap có sẵn
        // $page, $totalPages đã tính
        include __DIR__ . '/../view/accountlist.php';
    }

    public function delete() {
        $id          = (int)($_GET['id'] ?? 0);
        $targetRoles = $this->model->getRolesByAccount($id);
        $canDelete   = in_array('admin', $this->meRoles)
                       && !in_array('admin', array_map('strtolower', $targetRoles));

        if ($canDelete) {
            $this->model->delete($id);
            $_SESSION['success'] = 'Xóa thành công.';
        } else {
            $_SESSION['error'] = 'Bạn không có quyền xóa tài khoản này.';
        }

        header('Location: index.php?controller=account&action=index');
        exit;
    }
}