import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favouriteApi, Favourite } from '../services/favouriteApi';
import { useAuth } from '../hooks/useAuth';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const FavouritesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavourites = () => {
    setLoading(true);
    favouriteApi.getMyFavourites()
      .then(setFavourites)
      .catch(() => setError('Không thể tải danh sách yêu thích'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavourites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemoveFavourite = async (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await favouriteApi.remove(serviceId);
      // Update local state
      setFavourites((prev) => prev.filter((item) => item.id !== serviceId));
    } catch (err) {
      alert('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
        <p className="text-slate-400 mb-6">Bạn cần đăng nhập để xem danh sách dịch vụ yêu thích của mình.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-slate-400">
      <svg className="animate-spin w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Đang tải...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh] text-red-400">{error}</div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dịch vụ yêu thích</h1>
          <p className="text-slate-400">Danh sách các phòng và dịch vụ bạn đã lưu</p>
        </div>
        <Link to="/services" className="text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors">
          ← Khám phá thêm dịch vụ
        </Link>
      </div>

      {favourites.length === 0 ? (
        <div className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-12 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-4">❤️</span>
          <h3 className="text-lg font-semibold text-white mb-2">Danh sách trống</h3>
          <p className="text-slate-400 mb-6 text-sm">Hãy gắn nút yêu thích ở các dịch vụ bạn quan tâm để lưu lại tại đây.</p>
          <Link to="/services" className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors">
            Xem danh sách dịch vụ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favourites.map((s) => (
            <div key={s.id} className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-200 group relative">
              
              {/* Remove Favorite Button */}
              <button
                onClick={(e) => handleRemoveFavourite(e, s.id)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center border border-red-500/20 transition-all cursor-pointer"
                title="Xóa khỏi danh sách yêu thích"
              >
                ❤️
              </button>

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center text-2xl">
                  🏢
                </div>
              </div>

              <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-400 transition-colors pr-8">
                {s.name}
              </h2>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{s.description}</p>

              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>⏱</span>
                  <span>{s.duration_minutes} phút</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>👥</span>
                  <span>Tối đa {s.capacity} người</span>
                </div>
                {s.location && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>📍</span>
                    <span>{s.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-brand-400 font-bold">{formatPrice(s.price)}</span>
                <Link
                  to={`/book/${s.id}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
                >
                  Đặt lịch →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
