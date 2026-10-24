"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider.jsx";
import { HoldButton } from "@/components/HoldButton.jsx";
import { Icon } from "@/components/Icon.jsx";
const money = (value) => Math.round(value).toLocaleString("vi-VN") + " đ";
function setText(id, text) { const el = document.getElementById(id); if (el)
    el.textContent = text; }
function activate(button) { button.parentElement?.querySelectorAll(":scope > button").forEach(el => { el.dataset.active = String(el === button); el.setAttribute("aria-pressed", String(el === button)); }); }
function filterCars(category) { document.querySelectorAll("[data-vehicle-card]").forEach(card => { card.dataset.filterHidden = String(category !== "all" && card.dataset.vehicleCard !== category); }); }
function Modal({ title, close, children }) {
    const ref = useRef(null);
    useEffect(() => { ref.current?.showModal(); }, []);
    return <dialog ref={ref} onCancel={close} onClick={event => { if (event.currentTarget === event.target)
        close(); }} aria-labelledby="app-dialog-title" className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-border-light bg-white p-0 text-text-primary shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"><div className="p-5 sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><h2 id="app-dialog-title" className="text-xl font-bold">{title}</h2><button type="button" aria-label="Đóng hộp thoại" onClick={close} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-section-bg"><Icon name="close" className="text-[20px]"/></button></div>{children}</div></dialog>;
}
export function Interactions({ children }) {
    const router = useRouter();
    const path = usePathname();
    const { login, register } = useAuth();
    const root = useRef(null);
    const toastTimer = useRef(null);
    const [toast, setToast] = useState("");
    const [modal, setModal] = useState(null);
    const [empty, setEmpty] = useState(false);
    const [rating, setRating] = useState(0);
    function notify(text) { setToast(text); if (toastTimer.current)
        clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 4000); }
    useEffect(() => () => { if (toastTimer.current)
        clearTimeout(toastTimer.current); }, []);
    useEffect(() => {
        setModal(null);
        setEmpty(false);
        setRating(0);
        const params = new URLSearchParams(window.location.search);
        if (params.get("filter"))
            filterCars(params.get("filter"));
        if (params.has("cancelled"))
            notify("Đã hủy yêu cầu thuê xe.");
        const scope = root.current;
        if (!scope)
            return;
        scope.querySelectorAll("[data-handler='toggleCard']").forEach(el => { el.tabIndex = 0; el.setAttribute("role", "button"); el.setAttribute("aria-expanded", String(!el.closest("[id^='card-']")?.querySelector(".card-body,.card-content")?.classList.contains("hidden"))); });
        scope.querySelectorAll("input:not([id])").forEach((input, index) => input.id = `cardb-field-${index}`);
        scope.querySelectorAll("[data-star]").forEach(el => el.setAttribute("aria-label", `${el.dataset.star} sao`));
        scope.querySelectorAll("[data-val]").forEach(el => el.setAttribute("aria-label", `Đánh giá ${el.dataset.val} sao`));
        const dialog = scope.querySelector("#modal-add-bank,#change-default-bank-modal");
        if (dialog) {
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-label", path.endsWith("/add") ? "Thêm tài khoản ngân hàng" : "Đổi tài khoản mặc định");
            dialog.querySelector("input,button")?.focus();
        }
        if (path.endsWith("bank/add") && params.get("edit") === "1") {
            const heading = dialog?.querySelector("h2,h3");
            if (heading)
                heading.textContent = "Chỉnh sửa tài khoản ngân hàng";
            const number = document.getElementById("account-number");
            if (number)
                number.value = "0071001234982";
        }
        if (path === "/account")
            try {
                const saved = JSON.parse(localStorage.getItem("cardb:profile:v1") ?? "{}");
                for (const [id, value] of Object.entries(saved)) {
                    const field = document.getElementById(id);
                    if (field instanceof HTMLInputElement)
                        field.value = String(value);
                    else if (field)
                        field.textContent = String(value);
                }
            }
            catch { }
    }, [path]);
    async function copy(value) { try {
        await navigator.clipboard.writeText(value);
        notify("Đã sao chép: " + value);
    }
    catch {
        setModal({ kind: "info", title: "Thông tin cần sao chép", body: value });
    } }
    function search(button) {
        const container = button.closest("section") ?? root.current;
        const location = container?.querySelector("select")?.value ?? "TP. Hồ Chí Minh";
        const fields = container?.querySelectorAll('input[type="text"]');
        const params = new URLSearchParams({ location, start: fields?.[0]?.value ?? "08:00, 25/10/2026", end: fields?.[1]?.value ?? "20:00, 27/10/2026" });
        if (path === "/explore") {
            notify("Đã cập nhật thời gian tìm xe.");
            return;
        }
        router.push("/explore?" + params);
    }
    function click(event) {
        const target = event.target;
        if (target.closest("[data-hold-control],[data-native]"))
            return;
        const button = target.closest("button,a,[data-action],[data-handler],[data-tab-target]");
        if (!button) {
            if (target.tagName === "IMG" && target.closest("main") && !path.includes("dang-") && !target.closest("a")) {
                const img = target;
                setModal({ kind: "image", title: img.alt || "Hình ảnh xe", image: img.src });
            }
            return;
        }
        if (button.getAttribute("type") === "submit")
            return;
        const text = (button.getAttribute("aria-label") || button.textContent || "").trim();
        const handler = button.dataset.handler ?? "";
        const arg = button.dataset.args?.match(/['"]([^'"]+)['"]/)?.[1] ?? "";
        const action = button.dataset.action;
        if (handler === "toggleCancelModal" && button.dataset.args?.includes("true") || action === "cancel-order") {
            setModal({ kind: "cancel", title: "Hủy yêu cầu thuê xe", body: "Giữ nút bên dưới để xác nhận hủy. Thả tay trước khi hết thời gian để giữ nguyên yêu cầu." });
            return;
        }
        if (button.dataset.route) {
            router.push(button.dataset.route);
            return;
        }
        if (handler === "switchAuthTab") {
            router.push(arg === "register" ? "/register" : "/login");
            return;
        }
        if (handler === "togglePasswordVisibility" || action === "password") {
            const input = (arg ? document.getElementById(arg) : button.parentElement?.querySelector("input"));
            if (input)
                input.type = input.type === "password" ? "text" : "password";
            return;
        }
        if (handler === "toggleCard") {
            const card = document.getElementById(arg);
            if (card) {
                const content = card.querySelector(".card-body,.card-content,.details-content,.expandable-content") ?? card.lastElementChild;
                content?.classList.toggle("hidden");
                if (content)
                    content.style.display = content.classList.contains("hidden") ? "none" : "";
                button.setAttribute("aria-expanded", String(!content?.classList.contains("hidden")));
            }
            return;
        }
        if (handler === "selectPaymentMethod") {
            const group = document.getElementById("payment-methods");
            group?.querySelectorAll("[data-handler='selectPaymentMethod']").forEach(el => el.dataset.active = String(el === button));
            notify("Đã chọn phương thức thanh toán.");
            return;
        }
        if (handler === "copyOrderCode" || handler === "navigator.clipboard.writeText" || action === "copy") {
            void copy(arg || "CDB-ORD-20261026-904");
            return;
        }
        if (handler === "window.print" || action === "receipt") {
            window.print();
            return;
        }
        if (action === "trip-filter") {
            const status = button.dataset.statusFilter;
            activate(button);
            root.current?.querySelectorAll("[data-trip-card]").forEach(card => card.dataset.filterHidden = String(status !== "all" && card.dataset.tripStatus !== status));
            setEmpty(!root.current?.querySelector('[data-trip-card]:not([data-filter-hidden="true"])'));
            return;
        }
        if (action === "choice") {
            activate(button);
            notify(`Đã chọn ${text.replace(/^\+\s*/, "")}.`);
            return;
        }
        if (action === "page") {
            activate(button);
            notify(/^[1-9]\d*$/.test(text) ? `Đã chọn trang ${text}. Các mục hiện có được hiển thị trong danh sách.` : "Danh sách hiện đã hiển thị các mục có sẵn.");
            return;
        }
        if (action === "view-layout") {
            const card = root.current?.querySelector("[data-vehicle-card]");
            if (card?.parentElement)
                card.parentElement.dataset.resultsLayout = button.dataset.layout;
            activate(button);
            return;
        }
        if (action === "edit-search") {
            root.current?.querySelector("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            notify("Chọn lại ngày nhận, ngày trả xe và nhấn Cập nhật.");
            return;
        }
        if (action === "refresh-list") {
            router.refresh();
            notify("Đã làm mới danh sách chuyến xe.");
            return;
        }
        if (action === "download-report") {
            const lines = root.current?.querySelector("main")?.innerText.split("\n").filter(Boolean) ?? [];
            const csv = "\ufeffNội dung\n" + lines.map(line => '"' + line.replaceAll('"', '""') + '"').join("\n");
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            const download = document.createElement("a");
            download.href = url;
            download.download = "cardb-lich-su.csv";
            download.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            notify("Đã xuất lịch sử dạng CSV, có thể mở bằng Excel.");
            return;
        }
        if (action === "media-info") {
            setModal({ kind: "info", title: text, body: "Nội dung này đang được cập nhật. Bạn có thể xem ảnh thực tế trong thư viện xe hoặc liên hệ 1900 8899 để được hỗ trợ." });
            return;
        }
        if (action === "contact-owner") {
            setModal({ kind: "info", title: "Liên hệ chủ xe", body: "Liên hệ tổng đài CarDB 1900 8899 để được kết nối với chủ xe và tư vấn lịch trình." });
            return;
        }
        if (action === "preview-attachment") {
            setModal({ kind: "info", title: "Bằng chứng đính kèm", body: "anh_taplo_dong_ho_tra_xe_08h00.jpg — Tải lên ảnh từ thiết bị để đính kèm bằng chứng của bạn." });
            return;
        }
        if (action === "remove-attachment") {
            button.closest("[data-attachment]")?.remove();
            setText("attachment-count", `Tài liệu đã chuẩn bị đính kèm (${root.current?.querySelectorAll("[data-attachment]").length ?? 0})`);
            notify("Đã xóa tệp đính kèm.");
            return;
        }
        if (action === "remove-voucher" || action === "apply-voucher") {
            const input = document.getElementById("voucher-input");
            const apply = action === "apply-voucher";
            if (apply && !input?.value.trim()) {
                notify("Nhập mã ưu đãi trước khi áp dụng.");
                input?.focus();
                return;
            }
            const total = apply ? 3700000 : 3900000;
            root.current?.querySelectorAll("[data-checkout-total]").forEach(el => el.textContent = el.dataset.checkoutTotal === "number" ? total.toLocaleString("vi-VN") : money(total));
            const discount = root.current?.querySelector("[data-voucher-discount]");
            if (discount)
                discount.textContent = money(apply ? -200000 : 0);
            const status = document.getElementById("voucher-status-box");
            if (status) {
                status.style.display = apply ? "" : "none";
                const code = status.querySelector("strong");
                if (code && input)
                    code.textContent = input.value.toUpperCase();
            }
            if (!apply && input)
                input.value = "";
            setText("btn-apply-voucher", apply ? "Đã áp dụng" : "Áp dụng");
            notify(apply ? "Đã áp dụng mã ưu đãi." : "Đã bỏ mã ưu đãi.");
            return;
        }
        if (action === "search") {
            search(button);
            return;
        }
        if (action === "rental-mode") {
            activate(button);
            return;
        }
        if (action === "filter") {
            const category = /điện|EV|Điện/.test(text) ? "ev" : /SUV|Gầm cao/.test(text) ? "suv" : /Sedan|sang/.test(text) ? "luxury" : "all";
            filterCars(category);
            activate(button);
            return;
        }
        if (action === "apply-filter") {
            const fuel = root.current?.querySelector('aside input[type="radio"]:checked');
            const label = fuel?.closest("label")?.textContent ?? "";
            const category = /điện|EV|Điện/.test(label) ? "ev" : "all";
            filterCars(category);
            setEmpty(document.querySelectorAll('[data-vehicle-card]:not([data-filter-hidden="true"])').length === 0);
            notify("Đã áp dụng bộ lọc.");
            return;
        }
        if (action === "clear-filter") {
            filterCars("all");
            setEmpty(false);
            root.current?.querySelectorAll('aside input[type="checkbox"],aside input[type="radio"]').forEach(input => input.checked = false);
            notify("Đã xóa bộ lọc.");
            return;
        }
        if (action === "favorite") {
            button.dataset.favorite = String(button.dataset.favorite !== "true");
            button.setAttribute("aria-pressed", button.dataset.favorite);
            notify(button.dataset.favorite === "true" ? "Đã lưu xe yêu thích." : "Đã bỏ lưu xe.");
            return;
        }
        if (action === "demo-login") {
            router.push("/login");
            return;
        }
        if (action === "edit-profile" || button.id === "btnEditProfile") {
            for (const id of ["fieldFullName", "fieldPhone", "fieldDob", "fieldAddress"]) {
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) {
                    field.readOnly = false;
                    field.disabled = false;
                    field.focus();
                }
                else if (field) {
                    field.contentEditable = "true";
                    field.classList.add("outline", "outline-brand-accent");
                }
            }
            setText("editBtnText", "Đang chỉnh sửa");
            notify("Bạn có thể chỉnh sửa thông tin cá nhân.");
            return;
        }
        if (action === "save-profile" || button.id === "btnSaveProfile") {
            const saved = {};
            for (const id of ["fieldFullName", "fieldPhone", "fieldDob", "fieldAddress"]) {
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement)
                    saved[id] = field.value;
                else if (field)
                    saved[id] = field.textContent ?? "";
            }
            try {
                localStorage.setItem("cardb:profile:v1", JSON.stringify(saved));
            }
            catch { }
            notify("Đã lưu thay đổi.");
            return;
        }
        if (button.dataset.star || button.dataset.val) {
            const score = Number(button.dataset.star || button.dataset.val);
            if (button.dataset.star)
                setRating(score);
            button.parentElement?.querySelectorAll("button").forEach(el => el.dataset.ratingActive = String(Number(el.dataset.star || el.dataset.val) <= score));
            setText("rating-feedback-label", `${score} sao — ${score >= 4 ? "Hài lòng" : "Đã ghi nhận lựa chọn"}`);
            return;
        }
        if (action === "review" || button.id === "submit-review-btn") {
            if (!rating) {
                notify("Vui lòng chọn số sao đánh giá.");
                return;
            }
            notify("Đã gửi đánh giá chuyến đi.");
            router.push("/account/history");
            return;
        }
        if (action === "dispute" || button.id === "submit-dispute-btn") {
            const reason = document.getElementById("dispute-detail");
            if (!reason?.value.trim()) {
                notify("Vui lòng nhập nội dung cần xem xét.");
                reason?.focus();
                return;
            }
            notify("Đã gửi yêu cầu xem xét.");
            router.push("/orders/CDB-ORD-20261026-904");
            return;
        }
        if (action === "upload") {
            const input = (button.closest("section")?.querySelector('input[type="file"]') ?? document.querySelector('input[type="file"]'));
            if (input)
                input.click();
            else {
                const picker = document.createElement("input");
                picker.type = "file";
                picker.accept = "image/*,.pdf";
                picker.multiple = true;
                picker.onchange = () => notify(`Đã chọn ${picker.files?.length ?? 0} tệp cho bản xem trước.`);
                picker.click();
            }
            return;
        }
        if (action === "default-bank") {
            router.push("/account/bank/default");
            return;
        }
        if (action === "bank-details") {
            const card = button.closest("article") ?? button.closest("[data-purpose='bank-card']");
            setModal({ kind: "info", title: "Thông tin tài khoản ngân hàng", body: (card?.querySelector("h3")?.textContent?.trim() || "Tài khoản đã liên kết") + " — Thông tin nhận chi trả được mã hóa. Bạn có thể chỉnh sửa hoặc chọn làm tài khoản mặc định." });
            return;
        }
        if (action === "preview-image") {
            const scope = button.closest("[id^='card-']") ?? button.closest("section") ?? root.current;
            const img = button.parentElement?.querySelector("img") ?? scope?.querySelector("img");
            if (img)
                setModal({ kind: "image", title: img.alt || "Ảnh đối chiếu", image: img.src });
            else
                notify("Chưa có ảnh đối chiếu cho mục này.");
            return;
        }
        if (action === "remove-bank") {
            setModal({ kind: "info", title: "Gỡ liên kết tài khoản", body: "Tài khoản mẫu đã được gỡ liên kết trong phiên xem trước." });
            return;
        }
        if (action === "handover" || (/Xác nhận của tôi/.test(text) && path === "/handover/pickup")) {
            notify("Đã xác nhận biên bản nhận xe.");
            router.push("/my-trips");
            return;
        }
        if (action === "return" || (/Xác nhận của tôi/.test(text) && path === "/handover/return")) {
            notify("Đã xác nhận biên bản trả xe.");
            router.push("/reviews");
            return;
        }
        if (path.includes("/bank/") && /Hủy|Đóng/.test(text)) {
            router.push("/account/bank");
            return;
        }
        if (path.endsWith("bank/default") && /Xác nhận|Lưu/.test(text)) {
            notify("Đã đổi tài khoản mặc định.");
            router.push("/account/bank");
            return;
        }
        if (/Lưu bản nháp/.test(text)) {
            notify("Đã lưu bản nháp biên bản.");
            return;
        }
        if (button.tagName === "A")
            return;
        if (/Quay lại|Trở về/.test(text)) {
            router.push("/my-trips");
            return;
        }
        if (/Áp dụng/.test(text)) {
            notify("Đã áp dụng mã ưu đãi.");
            return;
        }
        if (/Chọn|Thêm|Xác nhận|Lưu/.test(text)) {
            activate(button);
            notify("Đã cập nhật lựa chọn.");
        }
    }
    const value = (id) => document.getElementById(id)?.value ?? "";
    async function submitLogin(form) {
        const email = value("login-account").trim();
        const password = value("login-password");
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            notify("Vui lòng nhập email đã đăng ký (hệ thống đăng nhập bằng email).");
            return;
        }
        if (!password) {
            notify("Vui lòng nhập mật khẩu.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            const session = await login({ email, password });
            notify(`Xin chào ${session.account.fullName}!`);
            const next = new URLSearchParams(window.location.search).get("next");
            router.push(next && next.startsWith("/") ? next : session.account.role === "ADMIN" ? "/admin/dashboard" : "/explore");
        }
        catch (error) {
            notify(error.status === 401 ? "Email hoặc mật khẩu không đúng." : error.message);
        }
        finally {
            form.removeAttribute("aria-busy");
        }
    }
    async function submitRegister(form) {
        const payload = { fullName: value("reg-fullname"), email: value("reg-email"), phone: value("reg-phone"), password: value("reg-password") };
        if (!payload.fullName.trim() || !payload.email.trim() || !payload.phone.trim() || !payload.password) {
            notify("Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.");
            return;
        }
        if (payload.password !== value("reg-confirm-password")) {
            notify("Mật khẩu xác nhận chưa khớp.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            await register(payload);
            await login({ email: payload.email, password: payload.password });
            notify("Tạo tài khoản thành công. Chào mừng bạn đến với CarDB!");
            router.push("/account");
        }
        catch (error) {
            notify(error.message);
        }
        finally {
            form.removeAttribute("aria-busy");
        }
    }
    function submit(event) {
        if (event.target.closest?.("[data-native]"))
            return;
        event.preventDefault();
        const form = event.target;
        if (path === "/login") {
            void submitLogin(form);
            return;
        }
        if (path === "/register") {
            void submitRegister(form);
            return;
        }
        if (path.includes("/bank/")) {
            try {
                localStorage.setItem("cardb:bank:v1", JSON.stringify({ name: form.querySelector('#bank-name')?.value, number: form.querySelector('#account-number')?.value }));
            }
            catch { }
            notify("Đã lưu tài khoản ngân hàng mẫu.");
            router.push("/account/bank");
            return;
        }
        if (path === "/booking/confirm") {
            router.push("/booking/success");
            return;
        }
        notify("Đã lưu thông tin trong bản xem trước.");
    }
    return <div ref={root} onClick={click} onSubmit={submit} onInput={event => { const el = event.target; if (["review-content", "dispute-detail"].includes(el.id))
        setText("char-counter", `${el.value.length}/1000`); }} onChange={event => { const el = event.target; if (el.type === "file")
        notify(`Đã chọn ${el.files?.length ?? 0} tệp.`); }} onKeyDown={event => {
            const el = event.target;
            if (el.getAttribute("role") === "button" && ["Enter", " "].includes(event.key)) {
                event.preventDefault();
                el.click();
            }
            if (event.key === "Escape" && path.includes("/bank/"))
                router.push("/account/bank");
        }}>
  {children}
  {empty ? <p role="status" className="mx-auto my-4 max-w-xl rounded-lg border border-border-light bg-white p-6 text-center text-text-secondary">{path === "/explore" ? "Chưa có xe phù hợp. Hãy thử xóa hoặc thay đổi bộ lọc." : "Chưa có chuyến xe ở trạng thái này."}</p> : null}
  {toast ? <div role="status" className="toast fixed inset-x-4 bottom-5 z-[150] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-border-light bg-text-primary px-5 py-4 text-sm text-white shadow-xl"><Icon name="check_circle" className="text-[20px] text-brand-accent"/>{toast}<button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")}><Icon name="close" className="text-[18px]"/></button></div> : null}
  {modal ? <Modal title={modal.title} close={() => setModal(null)}>{modal.kind === "image" ? <img src={modal.image} alt={modal.title} className="max-h-[70vh] w-full rounded-lg object-contain"/> : <p className="text-sm leading-7 text-text-secondary">{modal.body}</p>}{modal.kind === "cancel" ? <div className="mt-5"><HoldButton danger onComplete={() => { setModal(null); router.push("/my-trips?cancelled=1"); notify("Đã hủy yêu cầu thuê xe."); }}>Giữ để hủy đặt xe</HoldButton></div> : null}</Modal> : null}
 </div>;
}
