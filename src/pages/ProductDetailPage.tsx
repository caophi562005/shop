import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/detailProduct.css";

// --- Dữ liệu mẫu (thay thế cho việc lấy từ CSDL) ---
const mockProduct = {
  id: 1,
  name: "Áo Sơ Mi Lịch Lãm",
  price: 750000,
  price_sale: 525000,
  discount_percent: 30,
  quantity: 15,
  detail:
    "Chất liệu: Cotton lụa cao cấp.\nKiểu dáng: Slim fit, tôn dáng.\nXuất xứ: Việt Nam.",
  imgURL_1:
    "https://5sfashion.vn/storage/upload/images/ckeditor/srPVq8SGZDDbIOv8QaewiyT0wcuMEMTNveWQF0pd.jpg",
  imgURL_2:
    "https://pubcdn.ivymoda.com/files/news/2023/08/22/68b06576539133beecb142def84a2912.png",
  imgURL_3:
    "https://bizweb.dktcdn.net/100/360/581/files/cac-phong-cach-thoi-trang-nam-13.jpg?v=1730253672558",
  imgURL_4:
    "https://tamanh.net/wp-content/uploads/2023/06/thuong-hieu-thoi-trang-nam-noi-tieng.jpg", // Ảnh 4 có thể trống
  colors: ["Trắng", "Xanh nhạt", "Đen"],
  sizes: [
    { id: 1, name: "S" },
    { id: 2, name: "M" },
    { id: 3, name: "L" },
  ],
};

const mockRelatedProducts = [
  /* ...dữ liệu sản phẩm liên quan... */
];
const mockFeedbacks = [
  /* ...dữ liệu đánh giá... */
];

const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState(mockProduct);
  const [mainImage, setMainImage] = useState(product.imgURL_1);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].name);

  // Hàm để format tiền tệ
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Đã thêm vào giỏ: ${quantity} sản phẩm "${product.name}", Màu: ${selectedColor}, Size: ${selectedSize}`
    );
  };

  return (
    <div className="content">
      <div className="content_detailProduct">
        <div className="img_product">
          <img
            id="main-image"
            src={mainImage}
            alt={product.name}
            className="image_shirt"
          />
          <div className="image_detail_product">
            {[
              product.imgURL_1,
              product.imgURL_2,
              product.imgURL_3,
              product.imgURL_4,
            ]
              .filter((url) => url) // Lọc bỏ các URL rỗng
              .map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} - thumbnail ${index + 1}`}
                  className="image_shirt_detail"
                  style={{ cursor: "pointer" }}
                  onClick={() => setMainImage(url)}
                />
              ))}
          </div>
        </div>

        <div className="inf_product">
          <h2 className="title_inf_products">{product.name}</h2>
          <p className="price_inf_products">
            {product.price_sale ? (
              <>
                <span className="price-original">
                  {formatCurrency(product.price)}
                </span>
                &nbsp;
                <span className="price-sale">
                  {formatCurrency(product.price_sale)}
                </span>
                &nbsp;
                <span
                  style={{
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    padding: "2px 6px",
                    fontSize: "0.9rem",
                    borderRadius: "3px",
                  }}
                >
                  Giảm {product.discount_percent}%
                </span>
              </>
            ) : (
              <span>{formatCurrency(product.price)}</span>
            )}
          </p>
          <p className="status_inf_products">
            Tình trạng:{" "}
            <span
              className="status_color_inf"
              style={{ color: product.quantity > 0 ? "inherit" : "red" }}
            >
              {product.quantity > 0 ? "còn hàng" : "hết hàng"}
            </span>
          </p>

          {product.colors.length > 0 && (
            <>
              <p className="color_inf_products">Màu sắc:</p>
              <div className="item_box_color">
                {product.colors.map((color, index) => (
                  <div key={index} className="color-item">
                    <input
                      type="radio"
                      id={`color_${index}`}
                      name="selected_color"
                      value={color}
                      checked={selectedColor === color}
                      onChange={() => setSelectedColor(color)}
                    />
                    <label htmlFor={`color_${index}`}>
                      <span
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                      ></span>
                      <span className="color-name">{color}</span>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {product.sizes.length > 0 && (
            <>
              <p className="size_inf_products">Kích thước:</p>
              <div className="box_option_size">
                {product.sizes.map((size, index) => (
                  <div key={index} className="size-item">
                    <input
                      type="radio"
                      id={`size_${index}`}
                      name="selected_size"
                      value={size.name}
                      checked={selectedSize === size.name}
                      onChange={() => setSelectedSize(size.name)}
                    />
                    <label htmlFor={`size_${index}`}>{size.name}</label>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="quantity_inf_products">Số lượng:</p>
          <div className="quantity_box">
            <div className="detail_quatity">
              <button
                className="totalProducts"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <input id="input-qty" type="text" value={quantity} readOnly />
              <button
                className="totalProducts"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <form onSubmit={handleAddToCart}>
              <button
                type="submit"
                className="btn_quantity_box"
                disabled={product.quantity <= 0}
              >
                {product.quantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </button>
            </form>
          </div>

          <div className="inf_detailProducts">
            <p className="title_detai_products">Chi tiết sản phẩm</p>
            <ul className="box_detail_products_inf">
              {product.detail.split("\n").map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Các phần đánh giá và sản phẩm liên quan có thể được thêm vào đây */}
    </div>
  );
};

export default ProductDetailPage;
