import React, { useEffect, useState } from "react";
import "../assets/css/adminProducts.css";
import "../assets/css/modal.css";
import http from "../api/http";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import CategoryTranslationModal from "../components/CategoryTranslationModal";
import DeleteCategoryModal from "../components/DeleteCategoryModal";
import type { CategoryType } from "../models/shared/shared-category.model";
import { toast } from "react-toastify";

const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [subCategories, setSubCategories] = useState<
    Record<number, CategoryType[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showTranslationModal, setShowTranslationModal] =
    useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [addModalParentId, setAddModalParentId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // Lấy tất cả categories cấp 1 (không có parentCategoryId)
      const response = await http.get("/categories");

      const data = response.data;
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubCategories = async (parentId: number) => {
    try {
      const response = await http.get(
        `/categories?parentCategoryId=${parentId}`
      );
      const data = response.data;
      setSubCategories((prev) => ({
        ...prev,
        [parentId]: data.data || [],
      }));
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Không thể tải danh mục con");
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (expandedCategories.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      // Fetch subcategories if not already loaded
      if (!subCategories[categoryId]) {
        fetchSubCategories(categoryId);
      }
    }
    setExpandedCategories(newExpanded);
  };

  const openTranslationModal = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowTranslationModal(true);
  };

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setShowTranslationModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
    setAddModalParentId(null);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    fetchCategories();
    // Refresh all expanded subcategories
    expandedCategories.forEach((parentId) => {
      fetchSubCategories(parentId);
    });
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
      setIsLoading(true);
      await http.put(`/categories/${id}`, {
        parentCategoryId,
        name,
        logo,
      });
      toast.success("Cập nhật thành công");

      // Refresh parent categories
      fetchCategories();

      // Refresh all expanded subcategories to reflect any changes
      expandedCategories.forEach((parentId) => {
        fetchSubCategories(parentId);
      });

      closeModals();
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAdd = async (
    name: string,
    logo: string,
    parentCategoryId: number | null
  ) => {
    try {
      setIsLoading(true);
      await http.post("/categories", {
        parentCategoryId,
        name,
        logo,
      });
      toast.success("Thêm mới thành công");

      // Refresh parent categories
      fetchCategories();

      // If it's a subcategory, refresh the parent's subcategories and ensure it's expanded
      if (parentCategoryId !== null) {
        // Ensure parent is expanded to show new subcategory
        setExpandedCategories((prev) => new Set([...prev, parentCategoryId]));
        // Refresh subcategories for this parent
        fetchSubCategories(parentCategoryId);
      }

      closeModals();
    } catch (error) {
      toast.error("Thêm mới thất bại");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = async () => {
    if (!selectedCategory) return;

    try {
      setIsLoading(true);

      // Refresh parent categories
      fetchCategories();

      // If deleting a subcategory, refresh its parent's subcategories
      if (selectedCategory.parentCategoryId) {
        fetchSubCategories(selectedCategory.parentCategoryId);
      }

      // Refresh all expanded subcategories
      expandedCategories.forEach((parentId) => {
        fetchSubCategories(parentId);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getAllCategories = () => {
    const allCategories: (CategoryType & { level: number })[] = [];

    // Add parent categories
    categories.forEach((category) => {
      allCategories.push({ ...category, level: 0 });

      // Add subcategories if expanded
      if (expandedCategories.has(category.id) && subCategories[category.id]) {
        subCategories[category.id].forEach((subCategory) => {
          allCategories.push({ ...subCategory, level: 1 });
        });
      }
    });

    return allCategories;
  };

  return (
    <div className="admin-container">
      <main className="admin-main">
        <div className="admin-header">
          <h1>Quản lý danh mục</h1>
          <button
            className="btn-create"
            onClick={() => handleAddCategory(null)}
          >
            <i className="fas fa-plus"></i>
            Thêm danh mục
          </button>
        </div>

        <div className="admin-stats">
          <p>Hiển thị {getAllCategories().length} danh mục</p>
        </div>

        <div className="table-container">
          <table className="cinema-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Logo</th>
                <th>Cấp độ</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : getAllCategories().length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                getAllCategories().map((category) => (
                  <tr key={`${category.id}-${category.level}`}>
                    <td>{category.id}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: `${category.level * 20}px`,
                        }}
                      >
                        {category.level === 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              marginRight: "8px",
                              fontSize: "12px",
                            }}
                          >
                            {expandedCategories.has(category.id) ? "▼" : "▶"}
                          </button>
                        )}
                        {category.level === 1 && (
                          <span style={{ marginRight: "8px", color: "#999" }}>
                            └─
                          </span>
                        )}
                        <span className="tooltip" data-tooltip={category.name}>
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {category.logo || "📁"}
                      </div>
                    </td>
                    <td>
                      {category.level === 0 ? "Danh mục chính" : "Danh mục con"}
                    </td>
                    <td>{formatDate(String(category.createdAt))}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditCategory(category)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-create"
                          onClick={() => openTranslationModal(category)}
                          title="Dịch danh mục"
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            padding: "5px 8px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            margin: "0 2px",
                          }}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        {category.level === 0 && (
                          <button
                            className="btn-create"
                            onClick={() => handleAddCategory(category.id)}
                            title="Thêm danh mục con"
                            style={{
                              backgroundColor: "#17a2b8",
                              color: "white",
                              border: "none",
                              padding: "5px 8px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              margin: "0 2px",
                            }}
                          >
                            <i className="fas fa-plus-circle"></i>
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteCategory(category)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        category={selectedCategory}
        onSave={handleSaveEdit}
      />

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        parentCategoryId={addModalParentId}
        onSave={handleSaveAdd}
      />

      <CategoryTranslationModal
        isOpen={showTranslationModal}
        onClose={closeModals}
        categoryId={selectedCategory?.id ?? 0}
        onSuccess={() => handleSuccess("Thao tác dịch thành công")}
      />

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        category={selectedCategory}
        onClose={closeModals}
        onSuccess={(message: string) => {
          handleSuccess(message);
          handleDeleteSuccess();
        }}
        onRefresh={() => {}}
      />
    </div>
  );
};

export default CategoryListPage;
