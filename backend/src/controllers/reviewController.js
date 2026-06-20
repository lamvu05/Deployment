const ReviewService = require('../services/reviewService');
const { catchAsync } = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  const { service_id, rating, comment } = req.body;
  const review = await ReviewService.create(req.user.id, { service_id, rating, comment });
  res.status(201).json({ status: 'success', data: { review } });
});

const getByService = catchAsync(async (req, res) => {
  const reviews = await ReviewService.getByService(req.params.serviceId);
  res.json({ status: 'success', results: reviews.length, data: { reviews } });
});

module.exports = { create, getByService };
