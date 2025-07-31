<?php
  // nếu view được gọi trực tiếp, tránh undefined
  $meRoles     = $meRoles     ?? [];
  $users       = $users       ?? [];
  $rolesMap    = $rolesMap    ?? [];
  $page        = $page        ?? 1;
  $totalPages  = $totalPages  ?? 1;
?>
<?php include 'inc/header.php'; ?>
<link href="view/css/accountlist.css" rel="stylesheet" />
<div class="wrapper">
    <div class="cinema-wrapper">
        <div class="cinema-card">
            <h2>Quản lý tài khoản</h2>


            <?php if (!empty($_SESSION['success'])): ?>
            <div class="toast success"><?= htmlspecialchars($_SESSION['success']) ?></div>
            <?php unset($_SESSION['success']); ?>
            <?php endif; ?>
            <?php if (!empty($_SESSION['error'])): ?>
            <div class="toast error"><?= htmlspecialchars($_SESSION['error']) ?></div>
            <?php unset($_SESSION['error']); ?>
            <?php endif; ?>

            <div class="table-container">
                <table class="cinema-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Roles</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u):
              $rs        = $rolesMap[$u['id']] ?? [];
              $canDelete = in_array('admin', $meRoles) && !in_array('admin', $rs);
          ?>
                        <tr>
                            <td><?= $u['id'] ?></td>
                            <td><?= htmlspecialchars($u['username']) ?></td>
                            <td>
                                <?php foreach ($rs as $r): ?>
                                <span class="badge <?= $r==='admin'?'admin':'user' ?>">
                                    <?= htmlspecialchars($r) ?>
                                </span>
                                <?php endforeach; ?>
                            </td>
                            <td><?= htmlspecialchars($u['email']) ?></td>
                            <td><?= htmlspecialchars($u['phone']) ?></td>
                            <td><?= $u['createAt'] ?></td>
                            <td>
                                <?php if ($canDelete): ?>
                                <a class="cinema-del"
                                    href="index.php?controller=account&action=delete&id=<?= $u['id'] ?>"
                                    onclick="return confirm('Xóa tài khoản #<?= $u['id'] ?>?')">
                                    Xóa
                                </a>
                                <?php else: ?>
                                <span class="na">—</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <?php if ($page > 1): ?>
                <a href="?controller=account&action=index&page=<?= $page-1 ?>" class="page-btn">« Trang trước</a>
                <?php else: ?>
                <span class="page-btn disabled">« Trang trước</span>
                <?php endif; ?>

                <?php for ($p = 1; $p <= $totalPages; $p++): ?>
                <?php if ($p == $page): ?>
                <span class="page-btn current"><?= $p ?></span>
                <?php else: ?>
                <a href="?controller=account&action=index&page=<?= $p ?>" class="page-btn"><?= $p ?></a>
                <?php endif; ?>
                <?php endfor; ?>

                <?php if ($page < $totalPages): ?>
                <a href="?controller=account&action=index&page=<?= $page+1 ?>" class="page-btn">Trang sau »</a>
                <?php else: ?>
                <span class="page-btn disabled">Trang sau »</span>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<script>
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toast').forEach(t => {
        setTimeout(() => t.classList.add('fade'), 2000);
        t.addEventListener('transitionend', () => t.remove());
    });
});
</script>

<?php include 'inc/footer.php'; ?>