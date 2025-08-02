import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import "../assets/css/detailProduct.css";
import type { GetProductDetailResType } from "../models/product.model"; // Đảm bảo bạn đã định nghĩa các type này
import http from "../api/http";
import type { SKUType } from "../models/shared/shared-sku.model";

// Biến để lưu trữ socket instance bên ngoài component để không bị khởi tạo lại mỗi lần render
let socket: Socket;

const ProductDetailPage: React.FC = () => {
  // State cho dữ liệu sản phẩm, cho phép null để xử lý trường hợp bị xóa
  const [product, setProduct] = useState<GetProductDetailResType | null>();
  // State để theo dõi tình trạng sản phẩm có bị xóa hay không
  const [isDeleted, setIsDeleted] = useState(false);
  // State cho số lượng người dùng muốn mua
  const [quantity, setQuantity] = useState(1);
  // State cho ảnh chính đang hiển thị
  const [mainImage, setMainImage] = useState<string>("");
  // State cho các lựa chọn của người dùng
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  // State cho SKU tương ứng với lựa chọn
  const [selectedSku, setSelectedSku] = useState<SKUType | null>(null);

  const { productId } = useParams<{ productId: string }>();

  // Effect để fetch dữ liệu sản phẩm ban đầu khi component được mount hoặc productId thay đổi
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await http.get(`/products/${productId}`);
        const data = res.data as GetProductDetailResType;
        setProduct(data);

        // Khởi tạo các giá trị mặc định sau khi có dữ liệu
        if (data.images.length > 0) {
          setMainImage(data.images[0]);
        }
        if (data.variants.length > 0) {
          setSelectedColor(data.variants[0]?.options?.[0] || "");
          setSelectedSize(data.variants[1]?.options?.[0] || "");
        }
      } catch (error) {
        console.log(error);
        // Nếu API trả về lỗi (ví dụ: 404 Not Found), đặt cờ sản phẩm đã bị xóa
        setIsDeleted(true);
      }
    };
    fetchProduct();
  }, [productId]);

  // Effect để quản lý vòng đời của kết nối WebSocket
  useEffect(() => {
    // Lấy access token từ localStorage (hoặc bất cứ nơi nào bạn lưu trữ)
    const accessToken = localStorage.getItem("accessToken");

    // Chỉ khởi tạo kết nối nếu người dùng đã đăng nhập (có token)
    if (!accessToken) {
      console.log("Người dùng chưa đăng nhập, không khởi tạo WebSocket.");
      return; // Dừng lại tại đây
    }

    // Khởi tạo socket với header xác thực
    socket = io("http://localhost:3003/product", {
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`, // 🔑 Gửi token lên đây
      },
    });

    // Listener khi kết nối thành công
    socket.on("connect", () => {
      console.log("✅ WebSocket connected successfully! ID:", socket.id);
      if (productId) {
        socket.emit("joinProductRoom", Number(productId));
      }
    });

    // Listener để bắt lỗi kết nối
    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err.message);
      // Nếu lỗi là "Thiếu Authentication", có thể token đã hết hạn
      if (err.message.includes("Authentication")) {
        // Tại đây bạn có thể xử lý việc đăng xuất người dùng hoặc refresh token
      }
    });

    // Các listener khác không đổi...
    socket.on("productUpdated", (updatedProduct: GetProductDetailResType) => {
      console.log(
        "Sản phẩm được cập nhật theo thời gian thực:",
        updatedProduct
      );
      setProduct(updatedProduct);
    });

    socket.on("productDeleted", (data: { message: string }) => {
      console.log(data.message);
      setIsDeleted(true);
    });

    // Hàm dọn dẹp không đổi
    return () => {
      if (socket) {
        if (productId) {
          socket.emit("leaveProductRoom", Number(productId));
        }
        socket.disconnect();
      }
    };
  }, [productId]);

  // Effect để tìm SKU tương ứng mỗi khi lựa chọn của người dùng thay đổi
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const skuValue = `${selectedColor}-${selectedSize}`;
      const foundSku = product.skus.find((sku) => sku.value === skuValue);
      setSelectedSku(foundSku || null);
      setQuantity(1); // Reset số lượng về 1 mỗi khi thay đổi phiên bản
    }
  }, [product, selectedColor, selectedSize]);

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Hàm xử lý tăng/giảm số lượng, kiểm tra với stock của SKU đã chọn
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (selectedSku && newQuantity >= 1 && newQuantity <= selectedSku.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || selectedSku.stock <= 0) {
      alert(
        "Sản phẩm này đã hết hàng hoặc bạn chưa chọn đầy đủ. Vui lòng thử lại."
      );
      return;
    }
    alert(
      `Đã thêm vào giỏ: ${quantity} sản phẩm "${product?.name}", Màu: ${selectedColor}, Size: ${selectedSize}`
    );
  };

  // --- RENDER LOGIC ---

  if (isDeleted) {
    return (
      <div className="content" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Sản phẩm không tồn tại</h2>
        <p>Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không có sẵn.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
    );
  }

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
            {product.images.filter(Boolean).map((url, index) => (
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
            <span>{formatCurrency(product.virtualPrice)}</span>
          </p>

          <p className="status_inf_products">
            Tình trạng:{" "}
            <span className="status_color_inf">
              {selectedSku
                ? selectedSku.stock > 0
                  ? `Còn hàng (Tồn kho: ${selectedSku.stock})`
                  : "Hết hàng"
                : "Vui lòng chọn đầy đủ tùy chọn"}
            </span>
          </p>

          {product.variants[0]?.options.length > 0 && (
            <>
              <p className="color_inf_products">Màu sắc:</p>
              <div className="item_box_color">
                {product.variants[0].options.map((color, index) => (
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
                      <span className="color-name">{color}</span>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {product.variants[1]?.options.length > 0 && (
            <>
              <p className="size_inf_products">Kích thước:</p>
              <div className="box_option_size">
                {product.variants[1].options.map((size, index) => (
                  <div key={index} className="size-item">
                    <input
                      type="radio"
                      id={`size_${index}`}
                      name="selected_size"
                      value={size}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                    />
                    <label htmlFor={`size_${index}`}>{size}</label>
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
                onClick={() => handleQuantityChange(-1)}
                disabled={!selectedSku}
              >
                −
              </button>
              <input id="input-qty" type="text" value={quantity} readOnly />
              <button
                className="totalProducts"
                onClick={() => handleQuantityChange(1)}
                disabled={!selectedSku}
              >
                +
              </button>
            </div>
            <form onSubmit={handleAddToCart}>
              <button
                type="submit"
                className="btn_quantity_box"
                disabled={!selectedSku || selectedSku.stock <= 0}
              >
                {!selectedSku || selectedSku.stock > 0
                  ? "Thêm vào giỏ hàng"
                  : "Hết hàng"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
