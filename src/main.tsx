// src/main.tsx

import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Sửa lại import
import Layout from "./Layout.tsx";
import Login from "./Login.tsx";
import Home from "./Home.tsx";
import Oauth from "./Oauth.tsx";
import UploadPage from "./UploadPage.tsx";
import ChatPage from "./ChatPage.tsx"; // <-- Thêm import

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="oauth-google-callback" element={<Oauth />} />
        {/* --- PHẦN MỚI: Route cho trang chat --- */}
        {/* :userId là một parameter động, ví dụ /chat/1, /chat/2 */}
        <Route path="chat/:userId" element={<ChatPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
