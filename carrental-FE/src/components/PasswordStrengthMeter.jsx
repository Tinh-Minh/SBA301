const SEGMENT_COLOR = {
    1: "bg-red-500",
    2: "bg-amber-500",
    3: "bg-blue-500",
    4: "bg-[#FC6C26]",
};

const LABEL_COLOR = {
    0: "text-red-500",
    1: "text-red-500",
    2: "text-amber-500",
    3: "text-blue-500",
    4: "text-[#FC6C26]",
};

/** Thanh 4 đoạn đặt ngay dưới ô mật khẩu. */
export function PasswordStrengthMeter({ strength }) {
    const score = strength?.score ?? 0;
    const active = strength?.password ? score : 0;
    const color = SEGMENT_COLOR[active] ?? "bg-[#E9E9E7]";
    const label = strength?.password ? strength.label : "Độ mạnh";

    return <div id="reg-password-strength" className="space-y-1.5 pt-1" aria-live="polite">
        <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map(index => <div key={index} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${index < active ? color : "bg-[#E9E9E7]"}`}/>)}
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className={`font-semibold ${strength?.password ? LABEL_COLOR[active] : "text-[#666666]"}`}>{label}</span>
            <span className="text-[#666666]">Tối thiểu 8 ký tự</span>
        </div>
        {strength?.warning ? <p className="text-[11px] leading-snug text-red-500">{strength.warning}</p> : null}
        {strength?.suggestions?.length ? <ul className="space-y-0.5 text-[11px] leading-snug text-[#666666]">
            {strength.suggestions.map(suggestion => <li key={suggestion}>{suggestion}</li>)}
        </ul> : null}
    </div>;
}
