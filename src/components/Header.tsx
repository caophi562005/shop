// src/components/Header.tsx

import React, { useState, useEffect, useRef } from "react";
import "../assets/css/style.css";
import "../assets/css/notification.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { RoleName } from "../constants/role.constant";
import { languageUtils, LANGUAGES, type Language } from "../utils/language";
import { useNotifications } from "../hooks/useNotifications";
import NotificationModal from "./NotificationModal";
import UserAvatar from "./UserAvatar";
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

  // Notification hooks
  const {
    notifications,
    hasUnread,
    loading: notificationLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languageUtils.getCurrentLanguage()
  );

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Logic đóng menu tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setLanguageMenuOpen(false);
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

  // Xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    languageUtils.setLanguage(language);
    setLanguageMenuOpen(false);
    // Reload page để apply ngôn ngữ mới cho tất cả components
    window.location.reload();
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
          <Link to="/admin/chat" style={linkStyle}>
            Hỗ trợ
          </Link>
          <Link to="/admin/revenue" style={linkStyle}>
            Doanh thu
          </Link>
          <Link to="/admin/account" style={linkStyle}>
            Quản lý tài khoản
          </Link>
          <Link to="/admin" style={linkStyle}>
            Quản lý sản phẩm
          </Link>
          <Link to="/admin/category" style={linkStyle}>
            Quản lý danh mục
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
        {/* Language Switcher */}
        <div
          className="language-menu"
          style={{ position: "relative", marginRight: "10px" }}
        >
          <button
            className="menu-button"
            onClick={() => setLanguageMenuOpen(!isLanguageMenuOpen)}
            aria-label="Chọn ngôn ngữ"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "white",
            }}
          >
            <span>{languageUtils.getLanguageFlag(currentLanguage)}</span>
            <span style={{ fontSize: "12px" }}>
              {currentLanguage === LANGUAGES.VI ? "VI" : "EN"}
            </span>
            <i
              className="fa-solid fa-chevron-down"
              style={{ fontSize: "10px" }}
            ></i>
          </button>

          {isLanguageMenuOpen && (
            <div
              ref={languageMenuRef}
              className="account_dropdown"
              style={{
                position: "absolute",
                top: "100%",
                right: "0",
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 1000,
                minWidth: "120px",
              }}
            >
              <button
                onClick={() => handleLanguageChange(LANGUAGES.VI)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background:
                    currentLanguage === LANGUAGES.VI
                      ? "#f0f0f0"
                      : "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "left",
                }}
              >
                <span>🇻🇳</span>
                <span>Việt Nam</span>
              </button>
              <button
                onClick={() => handleLanguageChange(LANGUAGES.EN)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background:
                    currentLanguage === LANGUAGES.EN
                      ? "#f0f0f0"
                      : "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "left",
                }}
              >
                <span>🇺🇸</span>
                <span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell - Chỉ hiện khi đã đăng nhập */}
        {isLoggedIn && (
          <div
            className="notification-menu"
            style={{ position: "relative", marginRight: "10px" }}
          >
            <button
              className="menu-button"
              onClick={() => setNotificationModalOpen(true)}
              aria-label="Thông báo"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: "8px",
              }}
            >
              <i
                className={`fa-solid fa-bell icon_while ${
                  hasUnread ? "has-notification" : ""
                }`}
                style={{
                  fontSize: "18px",
                  color: hasUnread ? "#ffc107" : "white",
                  transition: "color 0.3s ease",
                }}
              ></i>
              {hasUnread && (
                <span
                  className="notification-badge"
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#dc3545",
                    color: "white",
                    borderRadius: "50%",
                    width: "8px",
                    height: "8px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                ></span>
              )}
            </button>
          </div>
        )}

        <div className="account-menu" style={{ position: "relative" }}>
          <button
            className="menu-button"
            onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
            aria-label="Tài khoản"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <div className="user-avatar-container">
              <UserAvatar user={user} size={32} />
            </div>
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

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        notifications={notifications}
        loading={notificationLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </header>
  );
};

export default Header;
