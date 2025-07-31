import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/editProduct.css";

// --- Dữ liệu mẫu ---
const mockProductToEdit = {
  id: 1,
  name: "Áo Sơ Mi Cũ",
  price: 500000,
  quantity: 10,
  detail: "Chi tiết cũ",
  imgURL_1: "url1",
  imgURL_2: "url2",
  imgURL_3: "",
  imgURL_4: "",
  subCategory_id: 1,
  Sale_id: 1,
  colors: ["Xanh", "Đỏ"],
  selectedSizes: [1, 3], // ID của size S và L
};
const mockSubCategories = [
  { id: 1, name: "Áo Sơ Mi" },
  { id: 2, name: "Quần Jeans 30%" },
];
const mockSizes = [
  { id: 1, name: "S" },
  { id: 2, name: "M" },
  { id: 3, name: "L" },
];
const mockSales = [{ id: 1, name: "Sale 30%" }];

const EditProductPage: React.FC = () => {
  const [formData, setFormData] = useState(mockProductToEdit);

  // Logic để thêm/xóa/sửa các trường màu và size tương tự như trang CreateProductPage
  // ... (bạn có thể sao chép các hàm handle...Change từ component trên)

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="wrapper">
      <main className="main-content">
        <h2>Cập nhật sản phẩm</h2>
        <form className="product-form">
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
          {/* ... các input ảnh khác ... */}

          <label>Danh mục con:</label>
          <select
            name="subCategory_id"
            value={formData.subCategory_id}
            onChange={handleInputChange}
            required
          >
            {mockSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {/* ... các phần còn lại của form ... */}
          {/* Logic cho Màu và Size sẽ được implement tương tự trang Create */}

          <button type="submit">Cập nhật sản phẩm</button>
          <Link to="/admin" id="back-btn">
            Quay lại
          </Link>
        </form>
      </main>
    </div>
  );
};
export default EditProductPage;
