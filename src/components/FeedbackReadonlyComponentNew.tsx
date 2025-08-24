import React, { useState } from "react";
import "../assets/css/feedbackReadonly.css";
import http from "../api/http";
import { toast } from "react-toastify";

interface MediaItem {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  reviewId: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  avatar: string | null;
}

interface ReviewData {
  id: number;
  content: string;
  rating: number;
  orderId: number;
  productId: number;
  userId: number;
  updateCount: number;
  createdAt: string;
  updatedAt: string;
  medias: MediaItem[];
  user: User;
}

interface FeedbackReadonlyProps {
  reviewData: ReviewData;
  onEditSuccess?: () => void;
  isCompact?: boolean;
}

const FeedbackReadonlyComponent: React.FC<FeedbackReadonlyProps> = ({
  reviewData,
  onEditSuccess,
  isCompact = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [content, setContent] = useState<string>(reviewData.content);
  const [rating, setRating] = useState<number>(reviewData.rating);
  const [medias, setMedias] = useState<any[]>(
    reviewData.medias.map((media) => ({
      url: media.url,
      type: media.type,
    }))
  );
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Hiển thị sao
  const renderStars = (ratingValue: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < ratingValue ? "#ffc107" : "#ccc",
          fontSize: isCompact ? "16px" : "20px",
        }}
      >
        ★
      </span>
    ));
  };

  const handleAddMedia = () => {
    if (mediaUrl.trim()) {
      const newMedia = {
        url: mediaUrl.trim(),
        type: "IMAGE" as const,
      };
      setMedias([...medias, newMedia]);
      setMediaUrl("");
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedias(medias.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await http.put(`/reviews/${reviewData.id}`, {
        content: content.trim(),
        rating,
        productId: reviewData.productId,
        orderId: reviewData.orderId,
        medias,
      });

      toast.success("Cập nhật đánh giá thành công!");
      setIsEditing(false);

      // Callback to parent component
      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Không thể cập nhật đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (isEditing) {
    return (
      <section className={`feedback-section ${isCompact ? "compact" : ""}`}>
        <div className="feedback-card">
          <h1 className="feedback-title">Chỉnh sửa đánh giá</h1>

          <form onSubmit={handleUpdateSubmit} className="feedback-form">
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
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="add-media-btn"
                >
                  Thêm
                </button>
              </div>

              {medias.length > 0 && (
                <div className="media-list">
                  {medias.map((media, index) => (
                    <div key={index} className="media-item">
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="media-preview"
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

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="feedback-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật đánh giá"}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className={`feedback-section ${isCompact ? "compact" : ""}`}>
      <div className="feedback-card">
        <div className="feedback-header">
          {!isCompact && <h1 className="feedback-title">Đánh giá của bạn</h1>}
          {reviewData.updateCount < 1 && !isCompact && (
            <button
              onClick={() => setIsEditing(true)}
              className="edit-review-btn"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="feedback-content">
          <div className="reviewer-info">
            <div className="reviewer-avatar">
              {reviewData.user.avatar ? (
                <img src={reviewData.user.avatar} alt={reviewData.user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {reviewData.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="reviewer-details">
              <h4>{reviewData.user.name}</h4>
              <p className="review-date">
                Đánh giá vào {formatDate(reviewData.createdAt)}
              </p>
              {reviewData.updatedAt !== reviewData.createdAt && (
                <p className="review-updated">
                  Đã chỉnh sửa vào {formatDate(reviewData.updatedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="field-group">
            <label>Đánh giá:</label>
            <div className="stars">{renderStars(reviewData.rating)}</div>
          </div>

          <div className="field-group">
            <label>Nội dung:</label>
            <div className="review-content">
              {reviewData.content.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {reviewData.medias.length > 0 && (
            <div className="field-group">
              <label>Hình ảnh/Video:</label>
              <div className="media-gallery">
                {reviewData.medias.map((media) => (
                  <div key={media.id} className="media-item">
                    {media.type === "IMAGE" ? (
                      <img
                        src={media.url}
                        alt="Review media"
                        className="media-display"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        className="media-display"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewData.updateCount >= 1 && !isCompact && (
            <div className="update-notice">
              <p>
                <em>
                  Đánh giá này đã được chỉnh sửa và không thể chỉnh sửa thêm.
                </em>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackReadonlyComponent;
