import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { bookingApi } from '../services/bookingApi';
import type { Booking } from '../types';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getMyBookings()
      .then((list) => {
        const today = new Date().toISOString().split('T')[0];
        setUpcoming(list.filter((b) => b.booking_date >= today && b.status !== 'cancelled').slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          Xin chào, {user?.name}!
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Đặt lịch <span className="gradient-text">thông minh</span>
        </h1>
        <p className="text-slate-400 mb-6">Chọn dịch vụ, chọn thời gian, đặt lịch trong vài giây</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/services" className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-500 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(124,106,255,0.3)]">
            🏢 Xem dịch vụ
          </Link>
          <Link to="/my-bookings" className="px-6 py-3 rounded-xl font-semibold text-slate-300 border border-white/[0.1] hover:border-white/[0.2] hover:text-white transition-all">
            📅 Lịch của tôi
          </Link>
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">📆 Lịch sắp tới</h2>
          <Link to="/my-bookings" className="text-brand-400 text-sm hover:text-brand-500 transition-colors">
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-500 text-sm py-4 text-center">Đang tải...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 mb-3">Bạn chưa có lịch nào sắp tới</p>
            <Link to="/services" className="text-brand-400 text-sm hover:text-brand-500 transition-colors">
              Đặt lịch ngay →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex flex-col items-center justify-center text-brand-400 shrink-0">
                  <span className="text-xs font-bold">{b.booking_date.slice(5)}</span>
                  <span className="text-xs text-slate-500">{b.booking_date.slice(0,4)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{b.service_name}</p>
                  <p className="text-slate-400 text-xs">
                    🕐 {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}
                    {b.location && ` · 📍 ${b.location}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                  b.status === 'confirmed'
                    ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                    : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                }`}>
                  {b.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
