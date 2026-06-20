const BookingModel = require('../models/bookingModel');
const ServiceModel = require('../models/serviceModel');
const UserModel = require('../models/userModel');
const emailService = require('./emailService');
const AppError = require('../utils/AppError');

const BookingService = {
  /**
   * Create a booking after validating: service exists, date is future, slot is free
   */
  create: async (userId, { service_id, booking_date, start_time, end_time, notes }) => {
    // 1. Service must exist and be active
    const service = await ServiceModel.findById(service_id);
    if (!service || !service.is_active) throw new AppError('Service not found or inactive', 404);

    // 2. booking_date must not be in the past
    const today = new Date().toISOString().split('T')[0];
    if (booking_date < today) throw new AppError('Cannot book a date in the past', 400);

    // 3. Overlap check
    const overlaps = await BookingModel.checkOverlap(service_id, booking_date, start_time, end_time);
    if (overlaps) throw new AppError('This time slot is already booked', 409);

    const booking = await BookingModel.create({ user_id: userId, service_id, booking_date, start_time, end_time, notes });

    // Fetch user for sending email
    const user = await UserModel.findById(userId);
    if (user && user.email) {
      emailService.sendBookingConfirmation(user.email, user.name, {
        service_name: service.name,
        booking_date,
        start_time,
        end_time,
        location: service.location,
      });
    }

    return booking;
  },

  /** Get current user's bookings */
  getMyBookings: (userId) => BookingModel.findByUser(userId),

  /** Get a single booking — user can only see their own, admin sees all */
  getById: async (id, requesterId, requesterRole) => {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (requesterRole !== 'admin' && booking.user_id !== requesterId) {
      throw new AppError('Access denied', 403);
    }
    return booking;
  },

  /** Cancel a booking */
  cancel: async (id, requesterId, requesterRole) => {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (requesterRole !== 'admin' && booking.user_id !== requesterId) {
      throw new AppError('Access denied', 403);
    }
    if (booking.status === 'cancelled') throw new AppError('Booking is already cancelled', 400);
    
    const updatedBooking = await BookingModel.updateStatus(id, 'cancelled');

    // Notify user about cancellation
    if (booking.user_email) {
      emailService.sendBookingStatusUpdate(booking.user_email, booking.user_name, {
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
      }, 'cancelled');
    }

    return updatedBooking;
  },

  /** Admin: confirm a booking */
  confirm: async (id) => {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status !== 'pending') throw new AppError('Only pending bookings can be confirmed', 400);
    
    const updatedBooking = await BookingModel.updateStatus(id, 'confirmed');

    // Notify user about confirmation
    if (booking.user_email) {
      emailService.sendBookingStatusUpdate(booking.user_email, booking.user_name, {
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
      }, 'confirmed');
    }

    return updatedBooking;
  },

  /** Admin: list all bookings with filters */
  getAll: ({ status, date, page, limit }) =>
    BookingModel.findAll({ status, date, page, limit }),

  /** Admin: dashboard stats */
  getStats: () => BookingModel.getStats(),

  /** Get available slots for a service on a date */
  getAvailableSlots: async (service_id, date) => {
    const service = await ServiceModel.findById(service_id);
    if (!service) throw new AppError('Service not found', 404);

    const booked = await BookingModel.getBookedSlots(service_id, date);

    // Generate hourly slots from 08:00 to 18:00
    const allSlots = [];
    for (let h = 8; h < 18; h++) {
      const start = `${String(h).padStart(2, '0')}:00`;
      const end = `${String(h + 1).padStart(2, '0')}:00`;
      const isBooked = booked.some(
        (b) => b.start_time.slice(0, 5) < end && b.end_time.slice(0, 5) > start
      );
      allSlots.push({ start_time: start, end_time: end, available: !isBooked });
    }
    return { service, slots: allSlots, booked };
  },
};

module.exports = BookingService;
