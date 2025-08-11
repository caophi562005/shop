import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

interface LightboxModalProps {
  isOpen: boolean;
  images: Array<{
    original: string;
    thumbnail: string;
    description?: string;
  }>;
  startIndex: number;
  onClose: () => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  images,
  startIndex,
  onClose,
}) => {
  if (!isOpen || images.length === 0) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-50px",
            right: "0",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "18px",
            cursor: "pointer",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
        >
          ×
        </button>

        <ImageGallery
          items={images}
          startIndex={startIndex}
          showPlayButton={false}
          showFullscreenButton={true}
          showThumbnails={images.length > 1}
          showBullets={images.length > 1}
          showNav={images.length > 1}
          slideDuration={450}
          slideInterval={3000}
          showIndex={true}
          indexSeparator=" / "
          additionalClass="pixcam-lightbox"
        />
      </div>
    </div>
  );
};

export default LightboxModal;
