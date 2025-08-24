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
import { categoryApi } from "../api/categoryApi";
import type { CategoryWithSubcategories } from "../models/category.model";

const Header: React.FC = () => {
  const { isLoggedIn, logout, checkAuthStatus, user } = useAuthStore();
  const navigate = useNavigate();

  // State cho categories
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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

  // Fetch categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const categoriesData = response.data;

        // Map categories với display names và paths
        const mappedCategories: CategoryWithSubcategories[] =
          categoriesData.map((cat) => {
            let displayName = cat.name;
            let path = `/products/${cat.id}`;

            // Map specific categories
            if (cat.id === 1) {
              // Thời trang nam
              displayName = "NAM";
              path = "/products/men";
            } else if (cat.id === 2) {
              // Thời trang nữ
              displayName = "NỮ";
              path = "/products/women";
            } else if (cat.id === 3) {
              // Phụ kiện
              displayName = "PHỤ KIỆN";
              path = "/products/accessories";
            } else if (cat.id === 13) {
              // Sale
              displayName = "SALE";
              path = "/products/sale";
            }

            return {
              ...cat,
              name: displayName,
              path,
              subcategories: [],
            };
          });

        setCategories(mappedCategories);
        console.log("Categories loaded:", mappedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Function để fetch subcategories khi hover (desktop) hoặc click (mobile)
  const handleCategoryHover = async (categoryId: number) => {
    if (isMobile) return; // Skip hover on mobile - sẽ dùng click

    // Skip hover effect for Sale category (id: 13)
    if (categoryId === 13) return;

    setOpenCategory(categoryId);

    // Check if already has subcategories
    const category = categories.find((cat) => cat.id === categoryId);
    if (
      category &&
      category.subcategories &&
      category.subcategories.length > 0
    ) {
      return; // Already loaded
    }

    await fetchSubcategories(categoryId);
  };

  // Function để handle click trên mobile
  const handleCategoryClick = async (
    e: React.MouseEvent,
    categoryId: number
  ) => {
    if (!isMobile) return; // Only for mobile

    // Skip for Sale category (id: 13) - let it navigate normally
    if (categoryId === 13) return;

    e.preventDefault(); // Prevent navigation

    if (openCategory === categoryId) {
      // If already open, close it
      setOpenCategory(null);
    } else {
      // Open this category
      setOpenCategory(categoryId);

      // Check if already has subcategories
      const category = categories.find((cat) => cat.id === categoryId);
      if (
        !category ||
        !category.subcategories ||
        category.subcategories.length === 0
      ) {
        await fetchSubcategories(categoryId);
      }
    }
  };

  // Function để fetch subcategories
  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await categoryApi.getSubcategories(categoryId);
      const subcategories = response.data.map((sub) => {
        // Map subcategory to parent category page with query parameter
        let parentPath = "";
        switch (categoryId) {
          case 1: // Men
            parentPath = "/products/men";
            break;
          case 2: // Women
            parentPath = "/products/women";
            break;
          case 3: // Accessories
            parentPath = "/products/accessories";
            break;
          default:
            parentPath = `/products/category/${categoryId}`;
        }

        return {
          ...sub,
          path: `${parentPath}?category=${sub.id}`,
        };
      });

      // Update the category with subcategories
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, subcategories } : cat
        )
      );

      console.log(`Subcategories for ${categoryId}:`, subcategories);
    } catch (error) {
      console.error(`Failed to fetch subcategories for ${categoryId}:`, error);
    }
  };

  // Đóng menu khi chuyển từ mobile sang desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
        setOpenCategory(null); // Đóng tất cả dropdown khi chuyển sang desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMenuOpen) {
        const sidebar = document.querySelector(".nav_container");
        const menuToggle = document.querySelector(".menu_toggle");

        if (
          sidebar &&
          menuToggle &&
          !sidebar.contains(event.target as Node) &&
          !menuToggle.contains(event.target as Node)
        ) {
          setMenuOpen(false);
          setOpenCategory(null);
        }
      }
    };

    if (isMobile && isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isMenuOpen]);

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
          <Link to="/order-history" style={linkStyle}>
            Lịch sử mua hàng{" "}
          </Link>
          <Link to="/admin" style={linkStyle}>
            Quản lý
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
        {/* Header của sidebar cho mobile */}
        {isMobile && (
          <div
            className="sidebar-header"
            style={{
              padding: "15px 20px",
              borderBottom: "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#000",
            }}
          >
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <img
                src={logoImg}
                alt="Logo"
                style={{ width: "120px", height: "auto" }}
              />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                padding: "5px",
              }}
              aria-label="Đóng menu"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}

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
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="dropdown_header"
              onMouseEnter={() => handleCategoryHover(cat.id)}
              onMouseLeave={() => !isMobile && setOpenCategory(null)}
            >
              <Link
                to={cat.path || `/products/${cat.id}`}
                className="title_header"
                onClick={(e) => {
                  if (isMobile) {
                    handleCategoryClick(e, cat.id);
                  } else {
                    setMenuOpen(false);
                  }
                }}
              >
                {cat.name}
                {/* Thêm icon mũi tên cho mobile để indicate có subcategories */}
                {isMobile && cat.id !== 13 && (
                  <i
                    className={`fa-solid ${
                      openCategory === cat.id
                        ? "fa-chevron-up"
                        : "fa-chevron-down"
                    }`}
                    style={{ fontSize: "12px" }}
                  ></i>
                )}
              </Link>
              {openCategory === cat.id &&
                cat.id !== 13 && // Don't show dropdown for Sale category
                cat.subcategories &&
                cat.subcategories.length > 0 && (
                  <div className={`mega_menu ${isMobile ? "mobile-open" : ""}`}>
                    <div className="column">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.path || `/products/category/${sub.id}`}
                          onClick={() => {
                            setMenuOpen(false);
                            setOpenCategory(null);
                          }}
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

      {/* Overlay cho mobile sidebar */}
      {isMobile && isMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setMenuOpen(false);
            setOpenCategory(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            cursor: "pointer",
          }}
        />
      )}

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
