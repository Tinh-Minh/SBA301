import Link from "next/link";

export default function Register() {
  return (
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">
<div className="relative w-full overflow-hidden bg-surface py-space-xl md:py-space-2xl">
<div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
<div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>
<div className="max-w-[1240px] mx-auto px-margin-mobile md:px-margin relative z-10">
<div className="flex items-center gap-space-xs mb-space-lg text-text-muted">
<Link className="font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-1" href="/lien-he">
<span className="material-symbols-outlined text-[16px]">{"home"}</span>{"\n          Trang chủ\n        "}</Link>
<span className="material-symbols-outlined text-[14px]">{"chevron_right"}</span>
<span className="font-label-md text-label-md text-primary font-semibold">{"Đăng ký tài khoản"}</span>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<div className="lg:col-span-7 flex flex-col">
<div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-[0_4px_24px_-4px_rgba(20,85,91,0.08)]">
<div className="mb-space-lg">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint text-primary font-label-md text-label-md mb-space-sm font-semibold">
<span className="material-symbols-outlined text-[16px] text-secondary">{"verified_user"}</span>{"\n                Nền tảng thuê xe số thế hệ mới\n              "}</span>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">{"\n                Tạo tài khoản Kanow\n              "}</h1>
<p className="font-body-md text-body-md text-on-surface-variant">{"\n                Gia nhập cộng đồng di chuyển xanh và thuê xe thông minh hàng đầu\n              "}</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
<button className="group relative flex items-center justify-center gap-space-sm px-space-md py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all text-on-surface font-label-lg text-label-lg" type="button" data-action="provider">
<svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
<path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
<path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853"></path>
<path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
<path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
</svg>
<span>{"Google"}</span>
</button>
<button className="relative flex items-center justify-between px-space-md py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-label-lg text-label-lg shadow-[0_4px_14px_rgba(20,85,91,0.2)]" type="button" data-action="provider">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">{"shield_person"}</span>
<span>{"Đăng ký qua VNeID"}</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-[10px] uppercase font-bold tracking-wider">{"Cấp 2"}</span>
</button>
</div>
<div className="relative flex items-center justify-center my-space-lg">
<div className="w-full h-px bg-surface-container-high"></div>
<span className="absolute px-space-md bg-surface-container-lowest font-body-sm text-body-sm text-text-muted">{"Hoặc tiếp tục với thông tin cá nhân"}</span>
</div>
<form className="flex flex-col gap-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">{"\n                  Họ và tên "}<span className="text-error">{"*"}</span>
<span className="text-text-muted font-normal text-[11px] ml-1">{"(Khớp trên CCCD/GPLX)"}</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">{"badge"}</span>
<input className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted/60 font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#00696c] transition-all" placeholder="Nguyễn Văn A" required={true} type="text" aria-label="Nguyễn Văn A" />
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">{"\n                    Số điện thoại "}<span className="text-error">{"*"}</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">{"smartphone"}</span>
<input className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted/60 font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#00696c] transition-all" placeholder="0912 345 678" required={true} type="tel" aria-label="0912 345 678" />
</div>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">{"\n                    Địa chỉ Email "}<span className="text-error">{"*"}</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">{"mail"}</span>
<input className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted/60 font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#00696c] transition-all" placeholder="example@email.com" required={true} type="email" aria-label="example@email.com" />
</div>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">{"\n                    Mật khẩu "}<span className="text-error">{"*"}</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">{"lock"}</span>
<input className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted/60 font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#00696c] transition-all" id="pwd-input" placeholder="Tối thiểu 8 ký tự" required={true} type="password" aria-label="Tối thiểu 8 ký tự" />
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface p-1" type="button" data-handler="document.getElementById" data-args="'pwd-input'">
<span className="material-symbols-outlined text-[18px]">{"visibility"}</span>
</button>
</div>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1.5 font-semibold">{"\n                    Xác nhận mật khẩu "}<span className="text-error">{"*"}</span>
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-primary">{"lock_reset"}</span>
<input className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-text-muted/60 font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#00696c] transition-all" id="pwd-confirm" placeholder="Nhập lại mật khẩu" required={true} type="password" aria-label="Nhập lại mật khẩu" />
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface p-1" type="button" data-handler="document.getElementById" data-args="'pwd-confirm'">
<span className="material-symbols-outlined text-[18px]">{"visibility"}</span>
</button>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-tint flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm shadow-[0_2px_12px_rgba(20,85,91,0.04)]">
<div className="flex items-start gap-space-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 mt-0.5 text-on-secondary-fixed-variant">
<span className="material-symbols-outlined text-[20px]">{"card_membership"}</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-label-md text-label-md text-primary font-bold">{"Định danh eKYC sớm"}</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-md text-[10px] font-bold">{"Tặng 100K"}</span>
</div>
<p className="font-body-sm text-body-sm text-text-muted mt-0.5">{"\n                      Tải sẵn GPLX / Căn cước để nhận ngay voucher giảm 100.000₫ cho chuyến đi đầu tiên\n                    "}</p>
</div>
</div>
<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-primary font-label-md text-label-md font-semibold shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[16px]">{"add_a_photo"}</span>
<span>{"Đính kèm ảnh"}</span>
<input accept="image/*" className="hidden" type="file" aria-label="Thông tin" />
</label>
</div>
<label className="flex items-start gap-3 cursor-pointer pt-space-xs">
<input className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 accent-primary" required={true} type="checkbox" aria-label="Chọn tùy chọn" />
<span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{"\n                  Tôi đồng ý với "}<Link className="text-primary font-semibold hover:underline" href="/tai-khoan">{"Điều khoản sử dụng dịch vụ"}</Link>{" và "}<Link className="text-primary font-semibold hover:underline" href="/lien-he">{"Chính sách bảo mật thông tin"}</Link>{" của Kanow Mobility.\n                "}</span>
</label>
<button className="w-full py-3.5 px-space-lg rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-[0_8px_20px_rgba(0,61,66,0.24)] transition-all flex items-center justify-center gap-2 mt-space-xs" type="submit" data-action="contact">
<span>{"Hoàn tất đăng ký tài khoản"}</span>
<span className="material-symbols-outlined text-[20px]">{"arrow_forward"}</span>
</button>
<div className="text-center pt-space-xs">
<span className="font-body-md text-body-md text-text-muted">{"Đã có tài khoản?"}</span>
<Link className="font-label-lg text-label-lg text-primary hover:text-secondary font-bold ml-1.5 transition-colors underline underline-offset-4" href="/lien-he">{"Đăng nhập ngay"}</Link>
</div>
</form>
</div>
</div>
<div className="lg:col-span-5 flex flex-col gap-space-lg">
<div className="relative overflow-hidden rounded-xl bg-primary text-on-primary p-space-lg md:p-space-xl shadow-[0_16px_36px_-6px_rgba(20,85,91,0.3)]">
<div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-secondary-fixed/20 blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold tracking-wider uppercase">{"\n                Kanow Elite Member\n              "}</span>
<span className="material-symbols-outlined text-tertiary-fixed-dim text-[28px]">{"stars"}</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold mb-space-xs leading-snug">{"\n              Mở khóa đặc quyền dành riêng cho thành viên\n            "}</h3>
<p className="font-body-sm text-body-sm text-on-primary/80 mb-space-lg">{"\n              Tham gia hành trình di chuyển không giới hạn với những ưu đãi độc quyền toàn quốc.\n            "}</p>
<div className="flex flex-col gap-space-md">
<div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-white/5 backdrop-blur-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center shrink-0 text-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">{"savings"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg font-semibold">{"Miễn thế chấp tiền mặt"}</div>
<div className="font-body-sm text-body-sm text-on-primary/70">{"Nhận xe nhanh chóng không cần đặt cọc lớn khi xác thực VNeID Cấp 2."}</div>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-white/5 backdrop-blur-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center shrink-0 text-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">{"eco"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg font-semibold">{"Tích điểm Dặm Xanh (Green Miles)"}</div>
<div className="font-body-sm text-body-sm text-on-primary/70">{"Nhận 5% hoàn dặm thưởng cho xe điện và quy đổi phí thuê trên mọi hành trình."}</div>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-white/5 backdrop-blur-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center shrink-0 text-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">{"local_shipping"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg font-semibold">{"Giao xe miễn phí 5km đầu"}</div>
<div className="font-body-sm text-body-sm text-on-primary/70">{"Bàn giao xe tận sân bay, khách sạn hoặc địa chỉ riêng đúng hẹn 100%."}</div>
</div>
</div>
<div className="flex items-start gap-space-sm p-space-sm rounded-xl bg-white/5 backdrop-blur-sm">
<div className="w-9 h-9 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center shrink-0 text-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">{"support_agent"}</span>
</div>
<div>
<div className="font-label-lg text-label-lg font-semibold">{"Hỗ trợ khẩn cấp 24/7"}</div>
<div className="font-body-sm text-body-sm text-on-primary/70">{"Đội kỹ thuật cơ động sẵn sàng tiếp ứng và đổi xe thay thế tức thì trên tuyến."}</div>
</div>
</div>
</div>
<div className="mt-space-lg pt-space-md border-t border-white/10 flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary text-[10px] font-bold ring-2 ring-primary">{"VN"}</div>
<div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant text-[10px] font-bold ring-2 ring-primary">{"KH"}</div>
<div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed text-[10px] font-bold ring-2 ring-primary">{"HN"}</div>
</div>
<span className="font-body-sm text-body-sm text-on-primary/80 font-medium">{"Hơn 45.000+ tài xế tin dùng"}</span>
</div>
</div>
<div className="rounded-xl overflow-hidden bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(20,85,91,0.05)]">
<div className="relative h-44 w-full">
<img className="w-full h-full object-cover" src="/images/f3eecb09dfdd88e7.webp" alt="Hình ảnh xe và hành trình Kanow" loading="lazy" decoding="async" />
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-space-md">
<div className="text-white">
<div className="font-label-md text-label-md text-secondary-fixed font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">{"electric_car"}</span>{"\n                    Đội xe hiện đại 2024-2025\n                  "}</div>
<div className="font-body-sm text-body-sm text-white/90">{"Trải nghiệm hơn 300+ xe tự lái và xe cao cấp nguyên bản"}</div>
</div>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-high/60 flex items-center gap-space-sm text-on-surface">
<span className="material-symbols-outlined text-[24px] text-primary shrink-0">{"lock_clock"}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{"\n              Thông tin cá nhân được mã hóa chuẩn 256-bit và chỉ sử dụng cho mục đích lập hợp đồng thuê xe hợp pháp.\n            "}</p>
</div>
</div>
</div>
</div>
</div>
</div></main>
  );
}
