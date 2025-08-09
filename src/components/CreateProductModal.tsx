import React, { useState, useEffect } from "react";
import type { CreateProductBodyType } from "../models/product.model";
import type { VariantsType } from "../models/shared/shared-product.model";
import type { UpsertSKUType } from "../models/sku.model";
import type { SKUType } from "../models/shared/shared-sku.model";
import http from "../api/http";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onRefresh: () => void;
};

const CreateProductModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<CreateProductBodyType>({
    name: "",
    publishedAt: null,
    basePrice: 0,
    virtualPrice: 0,
    images: [""],
    categories: [0],
    variants: [
      { value: "Màu sắc", options: [""] },
      { value: "Kích thước", options: [""] },
    ],
    skus: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  function generateSKUs(variants: VariantsType): UpsertSKUType[] {
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
      price: 0,
      stock: 100,
      image: "",
    }));
  }

  // Update SKUs when variants or base price change
  useEffect(() => {
    const newSKUs = generateSKUs(formData.variants);
    setFormData((prev) => ({ ...prev, skus: newSKUs }));
  }, [formData.variants, formData.basePrice]);

  const parseCategoriesString = (value: string): number[] => {
    if (!value.trim()) return [0];
    return value
      .split("-")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (
    variantIndex: number,
    field: "value" | "options",
    value: any
  ) => {
    const newVariants = [...formData.variants];
    if (field === "value") {
      newVariants[variantIndex].value = value;
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
    newVariants[variantIndex].options[optionIndex] = value;
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
    newImages[index] = value;
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

  const handleSKUChange = (
    skuIndex: number,
    field: keyof SKUType,
    value: any
  ) => {
    const newSKUs = [...formData.skus];
    newSKUs[skuIndex] = { ...newSKUs[skuIndex], [field]: value };
    setFormData((prev) => ({ ...prev, skus: newSKUs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
        publishedAt: formData.publishedAt || new Date().toISOString(),
      };

      await http.post("/manage-product/products", submitData);

      onSuccess("Tạo sản phẩm thành công");
      resetForm();
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      publishedAt: null,
      basePrice: 0,
      virtualPrice: 0,
      images: [""],
      categories: [0],
      variants: [
        { value: "Màu sắc", options: [""] },
        { value: "Kích thước", options: [""] },
      ],
      skus: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo sản phẩm mới</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
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
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  handleInputChange("basePrice", Number(e.target.value))
                }
                required
                min="0"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Giá ảo *</label>
              <input
                type="number"
                value={formData.virtualPrice}
                onChange={(e) =>
                  handleInputChange("virtualPrice", Number(e.target.value))
                }
                required
                min="0"
                disabled={loading}
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
                  disabled={loading}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeImageField(index)}
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
              defaultValue={formData.categories.join("-")}
              onChange={(e) =>
                handleInputChange(
                  "categories",
                  parseCategoriesString(e.target.value)
                )
              }
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
                      type="number"
                      placeholder="Giá"
                      value={sku.price}
                      onChange={(e) =>
                        handleSKUChange(index, "price", Number(e.target.value))
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
