import Link from "next/link";

export default function Login() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">
<div className="relative w-full overflow-hidden py-space-xl lg:py-space-2xl">
<div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -right-40 w-[480px] h-[480px] bg-secondary-fixed/25 rounded-full blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin-mobile sm:px-margin w-full">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
<div className="lg:col-span-6 flex flex-col justify-center">
<div className="bg-surface-container rounded-xl p-6 sm:p-10 shadow-[0_16px_40px_-8px_rgba(20,85,91,0.08)] relative z-10">
<div className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-tint rounded-full mb-space-sm">
<span className="w-2 h-2 rounded-full bg-status-success"></span>
<span className="font-label-md text-label-md text-primary tracking-wide uppercase">{"Hệ thống xác thực an toàn"}</span>
</div>
<div className="mb-space-lg">
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs tracking-tight">{"Chào mừng trở lại với Kanow"}</h1>
<p className="font-body-md text-body-md text-on-surface-variant">{"Khởi hành thuận lợi, chuẩn hóa hành trình cùng dịch vụ xe thông minh."}</p>
</div>
<div className="space-y-space-sm mb-space-lg">
<button className="w-full flex items-center justify-center gap-space-sm py-3 px-space-md rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-on-surface font-label-lg text-label-lg group relative overflow-hidden" type="button" data-action="provider">
<div className="w-6 h-6 rounded-full bg-[#D92D20] flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-white text-[15px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"shield_with_heart"}</span>
</div>
<span>{"Đăng nhập 1 chạm với "}<strong>{"VNeID"}</strong></span>
<span className="absolute right-4 text-status-success font-label-md text-label-md bg-status-success/10 px-2 py-0.5 rounded-full">{"Định danh số"}</span>
</button>
<button className="w-full flex items-center justify-center gap-space-sm py-3 px-space-md rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all text-on-surface font-label-lg text-label-lg" type="button" data-action="provider">
<svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
</svg>
<span>{"Tiếp tục với Google"}</span>
</button>
</div>
<div className="relative flex items-center justify-center mb-space-lg">
<div className="w-full h-px bg-outline-variant/40"></div>
<span className="absolute bg-surface-container px-space-md font-body-sm text-body-sm text-text-muted">{"Hoặc dùng tài khoản Kanow"}</span>
</div>
<form className="space-y-space-md" id="loginForm">
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">{"Số điện thoại hoặc Email"}</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3.5 text-text-muted text-[20px]">{"person"}</span>
<input className="w-full bg-surface-container-low text-on-surface pl-11 pr-4 py-3 rounded-lg font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-inner transition-colors placeholder:text-text-muted/60" id="loginIdentity" placeholder="09xx xxx xxx hoặc email@domain.com" required={true} type="text" aria-label="09xx xxx xxx hoặc email@domain.com" />
</div>
</div>
<div>
<div className="flex items-center justify-between mb-1">
<label className="block font-label-md text-label-md text-on-surface">{"Mật khẩu"}</label>
<button className="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-1" id="btnOtpMode" type="button" data-action="otp">
<span className="material-symbols-outlined text-[15px]">{"sms"}</span>
<span>{"Đăng nhập OTP qua SMS"}</span>
</button>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3.5 text-text-muted text-[20px]">{"lock"}</span>
<input className="w-full bg-surface-container-low text-on-surface pl-11 pr-11 py-3 rounded-lg font-body-md text-body-md outline-none focus:bg-surface-canvas shadow-inner transition-colors placeholder:text-text-muted/60" id="loginPassword" placeholder="Nhập mật khẩu an toàn" required={true} type="password" aria-label="Nhập mật khẩu an toàn" />
<button className="absolute right-3.5 text-text-muted hover:text-on-surface p-1 flex items-center justify-center transition-colors" id="togglePasswordBtn" type="button" data-action="password">
<span className="material-symbols-outlined text-[20px]" id="passwordEyeIcon">{"visibility_off"}</span>
</button>
</div>
</div>
<div className="flex items-center justify-between pt-1">
<label className="inline-flex items-center gap-2 cursor-pointer select-none">
<input className="w-4 h-4 rounded bg-surface-container-low accent-primary cursor-pointer" type="checkbox" defaultChecked={true} aria-label="Chọn tùy chọn" />
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Ghi nhớ thiết bị này trong 30 ngày"}</span>
</label>
<Link className="font-label-md text-label-md text-secondary hover:text-primary transition-colors" href="/quen-mat-khau">{"Quên mật khẩu?"}</Link>
</div>
<button className="w-full py-3.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-all shadow-[0_8px_20px_rgba(20,85,91,0.2)] flex items-center justify-center gap-2 mt-2" type="submit">
<span>{"Đăng nhập ngay"}</span>
<span className="material-symbols-outlined text-[18px]">{"arrow_forward"}</span>
</button>
</form>
<div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-low/60 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 px-6 sm:px-10 py-4 rounded-b-xl">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-container text-[20px]">{"loyalty"}</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">{"Chưa có tài khoản Kanow?"}</span>
</div>
<Link className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-primary-container font-semibold transition-colors" data-path="dang-ky" href="/dang-ky">
<span>{"Đăng ký nhận ngay 150.000₫"}</span>
<span className="material-symbols-outlined text-[16px]">{"chevron_right"}</span>
</Link>
</div>
</div>
</div>
<div className="lg:col-span-6 flex flex-col justify-between">
<div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden shadow-[0_16px_36px_-4px_rgba(20,85,91,0.12)] flex flex-col justify-between p-6 sm:p-10" data-alt="A modern luxury electric SUV cruising gracefully along a scenic seaside highway in Da Nang Vietnam during golden hour twilight, glowing cinematic taillights, sleek reflections on teal-hued car body, shot with prime lens, premium travel mood, pristine and tranquil." style={{"backgroundImage": "url('/images/da2beb94c7a0d9ad.webp')"}}>
<div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/20 pointer-events-none"></div>
<div className="relative z-10 flex items-center justify-between">
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/90 backdrop-blur-md text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[16px] text-status-success">{"electric_car"}</span>
<span>{"Hạm đội xe điện thế hệ mới"}</span>
</div>
<div className="px-3 py-1 rounded-full bg-secondary-fixed/90 text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{"\n                100% VINFAST & HYBRID\n              "}</div>
</div>
<div className="relative z-10 mt-auto">
<div className="bg-surface-canvas/95 backdrop-blur-md rounded-xl p-6 text-on-surface shadow-lg mb-space-md">
<div className="flex items-center gap-3 mb-space-sm">
<div className="flex text-tertiary-fixed-dim">
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
<span className="material-symbols-outlined text-[18px]" style={{"fontVariationSettings": "'FILL' 1"}}>{"star"}</span>
</div>
<span className="font-label-md text-label-md text-text-muted">{"Đánh giá 4.9/5 từ 12.000+ chuyến đi"}</span>
</div>
<p className="font-body-md text-body-md text-on-surface mb-3 italic">{"\n                  \"Thuê VF8 tự lái từ TP.HCM đi Nha Trang mượt mà ngoài mong đợi. Đặt xe qua app duyệt nhanh trong 3 phút, trạm sạc V-GREEN phủ khắp quốc lộ. Dịch vụ số 1!\"\n                "}</p>
<div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed font-label-md text-label-md">{"\n                      TL\n                    "}</div>
<div>
<div className="font-label-md text-label-md text-on-surface font-semibold">{"Trần Thùy Linh"}</div>
<div className="font-body-sm text-body-sm text-text-muted">{"Doanh nhân • Thành viên Titan"}</div>
</div>
</div>
<span className="inline-flex items-center gap-1 font-label-md text-label-md text-status-success">
<span className="material-symbols-outlined text-[14px]">{"verified"}</span>
<span>{"Đã xác minh VNeID"}</span>
</span>
</div>
</div>
<div className="bg-surface-container/20 backdrop-blur-md rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-on-primary">
<span className="font-body-sm text-body-sm opacity-90 uppercase tracking-wider">{"Đối tác bảo hiểm & sạc điện:"}</span>
<div className="flex items-center gap-4 text-on-primary font-label-md text-label-md">
<span className="inline-flex items-center gap-1 bg-surface-container/25 px-2.5 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px]">{"bolt"}</span>{" V-GREEN\n                  "}</span>
<span className="inline-flex items-center gap-1 bg-surface-container/25 px-2.5 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px]">{"security"}</span>{" MIC Bảo Hiểm Quân Đội\n                  "}</span>
<span className="inline-flex items-center gap-1 bg-surface-container/25 px-2.5 py-1 rounded-md">
<span className="material-symbols-outlined text-[16px]">{"local_police"}</span>{" Bộ Công An (VNeID)\n                  "}</span>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="mt-space-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
<div className="bg-surface-container p-space-md rounded-xl shadow-[0_4px_20px_-2px_rgba(20,85,91,0.05)] flex items-start gap-3">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined">{"speed"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Nhận xe 3 phút"}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"Không cần thủ tục rườm rà, nhận xe qua Bluetooth hoặc mã số."}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-[0_4px_20px_-2px_rgba(20,85,91,0.05)] flex items-start gap-3">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined">{"verified_user"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Bảo hiểm 2 chiều MIC"}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"Gói bảo hiểm toàn diện bao gồm thân vỏ và người ngồi trên xe."}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-[0_4px_20px_-2px_rgba(20,85,91,0.05)] flex items-start gap-3">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined">{"airline_seat_recline_extra"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Tài xế VIP 5 sao"}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"Tùy chọn bác tài chuyên nghiệp, thông thạo lộ trình và ngoại ngữ."}</div>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-xl shadow-[0_4px_20px_-2px_rgba(20,85,91,0.05)] flex items-start gap-3">
<div className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined">{"ev_station"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg text-on-surface font-semibold">{"Sạc miễn phí 1 năm"}</div>
<div className="font-body-sm text-body-sm text-on-surface-variant">{"Hỗ trợ độc quyền tại hơn 150.000 cổng sạc V-GREEN cả nước."}</div>
</div>
</div>
</div>
</div>
</div>

</div></main>
  );
}
