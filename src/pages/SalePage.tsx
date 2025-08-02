// SalePage.tsx
import React, { useState, useMemo } from "react";
import "../assets/css/home.css";
import "../assets/css/Top.css";
import "../assets/css/style.css";
import "../assets/css/Sale.css";
import "../assets/css/Product.css";

// --- TYPE DEFINITIONS ---
type Product = {
  id: number;
  name: string;
  price: number;
  imgURL_1: string;
  sale_name: string | null;
  createdAt: Date;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// --- FAKE DATA ---
const createMockProducts = (): Product[] => {
  const products: Product[] = [];
  const productNames = [
    "AstroCam Pro",
    "GalaxyHunter Z1",
    "NightSky Observer",
    "Comet Seeker",
    "Orion's View",
    "Starlight Express",
    "PixelNova 5000",
    "DeepSpace Imager",
    "Solaris Scope",
    "LunarLens XT",
    "Nebula Navigator",
    "CosmoCapture",
  ];
  for (let i = 1; i <= 30; i++) {
    const hasSale = Math.random() > 0.5;
    products.push({
      id: i,
      name: `${productNames[i % productNames.length]} #${i}`,
      price: Math.floor(Math.random() * (2000 - 500 + 1) + 500) * 10000,
      imgURL_1: `https://picsum.photos/seed/${i}/400/400`,
      sale_name: hasSale ? `${Math.floor(Math.random() * 5 + 1) * 10}%` : null,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    });
  }
  return products;
};
const allProducts: Product[] = createMockProducts();

// --- HELPER FUNCTIONS ---
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
};
const getDiscountedPrice = (price: number, saleBadge: string): number => {
  const percentage = parseFloat(saleBadge.replace("%", ""));
  if (isNaN(percentage)) return price;
  return price * (1 - percentage / 100);
};

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunkedArr: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
};

// --- COMPONENT: Pagination ---
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const range = 2;
  const pages: React.ReactNode[] = [];

  // Prev
  pages.push(
    currentPage > 1 ? (
      <a key="prev" onClick={() => onPageChange(currentPage - 1)}>
        <i className="fas fa-angle-left"></i>
      </a>
    ) : (
      <span key="prev" className="disabled">
        <i className="fas fa-angle-left"></i>
      </span>
    )
  );

  // First + ellipsis
  if (currentPage > range + 2) {
    pages.push(
      <a key={1} onClick={() => onPageChange(1)}>
        1
      </a>
    );
    pages.push(
      <span key="start-ellipsis" className="disabled">
        ...
      </span>
    );
  }

  // Middle pages
  for (
    let i = Math.max(1, currentPage - range);
    i <= Math.min(totalPages, currentPage + range);
    i++
  ) {
    pages.push(
      i === currentPage ? (
        <span key={i} className="active">
          {i}
        </span>
      ) : (
        <a key={i} onClick={() => onPageChange(i)}>
          {i}
        </a>
      )
    );
  }

  // Last + ellipsis
  if (currentPage < totalPages - (range + 1)) {
    pages.push(
      <span key="end-ellipsis" className="disabled">
        ...
      </span>
    );
    pages.push(
      <a key={totalPages} onClick={() => onPageChange(totalPages)}>
        {totalPages}
      </a>
    );
  }

  // Next
  pages.push(
    currentPage < totalPages ? (
      <a key="next" onClick={() => onPageChange(currentPage + 1)}>
        <i className="fas fa-angle-right"></i>
      </a>
    ) : (
      <span key="next" className="disabled">
        <i className="fas fa-angle-right"></i>
      </span>
    )
  );

  return <div className="pagination">{pages}</div>;
};

// --- COMPONENT: SalePage ---
const SalePage: React.FC = () => {
  const [sortOption, setSortOption] = useState<string>("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const sortOptions: Record<string, string> = {
    "": "Thứ tự mặc định",
    price_asc: "Giá: thấp → cao",
    price_desc: "Giá: cao → thấp",
    latest: "Mới nhất",
  };

  const sortedProducts = useMemo(() => {
    const arr = [...allProducts];
    switch (sortOption) {
      case "price_asc":
        arr.sort((a, b) => {
          const pa = a.sale_name
            ? getDiscountedPrice(a.price, a.sale_name)
            : a.price;
          const pb = b.sale_name
            ? getDiscountedPrice(b.price, b.sale_name)
            : b.price;
          return pa - pb;
        });
        break;
      case "price_desc":
        arr.sort((a, b) => {
          const pa = a.sale_name
            ? getDiscountedPrice(a.price, a.sale_name)
            : a.price;
          const pb = b.sale_name
            ? getDiscountedPrice(b.price, b.sale_name)
            : b.price;
          return pb - pa;
        });
        break;
      case "latest":
        arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      default:
        arr.sort((a, b) => a.id - b.id);
    }
    return arr;
  }, [sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );
  const chunkedProducts = chunkArray(currentProducts, 4);

  const handleSortChange = (
    value: string,
    e: React.MouseEvent<HTMLLIElement>
  ) => {
    e.stopPropagation();
    setSortOption(value);
    setCurrentPage(1);
    setDropdownOpen(false);
  };

  return (
    <main>
      <div className="content">
        <div className="content_top">
          <div className="contentProducts_navigate">
            <div className="navigate_shopAll">
              <p className="title_navigate">
                <span className="home_navigate">TRANG CHỦ</span> / DANH MỤC SALE
              </p>
            </div>
            <div className="filter_shopAlll">
              <p>
                Hiển thị{" "}
                {currentProducts.length === 0
                  ? 0
                  : (currentPage - 1) * productsPerPage + 1}
                –{(currentPage - 1) * productsPerPage + currentProducts.length}{" "}
                của {sortedProducts.length} kết quả
              </p>
              <div className="custom-dropdown">
                <div
                  className="selected"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  {sortOptions[sortOption]} &#9662;
                </div>
                {isDropdownOpen && (
                  <ul className="options">
                    {Object.entries(sortOptions).map(([value, label]) => (
                      <li
                        key={value}
                        onClick={(e) => handleSortChange(value, e)}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {currentProducts.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Chưa có sản phẩm nào.
            </p>
          ) : (
            <div className="product_top">
              {chunkedProducts.map((row, rowIndex) => (
                <div className="products_home" key={rowIndex}>
                  {row.map((product) => {
                    const priceDisplay = formatCurrency(product.price);
                    let priceSaleDisplay: string | null = null;
                    if (product.sale_name) {
                      const discounted = getDiscountedPrice(
                        product.price,
                        product.sale_name
                      );
                      priceSaleDisplay = formatCurrency(discounted);
                    }
                    return (
                      <div className="item_products_home" key={product.id}>
                        <div className="image_home_item">
                          {product.sale_name && (
                            <div className="product_sale">
                              <p className="text_products_sale">
                                -{product.sale_name}
                              </p>
                            </div>
                          )}
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
                          {priceSaleDisplay ? (
                            <>
                              <span className="price-original">
                                {priceDisplay}
                              </span>
                              &nbsp;
                              <span className="price-sale">
                                {priceSaleDisplay}
                              </span>
                            </>
                          ) : (
                            <span>{priceDisplay}</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
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

export default SalePage;
