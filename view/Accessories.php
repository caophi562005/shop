<?php
include 'inc/header.php';
include_once 'helpers/format.php';
$fm = new Format(); // Khởi tạo đối tượng Format
?>
<style>
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 30px;
    flex-wrap: wrap;
}

.pagination a,
.pagination span {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 38px;
    height: 38px;
    font-size: 16px;
    border-radius: 6px;
    text-decoration: none;
    background-color: #2c2c2c;
    color: #ccc;
    transition: all 0.25s ease;
    border: 1px solid #444;
}

.pagination a:hover {
    background-color: #ff6f00;
    color: #fff;
    border-color: #ff6f00;
}

.pagination .active {
    background-color: #ff6f00;
    color: white;
    font-weight: bold;
    border-color: #ff6f00;
}

.pagination .disabled {
    opacity: 0.4;
    pointer-events: none;
    background-color: #1e1e1e;
    border-color: #333;
}
</style>
<main>
    <div class="content">
        <div class="content_top">
            <div class="contentProducts_navigate">
                <div class="navigate_shopAll">
                    <p class="title_navigate">
                        <span class="home_navigate">TRANG CHỦ</span> / DANH MỤC ACCESSORIES
                    </p>
                </div>

                <?php
             include 'inc/showproduct.php';
                ?>
            </div>
        </div>
        <!-- BẮT ĐẦU: PHÂN TRANG -->
        <?php if ($totalPages > 1): ?>

        <div class="pagination">
            <?php
        $baseUrl = 'index.php?controller=accessories&action=index';
        if (isset($_GET['sub_id'])) {
            $baseUrl .= '&sub_id=' . intval($_GET['sub_id']);
        } elseif (isset($_GET['cat_id'])) {
            $baseUrl .= '&cat_id=' . intval($_GET['cat_id']);
        }
        if (!empty($sort)) {
            $baseUrl .= '&sort=' . urlencode($sort);
        }

        $range = 2;

        // Nút Prev
        if ($page > 1) {
            echo '<a href="' . $baseUrl . '&page=' . ($page - 1) . '"><i class="fas fa-angle-left"></i></a>';
        } else {
            echo '<span class="disabled"><i class="fas fa-angle-left"></i></span>';
        }

        // Trang đầu
        if ($page > $range + 2) {
            echo '<a href="' . $baseUrl . '&page=1">1</a>';
            echo '<span class="disabled">...</span>';
        }

        // Các trang giữa
        for ($i = max(1, $page - $range); $i <= min($totalPages, $page + $range); $i++) {
            if ($i == $page) {
                echo '<span class="active">' . $i . '</span>';
            } else {
                echo '<a href="' . $baseUrl . '&page=' . $i . '">' . $i . '</a>';
            }
        }

        // Trang cuối
        if ($page < $totalPages - ($range + 1)) {
            echo '<span class="disabled">...</span>';
            echo '<a href="' . $baseUrl . '&page=' . $totalPages . '">' . $totalPages . '</a>';
        }

        // Nút Next
        if ($page < $totalPages) {
            echo '<a href="' . $baseUrl . '&page=' . ($page + 1) . '"><i class="fas fa-angle-right"></i></a>';
        } else {
            echo '<span class="disabled"><i class="fas fa-angle-right"></i></span>';
        }
    ?>
        </div>
        <?php endif; ?>


        <!-- KẾT THÚC: PHÂN TRANG -->
</main>

<?php
include 'inc/footer.php';
?>