import React, { useEffect, useState } from 'react';
import { bookingApi } from '../services/bookingApi';
import type { Booking, BookingStats, BookingStatus } from '../types';

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: 'Chờ xác nhận', className: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  confirmed: { label: 'Đã xác nhận',  className: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
  cancelled: { label: 'Đã huỷ',       className: 'bg-slate-400/15 text-slate-400 border-slate-400/30' },
};

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStats = () => bookingApi.getStats().then(setStats).catch(console.error);
  const loadBookings = () => {
    setLoading(true);
    bookingApi.getAll({ status: filter || undefined })
      .then(({ rows, total }) => { setBookings(rows); setTotal(total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadBookings(); }, [filter]);

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      await bookingApi.confirm(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b));
      loadStats();
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Huỷ lịch này?')) return;
    setActionLoading(id);
    try {
      await bookingApi.cancel(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
      loadStats();
    } finally { setActionLoading(null); }
  };

  const fmtVnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400">Quản lý toàn bộ lịch đặt</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Tổng cộng',     value: stats.total,          icon: '📊', color: 'text-white' },
            { label: 'Chờ xác nhận',  value: stats.pending,        icon: '⏳', color: 'text-amber-400' },
            { label: 'Đã xác nhận',   value: stats.confirmed,      icon: '✅', color: 'text-emerald-400' },
            { label: 'Đã huỷ',        value: stats.cancelled,      icon: '❌', color: 'text-slate-400' },
            { label: 'Doanh thu',     value: fmtVnd(Number(stats.revenue)), icon: '💰', color: 'text-brand-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-xl font-bold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-slate-400 text-sm">Lọc:</span>
        {['', 'pending', 'confirmed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === s
                ? 'bg-brand-500 text-white'
                : 'bg-white/[0.05] text-slate-400 hover:text-white'
            }`}
          >
            {s === '' ? 'Tất cả' : statusConfig[s as BookingStatus].label}
          </button>
        ))}
        <span className="ml-auto text-slate-500 text-xs">{total} kết quả</span>
      </div>

      {/* Table */}
      <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Đang tải...
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Khách hàng</th>
                  <th className="text-left px-5 py-3">Dịch vụ</th>
                  <th className="text-left px-5 py-3">Ngày & Giờ</th>
                  <th className="text-left px-5 py-3">Trạng thái</th>
                  <th className="text-right px-5 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {bookings.map((b) => {
                  const cfg = statusConfig[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{b.user_name}</p>
                        <p className="text-slate-500 text-xs">{b.user_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-300">{b.service_name}</p>
                        {b.location && <p className="text-slate-600 text-xs">{b.location}</p>}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        <p>{b.booking_date}</p>
                        <p className="text-xs">{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(b.id)}
                              disabled={actionLoading === b.id}
                              className="text-xs font-semibold text-emerald-400 border border-emerald-400/30 px-2.5 py-1 rounded-lg hover:bg-emerald-400/10 transition-all disabled:opacity-50"
                            >
                              Xác nhận
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={actionLoading === b.id}
                              className="text-xs font-semibold text-red-400 border border-red-400/30 px-2.5 py-1 rounded-lg hover:bg-red-400/10 transition-all disabled:opacity-50"
                            >
                              Huỷ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
