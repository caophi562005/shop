import React from "react";
import "../assets/css/LoadingOverlay.css";

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingOverlay;
