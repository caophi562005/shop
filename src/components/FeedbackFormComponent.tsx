import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import http from "../api/http";
import "../assets/css/feedbackfrom.css";
import LightboxModal from "./LightboxModal";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface FeedbackFormProps {
  productId: number;
  orderId: number;
  onSubmitSuccess?: () => void;
  isCompact?: boolean;
}

const FeedbackFormComponent: React.FC<FeedbackFormProps> = ({
  productId,
  orderId,
  onSubmitSuccess,
  isCompact = false,
}) => {
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Upload states
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lightbox state
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleAddMedia = () => {
    if (mediaUrl.trim()) {
      const newMedia: MediaItem = {
        url: mediaUrl.trim(),
        type: "IMAGE", // Default to IMAGE, có thể mở rộng logic để detect type
      };
      setMedias([...medias, newMedia]);
      setMediaUrl("");
    }
  };

  const handleMediaUpload = (file: File) => {
    setUploadingMedia(true);
    setUploadProgress(0);

    http
      .post(
        "/media/images/upload/presigned-url",
        {
          filename: file.name,
          filesize: file.size,
        },
        { withCredentials: false }
      )
      .then((res) => {
        const url = res.data.url;
        const presignedUrl = res.data.presignedUrl;

        return axios
          .put(presignedUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
            withCredentials: false,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(progress);
              }
            },
          })
          .then(() => {
            return url;
          });
      })
      .then((finalUrl) => {
        const newMedia: MediaItem = {
          url: finalUrl,
          type: "IMAGE",
        };
        setMedias((prev) => [...prev, newMedia]);
        setUploadingMedia(false);
        setUploadProgress(0);
        toast.success("Upload ảnh thành công!");
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        toast.error("Upload ảnh thất bại! Vui lòng thử lại.");
        setUploadingMedia(false);
        setUploadProgress(0);
      });
  };

  const handleRemoveMedia = (index: number) => {
    setMedias(medias.filter((_, i) => i !== index));
  };

  // Lightbox handlers
  const handleImageClick = (mediaIndex: number) => {
    // Chỉ lấy các hình ảnh, không bao gồm video
    const imageMedias = medias.filter((media) => media.type === "IMAGE");
    const images = imageMedias.map((media) => ({
      original: media.url,
      thumbnail: media.url,
      description: "Hình ảnh trong đánh giá",
    }));

    // Tìm index của hình ảnh được click trong danh sách chỉ có hình ảnh
    const clickedMedia = medias[mediaIndex];
    const imageIndex = imageMedias.findIndex(
      (media) => media.url === clickedMedia.url
    );

    setLightboxImages(images);
    setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxImages([]);
    setCurrentImageIndex(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post("/reviews", {
        content: content.trim(),
        rating,
        productId,
        orderId,
        medias,
      });

      toast.success("Gửi đánh giá thành công!");

      // Reset form
      setContent("");
      setRating(5);
      setMedias([]);
      setMediaUrl("");

      // Callback to parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`feedback-section ${isCompact ? "compact" : ""}`}>
      <div className="feedback-card">
        <h1 className="feedback-title">Đánh giá sản phẩm</h1>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="rating">Đánh giá</label>
            <select
              name="rating"
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value="1">1 sao</option>
              <option value="2">2 sao</option>
              <option value="3">3 sao</option>
              <option value="4">4 sao</option>
              <option value="5">5 sao</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung</label>
            <textarea
              name="content"
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Hình ảnh/Video (tùy chọn)</label>
            <div className="media-input">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Nhập URL hình ảnh hoặc video"
                disabled={uploadingMedia}
              />
              <button
                type="button"
                onClick={handleAddMedia}
                className="add-media-btn"
                disabled={uploadingMedia}
              >
                Thêm
              </button>

              {/* Upload button */}
              <label className="add-media-btn upload-btn">
                📁 Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(file);
                    }
                  }}
                  disabled={uploadingMedia}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Progress bar */}
            {uploadingMedia && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}

            {medias.length > 0 && (
              <div className="media-list">
                {medias.map((media, index) => (
                  <div key={index} className="media-item">
                    <img
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      className="media-preview"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        media.type === "IMAGE" && handleImageClick(index)
                      }
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="remove-media-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="feedback-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      </div>

      {/* Lightbox for images */}
      <LightboxModal
        isOpen={showLightbox}
        images={lightboxImages}
        startIndex={currentImageIndex}
        onClose={closeLightbox}
      />
    </section>
  );
};

export default FeedbackFormComponent;
