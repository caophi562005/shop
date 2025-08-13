import React from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TitleManager: React.FC = () => {
  // Hook này sẽ tự động set title dựa trên route
  useDocumentTitle();

  // Component này không render gì cả, chỉ để quản lý title
  return null;
};

export default TitleManager;
