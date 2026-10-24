"use client";
import { forwardRef, useEffect, useState } from "react";
import { formatInputDate, formatInputDateTime, parseInputDate, parseInputDateTime } from "@/utils/datetime.js";

const dateMessage = "Nhập theo ngày/tháng/năm, ví dụ 07/06/2004";
const dateTimeMessage = "Nhập theo ngày/tháng/năm giờ:phút, ví dụ 07/06/2004 08:30";

function maskDate(raw) {
    const typed = String(raw).trim();
    const iso = typed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso)
        return `${iso[3]}/${iso[2]}/${iso[1]}`;
    const loose = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (loose)
        return `${loose[1].padStart(2, "0")}/${loose[2].padStart(2, "0")}/${loose[3]}`;
    const digits = typed.replace(/\D/g, "").slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

function maskDateTime(raw) {
    const typed = String(raw).trim();
    const iso = typed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (iso)
        return `${iso[3]}/${iso[2]}/${iso[1]} ${iso[4]}:${iso[5]}`;
    const loose = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})$/);
    if (loose)
        return `${loose[1].padStart(2, "0")}/${loose[2].padStart(2, "0")}/${loose[3]} ${loose[4].padStart(2, "0")}:${loose[5]}`;
    const digits = typed.replace(/\D/g, "").slice(0, 12);
    let text = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
    if (digits.length > 8)
        text += ` ${digits.slice(8, 10)}`;
    if (digits.length > 10)
        text += `:${digits.slice(10, 12)}`;
    return text;
}

const CalendarInput = forwardRef(function CalendarInput({ value, onChange, className, required, id, name, withTime = false }, ref) {
    const format = withTime ? formatInputDateTime : formatInputDate;
    const parse = withTime ? parseInputDateTime : parseInputDate;
    const mask = withTime ? maskDateTime : maskDate;
    const message = withTime ? dateTimeMessage : dateMessage;
    const [text, setText] = useState(() => format(value));
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        if (focused)
            return;
        setText(current => !value && current.trim() ? current : format(value));
    }, [value, focused, format]);
    function commit(raw, input) {
        const next = mask(raw);
        setText(next);
        const iso = parse(next);
        if (!next) {
            input.setCustomValidity("");
            onChange({ target: { value: "" } });
            return;
        }
        if (iso) {
            input.setCustomValidity("");
            onChange({ target: { value: iso } });
            return;
        }
        input.setCustomValidity(message);
        onChange({ target: { value: "" } });
    }
    return <input ref={ref} id={id} name={name} required={required} type="text" inputMode="numeric" autoComplete="bday" placeholder={withTime ? "dd/mm/yyyy hh:mm" : "dd/mm/yyyy"} title={message} value={text} onFocus={() => setFocused(true)} onBlur={event => { setFocused(false); if (!parse(text) && text.trim())
        event.target.reportValidity(); }} onChange={event => commit(event.target.value, event.target)} className={className}/>;
});

export const DateField = forwardRef(function DateField(props, ref) {
    return <CalendarInput {...props} ref={ref}/>;
});

export const DateTimeField = forwardRef(function DateTimeField(props, ref) {
    return <CalendarInput {...props} withTime ref={ref}/>;
});
