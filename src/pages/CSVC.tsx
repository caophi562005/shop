import React from 'react';

const CSVC: React.FC = () => {
  return (
    <div className="content">
      <div className="content_CSTV">
        <style>
          {`
            .csvc {
              font-size: 24px;
            }
          `}
        </style>

        <div id="text">
          <br /><br /><br />
          <div className="csvc" style={{ paddingBottom: '10px' }}>
            <b>Chính sách vận chuyển</b>
          </div>

          <b>1. Trường hợp miễn phí phí giao hàng:</b><br /><br />
          - Miễn phí giao hàng với đơn hàng từ 700.000 đồng.<br /><br />

          <b>2. Phí vận chuyển:</b><br /><br />
          - Khu vực nội thành TP.Hồ Chí Minh: Phí vận chuyển do hãng vận chuyển quy định.<br /><br />
          - Khu vực ngoại thành TP.Hồ Chí Minh và các tỉnh: Phí vận chuyển do bên cung cấp vận chuyển quy định, tính theo khoảng cách và cân nặng của hàng hóa.<br /><br />

          <b>3. Xác nhận đơn hàng:</b><br /><br />
          - Tất cả đơn hàng đặt trên Facebook / Website / Instagram đều cần được xác nhận thông qua số điện thoại đặt hàng của khách hàng.<br /><br />
          - Những đơn hàng được gọi xác nhận nhưng không thể liên lạc từ 2 lần hệ thống sẽ tự động hủy đơn.<br /><br />
          - Bên vận chuyển sẽ gọi điện để liên lạc ship hàng sau khi được xác nhận. Trong trường hợp không thể liên lạc với khách hàng từ 2 lần, đơn hàng sẽ tự động hủy.<br /><br />

          <b>4. Thời gian nhận hàng:</b><br /><br />
          - Nội thành TP.Hồ Chí Minh: 1-3 ngày kể từ khi đặt hàng.<br /><br />
          - Ngoại thành TP.Hồ Chí Minh: 3-5 ngày, tính theo ngày làm việc của bên cung cấp vận chuyển.<br /><br />

          <b>5. Hình thức thanh toán:</b><br /><br />
          - Nội thành: chuyển khoản hoặc thanh toán sau khi nhận hàng (COD).<br /><br />
          - Ngoại thành: chuyển khoản hoặc thanh toán sau khi nhận hàng (COD).<br /><br />

          <b>Lưu ý:</b><br />
          Với những đơn hàng trị giá lớn hơn 2.000.000 đồng, chúng tôi không nhận phương thức thanh toán COD. Khách hàng cần thanh toán 100% giá trị đơn hàng trước khi ship hàng.<br /><br />
        </div>
      </div>
    </div>
  );
};

export default CSVC;
