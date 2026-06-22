import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi, Notification } from '../services/notificationApi';
import { useAuth } from '../hooks/useAuth';

const NotificationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for creating Demo Notification
  const [demoTitle, setDemoTitle] = useState('Khuyến mãi đặc biệt 🎁');
  const [demoMessage, setDemoMessage] = useState('Nhập mã "LOCALTEST" để nhận ngay ưu đãi 20% cho tất cả các dịch vụ phòng họp trong hôm nay!');
  const [creatingDemo, setCreatingDemo] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    notificationApi.getMyNotifications()
      .then(setNotifications)
      .catch(() => setError('Không thể tải danh sách thông báo'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.patchMarkAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      alert('Không thể cập nhật trạng thái thông báo');
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.is_read).length === 0) return;
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      alert('Không thể đánh dấu đọc tất cả');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert('Không thể xóa thông báo');
    }
  };

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoTitle.trim() || !demoMessage.trim()) return;
    setCreatingDemo(true);
    try {
      const newNotif = await notificationApi.createDemoNotification(demoTitle, demoMessage);
      setNotifications((prev) => [newNotif, ...prev]);
      // Reset demo message with current timestamp for next trigger
      setDemoMessage(`Nội dung thông báo thử nghiệm lúc ${new Date().toLocaleTimeString()} - Kết nối DB hoạt động hoàn hảo!`);
    } catch (err) {
      alert('Không thể tạo thông báo thử nghiệm');
    } finally {
      setCreatingDemo(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
        <p className="text-slate-400 mb-6">Bạn cần đăng nhập để xem các thông báo của tài khoản.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Thông báo của bạn</h1>
          <p className="text-slate-400">Xem và quản lý các thông báo từ hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ✓ Đọc tất cả
          </button>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            title="Làm mới danh sách"
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Notifications list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang tải thông báo...
            </div>
          ) : error ? (
            <div className="text-red-400 py-10 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-12 text-center">
              <span className="text-5xl block mb-4">🔔</span>
              <h3 className="text-lg font-semibold text-white mb-2">Không có thông báo nào</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Tài khoản của bạn hiện chưa có thông báo nào từ hệ thống. Hãy dùng bảng demo bên phải để tự tạo thông báo thử nghiệm!
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all duration-200 relative flex gap-4 ${
                  n.is_read
                    ? 'bg-[#1c1c26]/60 border-white/[0.05] opacity-75'
                    : 'bg-[#1c1c26] border-brand-500/20 hover:border-brand-500/40 shadow-lg shadow-brand-500/[0.02]'
                }`}
              >
                {/* Indicator dot */}
                {!n.is_read && (
                  <span className="absolute top-6 left-2.5 w-2.5 h-2.5 rounded-full bg-brand-500" />
                )}

                {/* Icon box */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  n.is_read ? 'bg-slate-500/10 text-slate-400' : 'bg-brand-500/15 text-brand-400'
                }`}>
                  {n.title.includes('mãi') || n.title.includes('quà') ? '🎁' : '📢'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className={`font-semibold text-sm mb-1 ${n.is_read ? 'text-slate-300' : 'text-white'}`}>
                    {n.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2 whitespace-pre-wrap">{n.message}</p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Actions group */}
                <div className="flex flex-col justify-between items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    className="w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                    title="Xóa thông báo"
                  >
                    🗑
                  </button>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 text-[11px] font-semibold transition-all"
                      title="Đánh dấu đã đọc"
                    >
                      Đọc
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Demo controller for local testing */}
        <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 self-start space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Cơ chế Test Local 🧪</h2>
            <p className="text-xs text-slate-400">
              Nhập nội dung dưới đây để gửi một request tạo thông báo mới vào bảng <code>notifications</code> của bạn.
            </p>
          </div>

          <form onSubmit={handleCreateDemo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tiêu đề thông báo</label>
              <input
                type="text"
                value={demoTitle}
                onChange={(e) => setDemoTitle(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/60"
                placeholder="Tiêu đề..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nội dung thông báo</label>
              <textarea
                value={demoMessage}
                onChange={(e) => setDemoMessage(e.target.value)}
                required
                rows={3}
                className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/60 resize-none"
                placeholder="Nội dung chi tiết..."
              />
            </div>
            <button
              type="submit"
              disabled={creatingDemo}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {creatingDemo ? 'Đang tạo...' : '⚡ Bắn thông báo lên DB Local'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.06] text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Đang kết nối: PostgreSQL Local (Docker)</span>
            </div>
            <p className="leading-relaxed">
              Khi nhấn nút, frontend sẽ POST đến <code>/api/notifications/demo</code>. Backend NodeJS nhận được sẽ INSERT dòng mới vào DB Postgres qua pool query.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
