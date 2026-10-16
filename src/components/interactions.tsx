"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./icon";
import { useAuth } from "./auth-provider";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")}₫`;
const storageKey = "kanow:preview:v1";
function writePreview(value: object) {
  try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* The preview also works without browser storage. */ }
}
function setText(id: string, value: string) { const el = document.getElementById(id); if (el) el.textContent = value; }
function activate(button: HTMLElement, selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach(el => { el.dataset.active = String(el === button); el.setAttribute("aria-pressed", String(el === button)); });
}
function filterVehicles(category: string) {
  document.querySelectorAll<HTMLElement>("[data-vehicle-card]").forEach(card => { card.dataset.filterHidden = String(category !== "all" && category !== "delivery" && card.dataset.vehicleCard !== category); });
}
function categoryFrom(text: string) {
  return /[đĐ]iện|EV|ev/.test(text) ? "ev" : /SUV|MPV|suv/.test(text) ? "suv" : /[Ss]ang|luxury/.test(text) ? "luxury" : /Sedan|sedan/.test(text) ? "sedan" : "all";
}

function PreviewDialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="preview-dialog-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border-0 bg-white p-0 text-on-surface shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm">
    <div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><h2 id="preview-dialog-title" className="text-xl font-semibold text-primary">{title}</h2><button type="button" onClick={close} aria-label="Đóng hộp thoại" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-tint"><Icon name="close" className="text-[20px]" /></button></div><div className="mt-4 text-sm leading-7 text-on-surface-variant">{children}</div><button type="button" onClick={close} className="mt-6 w-full rounded-full bg-primary px-6 py-3 font-semibold text-white">Đã hiểu</button></div>
  </dialog>;
}

export function Interactions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout } = useAuth();
  const root = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rate = useRef({ daily: 650000, name: "Compact 4-5 Chỗ" });
  const driver = useRef({ trip: "airport", car: "camry" });
  function notify(message: string) {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4500);
  }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    scope.querySelectorAll<HTMLElement>("[data-vehicle-card]").forEach((card, index) => {
      if (index === 0 && !document.getElementById("danh-sach-xe")) card.parentElement!.id = "danh-sach-xe";
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get("filter")) filterVehicles(params.get("filter")!);
    if (params.get("location")) {
      const location = scope.querySelector<HTMLInputElement>('main input[type="text"]');
      if (location) location.value = params.get("location")!;
    }
    scope.querySelectorAll<HTMLInputElement>("input").forEach((input, index) => {
      if (!input.id) input.id = `kanow-input-${index}`;
      const label = input.closest("div")?.querySelector("label:not([for])");
      if (label && !label.contains(input)) label.setAttribute("for", input.id);
    });
    scope.querySelectorAll<HTMLElement>('[data-handler*="setMode"], [data-handler*="setMortgage"], [data-handler*="updateVehicleChoice"]').forEach(el => {
      if (el.tagName !== "BUTTON" && el.tagName !== "INPUT") { el.tabIndex = 0; el.setAttribute("role", "button"); }
    });
    if (pathname === "/tai-khoan") {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        scope.querySelectorAll<HTMLInputElement>("#profileForm input").forEach((input, index) => { if (saved.profile?.[index] !== undefined) input.value = saved.profile[index]; });
      } catch { /* Ignore a malformed or unavailable preview record. */ }
    }
  }, [pathname]);

  function estimate() {
    const days = Number((document.getElementById("rental-days-range") as HTMLInputElement | null)?.value ?? 3);
    const base = rate.current.daily * days;
    const discount = days >= 30 ? .25 : days >= 7 ? .12 : days >= 3 ? .05 : 0;
    const insurance = (document.getElementById("addon-insurance") as HTMLInputElement | null)?.checked ? 99000 * days : 0;
    const delivery = (document.getElementById("addon-delivery") as HTMLInputElement | null)?.checked ? 150000 : 0;
    const subtotal = base * (1 - discount) + insurance + delivery;
    setText("days-display", String(days)); setText("receipt-days", String(days));
    setText("receipt-car-name", `${rate.current.name} (${days} ngày)`);
    setText("receipt-base-price", money(base)); setText("receipt-discount-percent", `${discount * 100}%`);
    setText("receipt-discount-amount", `-${money(base * discount)}`);
    setText("receipt-insurance-price", money(insurance)); setText("receipt-delivery-price", money(delivery));
    setText("receipt-vat", money(subtotal * .08)); setText("receipt-grand-total", money(subtotal * 1.08));
    setText("receipt-deposit", money(rate.current.daily >= 1400000 ? 10000000 : rate.current.daily >= 900000 ? 8000000 : 5000000));
  }
  function driverPrice() {
    const prices: Record<string, Record<string, number>> = { airport: { camry: 380000, carnival: 550000 }, city: { camry: 1400000, carnival: 1850000 }, province: { camry: 2100000, carnival: 2800000 } };
    const price = money(prices[driver.current.trip][driver.current.car]);
    setText("base-price-display", price); setText("total-price-display", price);
  }
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); notify(`Đã sao chép mã ${code}.`); }
    catch { setDialog({ title: "Mã ưu đãi của bạn", body: `Sao chép mã ${code} để sử dụng trong bước đặt xe.` }); }
    try { sessionStorage.setItem("kanow:voucher:v1", code); } catch { /* Optional preview storage. */ }
  }
  function click(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('[data-hold-control]')) return;
    const button = target.closest<HTMLElement>("button, [data-handler], a");
    if (!button) return;
    // Submit buttons retain native form validation and are handled by submit().
    if (button.getAttribute("type") === "submit") return;
    const text = button.textContent?.trim() ?? "";
    const handler = button.dataset.handler ?? "";
    const arg = button.dataset.args?.match(/['"]([^'"]+)['"]/)?.[1] ?? "";
    const action = button.dataset.action ?? "";
    if (handler === "toggleFaq" || action === "faq") {
      const answer = (button.nextElementSibling ?? button.closest("h3")?.nextElementSibling) as HTMLElement | null;
      if (answer) { const open = answer.classList.contains("hidden"); answer.classList.toggle("hidden", !open); button.setAttribute("aria-expanded", String(open)); const icon = button.querySelector<HTMLElement>(".material-symbols-outlined"); if (icon) icon.style.transform = open ? "rotate(180deg)" : ""; }
      return;
    }
    if (handler === "filterFleet" || action === "filter") {
      filterVehicles(arg || categoryFrom(text));
      activate(button, ".fleet-filter-btn, [data-action='filter']");
      if (button.closest(".search-console, .home-page")) return;
      document.getElementById("danh-sach-xe")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (handler === "filterCoupons") {
      activate(button, "#coupon-tabs button");
      document.querySelectorAll<HTMLElement>(".voucher-card").forEach(card => { card.dataset.filterHidden = String(arg !== "all" && !card.dataset.category?.split(" ").includes(arg)); });
      return;
    }
    if (handler === "copyCode" || handler.endsWith("copyContent") || action === "voucher") { void copy(arg || "KANOWNEW"); return; }
    if (handler === "switchBookingMode" || button.id.startsWith("tab-") && /self|driver|chauffeur/.test(button.id)) {
      activate(button, "[data-handler='switchBookingMode'], #tab-self-drive, #tab-with-driver, #tab-chauffeur-only");
      button.parentElement!.dataset.mode = arg || button.id;
      return;
    }
    if (button.classList.contains("vehicle-select-btn")) { rate.current = { daily: Number(button.dataset.rate), name: button.dataset.name! }; activate(button, ".vehicle-select-btn"); estimate(); return; }
    if (handler.endsWith("setMode")) {
      const full = arg === "full100";
      for (const id of ["30", "100"]) { const radio = document.getElementById(`radio-opt-${id}`) as HTMLInputElement; if (radio) radio.checked = full === (id === "100"); const card = document.getElementById(`card-opt-${id}`); if (card) card.dataset.active = String(full === (id === "100")); }
      const due = full ? 3758260 : 1142478;
      setText("val-deposit-due", money(due)); setText("cta-payment-text", `${full ? "THANH TOÁN TOÀN BỘ" : "XÁC NHẬN & ĐẶT CỌC"} ${money(due)}`);
      setText("summary-payment-ratio", full ? "Thanh toán 100% (-50k)" : "Cọc 30% giữ xe");
      document.getElementById("row-fullpay-discount")?.classList.toggle("hidden", !full);
      return;
    }
    if (handler.endsWith("setMethod")) {
      for (const method of ["vietqr", "atm", "card", "wallet"]) { document.getElementById(`method-details-${method}`)?.classList.toggle("hidden", method !== arg); const card = document.getElementById(`method-card-${method}`); if (card) card.dataset.active = String(method === arg); }
      return;
    }
    if (handler.endsWith("setMortgage")) {
      for (const id of ["a", "b", "c"]) { const radio = document.getElementById(`mortgage-radio-${id}`) as HTMLInputElement; if (radio) radio.checked = id === arg; const card = document.getElementById(`mortgage-card-${id}`); if (card) card.dataset.active = String(id === arg); }
      return;
    }
    if (handler === "setTripType") {
      driver.current.trip = arg; activate(button, "[data-handler='setTripType']"); driverPrice();
      const destination = document.getElementById("destination-input") as HTMLInputElement;
      if (destination) destination.value = arg === "airport" ? "Sân bay Quốc tế Nội Bài (Nhà ga T2)" : arg === "city" ? "Hành trình nội thành Hà Nội (8 tiếng/100km)" : "Hà Nội - Hạ Long / Ninh Bình / Hải Phòng";
      return;
    }
    if (/selectCarModel|updateVehicleChoice/.test(handler)) {
      driver.current.car = arg; driverPrice();
      document.querySelectorAll<HTMLInputElement>('input[name="selected_car"]').forEach(input => { input.checked = input.value === arg; });
      for (const car of ["camry", "carnival"]) { const card = document.getElementById(`card-car-${car}`); if (card) card.dataset.active = String(car === arg); }
      return;
    }
    if (button.id === "cta-payment-btn" || handler === "confirmBooking") {
      setDialog({ title: "Đã hoàn tất đặt xe mẫu", body: "Lựa chọn của bạn đã được ghi nhận trong bản xem trước. Chưa phát sinh giao dịch hoặc đặt xe thực tế. Kanow chưa kết nối cổng thanh toán." });
      writePreview({ booking: { status: "preview", car: "VinFast VF 8 Plus 2024", createdAt: new Date().toISOString() } }); return;
    }
    if (action === "password" || button.id === "togglePasswordBtn" || handler === "document.getElementById" && /pwd/.test(arg)) {
      const input = (arg ? document.getElementById(arg) : button.parentElement?.querySelector("input")) as HTMLInputElement | null;
      if (input) { input.type = input.type === "password" ? "text" : "password"; button.setAttribute("aria-label", input.type === "password" ? "Hiện mật khẩu" : "Ẩn mật khẩu"); }
      return;
    }
    if (action === "favorite") { const active = button.dataset.favorite !== "true"; button.dataset.favorite = String(active); button.setAttribute("aria-pressed", String(active)); notify(active ? "Đã lưu xe vào danh sách yêu thích." : "Đã bỏ lưu xe."); return; }
    if (action === "detail") { router.push("/xe/vinfast-vf8-plus-2024"); return; }
    if (action === "driver") { router.push("/tai-xe/tran-minh-tuan"); return; }
    if (button.classList.contains("sub-btn")) { activate(button, ".sub-btn"); return; }
    if (handler === "window.scrollTo") { window.scrollTo({ top: 250, behavior: "smooth" }); return; }
    if (action === "book") { router.push(pathname.startsWith("/xe/") ? "/thanh-toan-dat-coc" : "/xe/vinfast-vf8-plus-2024"); return; }
    if (action === "search") {
      if (pathname.includes("tu-lai")) { document.getElementById("danh-sach-xe")?.scrollIntoView({ behavior: "smooth" }); notify("Đã cập nhật danh sách xe phù hợp."); }
      else router.push("/thue-xe-tu-lai#danh-sach-xe");
      return;
    }
    if (action === "logout") { logout(); router.push("/dang-nhap"); notify("Đã đăng xuất."); return; }
    if (action === "edit") { const input = document.querySelector<HTMLInputElement>("#profileForm input"); input?.focus(); input?.select(); return; }
    if (action === "reset") { (document.getElementById("profileForm") as HTMLFormElement | null)?.reset(); return; }
    if (action === "provider") { login(); router.push("/tai-khoan"); notify("Đăng nhập tài khoản mẫu thành công."); return; }
    if (action === "otp") { setDialog({ title: "Đăng nhập bằng OTP", body: "Dịch vụ gửi SMS chưa được kết nối. Vui lòng sử dụng biểu mẫu đăng nhập mẫu để tiếp tục." }); return; }
    if (action === "contact") { router.push("/lien-he"); return; }
    if (button.tagName === "A") return;
    if (/photo_camera|upload_file|add_card|delete/.test(text)) { setDialog({ title: "Quản lý hồ sơ", body: "Tính năng tải giấy tờ và liên kết thẻ cần máy chủ bảo mật. Bản xem trước chưa lưu tài liệu hoặc thông tin thanh toán." }); return; }
    if (/Thay đổi/.test(text)) { router.push("/thue-xe-tu-lai"); return; }
    if (/Bác tài|call/.test(text)) { window.location.href = "tel:19008888"; return; }
    if (/Chi tiết hành trình/.test(text)) { router.push("/thanh-toan-dat-coc"); return; }
  }
  function submit(event: FormEvent<HTMLDivElement>) {
    const form = event.target as HTMLFormElement;
    if (form.id === "search-service-panel") return;
    event.preventDefault();
    if (pathname === "/dang-ky") {
      const password = document.getElementById("pwd-input") as HTMLInputElement;
      const confirm = document.getElementById("pwd-confirm") as HTMLInputElement;
      if (password?.value !== confirm?.value) { notify("Mật khẩu xác nhận chưa khớp."); confirm?.focus(); return; }
      login(); router.push("/tai-khoan"); notify("Đã đăng ký tài khoản mẫu."); return;
    }
    if (pathname === "/dang-nhap") { login(); router.push("/tai-khoan"); notify("Đăng nhập thành công."); return; }
    if (form.id === "profileForm") { writePreview({ profile: Array.from(form.querySelectorAll<HTMLInputElement>("input")).map(input => input.value) }); notify("Đã lưu thay đổi trên trình duyệt này."); return; }
    if (form.dataset.form === "recovery") { setDialog({ title: "Khôi phục mật khẩu", body: "Dịch vụ email và SMS chưa được kết nối trong bản xem trước. Chưa có hướng dẫn khôi phục được gửi." }); return; }
    setDialog({ title: "Đã xem trước thông tin", body: "Biểu mẫu hợp lệ. Bản giao diện hiện chưa kết nối máy chủ gửi thông tin. Gọi 1900 8888 để được tư vấn trực tiếp." });
  }
  return <div ref={root} onClick={click} onSubmit={submit} onInput={event => { if ((event.target as HTMLElement).id === "rental-days-range") estimate(); }} onChange={event => {
    const input = event.target as HTMLInputElement;
    if (["addon-insurance", "addon-delivery"].includes(input.id) && pathname === "/bang-gia-dong-xe") estimate();
    if (input.name === "selected_car") { driver.current.car = input.value; driverPrice(); }
  }} onKeyDown={event => { const target = event.target as HTMLElement; if (target.getAttribute("role") === "button" && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); target.click(); } }}>
    {children}
    {toast ? <div role="status" className="toast fixed inset-x-4 bottom-5 z-[80] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-sm text-white shadow-xl"><Icon name="check_circle" className="text-[20px] text-primary-fixed" />{toast}<button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")} className="ml-2 flex"><Icon name="close" className="text-[18px]" /></button></div> : null}
    {dialog ? <PreviewDialog title={dialog.title} close={() => setDialog(null)}>{dialog.body}</PreviewDialog> : null}
  </div>;
}
