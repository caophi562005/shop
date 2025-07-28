<?php
include 'inc/header.php';
include_once 'helpers/format.php';
$fm = new Format(); // Khởi tạo đối tượng Format
?>


<main>
    <div class="content">
        <div class="content_top">
            <div class="contentProducts_navigate">
                <div class="navigate_shopAll">
                    <p class="title_navigate">
                        <span class="home_navigate">TRANG CHỦ</span> / DANH MỤC NỮ
                    </p>
                </div>

                <?php
             include 'inc/showproduct.php';
                ?>
            </div>
        </div>

</main>

<?php
include 'inc/footer.php';
?>