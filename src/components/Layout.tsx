import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../assets/css/index.css";

const Layout: React.FC = () => {
  return (
    <>
      <Header />
      <main className="main-content-area">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
export default Layout;
