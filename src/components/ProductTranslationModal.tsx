import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import http from "../api/http";
import "../assets/css/modal.css";

interface ProductTranslation {
  id?: number;
  productId: number;
  name: string;
  description: string;
  languageId: string;
}

interface ProductTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: () => void;
}

const ProductTranslationModal: React.FC<ProductTranslationModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viTranslation, setViTranslation] = useState<ProductTranslation>({
    productId,
    name: "",
    description: "",
    languageId: "vi",
  });
  const [enTranslation, setEnTranslation] = useState<ProductTranslation>({
    productId,
    name: "",
    description: "",
    languageId: "en",
  });

  useEffect(() => {
    if (isOpen && productId) {
      // Reset states with current productId
      setViTranslation({
        productId,
        name: "",
        description: "",
        languageId: "vi",
      });
      setEnTranslation({
        productId,
        name: "",
        description: "",
        languageId: "en",
      });

      fetchProductTranslations();
    }
  }, [isOpen, productId]);

  const fetchProductTranslations = async () => {
    try {
      setIsLoading(true);
      const response = await http.get(
        `/manage-product/products/${productId}?lang=all`
      );
      const product = response.data;

      if (product.productTranslations) {
        const viTrans = product.productTranslations.find(
          (t: any) => t.languageId === "vi"
        );
        const enTrans = product.productTranslations.find(
          (t: any) => t.languageId === "en"
        );

        if (viTrans) {
          setViTranslation({
            id: viTrans.id,
            productId,
            name: viTrans.name,
            description: viTrans.description,
            languageId: "vi",
          });
        }

        if (enTrans) {
          setEnTranslation({
            id: enTrans.id,
            productId,
            name: enTrans.name,
            description: enTrans.description,
            languageId: "en",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching product translations:", error);
      toast.error("Không thể tải dữ liệu dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (translation: ProductTranslation) => {
    if (!translation.name.trim() || !translation.description.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!productId || productId === 0) {
      toast.error("Lỗi: Không xác định được sản phẩm");
      return;
    }

    try {
      setIsLoading(true);

      const body = {
        name: translation.name,
        description: translation.description,
        languageId: translation.languageId,
        productId: productId, // Sử dụng productId từ props thay vì từ translation
      };

      console.log("Saving translation with body:", body);
      console.log("ProductId from props:", productId);
      console.log("Translation object:", translation);

      if (translation.id) {
        // Update existing translation
        await http.put(`/product-translations/${translation.id}`, body);
        toast.success(
          `Cập nhật dịch ${translation.languageId.toUpperCase()} thành công`
        );
      } else {
        // Create new translation
        const response = await http.post("/product-translations", body);
        const newTranslation = response.data;

        // Update local state with new ID
        if (translation.languageId === "vi") {
          setViTranslation((prev) => ({ ...prev, id: newTranslation.id }));
        } else {
          setEnTranslation((prev) => ({ ...prev, id: newTranslation.id }));
        }

        toast.success(
          `Tạo dịch ${translation.languageId.toUpperCase()} thành công`
        );
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving translation:", error);
      toast.error("Lỗi khi lưu dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (translation: ProductTranslation) => {
    if (!translation.id) return;

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa dịch ${translation.languageId.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await http.delete(`/product-translations/${translation.id}`);

      // Reset local state
      if (translation.languageId === "vi") {
        setViTranslation({
          productId,
          name: "",
          description: "",
          languageId: "vi",
        });
      } else {
        setEnTranslation({
          productId,
          name: "",
          description: "",
          languageId: "en",
        });
      }

      toast.success(
        `Xóa dịch ${translation.languageId.toUpperCase()} thành công`
      );
      onSuccess();
    } catch (error) {
      console.error("Error deleting translation:", error);
      toast.error("Lỗi khi xóa dịch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset states when closing
    setViTranslation({
      productId,
      name: "",
      description: "",
      languageId: "vi",
    });
    setEnTranslation({
      productId,
      name: "",
      description: "",
      languageId: "en",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "900px", width: "90%" }}
      >
        <div className="modal-header">
          <h2>Dịch sản phẩm</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Đang tải...
            </div>
          ) : (
            <div style={{ display: "flex", gap: "20px" }}>
              {/* Vietnamese Form */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: "15px", color: "#333" }}>
                  Tiếng Việt
                </h3>
                <div className="form-group">
                  <label>Tên sản phẩm:</label>
                  <input
                    type="text"
                    value={viTranslation.name}
                    onChange={(e) =>
                      setViTranslation((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên sản phẩm tiếng Việt"
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả:</label>
                  <textarea
                    value={viTranslation.description}
                    onChange={(e) =>
                      setViTranslation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Nhập mô tả sản phẩm tiếng Việt"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "15px",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleSave(viTranslation)}
                    disabled={isLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {viTranslation.id ? "Cập nhật" : "Tạo mới"}
                  </button>
                  {viTranslation.id && (
                    <button
                      onClick={() => handleDelete(viTranslation)}
                      disabled={isLoading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* English Form */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: "15px", color: "#333" }}>English</h3>
                <div className="form-group">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    value={enTranslation.name}
                    onChange={(e) =>
                      setEnTranslation((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter product name in English"
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={enTranslation.description}
                    onChange={(e) =>
                      setEnTranslation((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter product description in English"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "15px",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleSave(enTranslation)}
                    disabled={isLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {enTranslation.id ? "Update" : "Create"}
                  </button>
                  {enTranslation.id && (
                    <button
                      onClick={() => handleDelete(enTranslation)}
                      disabled={isLoading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTranslationModal;
