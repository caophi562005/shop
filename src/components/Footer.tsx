import "../assets/css/style.css"; // File CSS riêng cho Footer
import React, { useEffect, useState } from "react";

// Import logo
import logoImg from "../assets/img/home/logo.png";

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
      <div className="logo_footer">
        <img src={logoImg} alt="Pixcam Logo" className="logo_footerIcon" />
      </div>
      <ul className="contact_footer">
        <li>
          <div className="item_title_contact">
            <p className="title_contact">LIÊN HỆ</p>
          </div>
          <div className="content_contact">
            <ul>
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
        </li>
        <li>
          <div className="item_title_contact">
            <p className="title_contact">CHÍNH SÁCH</p>
          </div>
          <div className="content_contact">
            <ul>
              <li className="address_contact">
                <a href="index.php?controller=CSTV&action=index">
                  Chính sách thành viên
                </a>
              </li>
              <li className="address_contact">
                <a href="index.php?controller=CSDT&action=index">
                  Chính sách đổi trả
                </a>
              </li>
              <li className="address_contact">
                <a href="index.php?controller=CSVC&action=index">
                  Chính sách vận chuyển
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <div className="item_title_contact">
            <p className="title_contact">ĐĂNG KÝ NHẬN TIN</p>
          </div>
          <div className="content_contact">
            <ul>
              <li className="address_contact">
                Nhận thông tin sản phẩm mới nhất
              </li>
              <li className="address_contact">Thông tin sản phẩm khuyến mại</li>
            </ul>
          </div>
        </li>
        <li>
          <div className="item_title_contact">
            <p className="title_contact">KẾT NỐI</p>
          </div>
          <div className="content_contact">
            <ul style={{ display: "flex", gap: "20px" }}>
              <li className="address_contact">
                <i className="fa-brands fa-facebook"></i>
              </li>
              <li className="address_contact">
                <i className="fa-brands fa-instagram"></i>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      {showBackToTop && (
        <button id="backToTop" title="Lên đầu trang" onClick={scrollToTop}>
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </footer>
  );
};

export default Footer;
