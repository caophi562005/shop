import React, { useState, useEffect } from "react";
import type {
  ProductIncludeTranslationType,
  UpdateProductBodyType,
  GetProductDetailResType,
} from "../models/product.model";
import type { VariantsType } from "../models/shared/shared-product.model";
import http from "../api/http";
import axios from "axios";
import "../assets/css/editProduct.css";

// Local interface for form state với string prices
interface EditProductFormData {
  name: string;
  publishedAt: string | null;
  basePrice: string;
  virtualPrice: string;
  images: string[];
  categories: number[];
  variants: VariantsType;
  skus: LocalSKUType[];
}

// Local SKU type with string price
interface LocalSKUType {
  value: string;
  price: string; // Changed from number to string
  stock: number;
  image: string;
}

type Props = {
  isOpen: boolean;
  product: ProductIncludeTranslationType | GetProductDetailResType | null;
  isLoading?: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const EditProductModal: React.FC<Props> = ({
  isOpen,
  product,
  isLoading = false,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<EditProductFormData>({
    name: "",
    publishedAt: null,
    basePrice: "0",
    virtualPrice: "0",
    images: [""],
    categories: [0],
    variants: [
      { value: "Màu sắc", options: [""] },
      { value: "Kích thước", options: [""] },
    ],
    skus: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesInput, setCategoriesInput] = useState<string>("");
  const [hasExistingSKUs, setHasExistingSKUs] = useState<boolean>(false);

  // Upload states
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {}
  );

  useEffect(() => {
    // Chỉ populate form khi:
    // 1. Modal đang mở
    // 2. Có product data
    // 3. Không đang loading (đảm bảo data đã được fetch xong)
    if (product && isOpen && !isLoading) {
      const categoriesIds = product.categories.map((cat) => cat.id);
      setCategoriesInput(categoriesIds.join("-"));

      // Type guard để check xem có SKUs hay không
      const hasSkus =
        "skus" in product && product.skus && product.skus.length > 0;

      // Sử dụng SKU từ API thay vì tự generate
      const existingSKUs: LocalSKUType[] = hasSkus
        ? (product as any).skus.map((sku: any) => ({
            value: sku.value,
            price: sku.price.toString(), // Convert to string
            stock: sku.stock,
            image: sku.image || "",
          }))
        : generateSKUs(product.variants); // Fallback nếu không có SKU

      setFormData({
        name: product.name,
        publishedAt: product.publishedAt
          ? product.publishedAt.toString()
          : null,
        basePrice: product.basePrice.toString(),
        virtualPrice: product.virtualPrice.toString(),
        images: product.images.length > 0 ? product.images : [""],
        categories: product.categories.map((cat: any) => cat.id),
        variants:
          product.variants.length > 0
            ? product.variants
            : [
                { value: "Màu sắc", options: [""] },
                { value: "Kích thước", options: [""] },
              ],
        skus: existingSKUs,
      });

      // Set flag để không auto-generate SKU
      setHasExistingSKUs(hasSkus);

      console.log("Product has SKUs:", hasSkus);
      console.log("Populated form with SKUs:", existingSKUs);
    }
  }, [product, isOpen, isLoading]); // Thêm isLoading vào dependency array

  function generateSKUs(variants: VariantsType): LocalSKUType[] {
    function getCombinations(arrays: string[][]): string[] {
      return arrays.reduce(
        (acc, curr) =>
          acc.flatMap((x) => curr.map((y) => `${x}${x ? "-" : ""}${y}`)),
        [""]
      );
    }

    const options = variants.map((variant) => variant.options);

    const combinations = getCombinations(options);

    return combinations.map((value) => ({
      value,
      price: "0", // String instead of number
      stock: 100,
      image: "",
    }));
  }

  // Update SKUs when variants or base price change (chỉ khi không có existing SKU)
  useEffect(() => {
    if (isOpen && !hasExistingSKUs) {
      const newSKUs = generateSKUs(formData.variants);
      setFormData((prev) => ({ ...prev, skus: newSKUs }));
      console.log("Auto-generated SKUs:", newSKUs);
    }
  }, [formData.variants, formData.basePrice, isOpen, hasExistingSKUs]);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        publishedAt: null,
        basePrice: "0",
        virtualPrice: "0",
        images: [""],
        categories: [0],
        variants: [
          { value: "Màu sắc", options: [""] },
          { value: "Kích thước", options: [""] },
        ],
        skus: [],
      });
      setCategoriesInput("");
      setHasExistingSKUs(false);
      setUploadingIndex(null);
      setUploadProgress({});
    }
  }, [isOpen]);

  // Debug: Log khi SKUs thay đổi
  useEffect(() => {
    console.log("SKUs updated:", formData.skus);
    console.log("Has existing SKUs:", hasExistingSKUs);
  }, [formData.skus, hasExistingSKUs]);

  const parseCategoriesString = (value: string): number[] => {
    if (!value.trim()) return [0];
    return value
      .split("-")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  };

  const handleInputChange = (field: string, value: any) => {
    // Trim string values to remove leading/trailing spaces
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    setFormData((prev) => ({ ...prev, [field]: trimmedValue }));
  };

  const handleVariantChange = (
    variantIndex: number,
    field: "value" | "options",
    value: any
  ) => {
    const newVariants = [...formData.variants];
    if (field === "value") {
      // Trim variant value
      newVariants[variantIndex].value =
        typeof value === "string" ? value.trim() : value;
    } else {
      newVariants[variantIndex].options = value;
    }
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleVariantOptionChange = (
    variantIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newVariants = [...formData.variants];
    // Trim variant option value
    newVariants[variantIndex].options[optionIndex] = value.trim();
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariantOption = (variantIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options.push("");
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...formData.variants];
    if (newVariants[variantIndex].options.length > 1) {
      newVariants[variantIndex].options.splice(optionIndex, 1);
      setFormData((prev) => ({ ...prev, variants: newVariants }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    // Trim image URL
    newImages[index] = value.trim();
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleImageUpload = (index: number, file: File) => {
    setUploadingIndex(index);
    setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

    // Follow exact same flow as Upload.tsx
    http
      .post(
        "/media/images/upload/presigned-url",
        {
          filename: file.name,
          filesize: file.size,
        },
        { withCredentials: false }
      )
      .then((res) => {
        // Store URLs first (matching Upload.tsx logic)
        const url = res.data.url;
        const presignedUrl = res.data.presignedUrl;

        // Return axios.put to chain promises (matching Upload.tsx)
        return axios
          .put(presignedUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
            withCredentials: false, // Fix CORS issue with S3
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress((prev) => ({ ...prev, [index]: progress }));
              }
            },
          })
          .then(() => {
            // Return the final URL after successful upload
            return url;
          });
      })
      .then((finalUrl) => {
        // Update input form với URL sau khi upload thành công
        handleImageChange(index, finalUrl);

        setUploadingIndex(null);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        alert("Upload thất bại! Vui lòng thử lại.");
        setUploadingIndex(null);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      });
  };

  const handleSKUChange = (
    skuIndex: number,
    field: keyof LocalSKUType,
    value: any
  ) => {
    const newSKUs = [...formData.skus];
    // Trim string values (price, value, image)
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    newSKUs[skuIndex] = { ...newSKUs[skuIndex], [field]: trimmedValue };
    setFormData((prev) => ({ ...prev, skus: newSKUs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    setLoading(true);

    try {
      const submitData: UpdateProductBodyType = {
        ...formData,
        basePrice: Number(formData.basePrice) || 0,
        virtualPrice: Number(formData.virtualPrice) || 0,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt)
          : null,
        images: formData.images.filter((img) => img.trim() !== ""),
        skus: formData.skus.map((sku) => ({
          ...sku,
          price: Number(sku.price) || 0,
        })),
      };

      await http.put(`/manage-product/products/${product.id}`, submitData);

      onSuccess("Cập nhật sản phẩm thành công");
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  // Hiển thị loading spinner khi đang fetch data
  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal modal-large">
          <div className="modal-header">
            <h3>Đang tải thông tin sản phẩm...</h3>
          </div>
          <div
            className="modal-body"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <div className="loading-spinner">
              <i
                className="fas fa-spinner fa-spin"
                style={{ fontSize: "2rem", color: "#ee5022" }}
              ></i>
              <p style={{ marginTop: "1rem", color: "#666" }}>
                Đang tải dữ liệu sản phẩm...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chỉnh sửa sản phẩm #{product.id}</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>ID</label>
              <input type="text" value={product.id} disabled />
            </div>
            <div className="form-group">
              <label>Ngày tạo</label>
              <input
                type="text"
                value={formatDate(String(product.createdAt))}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tên sản phẩm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá gốc *</label>
              <input
                type="text"
                value={formData.basePrice}
                onChange={(e) => handleInputChange("basePrice", e.target.value)}
                required
                disabled={loading}
                placeholder="Nhập giá gốc"
              />
            </div>
            <div className="form-group">
              <label>Giá ảo *</label>
              <input
                type="text"
                value={formData.virtualPrice}
                onChange={(e) =>
                  handleInputChange("virtualPrice", e.target.value)
                }
                required
                disabled={loading}
                placeholder="Nhập giá ảo"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ngày xuất bản</label>
            <input
              type="datetime-local"
              value={String(formData.publishedAt).slice(0, 16) || ""}
              onChange={(e) =>
                handleInputChange(
                  "publishedAt",
                  e.target.value ? new Date(e.target.value).toISOString() : null
                )
              }
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Hình ảnh</label>
            {formData.images.map((image, index) => (
              <div key={index} className="field-group">
                <input
                  type="url"
                  placeholder="URL hình ảnh"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  disabled={loading || uploadingIndex === index}
                />

                {/* Upload button */}
                <label className="btn-upload">
                  📁 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(index, file);
                      }
                    }}
                    disabled={loading || uploadingIndex === index}
                    style={{ display: "none" }}
                  />
                </label>

                {/* Progress bar */}
                {uploadingIndex === index && (
                  <div className="upload-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress[index] || 0}%` }}
                    ></div>
                    <span>{uploadProgress[index] || 0}%</span>
                  </div>
                )}

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeImageField(index)}
                    disabled={loading || uploadingIndex === index}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={addImageField}
              disabled={loading}
            >
              + Thêm hình ảnh
            </button>
          </div>

          <div className="form-group">
            <label>Danh mục ID * (Cách nhau bằng dấu -)</label>
            <input
              type="text"
              placeholder="Ví dụ: 1-2-3"
              value={categoriesInput}
              onChange={(e) => {
                setCategoriesInput(e.target.value);
                handleInputChange(
                  "categories",
                  parseCategoriesString(e.target.value)
                );
              }}
              required
              disabled={loading}
            />
          </div>

          {formData.variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="form-group">
              <label>{variant.value}</label>
              <input
                type="text"
                value={variant.value}
                onChange={(e) =>
                  handleVariantChange(variantIndex, "value", e.target.value)
                }
                placeholder="Tên biến thể"
                disabled={loading}
                style={{ marginBottom: "8px" }}
              />

              {variant.options.map((option, optionIndex) => (
                <div key={optionIndex} className="field-group">
                  <input
                    type="text"
                    placeholder="Tùy chọn"
                    value={option}
                    onChange={(e) =>
                      handleVariantOptionChange(
                        variantIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                  {variant.options.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() =>
                        removeVariantOption(variantIndex, optionIndex)
                      }
                      disabled={loading}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-add"
                onClick={() => addVariantOption(variantIndex)}
                disabled={loading}
              >
                + Thêm tùy chọn
              </button>
            </div>
          ))}

          <div className="form-group">
            <label>SKUs (Tự động tạo)</label>
            <div className="sku-list">
              {formData.skus.map((sku, index) => (
                <div key={index} className="sku-item">
                  <h5>SKU: {sku.value}</h5>
                  <div className="sku-fields">
                    <input
                      type="text"
                      placeholder="Giá"
                      value={sku.price}
                      onChange={(e) =>
                        handleSKUChange(index, "price", e.target.value)
                      }
                      disabled={loading}
                    />
                    <input
                      type="number"
                      placeholder="Tồn kho"
                      value={sku.stock}
                      onChange={(e) =>
                        handleSKUChange(index, "stock", Number(e.target.value))
                      }
                      disabled={loading}
                    />
                    <input
                      type="url"
                      placeholder="Hình ảnh SKU"
                      value={sku.image}
                      onChange={(e) =>
                        handleSKUChange(index, "image", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Người tạo</label>
              <input
                type="text"
                value={product.createdById || "N/A"}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Người cập nhật</label>
              <input
                type="text"
                value={product.updatedById || "N/A"}
                disabled
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
