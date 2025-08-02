import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { RoleName } from "../constants/role.constant";
import logoImg from "../assets/img/home/logo.png";

// Dữ liệu mẫu cho menu
const mockCategories = [
  {
    id: 1,
    name: "NAM",
    path: "/products/men",
    subcategories: [
      { id: 101, name: "Áo Nam", path: "/products/men/shirts" },
      { id: 102, name: "Quần Nam", path: "/products/men/trousers" },
    ],
  },
  {
    id: 2,
    name: "NỮ",
    path: "/products/women",
    subcategories: [
      { id: 201, name: "Áo Nữ", path: "/products/women/blouses" },
      { id: 202, name: "Váy & Chân Váy", path: "/products/women/dresses" },
    ],
  },
  {
    id: 3,
    name: "PHỤ KIỆN",
    path: "/products/accessories",
    subcategories: [
      { id: 301, name: "Túi Xách", path: "/products/accessories/bags" },
      { id: 302, name: "Kính Mắt", path: "/products/accessories/glasses" },
    ],
  },
  { id: 4, name: "SALE", path: "/sale", subcategories: [] },
];

const Header: React.FC = () => {
  const { isLoggedIn, logout, checkAuthStatus, user } = useAuthStore();

  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Logic đóng menu tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Kiểm tra trạng thái đăng nhập khi component tải
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const renderAccountMenuItems = () => {
    if (!isLoggedIn) {
      return (
        <>
          <Link to="/login" style={linkStyle}>
            Đăng nhập
          </Link>
          <Link to="/register" style={linkStyle}>
            Đăng ký
          </Link>
        </>
      );
    }
    // Nếu là admin
    if (user?.roleName === RoleName.ADMIN) {
      return (
        <>
          <Link to="/profile" style={linkStyle}>
            Thông tin tài khoản
          </Link>
          <Link to="/cart" style={linkStyle}>
            Giỏ hàng
          </Link>
          <Link to="/admin/products" style={linkStyle}>
            Quản lý sản phẩm
          </Link>
          <Link to="/admin/category" style={linkStyle}>
            Quản lý danh mục
          </Link>
          <Link to="/admin/orders" style={linkStyle}>
            Quản lý đơn hàng
          </Link>
          <Link to="/admin/customers" style={linkStyle}>
            Quản lý khách hàng
          </Link>
          <Link to="/admin/categories" style={linkStyle}>
            Quản lý danh mục
          </Link>

          <Link to="/revenue" style={linkStyle}>
            Thống kê doanh thu
          </Link>

          <Link
            to="/"
            onClick={() => {
              logout();
              setAccountMenuOpen(false);
            }}
            style={linkStyle}
          >
            Đăng xuất
          </Link>
        </>
      );
    }
    // Nếu là user thường
    return (
      <>
        <Link to="/profile" style={linkStyle}>
          Thông tin tài khoản
        </Link>
        <Link to="/cart" style={linkStyle}>
          Giỏ hàng
        </Link>
        <Link to="/order-history" style={linkStyle}>
          Lịch sử mua hàng
        </Link>
        <Link
          to="/"
          onClick={() => {
            logout();
            setAccountMenuOpen(false);
          }}
          style={linkStyle}
        >
          Đăng xuất
        </Link>
      </>
    );
  };

  const linkStyle: React.CSSProperties = {
    display: "block",
    padding: "10px 15px",
    textDecoration: "none",
    fontSize: "14px",
    color: "#000",
  };

  return (
    <header>
      <div className="logo_header">
        <Link to="/" className="logo">
          <img src={logoImg} alt="Logo" />
        </Link>
      </div>

      <ul className="navigate_header">
        <li>
          <Link to="/" className="title_header">
            HOME
          </Link>
        </li>
        {mockCategories.map((cat) => (
          <li
            key={cat.id}
            className="dropdown_header"
            onMouseEnter={() => setOpenCategory(cat.id)}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <Link to={cat.path} className="title_header">
              {cat.name}
            </Link>
            {openCategory === cat.id && cat.subcategories.length > 0 && (
              <div className="mega_menu">
                <div className="column">
                  {cat.subcategories.map((sub) => (
                    <Link key={sub.id} to={sub.path}>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ul className="tools_header">
        <li
          className="account-menu"
          style={{ position: "relative", display: "inline-block" }}
        >
          <div
            className="menu-button"
            onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-user icon_while"></i>
          </div>

          {isAccountMenuOpen && (
            <div
              ref={accountMenuRef}
              id="accountMenu"
              style={{
                display: "block",
                position: "absolute",
                top: "130%",
                right: 0,
                backgroundColor: "#fef6e4",
                minWidth: "180px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                zIndex: 999,
              }}
            >
              {renderAccountMenuItems()}
            </div>
          )}
        </li>

        <li className="header_search_wrapper">
          <form className="header_search_form">
            <input
              type="text"
              name="q"
              className="header_search_input"
              placeholder="Tìm sản phẩm..."
              autoComplete="off"
            />
            <button type="submit" className="header_search_btn">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </li>
      </ul>
    </header>
  );
};

export default Header;
