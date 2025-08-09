import React, { useState } from 'react';
import './feedbackfrom.css';

const FeedbackForm: React.FC = () => {
  // Fake data
  const [feedback, setFeedback] = useState<string>('');
  const [flashSuccess, setFlashSuccess] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);

  const paymentId = '123'; // fake ID
  const productId = '456'; // fake ID

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setFlashError('Vui lòng nhập nội dung đánh giá.');
      setFlashSuccess(null);
    } else {
      setFlashSuccess('Gửi đánh giá thành công!');
      setFlashError(null);
    }
  };

  return (
    <section className="feedback-section">
      <div className="feedback-card">
        <h1 className="feedback-title">
          {feedback ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}
        </h1>

        {flashError && <div className="feedback-message error">{flashError}</div>}
        {flashSuccess && <div className="feedback-message success">{flashSuccess}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <input type="hidden" name="payment_id" value={paymentId} />
          <input type="hidden" name="product_id" value={productId} />

          <label htmlFor="rating">Đánh giá</label>
          <select name="rating" id="rating" defaultValue="5">
            <option value="1">1 sao</option>
            <option value="2">2 sao</option>
            <option value="3">3 sao</option>
            <option value="4">4 sao</option>
            <option value="5">5 sao</option>
          </select>

          <label htmlFor="content">Nội dung</label>
          <textarea
            name="content"
            id="content"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
          ></textarea>

          <button type="submit" className="feedback-submit">Gửi đánh giá</button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;