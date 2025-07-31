import "../assets/css/style.css"; // File CSS riêng cho Footer
import React, { useEffect } from "react";

// Import logo
import logoImg from "../assets/img/home/logo.png";

const Footer: React.FC = () => {
  // GHI CHÚ: Logic cho nút "Back to Top" cần được triển khai lại ở đây
  // bằng cách sử dụng React Hooks (useEffect và useState).
  useEffect(() => {
    const backToTopButton = document.getElementById("backToTop");

    const handleScroll = () => {
      if (backToTopButton) {
        if (window.scrollY > 300) {
          // Hiển thị nút khi cuộn xuống 300px
          backToTopButton.style.display = "block";
        } else {
          backToTopButton.style.display = "none";
        }
      }
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("scroll", handleScroll);
    if (backToTopButton) {
      backToTopButton.addEventListener("click", scrollToTop);
    }

    // Dọn dẹp event listener khi component bị hủy
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (backToTopButton) {
        backToTopButton.removeEventListener("click", scrollToTop);
      }
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

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
      {/* Nút này giờ sẽ được điều khiển bởi logic trong useEffect */}
      <button id="backToTop" title="Lên đầu trang" style={{ display: "none" }}>
        <i className="fas fa-arrow-up"></i>
      </button>
    </footer>
  );
};

export default Footer;
