import React from "react";
import "./orderHistory.css"; // Giữ nguyên nếu bạn có file CSS cũ

type Product = {
    name: string;
    quantity: number;
    price: number;
};

type Order = {
    id: string;
    date: string;
    total: string;
    method: string;
    products: Product[];
};

const fakeOrders: Order[] = [
    {
        id: "DH001",
        date: "2025-08-01",
        total: "1,200,000 VND",
        method: "COD",
        products: [
            { name: "Áo thun", quantity: 2, price: 200000 },
            { name: "Quần jeans", quantity: 1, price: 800000 },
        ],
    },
    {
        id: "DH002",
        date: "2025-08-05",
        total: "750,000 VND",
        method: "Chuyển khoản",
        products: [
            { name: "Giày sneaker", quantity: 1, price: 750000 },
        ],
    },
];

const OrderHistory: React.FC = () => {
    return (
        <div className="wrapper">
            <h1>Lịch sử đơn hàng</h1>

            {fakeOrders.length > 0 ? (
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
                        {fakeOrders.map((order, orderIdx) => (
                            order.products.map((product, productIdx) => (
                                <tr key={`${order.id}-${productIdx}`}>
                                    {productIdx === 0 && (
                                        <>
                                            <td rowSpan={order.products.length}>{order.id}</td>
                                            <td rowSpan={order.products.length}>{order.date}</td>
                                            <td rowSpan={order.products.length}>{order.total}</td>
                                            <td rowSpan={order.products.length}>{order.method}</td>
                                        </>
                                    )}
                                    <td>{product.name} x{product.quantity}</td>
                                    <td>
                                        <button>Đánh giá</button>
                                    </td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Không có đơn hàng nào.</p>
            )}
        </div>
    );
};

export default OrderHistory;
