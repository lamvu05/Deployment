import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { bookingApi } from '../services/bookingApi';
import type { Booking } from '../types';

// Import images
import hotelHero from '../assets/hotel_booking_hero.png';
import meetingHero from '../assets/meeting_booking_hero.png';
import loungeHero from '../assets/lounge_booking_hero.png';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  price: string;
  link: string;
}

const slides: Slide[] = [
  {
    image: hotelHero,
    title: 'Phòng nghỉ dưỡng Thượng hạng',
    subtitle: 'Trải nghiệm không gian sang trọng đẳng cấp với tầm nhìn toàn cảnh triệu đô.',
    price: 'Từ 1.200.000đ / đêm',
    link: '/services',
  },
  {
    image: meetingHero,
    title: 'Phòng Họp & Sự Kiện Hiện Đại',
    subtitle: 'Trang bị đầy đủ thiết bị âm thanh, ánh sáng cao cấp và màn hình tương tác thông minh.',
    price: 'Từ 350.000đ / giờ',
    link: '/services',
  },
  {
    image: loungeHero,
    title: 'Rooftop Lounge & Bể bơi Vô Cực',
    subtitle: 'Tận hưởng những buổi tối lãng mạn bên ly cocktail mát lạnh và nhạc sống chillout.',
    price: 'Từ 500.000đ / khách',
    link: '/services',
  },
];

const promoItems = [
  { text: '🎁 MÃ GIẢM GIÁ: [SUMMER26] - Giảm ngay 20% cho phòng nghỉ dưỡng!', color: 'text-amber-400' },
  { text: '🔥 HOT DEAL: Đặt phòng họp từ 4 giờ được miễn phí tiệc trà chiều (teabreak)!', color: 'text-rose-400' },
  { text: '✨ THÀNH VIÊN: Tích lũy điểm thưởng x2 khi thanh toán qua ví điện tử!', color: 'text-sky-400' },
  { text: '⭐ DỊCH VỤ MỚI: Khai trương khu vực làm việc ngoài trời (Co-working Outdoor)!', color: 'text-emerald-400' },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto scroll slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch bookings
  useEffect(() => {
    bookingApi.getMyBookings()
      .then((list) => {
        const today = new Date().toISOString().split('T')[0];
        setUpcoming(list.filter((b) => b.booking_date >= today && b.status !== 'cancelled').slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07070d] text-slate-100 overflow-x-hidden pb-16">
      {/* ── Background Glow Elements ─────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      {/* ── Interactive Ken Burns Slider ────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden border-b border-white/[0.06]">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Image Wrapper */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center animate-kenburns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-black/50 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-4xl mx-auto w-full px-6 md:px-12 flex flex-col items-start text-left mt-24">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-fade-in">
                  💎 Không gian VIP
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-slate-300 text-sm md:text-lg max-w-xl mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-brand-400 font-bold text-lg md:text-xl">
                    {slide.price}
                  </span>
                  <Link
                    to={slide.link}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-500 to-purple-500 hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_4px_25px_rgba(124,106,255,0.4)] flex items-center gap-2"
                  >
                    ⚡ Đặt lịch ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeSlide ? 'bg-brand-500 w-8' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── Infinite Marquee Promotion Banner ─────────────────────── */}
      <section className="bg-brand-950/20 border-y border-white/[0.05] py-3 overflow-hidden">
        <div className="animate-marquee flex gap-12 text-sm font-semibold select-none whitespace-nowrap">
          {/* Loop twice to make seamless marquee effect */}
          {[...promoItems, ...promoItems].map((item, idx) => (
            <span key={idx} className={`flex items-center gap-2 ${item.color}`}>
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Main Layout Grid ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left/Middle Column - Welcome & Features (Span 2) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-brand-950/30 to-purple-950/20 border border-white/[0.06] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg">
            <div className="absolute top-[-50%] right-[-10%] w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              Đăng nhập thành công
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Xin chào, <span className="gradient-text">{user?.name || 'Quý khách'}</span>!
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mb-6">
              Hệ thống đặt lịch không gian thông minh đã sẵn sàng. Trải nghiệm dịch vụ chuyên nghiệp hàng đầu ngay hôm nay.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/services" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-all text-sm shadow-md">
                🏢 Đặt lịch mới
              </Link>
              <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 border border-white/[0.08] hover:bg-white/5 transition-all text-sm">
                📅 Lịch của tôi
              </Link>
            </div>
          </div>

          {/* Features Introduction */}
          <div>
            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="text-brand-500">✦</span> Giới thiệu chức năng nổi bật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Feature 1 */}
              <div className="bg-[#121220]/60 border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.1] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-brand-500/25 transition-all">
                  🔍
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">Tìm kiếm dịch vụ</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Lọc danh sách các loại phòng, vị trí, giá cả và tiện ích có sẵn một cách nhanh chóng và chi tiết.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#121220]/60 border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.1] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-purple-500/25 transition-all">
                  ⚡
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">Đặt lịch tức thì</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Kiểm tra các khung giờ trống theo thời gian thực và tiến hành đặt chỗ chỉ trong 3 bước chạm.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#121220]/60 border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.1] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-rose-500/25 transition-all">
                  📅
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">Quản lý tiện lợi</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Theo dõi danh sách các cuộc hẹn của bạn, nhận thông báo nhắc nhở và yêu cầu hủy lịch dễ dàng.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#121220]/60 border border-white/[0.05] p-5 rounded-2xl hover:border-white/[0.1] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-emerald-500/25 transition-all">
                  ★
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">Đánh giá thực tế</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Đánh giá dịch vụ và viết bình luận trải nghiệm của bản thân để giúp cải thiện chất lượng phục vụ.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Bookings Widget */}
        <div className="lg:col-span-1">
          <div className="bg-[#11101e]/85 border border-white/[0.06] rounded-3xl p-6 shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📆</span> Lịch đặt sắp tới
              </h3>
              <Link to="/my-bookings" className="text-brand-400 text-xs hover:underline">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-2">
                <svg className="animate-spin w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang tải...
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/[0.05] rounded-2xl bg-white/[0.01]">
                <div className="text-4xl mb-3 select-none">📅</div>
                <p className="text-slate-500 text-sm mb-4">Bạn chưa có lịch hẹn nào sắp tới</p>
                <Link
                  to="/services"
                  className="inline-block text-xs font-semibold px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all"
                >
                  Khám phá phòng ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                  >
                    <h4 className="font-bold text-white text-sm mb-1.5 truncate">
                      {b.service_name}
                    </h4>
                    
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>📅</span>
                        <span>{b.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🕐</span>
                        <span>{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</span>
                      </div>
                      {b.location && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span>📍</span>
                          <span className="truncate">{b.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Trạng thái</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      }`}>
                        {b.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
