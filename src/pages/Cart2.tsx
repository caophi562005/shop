import React, { useEffect, useState } from 'react';
import '../assets/css/Cart2.css';

type CartItem = {
  id: number;
  product_name: string;
  imgURL: string;
  price: number;
  quantity: number;
  total: number;
};

type Coupon = {
  code: string;
  percent: number;
  min_order: number;
  expiration: string | null;
};

type Props = {
  cartItems: CartItem[];
  subTotal: number;
  discount?: number;
  coupon?: Coupon;
  grand: number;
};

const Cart2: React.FC<Props> = ({ cartItems, subTotal, discount = 0, coupon, grand }) => {
  const [items, setItems] = useState<CartItem[]>(cartItems);
  const [showModal, setShowModal] = useState(false);
  const [couponList, setCouponList] = useState<Coupon[] | null>(null);
  const [sumSubtotal, setSubtotal] = useState(subTotal);
  const [sumGrand, setGrand] = useState(grand);

  const formatVN = (num: number) => new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';

  // --- Load coupon list ---
  const loadCoupons = () => {
    fetch('index.php?controller=CouponAdmin&action=getValidAjax')
      .then(res => res.json())
      .then(setCouponList);
  };

  const applyCoupon = (code: string) => {
    fetch('index.php?controller=cart&action=applyCoupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: `code=${encodeURIComponent(code)}`
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) window.location.reload();
        else alert(data.message);
      });
  };

  const removeCoupon = () => {
    fetch('index.php?controller=cart&action=removeCoupon', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) window.location.reload();
        else alert('Không thể xóa coupon');
      });
  };

  const changeQty = (id: number, action: 'plus' | 'minus') => {
    fetch('index.php?controller=cart&action=update', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: new URLSearchParams({ change_qty: `${action}-${id}` }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) return alert('Cập nhật thất bại');
        setItems((prev) =>
          prev.map((item) =>
            item.id === data.itemId
              ? {
                  ...item,
                  quantity: data.newQty,
                  total: data.itemTotal,
                }
              : item
          )
        );
        setSubtotal(data.subTotal);
        setGrand(data.grandTotal);
      });
  };

  const deleteItem = (id: number) => {
    fetch(`index.php?controller=cart&action=delete&id=${id}`, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) return alert('Xóa thất bại');
        setItems(prev => prev.filter(i => i.id !== data.deletedId));
        setSubtotal(data.subTotal);
        setGrand(data.grandTotal);
      });
  };

  const renderImage = (url: string) =>
    /^(\/PIXCAM\/|https?:\/\/)/.test(url) ? url : '/PIXCAM/' + url.replace(/^\/+/, '');

  return (
    <div className="content">
      <div className="cart-wrapper">
        {items.length ? (
          <>
            <div className="cart-left">
              <div className="title-btn">
                <h2>Giỏ hàng của bạn</h2>
                <button id="btn-open-coupon" className="btn-coupon" onClick={() => {
                  setShowModal(true);
                  loadCoupons();
                }}>
                  Chọn mã giảm giá
                </button>
              </div>
              <div className="cart-items">
                <table className="table_cart">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Tạm tính</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} data-item-id={item.id}>
                        <td className="cart-product">
                          <img src={renderImage(item.imgURL)} className="cart-thumb" alt="" />
                          <span className="cart-name">{item.product_name}</span>
                        </td>
                        <td>{formatVN(item.price)}</td>
                        <td>
                          <div className="qty-form">
                            <button onClick={() => changeQty(item.id, 'minus')}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => changeQty(item.id, 'plus')}>+</button>
                          </div>
                        </td>
                        <td>{formatVN(item.total)}</td>
                        <td>
                          <button onClick={() => deleteItem(item.id)} className="btn-delete">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="cart-right">
              <h3>Tổng giỏ hàng</h3>
              <div className="summary-line">
                <span>Tạm tính</span>
                <span id="sum-subtotal">{formatVN(sumSubtotal)}</span>
              </div>

              {discount > 0 && coupon && (
                <div className="summary-line" style={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
                  <span>Giảm ({coupon.percent}%)</span>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: 4 }}>−</span>
                    {formatVN(discount)}
                    <button
                      type="button"
                      id="btn-remove-coupon"
                      style={{
                        marginLeft: 8,
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer'
                      }}
                      onClick={removeCoupon}
                      title="Xóa mã"
                    >
                      &times;
                    </button>
                  </span>
                </div>
              )}

              <div className="summary-line total">
                <span>Tổng cộng</span>
                <span id="sum-grand">{formatVN(sumGrand)}</span>
              </div>
              <a href="index.php?controller=pay&action=index" className="btn-payment">Tiến hành thanh toán</a>
            </div>
          </>
        ) : (
          <p>Giỏ hàng của bạn đang trống.</p>
        )}
      </div>

      {/* Modal chọn coupon */}
      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>Chọn Mã Giảm Giá</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <table className="modal-table" id="coupon-table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>%</th>
                    <th>Đơn tối thiểu</th>
                    <th>Hạn</th>
                    <th>Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {!couponList ? (
                    <tr><td colSpan={5} className="text-center text-muted">Đang tải...</td></tr>
                  ) : couponList.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted">Không có coupon</td></tr>
                  ) : (
                    couponList.map((c, i) => (
                      <tr key={i}>
                        <td>{c.code}</td>
                        <td>{c.percent}%</td>
                        <td>{formatVN(c.min_order)}</td>
                        <td>{c.expiration ? new Date(c.expiration).toLocaleString('vi-VN') : 'Không giới hạn'}</td>
                        <td>
                          <button className="btn-select" onClick={() => applyCoupon(c.code)}>Chọn</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart2;
