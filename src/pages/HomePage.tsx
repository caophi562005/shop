import React from "react";
import "../assets/css/home.css";

import banner3 from "../assets/img/home/banner3.jpg";
import banner1 from "../assets/img/home/banner1.jpg";
import banner2 from "../assets/img/home/banner2.jpg";
import layout1 from "../assets/img/home/layout1.jpg";
import layout2 from "../assets/img/home/layout2.jpg";
import layout4 from "../assets/img/home/layout4.jpg";
import layout5 from "../assets/img/home/layout5.jpg";
import layout6 from "../assets/img/home/layout6.jpg";
import layout7 from "../assets/img/home/layout7.jpg";
import layout8 from "../assets/img/home/layout8.jpg";

// --- Ảnh cho Review Home ---
import review1 from "../assets/img/home/review1.jpg";
import review2 from "../assets/img/home/review2.jpg";
import review3 from "../assets/img/home/review_3.jpg";

// --- Ảnh cho sản phẩm mẫu ---
import product1Img from "../assets/img/products/products_1.jpg";
import product2Img from "../assets/img/products/products_2.jpg";
import product3Img from "../assets/img/products/products_3.jpg";

// --- Ảnh cho Poster Carousel ---
import poster1 from "../assets/img/poster/hinh1.jpg";
import poster2 from "../assets/img/poster/hinh2.jpg";
import poster3 from "../assets/img/poster/hinh3.jpg";
import poster4 from "../assets/img/poster/hinh4.jpg";
import poster5 from "../assets/img/poster/hinh5.jpg";
// (bạn có thể import thêm các ảnh poster khác nếu cần)

// --- Ảnh cho các section khác ---
import aboutImg from "../assets/img/home/about.jpg";
import fashion1Img from "../assets/img/poster/fashion1.jpg";
import fashion2Img from "../assets/img/poster/fashion2.jpg";
import fashion3Img from "../assets/img/poster/fashion3.jpg";
import thienNguyenImg from "../assets/img/poster/thiennguyen2.jpg";

// Giả lập dữ liệu sản phẩm. Sau này, bạn sẽ lấy dữ liệu này từ API.
const mockProducts = [
  {
    id: 1,
    name: "Áo Sơ Mi Nam Tay Dài",
    imgURL_1: product1Img,
    price: 550000,
    price_sale: 450000,
    sale_name: "20%",
  },
  {
    id: 2,
    name: "Quần Jeans Nữ Skinny",
    imgURL_1: product2Img,
    price: 750000,
    price_sale: null,
    sale_name: null,
  },
  {
    id: 3,
    name: "Váy Hoa Mùa Hè",
    imgURL_1: product3Img,
    price: 890000,
    price_sale: 690000,
    sale_name: "22%",
  },
  // Thêm các sản phẩm khác nếu cần
];

// Hàm format tiền tệ (tương đương với $fm->formatCurrency)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const HomePage: React.FC = () => {
  // GHI CHÚ: Logic cho slider và poster carousel cần được triển khai bằng React Hooks (useState, useEffect)
  // thay vì mã JavaScript cũ đã bị xóa.

  return (
    <>
      {/* <Header /> */} {/* Bỏ comment khi bạn đã tạo component Header */}
      <div className="content">
        <div className="slider-container">
          {/* GHI CHÚ: Slider này cần được làm lại bằng thư viện React (vd: Swiper.js) hoặc custom hook */}
          <div className="slides" id="slides">
            <div className="slide">
              <img src={banner3} alt="Banner 3" />
            </div>
            <div className="slide">
              <img src={banner1} alt="Banner 1" />
            </div>
            <div className="slide">
              <img src={banner2} alt="Banner 2" />
            </div>
            <div className="slide">
              <img src={layout1} alt="Layout 1" />
            </div>
            <div className="slide">
              <img src={layout2} alt="Layout 2" />
            </div>
            <div className="slide">
              <img src={layout4} alt="Layout 4" />
            </div>
            <div className="slide">
              <img src={layout5} alt="Layout 5" />
            </div>
            <div className="slide">
              <img src={layout6} alt="Layout 6" />
            </div>
            <div className="slide">
              <img src={layout7} alt="Layout 7" />
            </div>
            <div className="slide">
              <img src={layout8} alt="Layout 8" />
            </div>
          </div>
          <button className="arrow left">❮</button>
          <button className="arrow right">❯</button>
        </div>

        <div className="review_home">
          <div
            className="item_review"
            style={{ backgroundImage: `url(${review1})` }}
          >
            <p className="text_itemReview">PHONG CÁCH NAM</p>
          </div>
          <div
            className="item_review"
            style={{ backgroundImage: `url(${review2})` }}
          >
            <p className="text_itemReview">PHONG CÁCH NỮ</p>
          </div>
          <div
            className="item_review"
            style={{ backgroundImage: `url(${review3})` }}
          >
            <p className="text_itemReview">ĐIỂM NHẤN TINH TẾ</p>
          </div>
        </div>

        <h1 className="title_home_product">HÀNG MỚI VỀ</h1>

        <div className="products_home">
          {mockProducts.length > 0 ? (
            mockProducts.map((prod) => (
              <div key={prod.id} className="item_products_home">
                <div className="image_home_item">
                  <a href={`/products/${prod.id}`}>
                    {" "}
                    {/* Thay đổi URL cho phù hợp với routing của React */}
                    <img
                      src={prod.imgURL_1}
                      alt={prod.name}
                      className="image_products_home"
                    />
                  </a>
                </div>
                <h4 className="infProducts_home">{prod.name}</h4>
                <p className="infProducts_home price-block">
                  {prod.price_sale && prod.sale_name ? (
                    <>
                      <span className="price-original">
                        {formatCurrency(prod.price)}
                      </span>
                      <span className="price-sale">
                        {formatCurrency(prod.price_sale)}
                      </span>
                      <span className="discount-label">-{prod.sale_name}</span>
                    </>
                  ) : (
                    <span>{formatCurrency(prod.price)}</span>
                  )}
                </p>
              </div>
            ))
          ) : (
            <p className="no-products">Chưa có sản phẩm mới</p>
          )}
        </div>

        <h1 className="title_home_poster">Khám Phá Phong Cách Của Bạn</h1>
        <div className="poster-carousel-wrapper">
          <button className="btn-scroll btn-left" aria-label="Scroll Left">
            &#10094;
          </button>
          <div className="poster-carousel">
            {/* Bạn có thể map qua một mảng ảnh tương tự như sản phẩm */}
            <img src={poster1} alt="Image 1" className="image_poster" />
            <img src={poster2} alt="Image 2" className="image_poster" />
            <img src={poster3} alt="Image 3" className="image_poster" />
            <img src={poster4} alt="Image 4" className="image_poster" />
            <img src={poster5} alt="Image 5" className="image_poster" />
            {/* ... thêm các ảnh còn lại */}
          </div>
          <button className="btn-scroll btn-right" aria-label="Scroll Right">
            &#10095;
          </button>
        </div>

        <section className="about-us">
          <div className="about-content">
            <h2>Về Chúng Tôi</h2>
            <p>
              Chào mừng bạn đến với <strong>PIXCAM</strong> – cửa hàng thời
              trang hiện đại nơi phong cách và cá tính được tôn vinh. Chúng tôi
              tin rằng mỗi bộ trang phục không chỉ để mặc, mà là để kể câu
              chuyện riêng của bạn.
            </p>
            <p>
              Với đa dạng phong cách từ năng động, thanh lịch đến cá tính, sản
              phẩm của chúng tôi được chọn lọc kỹ lưỡng nhằm mang lại chất lượng
              và sự tự tin tuyệt đối cho bạn.
            </p>
            <p>
              <strong>PIXCAM</strong> không chỉ là nơi mua sắm, mà còn là người
              bạn đồng hành cùng bạn định hình phong cách và khẳng định bản thân
              mỗi ngày.
            </p>
          </div>
          <div className="about-image">
            <img src={aboutImg} alt="Cửa hàng thời trang FashionVibe" />
          </div>
        </section>

        <section className="fashion-inspiration">
          <h2 className="section-title">Góc Phối Đồ Cá Tính</h2>
          <div className="scrolling-text-container">
            <p className="scrolling-text">
              ✦ Khám phá thế giới outfit đầy màu sắc, chất riêng và phá cách –
              phong cách là bản sắc, hãy mặc đúng cá tính của bạn! ✦
            </p>
          </div>
          <div className="inspiration-cards">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.coolmate.me/post/cac-phong-cach-thoi-trang-nam-808"
              className="card"
            >
              <img src={fashion1Img} alt="Look 1" />
              <div className="card-text">
                <h3>For Him — Tối Giản & Mạnh Mẽ</h3>
                <p className="meta-info">Khám phá phong cách nam →</p>
              </div>
            </a>
            <a
              href="https://www.vfestival.vn/cach-phoi-do-dep-cho-nu-ca-tinh-di-choi-du-lich-dao-pho/"
              target="_blank"
              rel="noopener noreferrer"
              className="card"
            >
              <img src={fashion2Img} alt="Look 2" />
              <div className="card-text">
                <h3>For Her — Thanh Lịch & Cá Tính</h3>
                <p className="meta-info">Gu thời trang nữ →</p>
              </div>
            </a>
            <a
              href="https://bp-guide.vn/AXtIQX6W"
              className="card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={fashion3Img} alt="Look 3" />
              <div className="card-text">
                <h3>Accessories — Điểm Nhấn Đắt Giá</h3>
                <p className="meta-info">Phụ kiện tạo chất →</p>
              </div>
            </a>
          </div>
        </section>

        <section className="charity-banner">
          <div className="charity-text">
            <h2>PIXCAM & Hành Trình Lan Tỏa Yêu Thương</h2>
            <p>
              Mỗi chiếc áo bạn chọn không chỉ là một phong cách mà còn là một
              hành động tử tế.
              <strong>PIXCAM</strong> trích một phần lợi nhuận từ đơn hàng để
              đồng hành cùng các hoạt động thiện nguyện: hỗ trợ trẻ em khó khăn,
              người vô gia cư và các chiến dịch vì môi trường.
            </p>
            <p className="highlight">
              ✦ Mua sắm có ý nghĩa — Mặc đẹp và lan tỏa điều tốt đẹp ✦
            </p>
            <div style={{ textAlign: "center" }}>
              <a
                href="https://www.nuoiem.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-charity"
              >
                Tìm hiểu các hoạt động của chúng tôi →
              </a>
            </div>
          </div>
          <div className="charity-image">
            <img src={thienNguyenImg} alt="Hành trình thiện nguyện" />
          </div>
        </section>
      </div>
      {/* <Footer /> */} {/* Bỏ comment khi bạn đã tạo component Footer */}
    </>
  );
};

export default HomePage;
