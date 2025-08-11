import React from 'react';
import './feedbackReadonly.css';

const FeedbackReadonly: React.FC = () => {
    // Fake data
    const feedback = {
        rating: 4,
        comment: 'Sản phẩm rất tốt, giao hàng nhanh.\nTôi sẽ ủng hộ lần sau!'
    };

    // Hiển thị sao
    const renderStars = () => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < feedback.rating ? '#ffc107' : '#ccc' }}>
                &#9733;
            </span>
        ));
    };

    return (
        <section className="feedback-section">
            <div className="feedback-card">
                <h1 className="feedback-title">Nội dung đánh giá của bạn</h1>

                <div className="feedback-content">
                    <div className="field-group">
                        <label>Số sao:</label>
                        <div className="stars">{renderStars()}</div>
                    </div>

                    <div className="field-group">
                        <label>Bình luận:</label>
                        <div>
                            {feedback.comment.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeedbackReadonly;
