<?php
include 'inc/header.php';
include_once 'helpers/format.php';
$fm = new Format();
?>


<main>
    <div class="content">
        <div class="content_top">
            <div class="contentProducts_navigate">
                <div class="navigate_shopAll">
                    <p class="title_navigate">
                        <span class="home_navigate">TRANG CHỦ</span> / SALE
                    </p>
                </div>
                <div class="filter_shopAlll">
                    <?php $total = count($productsArr); ?>
                    <p>Hiển thị 1–<?= $total ?> của <?= $total ?> kết quả</p>

                    <!-- BẮT ĐẦU: Form chọn sort -->
                    <form id="sortForm" method="get" action="index.php">
                        <input type="hidden" name="controller"
                            value="<?= htmlspecialchars($_GET['controller'] ?? 'men') ?>">
                        <input type="hidden" name="action" value="<?= htmlspecialchars($_GET['action'] ?? 'index') ?>">

                        <?php if (isset($_GET['sub_id'])): ?>
                        <input type="hidden" name="sub_id" value="<?= intval($_GET['sub_id']) ?>">
                        <?php elseif (isset($_GET['cat_id'])): ?>
                        <input type="hidden" name="cat_id" value="<?= intval($_GET['cat_id']) ?>">
                        <?php endif; ?>

                        <input type="hidden" name="sort" id="sortInput"
                            value="<?= htmlspecialchars($_GET['sort'] ?? '') ?>">

                        <div class="custom-dropdown" id="customDropdown">
                            <div class="selected" id="selectedText">
                                <?= match ($_GET['sort'] ?? '') {
                'price_asc' => 'Giá: thấp → cao',
                'price_desc' => 'Giá: cao → thấp',
                'latest' => 'Mới nhất',
                default => 'Thứ tự mặc định',
            } ?> &#9662;
                            </div>
                            <ul class="options">
                                <li data-value="">Thứ tự mặc định</li>
                                <li data-value="price_asc">Giá: thấp → cao</li>
                                <li data-value="price_desc">Giá: cao → thấp</li>
                                <li data-value="latest">Mới nhất</li>
                            </ul>
                        </div>
                    </form>


                    <!-- KẾT THÚC: Form sort -->
                </div>
            </div>

            <?php if (empty($productsArr)): ?>
            <p style="text-align:center; padding: 20px;">Chưa có sản phẩm nào.</p>
            <?php else: ?>
            <div class="product_top">
                <?php
                    $perRow = 4;
                    $count = 0;
                    $totalProducts = count($productsArr);
                    foreach ($productsArr as $product):
                        // Mở div.products_home khi bắt đầu một hàng mới
                        if ($count % $perRow === 0):
                    ?>
                <div class="products_home">
                    <?php
                        endif;

                        $count++;
                        $id     = intval($product['id']);
                        $name   = htmlspecialchars($product['name']);
                        $price  = isset($product['price']) ? floatval($product['price']) : 0;
                        $imgURL = !empty($product['imgURL_1'])
                                  ? htmlspecialchars($product['imgURL_1'])
                                  : '/PIXCAM/view/img/default-product.png';

                        // Bây giờ chắc chắn có sale_name nếu đang lấy từ getProductsBySale
                        $saleBadge = isset($product['sale_name']) && !empty($product['sale_name'])
                                     ? htmlspecialchars($product['sale_name'])
                                     : null;

                        $priceDisplay = $fm->formatCurrency($price);
                        if ($saleBadge) {
                            // Nếu bạn muốn tính giá sau khi giảm theo % (giả sử sale_name = "50%")
                            $priceSale = $fm->getDiscountedPriceFormatted($price, $saleBadge);
                        }
                    ?>
                    <div class="item_products_home">
                        <div class="image_home_item">
                            <?php if ($saleBadge): ?>
                            <div class="product_sale">
                                <p class="text_products_sale">-<?= $saleBadge ?></p>
                            </div>
                            <?php endif; ?>
                            <a href="index.php?controller=detailProducts&action=index&id=<?= $id ?>">
                                <img src="<?= $imgURL ?>" alt="<?= htmlspecialchars($name) ?>"
                                    class="image_products_home" />
                            </a>

                        </div>
                        <h4 class="infProducts_home"><?= $name ?></h4>
                        <p class="infProducts_home">
                            <?php if ($saleBadge): ?>
                            <span class="price-original">
                                <?= $priceDisplay ?>
                            </span>
                            &nbsp;
                            <span class="price-sale">
                                <?= $priceSale ?>
                            </span>
                            <?php else: ?>
                            <?= $priceDisplay ?>
                            <?php endif; ?>
                        </p>
                    </div>
                    <?php
                        // Đóng div.products_home khi đủ 4 item hoặc đến cuối mảng
                        if ($count % $perRow === 0 || $count === $totalProducts):
                    ?>
                </div> <!-- hết .products_home -->
                <?php
                        endif;
                    endforeach;
                    ?>
            </div> <!-- hết .product_top -->
            <?php endif; ?>
        </div>
    </div>

</main>

<?php include 'inc/footer.php'; ?>