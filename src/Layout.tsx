// src/Layout.tsx

import { Outlet, Link } from "react-router-dom"; // Sửa lại import để dùng Link
import http from "./http";

export default function Layout() {
  const isLogged = localStorage.getItem("accessToken") !== null;
  const handleLogout = async () => {
    try {
      await http.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <header>
        <nav>
          <ul style={{ listStyle: "none", display: "flex", gap: "20px" }}>
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/login">Đăng nhập</Link>
            </li>
            <li>
              <Link to="/upload">Upload</Link>
            </li>
            {/* --- PHẦN MỚI: Link ví dụ đến trang chat --- */}
            {isLogged && (
              <li>
                {/* Đây là ví dụ chat với user có ID=2 */}
                <Link to="/chat/2">Chat với User 2</Link>
              </li>
            )}
            {isLogged && (
              <li>
                <button onClick={handleLogout}>Đăng xuất</button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <hr style={{ margin: "20px 0" }} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
