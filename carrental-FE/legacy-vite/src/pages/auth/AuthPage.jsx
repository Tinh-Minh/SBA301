import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode based on route or prop
  const isRegisterRoute = location.pathname === '/register';
  const [authMode, setAuthMode] = useState(isRegisterRoute ? 'register' : initialMode);

  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
      document.title = 'CarDB - Đăng ký tài khoản';
    } else if (location.pathname === '/login') {
      setAuthMode('login');
      document.title = 'CarDB - Đăng nhập tài khoản';
    }
  }, [location.pathname]);

  const switchTab = (tab) => {
    setAuthMode(tab);
    if (tab === 'login') {
      navigate('/login', { replace: true });
      document.title = 'CarDB - Đăng nhập tài khoản';
    } else {
      navigate('/register', { replace: true });
      document.title = 'CarDB - Đăng ký tài khoản';
    }
  };

  // Form states
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTerms, setRegTerms] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Dynamic Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 3, label: 'Khá' }; // default mockup state
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 10) score += 1;
    const labels = ['Yếu', 'Yếu', 'Trung bình', 'Khá', 'Rất mạnh'];
    return { score, label: labels[score] || 'Khá' };
  };

  const { score: passwordStrength, label: strengthLabel } = calculatePasswordStrength(regPassword);

  // Toast feedback state
  const [toast, setToast] = useState({
    show: false,
    title: '',
    desc: '',
  });

  const showToast = (title, desc) => {
    setToast({ show: true, title, desc });
    setTimeout(() => {
      setToast({ show: false, title: '', desc: '' });
    }, 3800);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    showToast(
      'Đăng nhập thành công',
      'Đang chuyển hướng về xe Porsche Taycan 4S đã chọn...'
    );
    setTimeout(() => {
      navigate('/trip');
    }, 1500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }
    showToast(
      'Đăng ký tài khoản thành công',
      'Mã xác thực OTP đã được gửi đến số điện thoại của bạn.'
    );
    setTimeout(() => {
      switchTab('login');
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container flex flex-col justify-between">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-low/70 backdrop-blur-2xl shadow-[0_1px_12px_rgba(0,0,0,0.18)]">
        <div className="h-16 w-full px-margin-sm md:px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <Link className="flex items-center gap-space-sm group" to="/">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center transition-all duration-300 group-hover:bg-primary-container">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary-container text-[20px]">
                  directions_car
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold leading-none">
                  Car<span className="text-secondary">DB</span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase leading-none mt-1">
                  Vietnam Luxury
                </span>
              </div>
            </Link>
            <Link
              className="hidden sm:flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container-high/60"
              to="/"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Về trang chủ</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-space-md">
            <Link
              className="px-3 py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
              to="/trip"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span>Trung tâm hỗ trợ</span>
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <a
              className="hidden lg:flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-high/70 hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all"
              href="tel:19008899"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">call</span>
              <span className="font-label-md text-label-md tracking-wider font-semibold">1900 8899</span>
            </a>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high/50 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-primary text-[16px]">language</span>
              <span className="font-semibold text-primary">VI</span>
              <span className="text-outline-variant">|</span>
              <span className="hover:text-on-surface cursor-pointer transition-colors">EN</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-16 flex-1 bg-background flex flex-col justify-center">
        <div className="flex flex-col w-full py-8 px-margin-sm md:px-margin items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[160px] pointer-events-none -z-10"></div>

          {/* Main Unified 2-Column Showcase Container */}
          <div className="w-full max-w-6xl rounded-2xl bg-surface-container-low shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
            {/* LEFT PANEL: Automotive Hero with Dynamic Driving Physics */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col justify-between p-6 md:p-8 overflow-hidden bg-surface-container-lowest min-h-[500px] lg:min-h-full">
              {/* Cinematic Motion Vehicle Layer */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                {/* Dynamic Car Chassis Micro-motion Layer */}
                <div className="w-full h-full car-driving-body relative">
                  <img
                    alt="CarDB Luxury Electric GT Sports Sedan"
                    className="w-full h-full object-cover object-center filter contrast-[1.04] brightness-[1.02]"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1WFvJurVEJLQmfGCLvq_hof0B1mkCf3BmMYoHZ8hcN1ZZIilAxOfni7D6PKMY7dPhpYcMDPZ6bMirpzc3bEtEVZBUoYT5hncMz3oUWZdWlpfNLBkCvIyqCiikDm1cSHLfz0XJZ2VTDV9JkZEjgE2LBB0HrRkBp51P8DIg7eRhNd8MkgYmAmZIpc62dQQ77NGvhqbXfPtxWy1GxoXwsOSCy6_Wg1KwpSwYcuniTkHkUI1WxDfixGo7rz5DZr"
                  />

                  {/* Dynamic Laser Headlight Projector & Beam Flare */}
                  <div className="absolute top-[54%] left-[17%] w-[14%] h-[7%] rounded-full pointer-events-none z-10 mix-blend-screen headlight-pulse">
                    <div className="absolute top-[25%] left-[28%] w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_24px_12px_rgba(110,245,230,0.98)]"></div>
                    <div className="absolute top-[20%] left-[8%] w-[75%] h-[2.5px] rounded-full bg-gradient-to-r from-secondary via-white to-primary filter blur-[0.4px]">
                      <div className="w-full h-full headlight-sweep bg-white/80"></div>
                    </div>
                    <div className="absolute -inset-3 rounded-full bg-secondary/35 blur-xl"></div>
                  </div>

                  {/* Long Forward Laser Road Illuminator Beam */}
                  <div className="absolute top-[56%] left-[1%] w-[32%] h-[26%] pointer-events-none z-10 mix-blend-screen headlight-pulse">
                    <div className="w-full h-full bg-gradient-to-br from-cyan-100/40 via-secondary/20 to-transparent rounded-full filter blur-[18px] transform -rotate-12 scale-x-125"></div>
                  </div>
                </div>

                {/* STREAMING ROAD SURFACE & WATER PUDDLE GLOSS */}
                <div className="absolute bottom-0 left-0 right-0 h-[38%] pointer-events-none z-10 overflow-hidden">
                  <div className="w-full h-full road-stream-layer opacity-45 mix-blend-screen transform skew-x-[-12deg]"></div>
                  <div className="absolute bottom-[24%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent blur-[1px]"></div>
                  <div className="absolute bottom-[16%] left-[10%] right-[15%] h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-[0.8px]"></div>
                </div>

                {/* WATER SPRAY & HIGH VELOCITY ROAD MIST */}
                <div
                  className="absolute pointer-events-none z-10 water-spray-1"
                  style={{ left: '31%', top: '66%', width: '90px', height: '35px' }}
                >
                  <div className="w-full h-full bg-gradient-to-l from-transparent via-secondary/35 to-transparent blur-[5px] rounded-[50%] transform -rotate-12"></div>
                </div>
                <div
                  className="absolute pointer-events-none z-10 water-spray-2"
                  style={{ left: '58%', top: '56%', width: '110px', height: '30px' }}
                >
                  <div className="w-full h-full bg-gradient-to-l from-transparent via-primary/40 to-transparent blur-[6px] rounded-[50%] transform -rotate-8"></div>
                </div>

                {/* MULTI-LAYER SPEED TRAILS & AERODYNAMIC WIND STREAKS */}
                <div className="absolute top-[27%] left-0 w-[420px] h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent wind-trail-1 z-10 shadow-[0_0_14px_#4adcc8] filter blur-[0.5px]"></div>
                <div className="absolute top-[49%] left-0 w-[500px] h-[1.8px] bg-gradient-to-r from-transparent via-primary-fixed to-transparent wind-trail-2 z-10 shadow-[0_0_12px_#88d5c0] filter blur-[0.4px]"></div>
                <div className="absolute top-[63%] left-0 w-[380px] h-[2.5px] bg-gradient-to-r from-transparent via-secondary-fixed to-transparent wind-trail-3 z-10 shadow-[0_0_16px_#6cf9e4] filter blur-[0.6px]"></div>
                <div className="absolute top-[18%] left-0 w-[300px] h-[1.2px] bg-gradient-to-r from-transparent via-primary to-transparent wind-trail-4 z-10 shadow-[0_0_8px_#88d5c0]"></div>

                {/* High-Tech Neon Underglow Pulse under chassis */}
                <div className="underglow-active absolute bottom-1 left-[18%] right-[18%] h-28 bg-gradient-to-t from-secondary/40 via-primary-container/20 to-transparent rounded-full blur-[48px] pointer-events-none"></div>

                {/* Cinematic Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/95 via-transparent to-surface-container-lowest/40 z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/45 via-transparent to-transparent pointer-events-none z-10"></div>
              </div>

              {/* TOP MINIMAL HEADER & FUTURISTIC TELEMETRY HUD */}
              <div className="relative z-20 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/30 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">
                    Hệ thống 24/7 • TP. Hồ Chí Minh &amp; Toàn quốc
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-secondary/30 shadow-[0_0_10px_rgba(74,220,200,0.2)]">
                  <span className="material-symbols-outlined text-secondary text-[14px] animate-pulse">
                    speed
                  </span>
                  <span className="font-label-sm text-[10px] tracking-widest text-secondary font-mono font-semibold uppercase">
                    120 KM/H • SPORT+
                  </span>
                </div>
              </div>

              {/* FLOATING PILLS IN SPACE OVER WHEELS */}
              <div className="relative z-20 w-full pointer-events-none mb-1">
                <div className="absolute -top-64 left-2 pointer-events-auto backdrop-blur-md bg-surface-container-low/70 border border-secondary/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-sm text-[11px] text-on-surface font-medium">Xe điện cao cấp</span>
                </div>
                <div className="absolute -top-64 right-2 pointer-events-auto backdrop-blur-md bg-surface-container-low/70 border border-secondary/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-[11px] text-on-surface font-medium">5 chỗ · Số tự động</span>
                </div>
                <div className="absolute -top-40 right-2 pointer-events-auto backdrop-blur-md bg-surface-container-low/70 border border-secondary/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="material-symbols-outlined text-secondary text-[13px]">schedule</span>
                  <span className="font-label-sm text-[11px] text-on-surface font-medium">
                    Thuê theo giờ hoặc ngày
                  </span>
                </div>
                <div className="absolute -top-20 left-2 pointer-events-auto backdrop-blur-md bg-surface-container-low/70 border border-secondary/30 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="material-symbols-outlined text-secondary text-[13px]">location_on</span>
                  <span className="font-label-sm text-[11px] text-secondary font-medium">
                    Nhận xe tại TP. Hồ Chí Minh
                  </span>
                </div>
                <div className="absolute -top-20 right-2 pointer-events-auto backdrop-blur-md bg-surface-container-lowest/80 border border-outline-variant/30 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">
                    Giá tham khảo: 3.800.000đ/ngày (Dữ liệu mẫu)
                  </span>
                </div>
              </div>

              {/* BOTTOM ZONE: Relocated Title & Subtitle */}
              <div className="relative z-20 mt-auto pt-6 flex flex-col gap-3">
                <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 shadow-lg pointer-events-none transition-all">
                  <div className="inline-flex items-center gap-1.5 mb-1">
                    <span className="h-0.5 w-3 bg-secondary"></span>
                    <span className="font-label-sm text-[10px] uppercase text-secondary tracking-widest font-semibold">
                      Trải nghiệm đỉnh cao
                    </span>
                  </div>
                  <h1 className="text-[20px] sm:text-[22px] font-semibold text-on-surface tracking-tight leading-snug drop-shadow-md">
                    Khởi đầu hành trình cùng <span className="text-primary font-bold">CarDB</span>
                  </h1>
                  <p className="font-body-sm text-label-md text-on-surface-variant/90 drop-shadow mt-1 leading-snug">
                    Thuê xe tự lái cao cấp, minh bạch và chủ động trên mọi nẻo đường.
                  </p>
                </div>

                {/* CONDENSED BOTTOM PILL BAR */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-2 px-2.5 py-1">
                    <span className="material-symbols-outlined text-secondary text-[18px]">search_check</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                      Tìm xe tức thì
                    </span>
                  </div>
                  <div className="h-3 w-[1px] bg-outline-variant/40"></div>
                  <div className="flex items-center gap-2 px-2.5 py-1">
                    <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                      Theo giờ / ngày
                    </span>
                  </div>
                  <div className="h-3 w-[1px] bg-outline-variant/40"></div>
                  <div className="flex items-center gap-2 px-2.5 py-1">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-medium hidden sm:inline">
                      Hành trình bảo chứng
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Authentication Form Hub */}
            <div className="lg:col-span-6 xl:col-span-6 bg-surface-container p-6 md:p-10 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(74,220,200,0.8)]"></span>
                    <span className="font-label-md text-label-md text-on-surface-variant font-bold tracking-widest uppercase">
                      CarDB • Luxury Mobility
                    </span>
                  </div>
                </div>

                {/* Interactive Tab Switcher */}
                <div className="p-1 rounded-xl bg-surface-container-lowest grid grid-cols-2 gap-1 mb-8 shadow-inner">
                  <button
                    className={`py-2.5 px-4 rounded-lg font-label-lg text-label-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      authMode === 'login'
                        ? 'font-semibold bg-primary-container text-on-primary-container shadow-md'
                        : 'font-medium text-on-surface-variant hover:text-on-surface'
                    }`}
                    id="tab-btn-login"
                    onClick={() => switchTab('login')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    className={`py-2.5 px-4 rounded-lg font-label-lg text-label-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      authMode === 'register'
                        ? 'font-semibold bg-primary-container text-on-primary-container shadow-md'
                        : 'font-medium text-on-surface-variant hover:text-on-surface'
                    }`}
                    id="tab-btn-register"
                    onClick={() => switchTab('register')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Đăng ký</span>
                  </button>
                </div>

                {/* VIEW 1: LOGIN SECTION */}
                {authMode === 'login' && (
                  <div className="transition-opacity duration-300" id="view-login">
                    <div className="mb-6">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                        Chào mừng bạn trở lại
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Đăng nhập để quản lý lộ trình và tiếp tục hành trình cùng CarDB
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                      {/* Email or Phone */}
                      <div className="space-y-1.5">
                        <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="login-account">
                          Email hoặc số điện thoại
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                            alternate_email
                          </span>
                          <input
                            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                            id="login-account"
                            name="login-account"
                            placeholder="name@example.com hoặc 0912..."
                            required
                            type="text"
                            value={loginAccount}
                            onChange={(e) => setLoginAccount(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="login-password">
                            Mật khẩu
                          </label>
                          <a
                            className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors"
                            href="#forgot"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Tính năng khôi phục mật khẩu qua SMS / Email');
                            }}
                          >
                            Quên mật khẩu?
                          </a>
                        </div>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                            lock
                          </span>
                          <input
                            className="w-full pl-11 pr-11 py-3 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                            id="login-password"
                            name="login-password"
                            placeholder="Nhập mật khẩu của bạn"
                            required
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <button
                            aria-label="Hiển thị mật khẩu"
                            className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showLoginPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Option Row */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded bg-surface-container-lowest accent-secondary text-primary cursor-pointer"
                            name="remember-me"
                            type="checkbox"
                          />
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Ghi nhớ đăng nhập trên thiết bị này
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        className="w-full mt-2 py-3.5 px-6 rounded-xl font-label-lg text-label-lg font-semibold bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-lg hover:shadow-[0_12px_24px_-4px_rgba(74,220,200,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        type="submit"
                      >
                        <span>Đăng nhập</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </form>

                    {/* Switch to Register */}
                    <div className="text-center pt-6">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Chưa có tài khoản? </span>
                      <button
                        className="font-label-md text-label-md text-secondary font-semibold hover:underline cursor-pointer"
                        onClick={() => switchTab('register')}
                        type="button"
                      >
                        Đăng ký ngay
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW 2: REGISTER SECTION */}
                {authMode === 'register' && (
                  <div className="transition-opacity duration-300" id="view-register">
                    <div className="mb-4">
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                        Tạo tài khoản CarDB
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Tạo tài khoản để bắt đầu trải nghiệm thuê xe tự lái cao cấp
                      </p>
                    </div>

                    <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="reg-fullname">
                          Họ và tên <span className="text-secondary">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                            person
                          </span>
                          <input
                            className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                            id="reg-fullname"
                            name="fullname"
                            placeholder="Nguyễn Văn A"
                            required
                            type="text"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="reg-email">
                            Email <span className="text-secondary">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                              mail
                            </span>
                            <input
                              className="w-full pl-11 pr-3 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                              id="reg-email"
                              name="email"
                              placeholder="name@example.com"
                              required
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="reg-phone">
                            Số điện thoại <span className="text-secondary">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                              phone
                            </span>
                            <input
                              className="w-full pl-11 pr-3 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                              id="reg-phone"
                              name="phone"
                              placeholder="0912 345 678"
                              required
                              type="tel"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password & Confirm Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="reg-password">
                            Mật khẩu <span className="text-secondary">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                              lock
                            </span>
                            <input
                              className="w-full pl-11 pr-11 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                              id="reg-password"
                              minLength={8}
                              name="password"
                              placeholder="Tối thiểu 8 ký tự"
                              required
                              type={showRegPassword ? 'text' : 'password'}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <button
                              aria-label="Hiển thị mật khẩu"
                              className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {showRegPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="reg-confirm-password">
                            Xác nhận mật khẩu <span className="text-secondary">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px]">
                              lock_reset
                            </span>
                            <input
                              className="w-full pl-11 pr-11 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest/90"
                              id="reg-confirm-password"
                              name="confirm-password"
                              placeholder="Nhập lại mật khẩu"
                              required
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                            />
                            <button
                              aria-label="Hiển thị mật khẩu"
                              className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Password Strength Indicator */}
                      <div className="pt-0.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              (regPassword.length > 0 || passwordStrength >= 1) ? 'bg-secondary' : 'bg-outline-variant/40'
                            }`}
                          ></div>
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              (regPassword.length > 0 ? passwordStrength >= 2 : true) ? 'bg-secondary' : 'bg-outline-variant/40'
                            }`}
                          ></div>
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              (regPassword.length > 0 ? passwordStrength >= 3 : true) ? 'bg-secondary' : 'bg-outline-variant/40'
                            }`}
                          ></div>
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              (regPassword.length > 0 ? passwordStrength >= 4 : false) ? 'bg-secondary' : 'bg-outline-variant/40'
                            }`}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-label-sm">
                          <span className="text-secondary font-medium">Độ mạnh: {strengthLabel}</span>
                          <span className="text-on-surface-variant">Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số</span>
                        </div>
                      </div>

                      {/* Terms & Conditions */}
                      <div>
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            checked={regTerms}
                            onChange={(e) => setRegTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded bg-surface-container-lowest accent-secondary text-primary cursor-pointer shrink-0"
                            id="reg-terms"
                            name="terms"
                            required
                            type="checkbox"
                          />
                          <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                            Tôi đồng ý với{' '}
                            <a className="text-secondary hover:underline font-medium" data-path="terms-of-service" href="#terms">
                              Điều khoản sử dụng
                            </a>{' '}
                            và{' '}
                            <a className="text-secondary hover:underline font-medium" data-path="privacy-policy" href="#privacy">
                              Chính sách bảo mật
                            </a>{' '}
                            của CarDB <span className="text-secondary">*</span>
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        className="w-full mt-1.5 py-3 px-6 rounded-xl font-label-lg text-label-lg font-semibold bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-lg hover:shadow-[0_12px_24px_-4px_rgba(74,220,200,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        type="submit"
                      >
                        <span>Tạo tài khoản</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="text-center pt-4">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Đã có tài khoản? </span>
                      <button
                        className="font-label-md text-label-md text-secondary font-semibold hover:underline cursor-pointer"
                        onClick={() => switchTab('login')}
                        type="button"
                      >
                        Đăng nhập ngay
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Architecture Footnote */}
              <div className="mt-4 bg-surface-container-high/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-on-surface-variant border border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    verified_user
                  </span>
                  <span className="font-label-sm text-label-sm leading-tight text-on-surface-variant">
                    Thông tin cá nhân được bảo vệ theo{' '}
                    <span className="text-secondary font-medium">Chính sách quyền riêng tư</span> của CarDB.
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0 font-label-sm text-label-sm text-primary">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span>Bảo vệ 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Toast for Interaction Feedback */}
          <div
            className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none bg-surface-container-highest text-on-surface px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.show ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
            }`}
            id="auth-feedback-toast"
          >
            <span className="material-symbols-outlined text-secondary text-[24px]">task_alt</span>
            <div>
              <h4 className="font-label-md text-label-md font-bold text-on-surface" id="auth-toast-title">
                {toast.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant" id="auth-toast-desc">
                {toast.desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="w-full bg-surface-container-lowest/80 backdrop-blur-md shadow-[0_-1px_10px_rgba(0,0,0,0.12)]">
        <div className="w-full px-margin-sm md:px-margin py-6 flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm text-center md:text-left">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              © 2025 CarDB Vietnam JSC • TP. Hồ Chí Minh • Hà Nội • Đà Nẵng • Cần Thơ
            </span>
          </div>
          <div className="flex items-center gap-space-md flex-wrap justify-center">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" data-path="terms-of-service" href="#terms">
              Điều khoản sử dụng
            </a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" data-path="privacy-policy" href="#privacy">
              Chính sách bảo mật
            </a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" data-path="car-rental-agreement" href="#agreement">
              Hợp đồng mẫu
            </a>
            <span className="text-outline-variant text-[10px]">•</span>
            <span className="font-label-md text-label-md text-secondary/90 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Bảo hiểm MIC bảo chứng
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
