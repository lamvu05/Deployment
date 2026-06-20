import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { bookingApi } from '../services/bookingApi';
import { reviewApi } from '../services/reviewApi';
import type { Service, TimeSlot, Review } from '../types';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const BookingPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (serviceId) {
      serviceApi.getById(serviceId).then(setService).catch(() => navigate('/services'));
      reviewApi.getByService(serviceId).then(setReviews).catch(console.error);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId && selectedDate) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      bookingApi.getSlots(serviceId, selectedDate)
        .then(({ slots }) => setSlots(slots))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [serviceId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !service) return;
    setLoading(true);
    setError(null);
    try {
      await bookingApi.create({
        service_id: service.id,
        booking_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes,
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 1800);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đặt lịch thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!service) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-400">
      <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Đang tải...
    </div>
  );

  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-4xl">✅</div>
      <h2 className="text-2xl font-bold text-white">Đặt lịch thành công!</h2>
      <p className="text-slate-400">Đang chuyển về trang lịch của bạn...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => navigate('/services')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm transition-colors">
        ← Quay lại
      </button>

      {/* Service info */}
      <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">{service.name}</h1>
        <p className="text-slate-400 text-sm mb-4">{service.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>⏱ {service.duration_minutes} phút</span>
          <span>👥 Tối đa {service.capacity} người</span>
          {service.location && <span>📍 {service.location}</span>}
          <span className="text-brand-400 font-bold">{formatPrice(service.price)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Date picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            📅 Chọn ngày
          </label>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-all"
          />
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              🕐 Chọn khung giờ
            </label>
            {slotsLoading ? (
              <div className="text-slate-400 text-sm">Đang tải khung giờ...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.start_time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      !slot.available
                        ? 'bg-white/[0.03] text-slate-600 cursor-not-allowed line-through'
                        : selectedSlot?.start_time === slot.start_time
                        ? 'bg-brand-500 text-white ring-2 ring-brand-500/50'
                        : 'bg-white/[0.05] text-slate-300 hover:bg-brand-500/20 hover:text-brand-400'
                    }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            📝 Ghi chú (tuỳ chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Yêu cầu đặc biệt, mục đích sử dụng..."
            rows={3}
            className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-all resize-none"
          />
        </div>

        {/* Summary */}
        {selectedSlot && (
          <div className="bg-brand-500/10 border border-brand-500/25 rounded-xl p-4 text-sm">
            <p className="text-brand-400 font-semibold mb-2">📋 Tóm tắt đặt lịch</p>
            <div className="space-y-1 text-slate-300">
              <p><span className="text-slate-500">Dịch vụ:</span> {service.name}</p>
              <p><span className="text-slate-500">Ngày:</span> {selectedDate}</p>
              <p><span className="text-slate-500">Giờ:</span> {selectedSlot.start_time} – {selectedSlot.end_time}</p>
              <p><span className="text-slate-500">Giá:</span> <span className="text-brand-400 font-bold">{formatPrice(service.price)}</span></p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedSlot || loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-500 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all shadow-[0_4px_20px_rgba(124,106,255,0.3)] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang xử lý...
            </>
          ) : '✅ Xác nhận đặt lịch'}
        </button>
      </form>

      {/* Reviews list */}
      <div className="mt-10 pt-10 border-t border-white/[0.07]">
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          💬 Đánh giá từ khách hàng ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Chưa có đánh giá nào cho dịch vụ này.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#1c1c26] border border-white/[0.07] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-xs font-bold text-brand-400">
                      {r.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-slate-300 text-sm font-semibold">{r.user_name}</span>
                  </div>
                  <span className="text-amber-400 text-sm">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && <p className="text-slate-400 text-sm pl-10">{r.comment}</p>}
                <p className="text-slate-600 text-xs pl-10 mt-1">
                  {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
