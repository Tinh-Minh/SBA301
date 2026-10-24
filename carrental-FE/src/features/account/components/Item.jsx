

export const driverStatus = { PENDING: "Chờ duyệt", ACTIVE: "Đang hoạt động", SUSPENDED: "Tạm ngưng" };
export const reasons = {
    ACCOUNT_NOT_ACTIVE: "Tài khoản đang bị khóa.",
    DRIVER_PROFILE_MISSING: "Bạn chưa đăng ký hồ sơ tài xế.",
    DRIVER_NOT_ACTIVE: "Hồ sơ tài xế chưa được duyệt hoặc đang tạm ngưng.",
    IDENTITY_NOT_VERIFIED: "Cần xác minh danh tính (KYC) trước.",
    VALID_DRIVER_LICENSE_REQUIRED: "Cần giấy phép lái xe còn hạn đã được duyệt.",
};

export function Item({ term, value }) {
    return <div className="rounded-xl bg-[#F7F7F5] p-3"><dt className="text-[11px] uppercase text-[#666666]">{term}</dt><dd className="font-semibold">{value || "—"}</dd></div>;
}
