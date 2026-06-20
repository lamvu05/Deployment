const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `BookingApp <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    // We don't want to crash the request if email sending fails (non-blocking notification)
  }
};

const emailService = {
  sendBookingConfirmation: async (userEmail, userName, bookingDetails) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #7c6aff; text-align: center;">📅 Đặt Lịch Thành Công!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Lịch của bạn đã được tiếp nhận và đang chờ xác nhận.</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4a5568;">Chi tiết đặt lịch:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #718096;">Dịch vụ:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.service_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #718096;">Ngày đặt:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.booking_date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #718096;">Thời gian:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.start_time} - ${bookingDetails.end_time}</td>
            </tr>
            ${bookingDetails.location ? `
            <tr>
              <td style="padding: 6px 0; color: #718096;">Địa điểm:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.location}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 0; color: #718096;">Trạng thái:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #d69e2e;">Chờ xác nhận</td>
            </tr>
          </table>
        </div>
        
        <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px;">
          Đây là email tự động từ hệ thống. Vui lòng không trả lời email này.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `[BookingApp] Xác nhận yêu cầu đặt lịch: ${bookingDetails.service_name}`,
      html,
    });
  },

  sendBookingStatusUpdate: async (userEmail, userName, bookingDetails, newStatus) => {
    let statusLabel = 'Chờ xác nhận';
    let statusColor = '#d69e2e';
    if (newStatus === 'confirmed') {
      statusLabel = 'Đã xác nhận';
      statusColor = '#38a169';
    } else if (newStatus === 'cancelled') {
      statusLabel = 'Đã huỷ';
      statusColor = '#e53e3e';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: ${statusColor}; text-align: center;">🔔 Cập Nhật Trạng Thái Đặt Lịch</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Trạng thái đặt lịch của bạn đã được cập nhật thành: <strong style="color: ${statusColor};">${statusLabel}</strong>.</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4a5568;">Thông tin lịch đặt:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #718096;">Dịch vụ:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.service_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #718096;">Ngày đặt:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.booking_date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #718096;">Thời gian:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2d3748;">${bookingDetails.start_time} - ${bookingDetails.end_time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #718096;">Trạng thái mới:</td>
              <td style="padding: 6px 0; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
            </tr>
          </table>
        </div>
        
        <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px;">
          Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `[BookingApp] Cập nhật đặt lịch: ${bookingDetails.service_name} [${statusLabel}]`,
      html,
    });
  },
};

module.exports = emailService;
