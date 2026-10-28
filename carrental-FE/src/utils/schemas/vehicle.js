import { z } from "zod";
import { httpUrlInput, integerInput, optionalHttpUrlInput, requiredText, vndInput } from "@/utils/validateInput.js";

export const vehiclePricingSchema = z.object({
    pricePerDay: vndInput({ positive: true }),
    depositAmount: vndInput(),
    kmLimitPerDay: vndInput({ positive: true }),
    extraKmFee: vndInput(),
});

export const vehicleCreateSchema = vehiclePricingSchema.extend({
    brand: requiredText("Vui lòng nhập hãng xe."),
    model: requiredText("Vui lòng nhập dòng xe."),
    city: requiredText("Vui lòng chọn thành phố."),
    manufactureYear: integerInput(1990, 2100),
    licensePlate: z.string().trim().min(4, "Biển số cần ít nhất 4 ký tự."),
    pickupAddress: requiredText("Chưa nhập địa chỉ bãi xe."),
    carType: requiredText("Vui lòng chọn loại xe."),
    seats: integerInput(1, 60),
    transmission: requiredText("Vui lòng chọn hộp số."),
    fuelType: requiredText("Vui lòng chọn nhiên liệu."),
    weekendPrice: vndInput({ positive: true }),
    registrationUrl: optionalHttpUrlInput,
    inspectionUrl: optionalHttpUrlInput,
    photos: z.record(z.string(), z.object({ url: httpUrlInput })),
    agreed: z.literal(true, { error: "Vui lòng xác nhận thông tin đăng ký xe." }),
});

export const vehicleStepFields = [
    ["brand", "model", "city", "manufactureYear", "licensePlate", "pickupAddress", "carType", "registrationUrl", "inspectionUrl"],
    ["seats", "transmission", "fuelType"],
    ["pricePerDay", "weekendPrice", "depositAmount", "kmLimitPerDay", "extraKmFee"],
    ["photos", "agreed"],
];

export const vehicleStepSchemas = vehicleStepFields.map(fields =>
    vehicleCreateSchema.pick(Object.fromEntries(fields.map(field => [field, true]))));
