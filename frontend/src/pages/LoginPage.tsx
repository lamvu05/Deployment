import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { login, googleLogin, submitting, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  // Redirect when auth state becomes true (after successful login)
  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    const initializeGoogleSignIn = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        g.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              await googleLogin(response.credential);
            }
          },
        });

        const parent = document.getElementById('google-btn-container');
        if (parent) {
          g.accounts.id.renderButton(parent, {
            theme: 'filled_black',
            size: 'large',
            width: parent.offsetWidth || 380,
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      }
    };

    // Try immediately
    initializeGoogleSignIn();

    // Check periodically for google object to load
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [googleLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(form);
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/08 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3 drop-shadow-[0_0_12px_rgba(124,106,255,0.8)]">✦</div>
            <h1 className="text-2xl font-bold text-white">Chào mừng trở lại</h1>
            <p className="text-slate-400 text-sm mt-1">Đăng nhập để tiếp tục</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#12121a] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-500 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_4px_20px_rgba(124,106,255,0.35)] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Google Login Button */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center w-full my-1">
              <div className="flex-1 border-t border-white/[0.07]"></div>
              <span className="px-3 text-xs text-slate-500 uppercase tracking-wider">Hoặc đăng nhập bằng</span>
              <div className="flex-1 border-t border-white/[0.07]"></div>
            </div>
            
            <div id="google-btn-container" className="w-full flex justify-center min-h-[44px]"></div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/[0.07] text-center text-sm text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-500 transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
