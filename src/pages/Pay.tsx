import React, { useState } from 'react';
import './pay.css';

const Pay: React.FC = () => {
    // Fake data user ban đầu
    const [formData, setFormData] = useState({
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'nguyenvana@example.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        paymentMethod: 'cod',
    });

    const [errors, setErrors] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate đơn giản
        const newErrors: string[] = [];
        if (formData.name.trim().length < 2) newErrors.push('Họ tên phải có ít nhất 2 ký tự');
        if (!/^\d{9,11}$/.test(formData.phone)) newErrors.push('Số điện thoại phải từ 9-11 chữ số');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.push('Email không hợp lệ');
        if (formData.address.trim() === '') newErrors.push('Địa chỉ không được để trống');

        setErrors(newErrors);
        if (newErrors.length === 0) {
            alert('Thanh toán thành công!');
        }
    };

    return (
        <div className="content">
            <h1 className="inf_title_paycart">Thông tin thanh toán</h1>

            {errors.length > 0 && (
                <div className="message error">
                    {errors.map((err, idx) => (
                        <p key={idx}>{err}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="contentPayCart">
                    {/* Thông tin người dùng */}
                    <div className="infPay">
                        <div className="box_infPay">
                            <p className="lable_infPay"><strong>Họ và tên</strong></p>
                            <input
                                name="name"
                                type="text"
                                className="input_box_infPay"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>

                        <div className="box_sdt">
                            <div className="item_infPays">
                                <p><strong>Số điện thoại</strong></p>
                                <input
                                    name="phone"
                                    type="tel"
                                    className="input_box_sdt"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="\\d{9,11}"
                                />
                            </div>
                            <div className="item_infPays">
                                <p><strong>Địa chỉ email</strong></p>
                                <input
                                    name="email"
                                    type="email"
                                    className="input_box_sdt"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="box_infPay">
                            <p className="lable_infPay"><strong>Địa chỉ giao hàng</strong></p>
                            <input
                                name="address"
                                type="text"
                                className="input_box_sdt"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="box_infPay">
                        <p className="lable_infPay"><strong>Phương thức thanh toán</strong></p>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={formData.paymentMethod === 'cod'}
                                    onChange={handleChange}
                                />
                                Thanh toán khi nhận hàng
                            </label>
                            <br />
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="bank"
                                    checked={formData.paymentMethod === 'bank'}
                                    onChange={handleChange}
                                />
                                Chuyển khoản ngân hàng
                            </label>
                        </div>
                    </div>

                    {/* Nút xác nhận */}
                    <button type="submit" className="btn_submit_pay">Xác nhận thanh toán</button>
                </div>
            </form>
        </div>
    );
};

export default Pay;