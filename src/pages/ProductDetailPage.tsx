import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import "../assets/css/detailProduct.css";
import type { GetProductDetailResType } from "../models/product.model";
import http from "../api/http";
import type { SKUType } from "../models/shared/shared-sku.model";
import { languageUtils } from "../utils/language";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-toastify";
import FeedbackReadonlyComponent from "../components/FeedbackReadonlyComponent";

// Review interfaces
interface MediaItem {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  reviewId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  avatar: string | null;
}

interface ReviewData {
  id: number;
  content: string;
  rating: number;
  orderId: number;
  productId: number;
  userId: number;
  updateCount: number;
  createdAt: string;
  updatedAt: string;
  medias: MediaItem[];
  user: User;
}

interface ReviewsResponse {
  data: ReviewData[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Biến để lưu trữ socket instance bên ngoài component để không bị khởi tạo lại mỗi lần render
let socket: Socket;

const ProductDetailPage: React.FC = () => {
  // Auth store để kiểm tra trạng thái đăng nhập
  const { user, isInitialized } = useAuthStore();

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
  // State cho reviews
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);

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
        // Nếu API trả về lỗi (ví dụ: 404 Not Found), đặt cờ sản phẩm đã bị xóa
        setIsDeleted(true);
      }
    };
    fetchProduct();
  }, [productId]);

  // Effect để quản lý vòng đời của kết nối WebSocket
  useEffect(() => {
    // Đợi auth store được khởi tạo
    if (!isInitialized) {
      console.log("Đang khởi tạo auth store...");
      return;
    }

    // Chỉ khởi tạo kết nối nếu người dùng đã đăng nhập
    if (!user) {
      console.log("Người dùng chưa đăng nhập, không khởi tạo WebSocket.");
      return;
    }

    // Khởi tạo socket với credentials để gửi HTTP-only cookies
    socket = io("https://api-pixcam.hacmieu.xyz/product", {
      withCredentials: true, // 🔑 Quan trọng: gửi HTTP-only cookies
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
      // Nếu lỗi là "Thiếu Authentication", có thể cookies đã hết hạn
      if (err.message.includes("Authentication")) {
        console.log("Authentication failed, user may need to login again");
      }
    });

    // Các listener khác không đổi...
    socket.on("productUpdated", (updatedProduct: GetProductDetailResType) => {
      setProduct(updatedProduct);
    });

    socket.on("productDeleted", () => {
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
  }, [productId, isInitialized, user]);

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

  // Helper function để lấy translation content theo ngôn ngữ hiện tại
  const getTranslatedContent = (product: GetProductDetailResType) => {
    const currentLang = languageUtils.getCurrentLanguage();
    const translation = product.productTranslations.find(
      (trans) => trans.languageId === currentLang
    );

    return {
      name: translation?.name || product.name,
      description: translation?.description || "",
    };
  };

  // Hàm tính phần trăm giảm giá (giống SalePage)
  const calculateDiscountPercentage = (
    basePrice: number,
    virtualPrice: number
  ): number => {
    // basePrice: giá bán thực tế (thấp hơn)
    // virtualPrice: giá ảo (cao hơn để tạo cảm giác giảm giá)
    // Sale khi virtualPrice > basePrice
    if (virtualPrice <= 0 || basePrice <= 0 || virtualPrice <= basePrice)
      return 0;
    return Math.round(((virtualPrice - basePrice) / virtualPrice) * 100);
  };

  // Hàm xử lý tăng/giảm số lượng, kiểm tra với stock của SKU đã chọn
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (selectedSku && newQuantity >= 1 && newQuantity <= selectedSku.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSku || selectedSku.stock <= 0) {
      toast.error(
        "Sản phẩm này đã hết hàng hoặc bạn chưa chọn đầy đủ. Vui lòng thử lại."
      );
      return;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      // Gọi API để thêm vào giỏ hàng
      await http.post("/cart", {
        skuId: selectedSku.id,
        quantity: quantity,
      });

      toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  // Fetch reviews function
  const fetchReviews = async (page: number = 1) => {
    if (!productId) return;

    setReviewsLoading(true);
    try {
      const response = await http.get(
        `/reviews/products/${productId}?page=${page}&limit=10`
      );
      const reviewsData: ReviewsResponse = response.data;

      if (page === 1) {
        setReviews(reviewsData.data);
      } else {
        setReviews((prev) => [...prev, ...reviewsData.data]);
      }

      setTotalPages(reviewsData.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Effect to fetch reviews when productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews(1);
    }
  }, [productId]);

  const handleLoadMoreReviews = () => {
    if (currentPage < totalPages) {
      fetchReviews(currentPage + 1);
    }
  };

  const toggleShowAllReviews = () => {
    setShowAllReviews(!showAllReviews);
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

  // Lấy nội dung đã dịch
  const translatedContent = getTranslatedContent(product);

  // Tính toán giảm giá dựa trên basePrice và virtualPrice
  const discountPercentage = calculateDiscountPercentage(
    product.basePrice,
    product.virtualPrice
  );
  const hasDiscount = discountPercentage > 0;

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
          <h2 className="title_inf_products">{translatedContent.name}</h2>

          {/* ✅ Hiển thị giá với logic giảm giá */}
          <div className="price_inf_products">
            {hasDiscount ? (
              <>
                <span className="price-original">
                  {formatCurrency(product.virtualPrice)}
                </span>
                <span className="price-sale">
                  {selectedSku
                    ? formatCurrency(selectedSku.price)
                    : formatCurrency(product.basePrice)}
                </span>
                <span className="discount-badge">-{discountPercentage}%</span>
              </>
            ) : (
              <span>
                {selectedSku
                  ? formatCurrency(selectedSku.price)
                  : formatCurrency(product.basePrice)}
              </span>
            )}
          </div>

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

      {/* Description block - Separate from main content */}
      {translatedContent.description && (
        <div className="description_inf_products">
          <h3 className="description_title">Mô tả sản phẩm</h3>
          <div className="description_content">
            <p>{translatedContent.description}</p>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews_section">
        <div className="reviews_header">
          <h3 className="reviews_title">Đánh giá sản phẩm</h3>
          {reviews.length > 0 && (
            <span className="reviews_count">({reviews.length} đánh giá)</span>
          )}
        </div>

        {reviewsLoading && reviews.length === 0 ? (
          <div className="reviews_loading">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="reviews_empty">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          <div className="reviews_list">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
              <div key={review.id} className="review_item_compact">
                <FeedbackReadonlyComponent
                  reviewData={review}
                  isCompact={true}
                />
              </div>
            ))}

            {reviews.length > 3 && !showAllReviews && (
              <button
                onClick={toggleShowAllReviews}
                className="btn_show_more_reviews"
              >
                Xem thêm {reviews.length - 3} đánh giá
              </button>
            )}

            {showAllReviews && reviews.length > 3 && (
              <button
                onClick={toggleShowAllReviews}
                className="btn_show_less_reviews"
              >
                Thu gọn đánh giá
              </button>
            )}

            {showAllReviews && currentPage < totalPages && (
              <button
                onClick={handleLoadMoreReviews}
                className="btn_load_more_reviews"
                disabled={reviewsLoading}
              >
                {reviewsLoading ? "Đang tải..." : "Tải thêm đánh giá"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
