import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- Dữ liệu mẫu (thay thế cho việc lấy từ API/CSDL) ---
const mockData = {
  subCategories: [
    { id: "1", name: "Áo Sơ Mi" },
    { id: "2", name: "Quần Jeans Sale 30%" },
    { id: "3", name: "Phụ Kiện Sale 50%" },
  ],
  sales: [
    { id: "1", name: "Sale 30%" },
    { id: "2", name: "Sale 50%" },
    { id: "3", name: "Sale 70%" },
  ],
  sizes: [
    { id: "1", name: "S" },
    { id: "2", name: "M" },
    { id: "3", name: "L" },
    { id: "4", name: "XL" },
  ],
};

const CreateProductPage: React.FC = () => {
  // State chính để lưu trữ tất cả dữ liệu của form
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    detail: "",
    imgURL_1: "",
    imgURL_2: "",
    imgURL_3: "",
    imgURL_4: "",
    subCategory_id: "",
    Sale_id: "",
    colors: [""], // Mảng chứa các chuỗi màu sắc
    sizes: [""], // Mảng chứa các ID của size đã chọn
  });

  // Xử lý thay đổi cho các input đơn giản
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Logic cho các trường động (Màu sắc) ---
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };
  const addColorField = () => {
    setFormData((prev) => ({ ...prev, colors: [...prev.colors, ""] }));
  };
  const removeColorField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // --- Logic cho các trường động (Kích thước) ---
  const handleSizeChange = (index: number, value: string) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = value;
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };
  const addSizeField = () => {
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, ""] }));
  };
  const removeSizeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // --- Tái tạo lại logic tự động chọn Khuyến mãi ---
  useEffect(() => {
    const selectedSubCategory = mockData.subCategories.find(
      (sub) => sub.id === formData.subCategory_id
    );
    if (!selectedSubCategory) {
      setFormData((prev) => ({ ...prev, Sale_id: "" }));
      return;
    }

    const subName = selectedSubCategory.name.toLowerCase();
    let matchedSaleId = "";

    if (subName.includes("30")) {
      matchedSaleId =
        mockData.sales.find((s) => s.name.includes("30"))?.id || "";
    } else if (subName.includes("50")) {
      matchedSaleId =
        mockData.sales.find((s) => s.name.includes("50"))?.id || "";
    } else if (subName.includes("70")) {
      matchedSaleId =
        mockData.sales.find((s) => s.name.includes("70"))?.id || "";
    }

    setFormData((prev) => ({ ...prev, Sale_id: matchedSaleId }));
  }, [formData.subCategory_id]); // Chạy lại khi danh mục con thay đổi

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dữ liệu form gửi đi:", formData);
    alert("Xem dữ liệu trong console log!");
  };

  return (
    <div className="wrapper">
      <div className="main-content">
        <form onSubmit={handleSubmit} className="product-form">
          <h2>Thêm sản phẩm</h2>
          <input
            name="name"
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
          <input
            name="quantity"
            type="number"
            placeholder="Số lượng"
            value={formData.quantity}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="detail"
            placeholder="Chi tiết sản phẩm..."
            rows={4}
            value={formData.detail}
            onChange={handleInputChange}
          ></textarea>

          <input
            name="imgURL_1"
            placeholder="URL ảnh 1"
            value={formData.imgURL_1}
            onChange={handleInputChange}
          />
          <input
            name="imgURL_2"
            placeholder="URL ảnh 2"
            value={formData.imgURL_2}
            onChange={handleInputChange}
          />
          <input
            name="imgURL_3"
            placeholder="URL ảnh 3"
            value={formData.imgURL_3}
            onChange={handleInputChange}
          />
          <input
            name="imgURL_4"
            placeholder="URL ảnh 4"
            value={formData.imgURL_4}
            onChange={handleInputChange}
          />

          <label>Danh mục con:</label>
          <select
            name="subCategory_id"
            id="subCategorySelect"
            value={formData.subCategory_id}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {mockData.subCategories.map((sub) => (
              <option key={sub.id} value={sub.id} data-name={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>

          <label>Khuyến mãi:</label>
          <select id="saleSelectDisplay" value={formData.Sale_id} disabled>
            <option value="">-- Không áp dụng --</option>
            {mockData.sales.map((sale) => (
              <option key={sale.id} value={sale.id} data-name={sale.name}>
                {sale.name}
              </option>
            ))}
          </select>
          <input
            type="hidden"
            name="Sale_id"
            id="saleIdHidden"
            value={formData.Sale_id}
          />

          {/* Phần Màu sắc */}
          <div>
            <label>Màu sắc:</label>
            <div id="colorFields">
              {formData.colors.map((color, index) => (
                <div key={index} className="field-group">
                  <input
                    type="text"
                    name="colors[]"
                    placeholder="Màu sắc"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                  <button type="button" onClick={() => removeColorField(index)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-btn" onClick={addColorField}>
              + Thêm màu
            </button>
          </div>

          {/* Phần Kích thước */}
          <div>
            <label>Kích thước:</label>
            <div id="sizeFields">
              {formData.sizes.map((selectedSizeId, index) => (
                <div key={index} className="field-group">
                  <select
                    name="sizes[]"
                    className="size-select"
                    value={selectedSizeId}
                    onChange={(e) => handleSizeChange(index, e.target.value)}
                  >
                    <option value="">-- Chọn size --</option>
                    {mockData.sizes.map((sizeOption) => {
                      // Một size sẽ bị vô hiệu hóa nếu nó đã được chọn ở một dropdown khác
                      const isSelectedElsewhere =
                        formData.sizes.includes(sizeOption.id) &&
                        sizeOption.id !== selectedSizeId;
                      return (
                        <option
                          key={sizeOption.id}
                          value={sizeOption.id}
                          disabled={isSelectedElsewhere}
                        >
                          {sizeOption.name}
                        </option>
                      );
                    })}
                  </select>
                  <button type="button" onClick={() => removeSizeField(index)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-btn" onClick={addSizeField}>
              + Thêm size
            </button>
          </div>

          <button type="submit">Thêm sản phẩm</button>
          <Link to="/admin" id="back-btn" className="btn back-btn">
            Quay lại
          </Link>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
