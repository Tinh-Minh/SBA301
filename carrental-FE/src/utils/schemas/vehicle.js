import { z } from "zod";
import { httpUrlInput, integerInput, optionalHttpUrlInput, optionalIntegerInput, optionalVndInput, requiredText, vndInput } from "@/utils/validateInput.js";

const CURRENT_YEAR = new Date().getFullYear();

export const vehiclePricingSchema = z.object({
    pricePerDay: vndInput({ positive: true, min: 10_000, max: 100_000_000, label: "Đơn giá ngày" }),
    depositAmount: vndInput({ min: 0, max: 500_000_000, label: "Tiền cọc" }),
    kmLimitPerDay: integerInput(10, 5_000, "Giới hạn km/ngày"),
    extraKmFee: vndInput({ min: 0, max: 1_000_000, label: "Phí quá km" }),
});

export const vehicleCreateSchema = vehiclePricingSchema.extend({
    brand: requiredText("Vui lòng nhập hãng xe.").max(50, "Hãng xe tối đa 50 ký tự."),
    model: requiredText("Vui lòng nhập dòng xe.").max(50, "Dòng xe tối đa 50 ký tự."),
    city: requiredText("Vui lòng chọn thành phố.").max(100, "Tên thành phố tối đa 100 ký tự."),
    manufactureYear: integerInput(1990, CURRENT_YEAR + 1, "Năm sản xuất"),
    licensePlate: z.string().trim()
        .min(4, "Biển số cần ít nhất 4 ký tự.")
        .max(20, "Biển số tối đa 20 ký tự.")
        .regex(/^[0-9A-Za-z.\-\s]+$/, "Biển số chỉ gồm chữ cái, số, dấu '-' hoặc '.'."),
    pickupAddress: requiredText("Chưa nhập địa chỉ bãi xe.").max(300, "Địa chỉ tối đa 300 ký tự."),
    carType: requiredText("Vui lòng chọn loại xe."),
    seats: integerInput(2, 60, "Số chỗ ngồi"),
    transmission: requiredText("Vui lòng chọn hộp số."),
    fuelType: requiredText("Vui lòng chọn nhiên liệu."),
    rangeKm: optionalIntegerInput(10, 5_000, "Tầm vận hành"),
    weekendPrice: vndInput({ positive: true, min: 10_000, max: 100_000_000, label: "Đơn giá cuối tuần" }),
    lateFee: optionalVndInput({ max: 10_000_000, label: "Phí trễ giờ" }),
    registrationUrl: optionalHttpUrlInput,
    inspectionUrl: optionalHttpUrlInput,
    photos: z.record(z.string(), z.object({ url: httpUrlInput })),
    agreed: z.literal(true, { error: "Vui lòng xác nhận thông tin đăng ký xe." }),
});

export const vehicleStepFields = [
    ["brand", "model", "city", "manufactureYear", "licensePlate", "pickupAddress", "carType", "registrationUrl", "inspectionUrl"],
    ["seats", "transmission", "fuelType", "rangeKm"],
    ["pricePerDay", "weekendPrice", "depositAmount", "kmLimitPerDay", "extraKmFee", "lateFee"],
    ["photos", "agreed"],
];

export const vehicleStepSchemas = vehicleStepFields.map(fields =>
    vehicleCreateSchema.pick(Object.fromEntries(fields.map(field => [field, true]))));
