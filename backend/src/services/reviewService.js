const ReviewModel = require('../models/reviewModel');
const BookingModel = require('../models/bookingModel');
const AppError = require('../utils/AppError');

const ReviewService = {
  create: async (userId, { service_id, rating, comment }) => {
    // Validate: User must have at least one confirmed booking for this service
    const myBookings = await BookingModel.findByUser(userId);
    const hasBooked = myBookings.some(
      (b) => b.service_id === service_id && b.status === 'confirmed'
    );

    if (!hasBooked) {
      throw new AppError('Bạn chỉ có thể đánh giá dịch vụ sau khi có lịch đặt được xác nhận', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Đánh giá phải từ 1 đến 5 sao', 400);
    }

    return ReviewModel.create({ user_id: userId, service_id, rating, comment });
  },

  getByService: (serviceId) => ReviewModel.findByService(serviceId),
};

module.exports = ReviewService;
