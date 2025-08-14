import React, { useState, useRef, useEffect } from "react";
import "../assets/css/style.css";
import "../assets/css/CategoryPage.css";
import type { ProductType } from "../models/shared/shared-product.model";
import { Link } from "react-router-dom";
import http from "../api/http";
import { OrderBy, SortBy } from "../constants/other.constant";
import type { CategoryType } from "../models/shared/shared-category.model";

const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};

const SortChooseType = {
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  LATEST: "LATEST",
} as const;

const AccessoriesPage: React.FC = () => {
  const [sortOption, setSortOption] = useState<keyof typeof SortChooseType>(
    SortChooseType.LATEST
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [categoryParams, setCategoryParams] = useState<string | null>(null);

  const productsPerPage = 10;
  const parentCategoryId = 3;

  useEffect(() => {
    const takeCategories = async () => {
      try {
        const response = await http.get(
          `/categories?parentCategoryId=${parentCategoryId}`
        );
        const data: CategoryType[] = response.data.data;
        const params = data.map((item) => `categories=${item.id}`).join("&");
        setCategoryParams(params);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryParams("");
      }
    };
    takeCategories();
  }, []);

  useEffect(() => {
    if (categoryParams === null) return;
    const fetchProducts = async () => {
      let sortBy = "";
      let order = "";
      if (sortOption === SortChooseType.PRICE_ASC) {
        sortBy = SortBy.Price;
        order = OrderBy.Asc;
      } else if (sortOption === SortChooseType.PRICE_DESC) {
        sortBy = SortBy.Price;
        order = OrderBy.Desc;
      } else if (sortOption === SortChooseType.LATEST) {
        sortBy = SortBy.CreatedAt;
        order = OrderBy.Desc;
      }
      try {
        const response = await http.get(
          `/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&orderBy=${order}&${categoryParams}`
        );
        const data = response.data;
        // Lọc sản phẩm có basePrice = virtualPrice (không có giảm giá)
        const filteredProducts = (data.data || []).filter(
          (product: ProductType) => product.basePrice === product.virtualPrice
        );
        setProducts(filteredProducts);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [currentPage, sortOption, categoryParams]);

  const getSortLabel = (sortValue: keyof typeof SortChooseType) => {
    switch (sortValue) {
      case SortChooseType.PRICE_ASC:
        return "Giá: thấp → cao";
      case SortChooseType.PRICE_DESC:
        return "Giá: cao → thấp";
      default:
        return "Mới nhất";
    }
  };

  const handleSortChange = (value: keyof typeof SortChooseType) => {
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

  const calculateDiscountPercentage = (
    basePrice: number,
    virtualPrice: number
  ): number => {
    if (basePrice <= 0 || virtualPrice >= basePrice) return 0;
    return Math.round(((basePrice - virtualPrice) / basePrice) * 100);
  };

  return (
    <main className="content">
      <div className="content_top">
        <div className="contentProducts_navigate">
          <div className="navigate_shopAll">
            <p className="title_navigate">
              <Link to="/" className="home_navigate">
                TRANG CHỦ
              </Link>{" "}
              / DANH MỤC PHỤ KIỆN
            </p>
          </div>
          <div className="filter_shopAlll">
            <p>
              Hiển thị {products.length} của {totalItems} kết quả
            </p>
            <div
              className={`custom-dropdown ${isDropdownOpen ? "open" : ""}`}
              ref={dropdownRef}
            >
              <div
                className="selected"
                onClick={() => setIsDropdownOpen((o) => !o)}
              >
                <span>{getSortLabel(sortOption)}</span>
                <span>&#9662;</span>
              </div>
              <ul className="options" onClick={(e) => e.stopPropagation()}>
                <li onClick={() => handleSortChange(SortChooseType.LATEST)}>
                  Mới nhất
                </li>
                <li onClick={() => handleSortChange(SortChooseType.PRICE_ASC)}>
                  Giá: thấp → cao
                </li>
                <li onClick={() => handleSortChange(SortChooseType.PRICE_DESC)}>
                  Giá: cao → thấp
                </li>
              </ul>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px 0" }}>
            Chưa có sản phẩm nào cho danh mục này.
          </p>
        ) : (
          <div className="product_top">
            <div className="products_home">
              {products.map((product) => {
                const discountPercentage = calculateDiscountPercentage(
                  product.basePrice,
                  product.virtualPrice
                );
                const hasDiscount = discountPercentage > 0;
                return (
                  <div className="item_products_home" key={product.id}>
                    <a
                      href={`/product/${product.id}`}
                      className="image_home_item"
                    >
                      {hasDiscount && (
                        <div className="product_sale">
                          <p className="text_products_sale">
                            -{discountPercentage}%
                          </p>
                        </div>
                      )}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="image_products_home"
                      />
                    </a>
                    <div className="product-info-container">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-price">
                        {hasDiscount ? (
                          <>
                            <span className="price-original">
                              {formatCurrency(product.basePrice)}
                            </span>
                            <span className="price-sale">
                              {formatCurrency(product.virtualPrice)}
                            </span>
                          </>
                        ) : (
                          <span>{formatCurrency(product.virtualPrice)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {renderPagination()}
      </div>
    </main>
  );
};

export default AccessoriesPage;
