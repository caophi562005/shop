import React from 'react';

const CSTV: React.FC = () => {
  return (
    <div className="content">
      <div className="content_CSTV">
        <style>
          {`
            .hang1 {
              font-size: 24px;
            }
          `}
        </style>

        <br /><br /><br />
        <div className="cstv"><b className="hang1">Chính sách thành viên</b></div>
        <br />

        <b>1. Hạng Member:</b><br /><br />
        Khách hàng đăng ký thẻ thành viên tại các cơ sở cửa hàng của PIXCAM trên toàn quốc với điều kiện hóa đơn trên 500.000VNĐ<br /><br />

        <b>2. Hạng Silver:</b><br /><br />
        Khi tích đủ 5 triệu đồng, bạn sẽ được lên hạng thẻ SILVER với ưu đãi:<br /><br />
        - Giảm 5% cho toàn bộ đơn hàng<br /><br />
        - Tặng Voucher giảm 10% cho tháng sinh nhật<br /><br />

        <b>3. Hạng Gold:</b><br /><br />
        Khi tích đủ 20 triệu đồng, bạn sẽ được lên hạng thẻ GOLD với ưu đãi:<br /><br />
        - Giảm 8% cho toàn bộ đơn hàng<br /><br />
        - Tặng Voucher giảm 15% cho tháng sinh nhật<br /><br />

        <b>4. Hạng Platinum:</b><br /><br />
        Khi tích lũy đủ triệu đồng, bạn sẽ được nâng hạng thẻ PLATINUM với ưu đãi:<br /><br />
        - Giảm 12% cho toàn bộ đơn hàng<br /><br />
        - Tặng Voucher giảm 20% cho tháng sinh nhật<br /><br />

        <b>5. Hạng Diamond:</b><br /><br />
        Khi tích đủ 100.000.000 triệu đồng, bạn sẽ được lên hạng thẻ DIAMOND với ưu đãi hấp dẫn:<br /><br />
        - Giảm 12% cho toàn bộ đơn hàng<br /><br />
        - Tặng Voucher giảm 20% cho tháng sinh nhật<br /><br />
        - Cuối năm có một phần quà đặc biệt từ PIXCAM<br /><br />

        <b>Chương trình tích điểm</b><br /><br />
        Mỗi lần thanh toán khách hàng sẽ được cộng số điểm tương ứng với giá trị đơn hàng. Khi tích đủ điểm, quý khách tự động được thăng hạng trong hệ thống và được nhân viên thông báo để đổi thẻ mới. <br /><br />
      </div>
    </div>
  );
};

export default CSTV;
