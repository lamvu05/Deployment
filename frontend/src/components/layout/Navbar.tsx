import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
        pathname === to
          ? 'text-white bg-white/[0.08]'
          : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-[#16161d]/80 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl text-brand-500 drop-shadow-[0_0_8px_rgba(124,106,255,0.8)]">✦</span>
          <span className="text-white font-bold text-lg tracking-tight">BookingApp</span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLink('/services', 'Dịch vụ')}
          {isAuthenticated && navLink('/my-bookings', 'Lịch của tôi')}
          {isAuthenticated && navLink('/profile', 'Hồ sơ')}
          {user?.role === 'admin' && navLink('/admin', '⚙ Admin')}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-all no-underline">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 text-sm font-medium hidden sm:block">{user?.name}</span>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  Admin
                </span>
              )}
            </Link>
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 hover:border-red-400 transition-all duration-200 cursor-pointer"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link id="btn-nav-login" to="/login" className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              Đăng nhập
            </Link>
            <Link id="btn-nav-register" to="/register" className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-all">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
