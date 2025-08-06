import React from 'react';
import './orderHistory.css';

// Fake data thay cho $orders PHP
const orders = [
    {
        payment_id: 1001,
        createAt: '2025-08-01',
        finalTotal: 250000,
        paymentMethod: 'COD',
        products: [
            { product_id: 1 },
            { product_id: 2 },
        ],
        feedbacks: {
            1: { has: true, edited: true },
            2: { has: true, edited: false },
        }
    },
    {
        payment_id: 1002,
        createAt: '2025-08-02',
        finalTotal: 150000,
        paymentMethod: 'VNPAY',
        products: [
            { product_id: 3 }
        ],
        feedbacks: {
            3: { has: false, edited: false }
        }
    }
];

const OrderHistory = () => {
    const page = 1;
    const totalPages = 3;

    return (
        <div className="wrapper">
            <h1>Lịch sử đơn hàng</h1>
            {orders.length > 0 ? (
                <>
                    <table className="order-history-table">
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Ngày đặt hàng</th>
                                <th>Tổng cộng</th>
                                <th>Phương thức</th>
                                <th>Xem chi tiết</th>
                                <th>Đánh giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, idx) => {
                                const rowspan = order.products.length;
                                let firstRow = true;
                                return order.products.map((product, index) => (
                                    <tr key={`order-${idx}-product-${index}`}>
                                        {firstRow && (
                                            <>
                                                <td rowSpan={rowspan}>{order.payment_id}</td>
                                                <td rowSpan={rowspan}>{new Date(order.createAt).toLocaleDateString('vi-VN')}</td>
                                                <td rowSpan={rowspan}>{order.finalTotal.toLocaleString('vi-VN')} VNĐ</td>
                                                <td rowSpan={rowspan}>{order.paymentMethod}</td>
                                                <td rowSpan={rowspan}>
                                                    <a href={`#detail/${order.payment_id}`}>Xem chi tiết</a>
                                                </td>
                                            </>
                                        )}
                                        <td>
                                            {(() => {
                                                const feedback = order.feedbacks[product.product_id] || {};
                                                if (!feedback.has) {
                                                    return <a className="btn-rate" href={`#feedback/${order.payment_id}/${product.product_id}`}>Đánh giá</a>;
                                                } else if (!feedback.edited) {
                                                    return <a className="btn-rate" href={`#feedback/${order.payment_id}/${product.product_id}`}>Sửa đánh giá</a>;
                                                } else {
                                                    return <span className="btn-rate disabled" title="Bạn đã sửa đánh giá">Đã sửa</span>;
                                                }
                                            })()}
                                        </td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>

                    <div className="pagination">
                        {page > 1 && <a href={`#page=${page - 1}`}>« Trang trước</a>}
                        <span>Trang {page} / {totalPages}</span>
                        {page < totalPages && <a href={`#page=${page + 1}`}>Trang sau »</a>}
                    </div>
                </>
            ) : (
                <div className="empty-message">
                    <p>Không có đơn hàng nào trong lịch sử của bạn.</p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;