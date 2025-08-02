import React, { useState, useMemo, useRef, useEffect } from "react";
import "../assets/css/home.css";
import "../assets/css/Top.css";
import "../assets/css/style.css";
import "../assets/css/Product.css";

// Khai báo kiểu dữ liệu cho sản phẩm
interface Product {
  id: number;
  name: string;
  price: number;
  imgURL_1: string;
  createdAt: string; // Dùng để sort "Mới nhất"
  price_sale?: number; // Giá sale (có thể có hoặc không)
  discount_percent?: number; // % giảm giá (có thể có hoặc không)
}

// Hàm định dạng tiền tệ
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};

// --- DỮ LIỆU GIẢ (FAKE DATA) ---
// Tạo một mảng sản phẩm giả để hiển thị
const allFakeProducts: Product[] = Array.from({ length: 35 }, (_, i) => {
  const originalPrice = Math.floor(Math.random() * (2000000 - 300000) + 300000);
  const hasSale = Math.random() > 0.6; // 40% sản phẩm sẽ có sale
  let price_sale, discount_percent;

  if (hasSale) {
    discount_percent = Math.floor(Math.random() * (50 - 10) + 10);
    price_sale = originalPrice * (1 - discount_percent / 100);
  }

  return {
    id: i + 1,
    name: `Máy ảnh mẫu ${i + 1}`,
    price: originalPrice,
    imgURL_1: `https://via.placeholder.com/400x400.png?text=Sản+phẩm+${i + 1}`,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    price_sale: price_sale,
    discount_percent: discount_percent,
  };
});
// Thêm một vài sản phẩm có tên cụ thể để tìm kiếm dễ dàng
allFakeProducts.push({
  id: 99,
  name: "Canon EOS R5 siêu nét",
  price: 85000000,
  imgURL_1: `https://via.placeholder.com/400x400.png?text=Canon+R5`,
  createdAt: new Date().toISOString(),
});
allFakeProducts.push({
  id: 100,
  name: "Sony Alpha A7 IV",
  price: 58000000,
  imgURL_1: `https://via.placeholder.com/400x400.png?text=Sony+A7IV`,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  price_sale: 55000000,
  discount_percent: 5,
});

// --- COMPONENT CON: ProductCard ---
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const hasSale = product.price_sale && product.price_sale > 0;
  return (
    <div className="item_products_home">
      <div className="image_home_item">
        {hasSale && (
          <div className="product_sale">
            <p className="text_products_sale">−{product.discount_percent}%</p>
          </div>
        )}
        <a href={`#`}>
          <img
            src={product.imgURL_1}
            alt={product.name}
            className="image_products_home"
          />
        </a>
      </div>
      <h4 className="infProducts_home">{product.name}</h4>
      <p className="infProducts_home">
        {hasSale ? (
          <>
            <span className="price-original">
              {formatCurrency(product.price)}
            </span>
            &nbsp;
            <span className="price-sale">
              {formatCurrency(product.price_sale!)}
            </span>
          </>
        ) : (
          formatCurrency(product.price)
        )}
      </p>
    </div>
  );
};

// --- COMPONENT CON: Pagination ---
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const range = 2;
  const pages: (number | string)[] = [];

  // Nút "Prev"
  pages.push("prev");

  // Trang đầu và "..."
  if (currentPage > range + 1) {
    pages.push(1);
    if (currentPage > range + 2) {
      pages.push("...");
    }
  }

  // Các trang ở giữa
  for (
    let i = Math.max(1, currentPage - range);
    i <= Math.min(totalPages, currentPage + range);
    i++
  ) {
    pages.push(i);
  }

  // Trang cuối và "..."
  if (currentPage < totalPages - range) {
    if (currentPage < totalPages - range - 1) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  // Nút "Next"
  pages.push("next");

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {pages.map((p, index) => {
        if (p === "prev") {
          return (
            <a
              key={index}
              href="#"
              className={currentPage === 1 ? "disabled" : ""}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
            >
              <i className="fas fa-angle-left"></i>
            </a>
          );
        }
        if (p === "next") {
          return (
            <a
              key={index}
              href="#"
              className={currentPage === totalPages ? "disabled" : ""}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
            >
              <i className="fas fa-angle-right"></i>
            </a>
          );
        }
        if (p === "...") {
          return (
            <span key={index} className="disabled">
              ...
            </span>
          );
        }
        return (
          <a
            key={index}
            href="#"
            className={p === currentPage ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(p as number);
            }}
          >
            {p}
          </a>
        );
      })}
    </div>
  );
};

// --- COMPONENT CHÍNH: FindProductPage ---
const FindProductPage: React.FC = () => {
  // Giả lập lấy params từ URL, bạn có thể tích hợp với react-router-dom
  const [keyword, setKeyword] = useState<string>("sony"); // Giả sử người dùng tìm "sony"
  const [sortOption, setSortOption] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const productsPerPage = 12;

  // Lọc và sắp xếp sản phẩm
  const sortedAndFilteredProducts = useMemo(() => {
    let products = [...allFakeProducts];

    // 1. Lọc theo từ khóa
    if (keyword) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 2. Sắp xếp
    switch (sortOption) {
      case "price_asc":
        return products.sort(
          (a, b) => (a.price_sale || a.price) - (b.price_sale || b.price)
        );
      case "price_desc":
        return products.sort(
          (a, b) => (b.price_sale || b.price) - (a.price_sale || a.price)
        );
      case "latest":
        return products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return products;
    }
  }, [sortOption, keyword]);

  // Phân trang sản phẩm
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return sortedAndFilteredProducts.slice(startIndex, endIndex);
  }, [currentPage, sortedAndFilteredProducts]);

  const totalPages = Math.ceil(
    sortedAndFilteredProducts.length / productsPerPage
  );

  // Lấy nhãn cho tùy chọn sort
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

  // Xử lý khi thay đổi sort
  const handleSortChange = (value: string) => {
    setSortOption(value);
    setIsDropdownOpen(false);
    setCurrentPage(1); // Quay về trang 1 khi sort
  };

  // Xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render nội dung chính dựa trên điều kiện
  const renderContent = () => {
    if (keyword === "") {
      return (
        <>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Vui lòng nhập từ khóa tìm kiếm.
          </p>
          <div style={{ height: "300px" }}></div>
        </>
      );
    }
    if (sortedAndFilteredProducts.length === 0) {
      return (
        <>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Không tìm thấy sản phẩm nào chứa “<strong>{keyword}</strong>”.
          </p>
          <div style={{ height: "300px" }}></div>
        </>
      );
    }
    return (
      <div className="product_top">
        <div className="products_home">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
                <span className="home_navigate">TRANG CHỦ</span> / TÌM KIẾM
              </p>
            </div>

            <div className="filter_shopAlll">
              <p>
                Hiển thị {paginatedProducts.length} của{" "}
                {sortedAndFilteredProducts.length} kết quả
              </p>

              <div className="custom-dropdown" ref={dropdownRef}>
                <div
                  className="selected"
                  onClick={() => setIsDropdownOpen((o) => !o)}
                >
                  {getSortLabel(sortOption)} &#9662;
                </div>
                {isDropdownOpen && (
                  <ul className="options">
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

          {renderContent()}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
};

export default FindProductPage;
