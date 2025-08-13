// src/components/Footer.tsx

import "../assets/css/style.css"; // File CSS riêng cho Footer
import React, { useEffect, useState } from "react";
import logoImg from "../assets/img/home/logo.png";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer>
      <div className="footer_container">
        <div className="logo_footer">
          <img src={logoImg} alt="Pixcam Logo" className="logo_footerIcon" />
        </div>
        <div className="contact_footer">
          <div className="footer-column">
            <h4 className="title_contact">LIÊN HỆ</h4>
            <ul className="content_contact">
              <li className="address_contact">
                <i className="fa-solid fa-location-dot"></i> 02,Võ Oanh, Bình
                Thạnh,TPHCM
              </li>
              <li className="address_contact">
                <i className="fa-solid fa-phone"></i> Hotline: 0336673831
              </li>
              <li className="address_contact">
                <i className="fa-solid fa-envelope"></i> Email: pixcam@gmail.com
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="title_contact">CHÍNH SÁCH</h4>
            <ul className="content_contact">
              <Link to="chinh-sach-thanh-vien">
                <li className="address_contact">
                  <a>Chính sách thành viên</a>
                </li>
              </Link>
              <Link to="chinh-sach-doi-tra">
                <li className="address_contact">
                  <a>Chính sách đổi trả</a>
                </li>
              </Link>
              <Link to="chinh-sach-van-chuyen">
                <li className="address_contact">
                  <a>Chính sách vận chuyển</a>
                </li>
              </Link>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="title_contact">ĐĂNG KÝ NHẬN TIN</h4>
            <ul className="content_contact">
              <li className="address_contact">
                Nhận thông tin sản phẩm mới nhất và các chương trình khuyến mại.
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4 className="title_contact">KẾT NỐI</h4>
            <ul className="social_links">
              <li>
                <a href="#" aria-label="Facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {showBackToTop && (
        <button
          id="backToTop"
          title="Lên đầu trang"
          aria-label="Back to top"
          onClick={scrollToTop}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </footer>
  );
};

export default Footer;
