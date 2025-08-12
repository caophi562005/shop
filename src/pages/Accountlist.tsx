import React, { useEffect, useState } from "react";
import "../assets/css/accountlist.css";
import DeleteUserModal from "../components/DeleteUserModal";
import EditUserModal from "../components/EditUserModal";
import CreateUserModal from "../components/CreateUserModal";
import http from "../api/http";
import type { GetUsersResType, UserDetailType } from "../models/user.model";
import { RoleName } from "../constants/role.constant";
import { toast } from "react-toastify";

const AccountList: React.FC = () => {
  const [users, setUsers] = useState<UserDetailType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const currentUserRole = RoleName.ADMIN;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailType | null>(null);

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await http.get(
        `users?page=${currentPage}&limit=${usersPerPage}`
      );

      const data: GetUsersResType = await response.data;
      setUsers(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const canDeleteUser = (userRole: string) =>
    currentUserRole === "ADMIN" && userRole !== "ADMIN";

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openEditModal = (user: UserDetailType) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserDetailType) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
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
      <div className="pagination">
        {pages.map((p, index) => {
          if (p === "prev") {
            return currentPage > 1 ? (
              <a
                key={index}
                href="#"
                className="page-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage - 1);
                }}
              >
                <i className="fas fa-angle-left"></i>
              </a>
            ) : (
              <span key={index} className="page-btn disabled">
                <i className="fas fa-angle-left"></i>
              </span>
            );
          }
          if (p === "next") {
            return currentPage < totalPages ? (
              <a
                key={index}
                href="#"
                className="page-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage + 1);
                }}
              >
                <i className="fas fa-angle-right"></i>
              </a>
            ) : (
              <span key={index} className="page-btn disabled">
                <i className="fas fa-angle-right"></i>
              </span>
            );
          }
          if (p === "...") {
            return (
              <span key={index} className="page-btn disabled">
                ...
              </span>
            );
          }
          return p === currentPage ? (
            <span key={index} className="page-btn current">
              {p}
            </span>
          ) : (
            <a
              key={index}
              href="#"
              className="page-btn"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(p as number);
              }}
            >
              {p}
            </a>
          );
        })}
      </div>
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
      <div className="cinema-wrapper">
        <div className="cinema-card">
          <h2>Quản lý tài khoản</h2>
          {loading && (
            <div
              className="loading"
              style={{ textAlign: "center", padding: "20px" }}
            >
              Đang tải...
            </div>
          )}

          <div className="header-actions">
            <button className="btn-create" onClick={openCreateModal}>
              <i className="fas fa-plus"></i>
              Tạo người dùng mới
            </button>
          </div>

          <div className="filter-info">
            <p>
              Hiển thị {users.length} của {totalItems} người dùng
            </p>
          </div>

          <div className="table-container">
            <table className="cinema-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const canDelete = canDeleteUser(user.role.name);
                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="user-info">
                          {user.avatar && (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="user-avatar"
                            />
                          )}
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role.name === "ADMIN"
                              ? "admin"
                              : user.role.name === "SELLER"
                              ? "seller"
                              : "client"
                          }`}
                        >
                          {user.role.name}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{formatDate(String(user.createdAt))}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => openEditModal(user)}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {canDelete && (
                            <button
                              className="btn-delete"
                              onClick={() => openDeleteModal(user)}
                              disabled={loading}
                              title="Xóa"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                          {!canDelete && <span className="na">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSuccess={handleSuccess}
        onRefresh={fetchUsers}
      />

      <EditUserModal
        isOpen={showEditModal}
        user={selectedUser}
        onSuccess={handleSuccess}
        onClose={closeModals}
        onRefresh={fetchUsers}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        user={selectedUser}
        onSuccess={handleSuccess}
        onClose={closeModals}
        onRefresh={fetchUsers}
      />
    </div>
  );
};

export default AccountList;
