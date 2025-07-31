import React, { useEffect, useState } from "react";
import "../assets/css/categoryList.css";
import http from "../api/http";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import type { CategoryType } from "../models/shared/shared-category.model";
import { toast } from "react-toastify";

const CategoryListPage: React.FC = () => {
  const [categoryMap, setCategoryMap] = useState<
    Record<string, CategoryType[]>
  >({});

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [addModalParentId, setAddModalParentId] = useState<number | null>(null);

  const parentCategories = categoryMap["null"] || [];
  const fetchCategories = async (parentId: string | null) => {
    const key = parentId ?? "null";
    if (categoryMap[key]) return; // Cache đã có thì bỏ qua
    try {
      const res = await http.get("/categories", {
        params: parentId ? { parentCategoryId: parentId } : {},
      });
      const data = res.data.data;
      setCategoryMap((prev) => ({
        ...prev,
        [key]: data,
      }));
    } catch (err) {
      console.error("Lỗi khi gọi API danh mục:", err);
    }
  };

  useEffect(() => {
    fetchCategories(null); // Lần đầu load danh mục cha
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories((prev) => prev.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories((prev) => [...prev, categoryId]);
      fetchCategories(categoryId); // Fetch danh mục con nếu chưa có
    }
  };

  const handleEditCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleAddCategory = (parentId: number | null = null) => {
    setAddModalParentId(parentId);
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = async (
    id: number,
    parentCategoryId: number | null,
    name: string,
    logo: string
  ) => {
    try {
      await http.put(`/categories/${id}`, {
        parentCategoryId,
        name,
        logo,
      });
      window.location.reload();
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.log(error);
    }
  };

  const handleSaveAdd = async (
    name: string,
    logo: string,
    parentCategoryId: number | null
  ) => {
    console.log("Saving new category:", {
      name,
      logo,
      parentCategoryId,
    });
    try {
      await http.post("/categories", {
        parentCategoryId,
        name,
        logo,
      });

      window.location.reload();

      toast.success("Thêm mới thành công");
    } catch (error) {
      toast.error("Thêm mới thất bại");
      console.log(error);
    }
  };

  const handleDeleteCategory = async (category: CategoryType) => {
    try {
      await http.delete(`/categories/${category.id}`);
      window.location.reload();
      toast.success("Xóa thành công");
    } catch (error) {
      toast.error("Xóa thất bại");
      console.log(error);
    }
  };

  return (
    <div className="wrapper">
      <h2>Quản lý danh mục</h2>
      <div className="main-content">
        <div className="category-container">
          <div className="category-header">
            <button
              className="btn-add-category"
              onClick={() => {
                handleAddCategory(null);
              }}
            >
              + Thêm danh mục mới
            </button>
          </div>

          <div className="category-list">
            {(categoryMap["null"] || []).map((category) => (
              <div key={category.id} className="category-item">
                <div
                  className="category-parent"
                  onClick={() => toggleCategory(category.id.toString())}
                >
                  <div className="category-info">
                    <span className="category-icon">🗂️</span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">
                      {expandedCategories.includes(category.id.toString())
                        ? "(đang mở)"
                        : ""}
                    </span>
                  </div>
                  <div className="category-actions">
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category);
                      }}
                    >
                      🗑️
                    </button>
                    <span
                      className={`expand-icon ${
                        expandedCategories.includes(category.id.toString())
                          ? "expanded"
                          : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* Danh mục con */}
                {expandedCategories.includes(category.id.toString()) && (
                  <div className="subcategory-list">
                    {(categoryMap[category.id.toString()] || []).map(
                      (subCategory) => (
                        <div key={subCategory.id} className="subcategory-item">
                          <div className="subcategory-info">
                            <span className="subcategory-name">
                              {subCategory.name}
                            </span>
                          </div>
                          <div className="subcategory-actions">
                            <button
                              className="btn-edit-sub"
                              onClick={() => handleEditCategory(subCategory)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete-sub"
                              onClick={() => handleDeleteCategory(subCategory)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      )
                    )}
                    <div className="add-subcategory">
                      <button
                        className="btn-add-subcategory"
                        onClick={() => handleAddCategory(category.id)}
                      >
                        + Thêm danh mục con
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="category-footer">
            <button
              className="btn-back"
              onClick={() => console.log("Quay lại Dashboard")}
            >
              ← Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={selectedCategory}
        onSave={handleSaveEdit}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        parentCategoryId={addModalParentId}
        onSave={handleSaveAdd}
      />
    </div>
  );
};

export default CategoryListPage;
