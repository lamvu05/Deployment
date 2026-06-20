import React, { useEffect, useState } from 'react';
import { bookingApi } from '../services/bookingApi';
import { reviewApi } from '../services/reviewApi';
import type { Booking, BookingStatus } from '../types';

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: 'Chờ xác nhận', className: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  confirmed: { label: 'Đã xác nhận',  className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
  cancelled: { label: 'Đã huỷ',       className: 'bg-slate-400/15 text-slate-400 border-slate-400/30' },
};

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewServiceId, setReviewServiceId] = useState('');
  const [reviewServiceName, setReviewServiceName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    bookingApi.getMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn huỷ lịch này?')) return;
    setCancelling(id);
    try {
      await bookingApi.cancel(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('Huỷ lịch thất bại');
    } finally {
      setCancelling(null);
    }
  };

  const handleOpenReview = (serviceId: string, serviceName: string) => {
    setReviewServiceId(serviceId);
    setReviewServiceName(serviceName);
    setRating(5);
    setComment('');
    setReviewError(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await reviewApi.create({
        service_id: reviewServiceId,
        rating,
        comment,
      });
      setShowReviewModal(false);
      alert('Cảm ơn bạn đã đánh giá dịch vụ!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đánh giá thất bại';
      setReviewError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const upcoming = bookings.filter((b) => b.booking_date >= new Date().toISOString().split('T')[0] && b.status !== 'cancelled');
  const past = bookings.filter((b) => b.booking_date < new Date().toISOString().split('T')[0] || b.status === 'cancelled');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-400">
      <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Đang tải...
    </div>
  );

  const BookingCard = ({ b }: { b: Booking }) => {
    const cfg = statusConfig[b.status];
    const isUpcoming = b.booking_date >= new Date().toISOString().split('T')[0] && b.status !== 'cancelled';
    return (
      <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{b.service_name}</h3>
            {b.location && <p className="text-slate-500 text-xs mt-0.5">📍 {b.location}</p>}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.className}`}>
            {cfg.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
          <span>📅 {b.booking_date}</span>
          <span>🕐 {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</span>
          {b.price != null && (
            <span className="text-brand-400 font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.price)}
            </span>
          )}
        </div>

        {b.notes && <p className="text-slate-500 text-xs mb-4 italic">📝 {b.notes}</p>}

        {isUpcoming && b.status !== 'cancelled' && (
          <button
            onClick={() => handleCancel(b.id)}
            disabled={cancelling === b.id}
            className="text-xs font-semibold text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50"
          >
            {cancelling === b.id ? 'Đang huỷ...' : 'Huỷ lịch'}
          </button>
        )}

        {b.status === 'confirmed' && (
          <button
            onClick={() => handleOpenReview(b.service_id, b.service_name || 'Dịch vụ')}
            className="text-xs font-semibold text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-all ml-2"
          >
            ★ Viết đánh giá
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Lịch của tôi</h1>
          <p className="text-slate-400">Quản lý các lịch đặt của bạn</p>
        </div>
        <a href="/services" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors">
          + Đặt lịch mới
        </a>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-lg">Bạn chưa có lịch đặt nào</p>
          <a href="/services" className="text-brand-400 hover:text-brand-500 mt-2 inline-block">Đặt lịch ngay →</a>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                📆 Sắp tới ({upcoming.length})
              </h2>
              <div className="space-y-4">
                {upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                🗂 Lịch sử ({past.length})
              </h2>
              <div className="space-y-4 opacity-70">
                {past.map((b) => <BookingCard key={b.id} b={b} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl w-full max-w-md p-6 relative shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <h2 className="text-xl font-bold text-white mb-1">★ Đánh giá dịch vụ</h2>
            <p className="text-slate-400 text-sm mb-4">{reviewServiceName}</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                  ⚠ {reviewError}
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Số sao</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-115 text-amber-400 outline-none"
                    >
                      {star <= rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Bình luận</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                  rows={4}
                  required
                  className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 border border-white/[0.07] hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
