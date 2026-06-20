import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { formatDate } from '../utils/helpers';

const ProfilePage: React.FC = () => {
  const { user, updateProfileState } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        Bạn cần đăng nhập để xem trang này.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await userService.updateUser(user.id, { name });
      updateProfileState(updatedUser);
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật hồ sơ thất bại';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Hồ sơ cá nhân</h1>
        <p className="text-slate-400">Quản lý thông tin tài khoản và bảo mật của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column — Avatar card */}
        <div className="md:col-span-1">
          <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
            {/* Avatar Glow container */}
            <div className="relative mb-4 group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative w-24 h-24 bg-[#12121a] border border-white/[0.1] rounded-full flex items-center justify-center text-white text-3xl font-bold font-display select-none">
                {getInitials(user.name)}
              </div>
            </div>

            <h2 className="font-bold text-white text-lg tracking-wide">{user.name}</h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.05]">
              {user.role === 'admin' ? '🛡️ Quản trị viên' : '👤 Thành viên'}
            </p>

            <div className="w-full border-t border-white/[0.07] my-5" />

            <div className="w-full text-left space-y-3.5 text-sm">
              <div>
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Ngày tham gia</span>
                <span className="text-slate-300 font-medium">{formatDate(user.created_at)}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Trạng thái</span>
                <span className="inline-flex items-center gap-1.5 mt-0.5 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Form & details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 md:p-8 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span>📝</span> Thông tin chi tiết
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <span>⚠</span> {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  <span>✓</span> {success}
                </div>
              )}

              <div className="space-y-4">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-[#12121a]/50 border border-white/[0.04] text-slate-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed select-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">
                      🔒 Không thể thay đổi
                    </span>
                  </div>
                </div>

                {/* Full name (Editable) */}
                <div>
                  <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Họ và tên
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nhập họ tên của bạn"
                    className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || name.trim() === '' || name === user.name}
                  className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-500 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 shadow-[0_4px_20px_rgba(124,106,255,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
