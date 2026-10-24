export function Filter({ id, label, value, onChange }) {
    return <button type="button" onClick={() => onChange(id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${value === id ? "bg-[#FC6C26] text-white" : "border border-[#E9E9E7] bg-white"}`}>{label}</button>;
}
