import React, { useEffect, useState } from 'react';
import '../assets/css/accountlist.css';

type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  createAt: string;
};

type Props = {
  users: User[];
  rolesMap: { [userId: number]: string[] };
  meRoles: string[];
  page: number;
  totalPages: number;
  success?: string;
  error?: string;
};

const AccountList: React.FC<Props> = ({
  users = [],
  rolesMap = {},
  meRoles = [],
  page = 1,
  totalPages = 1,
  success,
  error
}) => {
  const [toastSuccess, setToastSuccess] = useState<string | undefined>(success);
  const [toastError, setToastError] = useState<string | undefined>(error);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    if (toastSuccess || toastError) {
      timers.push(setTimeout(() => setToastSuccess(undefined), 2000));
      timers.push(setTimeout(() => setToastError(undefined), 2000));
    }
    return () => timers.forEach(clearTimeout);
  }, [toastSuccess, toastError]);

  const canDeleteUser = (userRoles: string[]) =>
    meRoles.includes('admin') && !userRoles.includes('admin');

  const renderPagination = () => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      pages.push(
        p === page ? (
          <span key={p} className="page-btn current">{p}</span>
        ) : (
          <a key={p} href={`?controller=account&action=index&page=${p}`} className="page-btn">{p}</a>
        )
      );
    }
    return pages;
  };

  return (
    <div className="wrapper">
      <div className="cinema-wrapper">
        <div className="cinema-card">
          <h2>Quản lý tài khoản</h2>

          {toastSuccess && <div className="toast success">{toastSuccess}</div>}
          {toastError && <div className="toast error">{toastError}</div>}

          <div className="table-container">
            <table className="cinema-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Roles</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userRoles = rolesMap[u.id] || [];
                  const canDelete = canDeleteUser(userRoles);
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>
                        {userRoles.map((r, i) => (
                          <span key={i} className={`badge ${r === 'admin' ? 'admin' : 'user'}`}>
                            {r}
                          </span>
                        ))}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.createAt}</td>
                      <td>
                        {canDelete ? (
                          <a
                            className="cinema-del"
                            href={`index.php?controller=account&action=delete&id=${u.id}`}
                            onClick={(e) => {
                              if (!window.confirm(`Xóa tài khoản #${u.id}?`)) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Xóa
                          </a>
                        ) : (
                          <span className="na">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {page > 1 ? (
              <a href={`?controller=account&action=index&page=${page - 1}`} className="page-btn">
                « Trang trước
              </a>
            ) : (
              <span className="page-btn disabled">« Trang trước</span>
            )}

            {renderPagination()}

            {page < totalPages ? (
              <a href={`?controller=account&action=index&page=${page + 1}`} className="page-btn">
                Trang sau »
              </a>
            ) : (
              <span className="page-btn disabled">Trang sau »</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
