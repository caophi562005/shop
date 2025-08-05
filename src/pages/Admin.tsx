import React, { useState, useEffect } from 'react';
import '../assets/css/admin.css';

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  detail: string;
};

type Props = {
  products: Product[];
  page: number;
  totalPages: number;
};

const Admin: React.FC<Props> = ({ products = [], page = 1, totalPages = 1 }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, products]);

  const toggleCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    if (!window.confirm('Bạn có chắc muốn xóa các sản phẩm đã chọn?')) {
      e.preventDefault();
    }
  };

  const openModal = (id: number) => setEditId(id);
  const closeModal = () => setEditId(null);
  const confirmEdit = () => {
    if (editId !== null) {
      window.location.href = `index.php?controller=admin&action=edit&id=${editId}`;
    }
  };

  const renderPagination = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages = [];

    if (start > 1) {
      pages.push(
        <a key="page-1" href="?controller=admin&action=index&page=1" className="admin-page-link">1</a>
      );
      if (start > 2) pages.push(<span key="dots-start" className="admin-dots">…</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        i === page ? (
          <span key={i} className="admin-page-link admin-current">{i}</span>
        ) : (
          <a key={i} href={`?controller=admin&action=index&page=${i}`} className="admin-page-link">{i}</a>
        )
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="dots-end" className="admin-dots">…</span>);
      }
      pages.push(
        <a key={totalPages} href={`?controller=admin&action=index&page=${totalPages}`} className="admin-page-link">
          {totalPages}
        </a>
      );
    }

    return pages;
  };

  return (
    <div className="wrapper">
      <main>
        <h2>Danh sách sản phẩm</h2>

        <div className="action-bar">
          <a id="Themsanpham" href="index.php?controller=admin&action=create" className="btn add-btn">
            ➕ Thêm sản phẩm
          </a>
        </div>

        <form method="post" action="index.php?controller=admin&action=deleteMulti" onSubmit={handleDeleteSubmit}>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={(e) => setSelectAll(e.target.checked)}
                  />
                </th>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Chi tiết</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      name="ids[]"
                      value={product.id}
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleCheckbox(product.id)}
                    />
                  </td>
                  <td>{product.id}</td>
                  <td className="tooltip" data-tooltip={product.name}>
                    {product.name}
                  </td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.detail}</td>
                  <td>
                    <a
                      href="javascript:void(0)"
                      className="action-link"
                      onClick={() => openModal(product.id)}
                    >
                      ✏️ Sửa
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-deleteproduct" type="submit">🗑️ Xóa đã chọn</button>
        </form>

        {totalPages > 1 && (
          <nav className="admin-pagination">
            {page > 1 ? (
              <a href={`?controller=admin&action=index&page=${page - 1}`} className="admin-page-link">«</a>
            ) : (
              <span className="admin-page-link admin-disabled">«</span>
            )}
            {renderPagination()}
            {page < totalPages ? (
              <a href={`?controller=admin&action=index&page=${page + 1}`} className="admin-page-link">»</a>
            ) : (
              <span className="admin-page-link admin-disabled">»</span>
            )}
          </nav>
        )}

        {/* Modal */}
        {editId !== null && (
          <div className="modal" id="editModal" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="modal-content">
              <h3>Xác nhận sửa sản phẩm?</h3>
              <button className="confirm-edit" onClick={confirmEdit}>Đồng ý</button>
              <button className="close-modal" onClick={closeModal}>Huỷ</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
