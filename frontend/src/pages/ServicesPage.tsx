import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { favouriteApi } from '../services/favouriteApi';
import { useAuth } from '../hooks/useAuth';
import type { Service } from '../types';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ServicesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const servicesData = await serviceApi.getAll();
        setServices(servicesData);

        if (isAuthenticated) {
          const favs = await favouriteApi.getMyFavourites();
          setFavIds(new Set(favs.map((f) => f.id)));
        }
      } catch (err) {
        setError('Không thể tải danh sách dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const toggleFavourite = async (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isFav = favIds.has(serviceId);
    try {
      if (isFav) {
        await favouriteApi.remove(serviceId);
        setFavIds((prev) => {
          const next = new Set(prev);
          next.delete(serviceId);
          return next;
        });
      } else {
        await favouriteApi.add(serviceId);
        setFavIds((prev) => {
          const next = new Set(prev);
          next.add(serviceId);
          return next;
        });
      }
    } catch (err) {
      console.error('Không thể cập nhật yêu thích', err);
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dịch vụ & Phòng</h1>
        <p className="text-slate-400">Chọn dịch vụ phù hợp để đặt lịch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s) => (
          <div key={s.id} className="bg-[#1c1c26] border border-white/[0.07] rounded-2xl p-6 hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center text-2xl">
                🏢
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    onClick={(e) => toggleFavourite(e, s.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      favIds.has(s.id)
                        ? 'bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/25'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                    title={favIds.has(s.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    {favIds.has(s.id) ? '❤️' : '🤍'}
                  </button>
                )}
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                  Còn chỗ
                </span>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-400 transition-colors">
              {s.name}
            </h2>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mb-3 text-xs">
              {s.rating_count && Number(s.rating_count) > 0 ? (
                <>
                  <span className="text-amber-400">★</span>
                  <span className="text-amber-400 font-bold">{Number(s.avg_rating).toFixed(1)}</span>
                  <span className="text-slate-500">({s.rating_count} đánh giá)</span>
                </>
              ) : (
                <>
                  <span className="text-slate-600">★</span>
                  <span className="text-slate-500">Chưa có đánh giá</span>
                </>
              )}
            </div>

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
    </div>
  );
};

export default ServicesPage;
