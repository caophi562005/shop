import React, { useState } from "react";
import "../assets/css/feedbackfrom.css";
import http from "../api/http";
import { toast } from "react-toastify";

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

  const handleRemoveMedia = (index: number) => {
    setMedias(medias.filter((_, i) => i !== index));
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

          <button
            type="submit"
            className="feedback-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackFormComponent;
