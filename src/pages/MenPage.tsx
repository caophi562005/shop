import React, { useState, useMemo, useRef, useEffect } from "react";
import "../assets/css/home.css";
import "../assets/css/Top.css";
import "../assets/css/style.css";
import "../assets/css/Product.css";

interface Product {
  id: number;
  name: string;
  price: number;
  imgURL_1: string;
  createdAt: string;
}

const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};

const fakeProducts: Product[] = Array.from({ length: 26 }, (_, i) => ({
  id: i + 1,
  name: `Sản phẩm mẫu ${i + 1}`,
  price: Math.floor(Math.random() * (2000000 - 300000) + 300000),
  imgURL_1: `https://via.placeholder.com/400x400.png?text=Sản+phẩm+${i + 1}`,
  createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
}));

const MenPage: React.FC = () => {
  const [sortOption, setSortOption] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const productsPerPage = 12;

  const sortedProducts = useMemo(() => {
    const products = [...fakeProducts];
    switch (sortOption) {
      case "price_asc":
        return products.sort((a, b) => a.price - b.price);
      case "price_desc":
        return products.sort((a, b) => b.price - a.price);
      case "latest":
        return products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return products;
    }
  }, [sortOption]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [currentPage, sortedProducts]);

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case "price_asc":
        return "Giá: thấp → cao";
      case "price_desc":
        return "Giá: cao → thấp";
      case "latest":
        return "Mới nhất";
      default:
        return "Thứ tự mặc định";
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const range = 2;
    const pages: (number | string)[] = [];
    pages.push("prev");
    if (currentPage > range + 1) {
      pages.push(1);
      if (currentPage > range + 2) pages.push("...");
    }
    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - range) {
      if (currentPage < totalPages - (range + 1)) pages.push("...");
      pages.push(totalPages);
    }
    pages.push("next");
    return (
      <div className="pagination">
        {pages.map((p, index) => {
          if (p === "prev") {
            return currentPage > 1 ? (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage - 1);
                }}
              >
                <i className="fas fa-angle-left"></i>
              </a>
            ) : (
              <span key={index} className="disabled">
                <i className="fas fa-angle-left"></i>
              </span>
            );
          }
          if (p === "next") {
            return currentPage < totalPages ? (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage + 1);
                }}
              >
                <i className="fas fa-angle-right"></i>
              </a>
            ) : (
              <span key={index} className="disabled">
                <i className="fas fa-angle-right"></i>
              </span>
            );
          }
          if (p === "...") {
            return (
              <span key={index} className="disabled">
                ...
              </span>
            );
          }
          return p === currentPage ? (
            <span key={index} className="active">
              {p}
            </span>
          ) : (
            <a
              key={index}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(p as number);
              }}
            >
              {p}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <main>
      <div className="content">
        <div className="content_top">
          <div className="contentProducts_navigate">
            <div className="navigate_shopAll">
              <p className="title_navigate">
                <span className="home_navigate">TRANG CHỦ</span> / DANH MỤC NAM
              </p>
            </div>
            <div className="filter_shopAlll">
              <p>
                Hiển thị {paginatedProducts.length} của {sortedProducts.length}{" "}
                kết quả
              </p>
              <div
                className={`custom-dropdown ${isDropdownOpen ? "open" : ""}`}
                ref={dropdownRef}
              >
                <div
                  className="selected"
                  onClick={() => setIsDropdownOpen((o) => !o)}
                >
                  {getSortLabel(sortOption)} &#9662;
                </div>
                {isDropdownOpen && (
                  <ul className="options" onClick={(e) => e.stopPropagation()}>
                    <li onClick={() => handleSortChange("")}>
                      Thứ tự mặc định
                    </li>
                    <li onClick={() => handleSortChange("price_asc")}>
                      Giá: thấp → cao
                    </li>
                    <li onClick={() => handleSortChange("price_desc")}>
                      Giá: cao → thấp
                    </li>
                    <li onClick={() => handleSortChange("latest")}>Mới nhất</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {paginatedProducts.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Chưa có sản phẩm nào cho danh mục này.
            </p>
          ) : (
            <div className="product_top">
              <div className="products_home">
                {paginatedProducts.map((product) => (
                  <div className="item_products_home" key={product.id}>
                    <div className="image_home_item">
                      <a href={`/products/${product.id}`}>
                        <img
                          src={product.imgURL_1}
                          alt={product.name}
                          className="image_products_home"
                        />
                      </a>
                    </div>
                    <h4 className="infProducts_home">{product.name}</h4>
                    <p className="infProducts_home">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {renderPagination()}
    </main>
  );
};

export default MenPage;
