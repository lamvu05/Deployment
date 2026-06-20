const BookingService = require('../services/bookingService');
const { catchAsync } = require('../utils/catchAsync');

/** POST /api/bookings */
const create = catchAsync(async (req, res) => {
  const booking = await BookingService.create(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { booking } });
});

/** GET /api/bookings/my */
const getMyBookings = catchAsync(async (req, res) => {
  const bookings = await BookingService.getMyBookings(req.user.id);
  res.json({ status: 'success', results: bookings.length, data: { bookings } });
});

/** GET /api/bookings/:id */
const getById = catchAsync(async (req, res) => {
  const booking = await BookingService.getById(req.params.id, req.user.id, req.user.role);
  res.json({ status: 'success', data: { booking } });
});

/** PATCH /api/bookings/:id/cancel */
const cancel = catchAsync(async (req, res) => {
  const booking = await BookingService.cancel(req.params.id, req.user.id, req.user.role);
  res.json({ status: 'success', data: { booking } });
});

/** PATCH /api/bookings/:id/confirm — admin only */
const confirm = catchAsync(async (req, res) => {
  const booking = await BookingService.confirm(req.params.id);
  res.json({ status: 'success', data: { booking } });
});

/** GET /api/bookings — admin only */
const getAll = catchAsync(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const result = await BookingService.getAll({ status, date, page: +page, limit: +limit });
  res.json({ status: 'success', ...result });
});

/** GET /api/bookings/stats — admin only */
const getStats = catchAsync(async (req, res) => {
  const stats = await BookingService.getStats();
  res.json({ status: 'success', data: { stats } });
});

/** GET /api/bookings/slots?service_id=&date= */
const getSlots = catchAsync(async (req, res) => {
  const { service_id, date } = req.query;
  const result = await BookingService.getAvailableSlots(service_id, date);
  res.json({ status: 'success', data: result });
});

module.exports = { create, getMyBookings, getById, cancel, confirm, getAll, getStats, getSlots };
