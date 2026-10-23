"use client";
import { useEffect, useState } from "react";

const LEVELS = [
    { label: "Yếu", color: "#DC2626" },
    { label: "Trung bình", color: "#D97706" },
    { label: "Khá", color: "#FC6C26" },
    { label: "Mạnh", color: "#15803D" },
];

function scorePassword(value) {
    if (!value)
        return 0;
    const longEnough = value.length >= 8;
    const hasLetter = /[A-Za-zÀ-ỹ]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasUpper = /[A-ZÀ-Ỹ]/.test(value);
    const hasSymbol = /[^A-Za-zÀ-ỹ0-9\s]/.test(value);
    if (!longEnough)
        return 1;
    if (!hasLetter || !hasDigit)
        return 2;
    if (value.length >= 12 && hasUpper && hasSymbol)
        return 4;
    return 3;
}

export function PasswordStrength({ inputId = "reg-password" }) {
    const [score, setScore] = useState(0);
    useEffect(() => {
        const input = document.getElementById(inputId);
        if (!input)
            return undefined;
        const update = () => setScore(scorePassword(input.value));
        update();
        input.addEventListener("input", update);
        return () => input.removeEventListener("input", update);
    }, [inputId]);
    const level = score > 0 ? LEVELS[score - 1] : null;
    return <div className="pt-0.5 space-y-1" aria-live="polite">
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map(index => <div key={index} className="h-1 flex-1 rounded-full transition-colors duration-200" style={{ backgroundColor: index < score ? level.color : "#E9E9E7" }}/>)}
    </div>
    <div className="flex items-center justify-between text-[11px]">
      <span className="font-semibold" style={{ color: level ? level.color : "#666666" }}>{level ? `Độ mạnh: ${level.label}` : "Độ mạnh"}</span>
      <span className="text-[#666666]">Tối thiểu 8 ký tự, gồm chữ & số</span>
    </div>
  </div>;
}
