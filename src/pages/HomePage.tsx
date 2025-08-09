// src/pages/HomePage.tsx

import React, { useEffect, useState, useRef } from "react";
import "../assets/css/home.css";

// --- Import ảnh (giữ nguyên) ---
import banner3 from "../assets/img/home/banner3.jpg";
import banner1 from "../assets/img/home/banner1.jpg";
import banner2 from "../assets/img/home/banner2.jpg";
import review1 from "../assets/img/home/review1.jpg";
import review2 from "../assets/img/home/review2.jpg";
import review3 from "../assets/img/home/review_3.jpg";
import product1Img from "../assets/img/products/products_1.jpg";
import product2Img from "../assets/img/products/products_2.jpg";
import product3Img from "../assets/img/products/products_3.jpg";
import poster1 from "../assets/img/poster/hinh1.jpg";
import poster2 from "../assets/img/poster/hinh2.jpg";
import poster3 from "../assets/img/poster/hinh3.jpg";
import poster4 from "../assets/img/poster/hinh4.jpg";
import poster5 from "../assets/img/poster/hinh5.jpg";
import aboutImg from "../assets/img/home/about.jpg";
import fashion1Img from "../assets/img/poster/fashion1.jpg";
import fashion2Img from "../assets/img/poster/fashion2.jpg";
import fashion3Img from "../assets/img/poster/fashion3.jpg";
import thienNguyenImg from "../assets/img/poster/thiennguyen2.jpg";

// Giả lập dữ liệu sản phẩm
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
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const HomePage: React.FC = () => {
  const sliderImages = [banner3, banner1, banner2];
  const posterImages = [poster1, poster2, poster3, poster4, poster5];
  const [currentSlide, setCurrentSlide] = useState(0);
  const posterCarouselRef = useRef<HTMLDivElement>(null);

  const handlePrevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length
    );
  const handleNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);

  useEffect(() => {
    const timer = setInterval(handleNextSlide, 4000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const scrollPoster = (direction: "left" | "right") => {
    if (posterCarouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      posterCarouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="content home-page">
      {/* Section 1: Hero Slider */}
      <section className="slider-container">
        <div
          className="slides"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {sliderImages.map((img, index) => (
            <div className="slide" key={index}>
              <img src={img} alt={`Banner ${index + 1}`} />
            </div>
          ))}
        </div>
        <button
          className="arrow left"
          onClick={handlePrevSlide}
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          className="arrow right"
          onClick={handleNextSlide}
          aria-label="Next slide"
        >
          ❯
        </button>
      </section>

      {/* Section 2: Review Categories */}
      <section className="review_home">
        <div
          className="item_review"
          style={{ backgroundImage: `url(${review1})` }}
        >
          <p>PHONG CÁCH NAM</p>
        </div>
        <div
          className="item_review"
          style={{ backgroundImage: `url(${review2})` }}
        >
          <p>PHONG CÁCH NỮ</p>
        </div>
        <div
          className="item_review"
          style={{ backgroundImage: `url(${review3})` }}
        >
          <p>ĐIỂM NHẤN TINH TẾ</p>
        </div>
      </section>

      {/* Section 3: New Products */}
      <section className="products-section">
        <h1 className="section-title">HÀNG MỚI VỀ</h1>
        <div className="products_home">
          {mockProducts.map((prod) => (
            <div key={prod.id} className="item_products_home">
              <a href={`/products/${prod.id}`} className="product-link">
                <div className="image_home_item">
                  <img
                    src={prod.imgURL_1}
                    alt={prod.name}
                    className="image_products_home"
                  />
                </div>
                <h4 className="infProducts_home name">{prod.name}</h4>
                <p className="infProducts_home price-block">
                  {prod.price_sale ? (
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
                    <span className="price-normal">
                      {formatCurrency(prod.price)}
                    </span>
                  )}
                </p>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Poster Carousel */}
      <section className="poster-section">
        <h1 className="section-title">Khám Phá Phong Cách Của Bạn</h1>
        <div className="poster-carousel-wrapper">
          <button
            className="btn-scroll btn-left"
            onClick={() => scrollPoster("left")}
            aria-label="Scroll Left"
          >
            &#10094;
          </button>
          <div className="poster-carousel" ref={posterCarouselRef}>
            {posterImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Poster ${index + 1}`}
                className="image_poster"
              />
            ))}
          </div>
          <button
            className="btn-scroll btn-right"
            onClick={() => scrollPoster("right")}
            aria-label="Scroll Right"
          >
            &#10095;
          </button>
        </div>
      </section>

      {/* Section 5: About Us */}
      <section className="about-us">
        <div className="about-content">
          <h2>Về Chúng Tôi</h2>
          <p>
            Chào mừng bạn đến với <strong>PIXCAM</strong> – nơi phong cách và cá
            tính được tôn vinh. Chúng tôi tin rằng mỗi bộ trang phục là để kể
            câu chuyện riêng của bạn.
          </p>
          <p>
            <strong>PIXCAM</strong> là người bạn đồng hành cùng bạn định hình
            phong cách và khẳng định bản thân mỗi ngày.
          </p>
        </div>
        <div className="about-image">
          <img src={aboutImg} alt="Cửa hàng thời trang PIXCAM" />
        </div>
      </section>

      {/* Section 6: Fashion Inspiration */}
      <section className="fashion-inspiration">
        <h2 className="section-title">Góc Phối Đồ Cá Tính</h2>
        <div className="inspiration-cards">
          <a href="#" className="card">
            <img src={fashion1Img} alt="Look 1" />
            <div className="card-text">
              <h3>For Him — Tối Giản & Mạnh Mẽ</h3>
              <p className="meta-info">Khám phá phong cách nam →</p>
            </div>
          </a>
          <a href="#" className="card">
            <img src={fashion2Img} alt="Look 2" />
            <div className="card-text">
              <h3>For Her — Thanh Lịch & Cá Tính</h3>
              <p className="meta-info">Gu thời trang nữ →</p>
            </div>
          </a>
          <a href="#" className="card">
            <img src={fashion3Img} alt="Look 3" />
            <div className="card-text">
              <h3>Accessories — Điểm Nhấn Đắt Giá</h3>
              <p className="meta-info">Phụ kiện tạo chất →</p>
            </div>
          </a>
        </div>
      </section>

      {/* Section 7: Charity Banner */}
      <section className="charity-banner">
        <div className="charity-text">
          <h2>PIXCAM & Hành Trình Yêu Thương</h2>
          <p>
            <strong>PIXCAM</strong> trích một phần lợi nhuận để đồng hành cùng
            các hoạt động thiện nguyện, hỗ trợ trẻ em khó khăn và các chiến dịch
            vì môi trường.
          </p>
          <p className="highlight">
            ✦ Mua sắm có ý nghĩa — Mặc đẹp và lan tỏa điều tốt đẹp ✦
          </p>
          <a href="#" className="btn-charity">
            Tìm hiểu thêm →
          </a>
        </div>
        <div className="charity-image">
          <img src={thienNguyenImg} alt="Hành trình thiện nguyện" />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
