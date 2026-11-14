import { PASSWORD_RULES } from "@/utils/passwordStrength.js";

const SEGMENT_COLOR = { 1: "bg-red-500", 2: "bg-amber-500", 3: "bg-emerald-600" };
const LABEL_COLOR = { 1: "text-red-600", 2: "text-amber-600", 3: "text-emerald-700" };

/** Thanh 3 đoạn (Yếu / Khá / Mạnh) và danh sách yêu cầu đặt ngay dưới ô mật khẩu. */
export function PasswordStrengthMeter({ strength }) {
    const typed = Boolean(strength?.password);
    const active = typed ? strength.score : 0;
    const color = SEGMENT_COLOR[active] ?? "bg-[#E9E9E7]";

    return <div id="reg-password-strength" className="space-y-1.5 pt-1" aria-live="polite">
        <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map(index => <div key={index} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${index < active ? color : "bg-[#E9E9E7]"}`}/>)}
        </div>
        <p className="text-[11px]">
            <span className="text-[#666666]">Độ mạnh: </span>
            <span className={`font-semibold ${typed ? LABEL_COLOR[active] : "text-[#666666]"}`}>{typed ? strength.label : "—"}</span>
        </p>
        <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 text-[11px] leading-snug sm:grid-cols-2">
            {PASSWORD_RULES.map(rule => {
                const ok = typed && strength.checks?.[rule.id];
                return <li key={rule.id} className={`flex items-center gap-1.5 ${ok ? "text-emerald-700" : "text-[#666666]"}`}>
                    <span aria-hidden="true" className="w-3 text-center font-bold">{ok ? "✓" : "•"}</span>
                    <span>{rule.label}</span>
                    <span className="sr-only">{ok ? "(đã đạt)" : "(chưa đạt)"}</span>
                </li>;
            })}
        </ul>
        {strength?.warning ? <p className="text-[11px] leading-snug text-red-600">{strength.warning}</p> : null}
    </div>;
}
