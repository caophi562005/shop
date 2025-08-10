import React from "react";


interface SaleItem {
    id: number;
    image: string;
    title: string;
    description: string;
}

const Sale: React.FC = () => {
    // Fake data thay cho dữ liệu PHP
    const sales: SaleItem[] = [
        {
            id: 1,
            image: "images/sale1.jpg",
            title: "Khuyến mãi mùa hè",
            description: "Giảm giá 50% cho tất cả sản phẩm trong mùa hè này!"
        },
        {
            id: 2,
            image: "images/sale2.jpg",
            title: "Mua 1 tặng 1",
            description: "Áp dụng cho tất cả sản phẩm trong tuần lễ vàng."
        },
        {
            id: 3,
            image: "images/sale3.jpg",
            title: "Giảm giá cuối năm",
            description: "Cơ hội mua sắm với giá rẻ nhất trong năm."
        }
    ];

    return (
        <div className="sale-container">
            <h1>Khuyến mãi</h1>
            <div className="sale-grid">
                {sales.map((sale) => (
                    <div className="sale-item" key={sale.id}>
                        <img src={sale.image} alt={sale.title} className="sale-image" />
                        <h2>{sale.title}</h2>
                        <p>{sale.description}</p>
                        <button className="sale-button">Xem chi tiết</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sale;
