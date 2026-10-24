import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Icon } from "@/shared/components/Icon.jsx";

function activate(button) {
    button.parentElement?.querySelectorAll(":scope > button").forEach(item => {
        item.dataset.active = String(item === button);
        item.setAttribute("aria-pressed", String(item === button));
    });
}

function filterCars(root, category) {
    root?.querySelectorAll("[data-vehicle-card]").forEach(card => {
        card.dataset.filterHidden = String(category !== "all" && card.dataset.vehicleCard !== category);
    });
}

function ImagePreview({ image, close }) {
    const dialog = useRef(null);
    useEffect(() => { dialog.current?.showModal(); }, []);
    return <dialog ref={dialog} onCancel={close} onClick={event => {
        if (event.currentTarget === event.target) close();
    }} aria-label={image.alt || "Hình ảnh xe"} className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-border-light bg-white p-5 shadow-2xl backdrop:bg-black/60">
        <button type="button" aria-label="Đóng hộp thoại" onClick={close} className="mb-4 flex size-8 items-center justify-center rounded-full bg-section-bg"><Icon name="close" /></button>
        <img src={image.src} alt={image.alt || "Hình ảnh xe"} className="max-h-[70vh] w-full rounded-lg object-contain" />
    </dialog>;
}

// Delegated visual controls for marketing markup. Data forms own their actions.
export function Interactions({ children }) {
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const root = useRef(null);
    const toastTimer = useRef(null);
    const [toast, setToast] = useState("");
    const [image, setImage] = useState(null);
    useEffect(() => () => clearTimeout(toastTimer.current), []);
    useEffect(() => { setImage(null); }, [path]);

    function notify(message) {
        clearTimeout(toastTimer.current);
        setToast(message);
        toastTimer.current = setTimeout(() => setToast(""), 4000);
    }

    function click(event) {
        const target = event.target;
        if (target.closest("[data-native]")) return;
        const button = target.closest("button,a,[data-action]");
        if (!button) {
            if (target.tagName === "IMG" && target.closest("main")) {
                setImage({ src: target.src, alt: target.alt });
            }
            return;
        }
        if (button.dataset.route) {
            navigate(button.dataset.route);
            return;
        }
        const action = button.dataset.action;
        if (action === "receipt" || button.dataset.handler === "window.print") {
            window.print();
        } else if (action === "default-bank") {
            navigate("/account/bank");
        } else if (action === "search") {
            const section = button.closest("section") ?? root.current;
            const fields = section?.querySelectorAll('input[type="text"]');
            const params = new URLSearchParams({
                location: section?.querySelector("select")?.value ?? "TP. Hồ Chí Minh",
                start: fields?.[0]?.value ?? "",
                end: fields?.[1]?.value ?? "",
            });
            navigate("/explore?" + params);
        } else if (action === "rental-mode") {
            activate(button);
        } else if (action === "filter") {
            const text = button.getAttribute("aria-label") || button.textContent || "";
            const category = /điện|EV|Điện/.test(text) ? "ev" : /SUV|Gầm cao/.test(text) ? "suv" : /Sedan|sang/.test(text) ? "luxury" : "all";
            filterCars(root.current, category);
            activate(button);
        } else if (action === "favorite") {
            const saved = button.dataset.favorite !== "true";
            button.dataset.favorite = String(saved);
            button.setAttribute("aria-pressed", String(saved));
            notify(saved ? "Đã lưu xe yêu thích." : "Đã bỏ lưu xe.");
        }
    }

    return <div ref={root} onClick={click}>
        {children}
        {toast ? <div role="status" className="toast fixed inset-x-4 bottom-5 z-[150] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-border-light bg-text-primary px-5 py-4 text-sm text-white shadow-xl">
            <Icon name="check_circle" className="text-brand-accent" />{toast}
            <button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")}><Icon name="close" /></button>
        </div> : null}
        {image ? <ImagePreview image={image} close={() => setImage(null)} /> : null}
    </div>;
}
