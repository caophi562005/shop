// src/components/Header.tsx

import React, { useState, useEffect, useRef } from "react";
import "../assets/css/style.css";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isMenuOpen, setMenuOpen] = useState(false);

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

  // Đóng menu khi chuyển từ mobile sang desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedKeyword = searchKeyword.trim();
    if (trimmedKeyword) {
      navigate(`/products/find-products/${encodeURIComponent(trimmedKeyword)}`);
      setSearchKeyword(""); // Clear input sau khi tìm kiếm
    }
  };

  // Xử lý thay đổi input
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

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
    if (user?.role.name === RoleName.ADMIN) {
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
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src={logoImg} alt="Logo" />
        </Link>
        <button
          className="menu_toggle"
          onClick={() => setMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <i className="fa-solid fa-bars icon_while"></i>
        </button>
      </div>

      <nav className={`nav_container ${isMenuOpen ? "open" : ""}`}>
        <ul className="navigate_header">
          <li>
            <Link
              to="/"
              className="title_header"
              onClick={() => setMenuOpen(false)}
            >
              HOME
            </Link>
          </li>
          {mockCategories.map((cat) => (
            <li
              key={cat.id}
              className="dropdown_header"
              onMouseEnter={() =>
                window.innerWidth > 768 && setOpenCategory(cat.id)
              }
              onMouseLeave={() =>
                window.innerWidth > 768 && setOpenCategory(null)
              }
            >
              <Link
                to={cat.path}
                className="title_header"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
              {openCategory === cat.id && cat.subcategories.length > 0 && (
                <div className="mega_menu">
                  <div className="column">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        onClick={() => setMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="tools_header">
        <div className="header_search_wrapper">
          <form className="header_search_form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              name="q"
              className="header_search_input"
              placeholder="Tìm kiếm..."
              autoComplete="off"
              value={searchKeyword}
              onChange={handleSearchInputChange}
            />
            <button type="submit" className="header_search_btn">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
        <div className="account-menu" style={{ position: "relative" }}>
          <button
            className="menu-button"
            onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
            aria-label="Tài khoản"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <i className="fa-solid fa-user icon_while"></i>
          </button>

          {isAccountMenuOpen && (
            <div
              ref={accountMenuRef}
              id="accountMenu"
              className="account_dropdown"
            >
              {renderAccountMenuItems()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
