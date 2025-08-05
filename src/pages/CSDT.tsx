import React from 'react';

const CSDT: React.FC = () => {
  return (
    <div className="content">
      <div className="content_CSTV">
        <style>
          {`
            .csdt {
              font-size: 24px;
            }
          `}
        </style>

        <div id="text" style={{ marginTop: '50px' }}>
          <div className="csdt"><b>Chính Sách Đổi Trả:</b></div>
          <br />

          <b>1. Tất cả các sản phẩm đã mua sẽ không được hoàn trả bằng tiền mặt.</b><br /><br />

          <b>2. Yêu cầu sản phẩm:</b><br /><br />
          - Sản phẩm còn mới, nguyên tag, chưa sử dụng, sửa chữa hay giặt, là trong vòng 7 ngày kể từ ngày nhận hàng.<br /><br />
          - Sản phẩm được mua nguyên giá, không áp dụng hình thức khuyến mại, giảm giá. Các sản phẩm được mua trong chương trình khuyến mãi giảm giá sẽ không được đổi trả. <br /><br />

          <b>3. Khách hàng được chấp nhận đổi sang bất kỳ món hàng nào có bán trong cửa hàng bằng hoặc hơn giá trị:</b><br /><br />
          - Cửa hàng không trả lại tiền thừa nếu khách muốn đổi sang sản phẩm có giá trị thấp hơn.<br /><br />
          - Hàng chỉ đổi một lần duy nhất.<br /><br />
          - Kiểm tra kỹ chất lượng sản phẩm đổi.<br /><br />

          <b>4. Cách thức đổi hàng:</b><br /><br />
          - Trường hợp đến trực tiếp cửa hàng: khách hàng mang theo hoá đơn và sản phẩm nguyên tag tới cửa hàng để được hỗ trợ đổi hàng<br /><br />
          - Trường hợp đổi hàng qua hình thức chuyển hàng:<br /><br />

          + Khách hàng chụp đầy đủ hóa đơn, tình trạng hàng, mác hàng và gửi hình ảnh kèm thông tin cá nhân đến fanpage PIXCAM để được tư vấn đổi hàng.<br /><br />
          + Khi được sự đồng ý của nhân viên, khách bọc sản phẩm muốn đổi chuyển về địa chỉ như nhân viên chăm sóc khách hàng hướng dẫn và lựa chọn sản phẩm muốn đổi.<br /><br />
          + Khách hàng thanh toán phần chênh lệch (nếu có) giữa sản phẩm mới và sản phẩm cũ.<br /><br />
          + Khi nhận được sản phẩm cần đổi và chuyển khoản chênh lệch (nếu có), nhân viên bọc hàng và gửi sản phẩm khách chọn đổi.<br /><br />

          <b>Lưu ý:</b> <br /><br />
          + Với trường hợp sản phẩm bị lỗi do nhà sản xuất (sản phẩm rách, bung chỉ, sờn vải), lỗi gửi nhầm và thiếu hàng, bên phía PIXCAM sẽ chịu phí ship đổi trả sản phẩm.<br /><br />
          + Với trường hợp khách hàng muốn đổi sản phẩm do lệch size hoặc muốn đổi sản phẩm khác, bên phía khách hàng sẽ chịu phí đổi trả sản phẩm.<br /><br />
        </div>
      </div>
    </div>
  );
};

export default CSDT;
