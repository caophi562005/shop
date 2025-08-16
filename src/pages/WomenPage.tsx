import React, { useState, useRef, useEffect } from "react";
import "../assets/css/style.css";
import "../assets/css/CategoryPage.css";
import type { ProductType } from "../models/shared/shared-product.model";
import { Link, useSearchParams } from "react-router-dom";
import http from "../api/http";
import { OrderBy, SortBy } from "../constants/other.constant";

interface CategoryType {
  id: number;
  name: string;
  logo: string;
  parentCategoryId: number;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};

const SortChooseType = {
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  LATEST: "LATEST",
} as const;

const WomenPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sortOption, setSortOption] = useState<keyof typeof SortChooseType>(
    SortChooseType.LATEST
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const productsPerPage = 12;
  const parentCategoryId = 2;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await http.get(
          `/categories?parentCategoryId=${parentCategoryId}`
        );
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [parentCategoryId]);

  // Handle query parameter for pre-selecting category
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categoryId = parseInt(categoryParam, 10);
      if (!isNaN(categoryId)) {
        setSelectedCategoryId(categoryId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
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

      // Build categories array for API call
      const categoriesParam = selectedCategoryId
        ? [selectedCategoryId] // Chỉ dùng category con được chọn
        : [parentCategoryId]; // Dùng parent category khi chưa chọn category con

      try {
        const categoriesQuery = categoriesParam
          .map((id) => `categories=${id}`)
          .join("&");
        console.log(
          "Fetching products with URL:",
          `/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&orderBy=${order}&${categoriesQuery}`
        );
        const response = await http.get(
          `/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&orderBy=${order}&${categoriesQuery}`
        );
        const data = response.data;
        console.log("API Response:", data);
        // Hiển thị tất cả sản phẩm (không lọc giảm giá)
        const allProducts = data.data || [];
        console.log("Products to display:", allProducts);
        setProducts(allProducts);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, sortOption, parentCategoryId, selectedCategoryId]);

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

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryDropdownOpen(false);
    setCurrentPage(1);
  };

  const getCategoryLabel = () => {
    if (!selectedCategoryId) return "Tất cả danh mục";
    const category = categories.find((cat) => cat.id === selectedCategoryId);
    return category ? category.name : "Tất cả danh mục";
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
      if (
        isCategoryDropdownOpen &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isCategoryDropdownOpen]);

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
    // basePrice: giá bán thực tế (thấp hơn)
    // virtualPrice: giá ảo (cao hơn để tạo cảm giác giảm giá)
    // Sale khi basePrice < virtualPrice
    if (virtualPrice <= 0 || basePrice <= 0 || virtualPrice <= basePrice)
      return 0;
    return Math.round(((virtualPrice - basePrice) / virtualPrice) * 100);
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
              / DANH MỤC NỮ
            </p>
          </div>
          <div className="filter_shopAlll">
            <p className="filter-results-text">
              Hiển thị {products.length} của {totalItems} kết quả
            </p>
            <div className="filter-dropdowns">
              <div
                className={`custom-dropdown ${
                  isCategoryDropdownOpen ? "open" : ""
                }`}
                ref={categoryDropdownRef}
              >
                <div
                  className="selected"
                  onClick={() => setIsCategoryDropdownOpen((o) => !o)}
                >
                  <span>{getCategoryLabel()}</span>
                  <span>&#9662;</span>
                </div>
                <ul className="options" onClick={(e) => e.stopPropagation()}>
                  <li onClick={() => handleCategoryChange(null)}>
                    Tất cả danh mục
                  </li>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              </div>
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
                  <li
                    onClick={() => handleSortChange(SortChooseType.PRICE_ASC)}
                  >
                    Giá: thấp → cao
                  </li>
                  <li
                    onClick={() => handleSortChange(SortChooseType.PRICE_DESC)}
                  >
                    Giá: cao → thấp
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="filter-loading">Đang tải sản phẩm...</div>
        ) : products.length === 0 ? (
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
                              {formatCurrency(product.virtualPrice)}
                            </span>
                            <span className="price-sale">
                              {formatCurrency(product.basePrice)}
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

export default WomenPage;
