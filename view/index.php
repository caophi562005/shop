<?php
include 'inc/header.php';
if (isset($_SESSION['login_success'])) {
    $login_message = $_SESSION['login_success'];
    // Xóa session để thông báo chỉ hiển thị 1 lần
    unset($_SESSION['login_success']);
    echo "<script>window.onload = function() { alert('$login_message'); }</script>";
}

if (isset($_SESSION['logout_success'])) {
    $logout_message = $_SESSION['logout_success'];
    // Xóa session để thông báo chỉ hiển thị 1 lần
    unset($_SESSION['logout_success']);
    echo "<script>window.onload = function() { alert('$logout_message'); }</script>";
}

include_once 'helpers/format.php';
$fm = new Format();
?>

<div class="content">
    <div class="slider-container">
        <div class="slides" id="slides">
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/banner3.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/banner1.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/banner2.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout1.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout2.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout4.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout5.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout6.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout7.jpg" />
            </div>
            <div class="slide">
                <img src="/PIXCAM/view/img/Home/layout8.jpg" />
            </div>
        </div>
        <button onclick="prevSlide()" class="arrow left">❮</button>
        <button onclick="nextSlide()" class="arrow right">❯</button>
    </div>


    <div class="review_home">
        <div class="item_review" style="background-image: url('/PIXCAM/view/img/Home/review1.jpg');">
            <p class="text_itemReview">PHONG CÁCH NAM</p>
        </div>
        <div class="item_review" style="background-image: url('/PIXCAM/view/img/Home/review2.jpg');">
            <p class="text_itemReview">PHONG CÁCH NỮ</p>
        </div>
        <div class="item_review" style="background-image: url('/PIXCAM/view/img/Home/review_3.jpg');">
            <p class="text_itemReview">ĐIỂM NHẤN TINH TẾ</p>
        </div>
    </div>

    <!-- Tiêu đề -->
    <h1 class="title_home_product">HÀNG MỚI VỀ</h1>

    <!-- Container dùng lại class *.products_home* (flex wrap) để hiển thị 12 sản phẩm -->
    <div class="products_home">
        <?php if (!empty($products)): ?>
        <?php foreach ($products as $prod): ?>
        <div class="item_products_home">
            <div class="image_home_item">
                <a href="index.php?controller=detailProducts&action=index&id=<?php echo intval($prod['id']); ?>">
                    <img src="<?php echo htmlspecialchars($prod['imgURL_1']); ?>"
                        alt="<?php echo htmlspecialchars($prod['name']); ?>" class="image_products_home" />
                </a>
            </div>
            <h4 class="infProducts_home">
                <?php echo htmlspecialchars($prod['name']); ?>
            </h4>
            <p class="infProducts_home price-block">
                <?php if (!empty($prod['sale_name']) && isset($prod['price_sale'])): ?>
                <!-- Giá gốc gạch ngang -->
                <span class="price-original">
                    <?php echo $fm->formatCurrency($prod['price']); ?>
                </span>
                <!-- Giá sale ngay bên cạnh -->
                <span class="price-sale">
                    <?php echo $fm->formatCurrency($prod['price_sale']); ?>
                </span>
                <!-- Hiển thị luôn phần trăm giảm đúng y nguyên sale_name -->
                <span class="discount-label">
                    -<?php echo htmlspecialchars($prod['sale_name']); ?>
                </span>
                <?php else: ?>
                <span>
                    <?php echo $fm->formatCurrency($prod['price']); ?>
                </span>
                <?php endif; ?>
            </p>


        </div>
        <?php endforeach; ?>
        <?php else: ?>
        <p class="no-products">Chưa có sản phẩm mới</p>
        <?php endif; ?>
    </div>
    <h1 class="title_home_poster">Khám Phá Phong Cách Của Bạn</h1>
    <div class="poster-carousel-wrapper">
        <button class="btn-scroll btn-left" aria-label="Scroll Left">
            &#10094;
        </button>
        <div class="poster-carousel">
            <img src="/PIXCAM/view/img/poster/hinh1.jpg" alt="Image 1" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh2.jpg" alt="Image 2" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh3.jpg" alt="Image 3" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh4.jpg" alt="Image 4" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh5.jpg" alt="Image 5" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh6.jpg" alt="Image 6" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh7.jpg" alt="Image 7" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh8.jpg" alt="Image 8" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh9.jpg" alt="Image 9" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh10.jpg" alt="Image 10" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh11.jpg" alt="Image 11" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh12.jpg" alt="Image 12" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh13.jpg" alt="Image 13" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh14.jpg" alt="Image 14" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh15.jpg" alt="Image 15" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh16.jpg" alt="Image 16" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh17.jpg" alt="Image 17" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh18.jpg" alt="Image 18" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh19.jpg" alt="Image 19" class="image_poster" />
            <img src="/PIXCAM/view/img/poster/hinh20.jpg" alt="Image 20" class="image_poster" />
        </div>

        <button class="btn-scroll btn-right" aria-label="Scroll Right">
            &#10095;
        </button>
    </div>
    <section class="about-us">
        <div class="about-content">
            <h2>Về Chúng Tôi</h2>
            <p>
                Chào mừng bạn đến với <strong>PIXCAM</strong> – cửa hàng thời trang hiện
                đại nơi phong cách và cá tính được tôn vinh. Chúng tôi tin rằng mỗi bộ
                trang phục không chỉ để mặc, mà là để kể câu chuyện riêng của bạn.
            </p>
            <p>
                Với đa dạng phong cách từ năng động, thanh lịch đến cá tính, sản phẩm
                của chúng tôi được chọn lọc kỹ lưỡng nhằm mang lại chất lượng và sự tự
                tin tuyệt đối cho bạn.
            </p>
            <p>
                <strong>PIXCAM</strong> không chỉ là nơi mua sắm, mà còn là người bạn
                đồng hành cùng bạn định hình phong cách và khẳng định bản thân mỗi ngày.
            </p>
        </div>
        <div class="about-image">
            <img src="/PIXCAM/view/img/Home/about.jpg" alt="Cửa hàng thời trang FashionVibe" />
        </div>
    </section>
    <section class="fashion-inspiration">
        <h2 class="section-title">Góc Phối Đồ Cá Tính</h2>
        <div class="scrolling-text-container">
            <p class="scrolling-text">
                ✦ Khám phá thế giới outfit đầy màu sắc, chất riêng và phá cách – phong
                cách là bản sắc, hãy mặc đúng cá tính của bạn! ✦
            </p>
        </div>

        <div class="inspiration-cards">
            <a target="_blank" href="https://www.coolmate.me/post/cac-phong-cach-thoi-trang-nam-808" class="card">
                <img src="/PIXCAM/view/img/poster/fashion1.jpg" alt="Look 1" />
                <div class="card-text">
                    <h3>For Him — Tối Giản & Mạnh Mẽ</h3>
                    <p class="meta-info">Khám phá phong cách nam →</p>
                </div>
            </a>
            <a href="https://www.vfestival.vn/cach-phoi-do-dep-cho-nu-ca-tinh-di-choi-du-lich-dao-pho/" target="_blank"
                class="card">
                <img src="/PIXCAM/view/img/poster/fashion2.jpg" alt="Look 2" />
                <div class="card-text">
                    <h3>For Her — Thanh Lịch & Cá Tính</h3>
                    <p class="meta-info">Gu thời trang nữ →</p>
                </div>
            </a>
            <a href="https://bp-guide.vn/AXtIQX6W" class="card" target="_blank">
                <img src="/PIXCAM/view/img/poster/fashion3.jpg" alt="Look 3" />
                <div class="card-text">
                    <h3>Accessories — Điểm Nhấn Đắt Giá</h3>
                    <p class="meta-info">Phụ kiện tạo chất →</p>
                </div>
            </a>
        </div>
    </section>
    <section class="charity-banner">
        <div class="charity-text">
            <h2>PIXCAM & Hành Trình Lan Tỏa Yêu Thương</h2>
            <p>
                Mỗi chiếc áo bạn chọn không chỉ là một phong cách mà còn là một hành
                động tử tế.
                <strong>PIXCAM</strong> trích một phần lợi nhuận từ đơn hàng để đồng
                hành cùng các hoạt động thiện nguyện: hỗ trợ trẻ em khó khăn, người vô
                gia cư và các chiến dịch vì môi trường.
            </p>
            <p class="highlight">
                ✦ Mua sắm có ý nghĩa — Mặc đẹp và lan tỏa điều tốt đẹp ✦
            </p>
            <div style="text-align: center">
                <a href="https://www.nuoiem.com/" target="_blank" class="btn-charity">Tìm hiểu các hoạt động của
                    chúng
                    tôi →</a>
            </div>
        </div>
        <div class="charity-image">
            <img src="/PIXCAM/view/img/poster/thiennguyen2.jpg" alt="Hành trình thiện nguyện" />
        </div>
    </section>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.getElementById("slides");
    const slideElements = slides.querySelectorAll(".slide");
    const totalSlides = slideElements.length;

    let index = 1;

    // Clone slide đầu và cuối
    const firstClone = slideElements[0].cloneNode(true);
    const lastClone = slideElements[totalSlides - 1].cloneNode(true);
    slides.appendChild(firstClone);
    slides.insertBefore(lastClone, slideElements[0]);

    const allSlides = slides.querySelectorAll(".slide");
    slides.style.display = "flex";
    slides.style.transition = "transform 0.5s ease-in-out";
    slides.style.transform = `translateX(-${index * 100}%)`;

    allSlides.forEach(slide => {
        slide.style.minWidth = "100%";
    });

    function goToSlide(i) {
        index = i;
        slides.style.transition = "transform 0.5s ease-in-out";
        slides.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        if (index >= allSlides.length - 1) return;
        goToSlide(index + 1);
    }

    function prevSlide() {
        if (index <= 0) return;
        goToSlide(index - 1);
    }

    slides.addEventListener("transitionend", () => {
        if (allSlides[index].isSameNode(firstClone)) {
            slides.style.transition = "none";
            index = 1;
            slides.style.transform = `translateX(-${index * 100}%)`;
        }
        if (allSlides[index].isSameNode(lastClone)) {
            slides.style.transition = "none";
            index = allSlides.length - 2;
            slides.style.transform = `translateX(-${index * 100}%)`;
        }
    });

    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;

    setInterval(() => {
        nextSlide();
    }, 5000);
});
</script>

<?php
include 'inc/footer.php';
?>