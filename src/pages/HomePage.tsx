// src/pages/HomePage.tsx

import React, { useEffect, useState } from "react";
import "../assets/css/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { productApi } from "../api/productApi";
import type { Product } from "../api/productApi";

// --- Import ảnh (giữ nguyên) ---
import banner3 from "../assets/img/home/banner3.jpg";
import banner1 from "../assets/img/home/banner1.jpg";
import banner2 from "../assets/img/home/banner2.jpg";
import review1 from "../assets/img/home/review1.jpg";
import review2 from "../assets/img/home/review2.jpg";
import review3 from "../assets/img/home/review_3.jpg";
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const HomePage: React.FC = () => {
  const sliderImages = [banner3, banner1, banner2];
  const posterImages = [poster1, poster2, poster3, poster4, poster5];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch newest products
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getNewProducts(10);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  const posterSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const productSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <main className="content home-page">
      {/* Section 1: Hero Slider with Carousel */}
      <section className="slider-container">
        <Slider {...sliderSettings}>
          {sliderImages.map((img, index) => (
            <div key={index} className="slide">
              <img src={img} alt={`Banner ${index + 1}`} />
            </div>
          ))}
        </Slider>
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

      {/* Section 3: New Products with Carousel */}
      <section className="products-section">
        <h1 className="section-title">HÀNG MỚI VỀ</h1>
        {loading ? (
          <div className="loading-container">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="products-carousel-wrapper">
            <Slider {...productSettings}>
              {products.map((product) => (
                <div key={product.id} className="product-item">
                  <a href={`/product/${product.id}`} className="product-link">
                    <img
                      src={
                        product.images[0] ||
                        "https://via.placeholder.com/300x400/e0e0e0/666666?text=No+Image"
                      }
                      alt={product.name}
                      className="image_product"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/300x400/e0e0e0/666666?text=No+Image";
                      }}
                    />
                    <div className="product-overlay">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-price">
                        {product.virtualPrice !== product.basePrice ? (
                          <>
                            <span className="price-sale">
                              {formatCurrency(product.virtualPrice)}
                            </span>
                            <span className="price-original">
                              {formatCurrency(product.basePrice)}
                            </span>
                          </>
                        ) : (
                          <span className="price-normal">
                            {formatCurrency(product.virtualPrice)}
                          </span>
                        )}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="no-products">
            <p>Chưa có sản phẩm mới nào.</p>
          </div>
        )}
      </section>

      {/* Section 4: Poster Carousel */}
      <section className="poster-section">
        <h1 className="section-title">Khám Phá Phong Cách Của Bạn</h1>
        <div className="poster-carousel-wrapper">
          <Slider {...posterSettings}>
            {posterImages.map((img, index) => (
              <div key={index} className="poster-item">
                <img
                  src={img}
                  alt={`Poster ${index + 1}`}
                  className="image_poster"
                />
              </div>
            ))}
          </Slider>
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
