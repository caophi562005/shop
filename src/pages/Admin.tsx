import React, { useEffect, useState } from "react";
import "../assets/css/admin.css";
import "../assets/css/modal.css";
import { toast } from "react-toastify";
import DeleteProductModal from "../components/DeleteProductModal";
import EditProductModal from "../components/EditProductModal";
import CreateProductModal from "../components/CreateProductModal";
import http from "../api/http";
import type {
  GetProductsResType,
  ProductIncludeTranslationType,
} from "../models/product.model";

const Admin: React.FC = () => {
  const [products, setProducts] = useState<ProductIncludeTranslationType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductIncludeTranslationType | null>(null);

  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await http.get(
        `/manage-product/products?page=${currentPage}&limit=${productsPerPage}`
      );

      const data: GetProductsResType = await response.data;
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      toast.error("Không thể tải danh sách sản phẩm");
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openEditModal = (product: ProductIncludeTranslationType) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: ProductIncludeTranslationType) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const range = 2;
    const pages: (number | string)[] = [];

    // Previous button
    pages.push("prev");

    // First page and ellipsis
    if (currentPage > range + 1) {
      pages.push(1);
      if (currentPage > range + 2) pages.push("...");
    }

    // Current page range
    for (
      let i = Math.max(1, currentPage - range);
      i <= Math.min(totalPages, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    // Last page and ellipsis
    if (currentPage < totalPages - range) {
      if (currentPage < totalPages - (range + 1)) pages.push("...");
      pages.push(totalPages);
    }

    // Next button
    pages.push("next");

    return (
      <nav className="admin-pagination">
        {pages.map((p, index) => {
          if (p === "prev") {
            return currentPage > 1 ? (
              <a
                key={index}
                href="#"
                className="admin-page-link"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage - 1);
                }}
              >
                <i className="fas fa-angle-left"></i>
              </a>
            ) : (
              <span key={index} className="admin-page-link admin-disabled">
                <i className="fas fa-angle-left"></i>
              </span>
            );
          }
          if (p === "next") {
            return currentPage < totalPages ? (
              <a
                key={index}
                href="#"
                className="admin-page-link"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage + 1);
                }}
              >
                <i className="fas fa-angle-right"></i>
              </a>
            ) : (
              <span key={index} className="admin-page-link admin-disabled">
                <i className="fas fa-angle-right"></i>
              </span>
            );
          }
          if (p === "...") {
            return (
              <span key={index} className="admin-page-link admin-disabled">
                ...
              </span>
            );
          }
          return p === currentPage ? (
            <span key={index} className="admin-page-link admin-current">
              {p}
            </span>
          ) : (
            <a
              key={index}
              href="#"
              className="admin-page-link"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(p as number);
              }}
            >
              {p}
            </a>
          );
        })}
      </nav>
    );
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

  return (
    <div className="wrapper">
      <main>
        <h2>Danh sách sản phẩm</h2>
        <div className="action-bar">
          <button className="btn add-btn" onClick={openCreateModal}>
            <i className="fas fa-plus"></i>
            Thêm sản phẩm
          </button>
        </div>

        <div className="filter-info">
          <p>
            Hiển thị {products.length} của {totalItems} sản phẩm
          </p>
        </div>

        <div className="table-container">
          <table className="cinema-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá gốc</th>
                <th>Giá ảo</th>
                <th>Ngày xuất bản</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {product.images.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </td>
                  <td className="tooltip" data-tooltip={product.name}>
                    {product.name}
                  </td>
                  <td>{product.basePrice.toLocaleString()} VND</td>
                  <td>{product.virtualPrice.toLocaleString()} VND</td>
                  <td>
                    {product.publishedAt
                      ? formatDate(String(product.publishedAt))
                      : "Chưa xuất bản"}
                  </td>
                  <td>{formatDate(String(product.createdAt))}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(product)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(product)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </main>

      {/* Modals */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSuccess={handleSuccess}
        onRefresh={fetchProducts}
      />

      <EditProductModal
        isOpen={showEditModal}
        product={selectedProduct}
        onSuccess={handleSuccess}
        onClose={closeModals}
        onRefresh={fetchProducts}
      />

      <DeleteProductModal
        isOpen={showDeleteModal}
        product={selectedProduct}
        onSuccess={handleSuccess}
        onClose={closeModals}
        onRefresh={fetchProducts}
      />
    </div>
  );
};

export default Admin;
