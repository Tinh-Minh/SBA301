const windows1252 = new Map([
    [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85],
    [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A],
    [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92],
    [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C],
    [0x017E, 0x9E], [0x0178, 0x9F],
]);

export function repairUtf8Mojibake(value) {
    if (typeof value !== "string" || !value || !/[ÃÂÆÄÐ]|á»|áº/.test(value))
        return value;
    const bytes = [];
    for (const char of value) {
        const code = char.codePointAt(0);
        if (code <= 255)
            bytes.push(code);
        else if (windows1252.has(code))
            bytes.push(windows1252.get(code));
        else
            return value;
    }
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    } catch {
        return value;
    }
}

export function repairDisplayText(value) {
    if (typeof value === "string")
        return repairUtf8Mojibake(value);
    if (Array.isArray(value))
        return value.map(repairDisplayText);
    if (value && typeof value === "object") {
        const next = {};
        for (const [key, item] of Object.entries(value))
            next[key] = repairDisplayText(item);
        return next;
    }
    return value;
}

export function packageTitle(item) {
    if (item?.code === "PKG_VIP")
        return "Gói VIP";
    const name = item?.name ?? "";
    return name.replace(/\s*\([^)]*\)\s*$/, "").trim() || name;
}

export function repairPackageText(item) {
    if (!item || typeof item !== "object")
        return item;
    return {
        ...item,
        name: repairUtf8Mojibake(item.name),
        badgeLabel: repairUtf8Mojibake(item.badgeLabel),
        description: repairUtf8Mojibake(item.description),
    };
}
