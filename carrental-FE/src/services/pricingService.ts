import type { PricingSegment } from "@/interfaces/pricing";

export const pricingSegments: readonly PricingSegment[] = [
  { id: "sedan", name: "Sedan đô thị", models: "Hyundai Accent, Toyota Vios, Mazda 3, Kia K3", seats: "4–5 chỗ", daily: 750000, range: "700.000–900.000 đ", image: "pricing-sedan.webp", imageAlt: "Hyundai Accent trắng" },
  { id: "suv", name: "Crossover & SUV", models: "Mazda CX-5, Hyundai Creta, Toyota Corolla Cross", seats: "5 chỗ", daily: 1050000, range: "950.000–1.200.000 đ", image: "cardb-73b166040535beb8.webp", imageAlt: "Mazda CX-5" },
  { id: "mpv", name: "7 chỗ gia đình", models: "Kia Carnival, Hyundai Santa Fe, Toyota Fortuner", seats: "7 chỗ", daily: 1350000, range: "1.000.000–1.800.000 đ", image: "cardb-82e98b75b37c32c9.webp", imageAlt: "Kia Carnival" },
  { id: "electric", name: "Xe điện VinFast", models: "VF 5, VF 6, VF 8 Plus, VF 9", seats: "5–7 chỗ", daily: 1250000, range: "750.000–1.400.000 đ", image: "cardb-e5cfa07014e754d6.webp", imageAlt: "VinFast VF 8 Plus" },
  { id: "luxury", name: "Hạng sang", models: "Mercedes-Benz GLC, BMW 5-Series, Porsche Macan", seats: "4–5 chỗ", daily: 2400000, range: "Từ 2.200.000 đ", image: "cardb-1ec43e930558b9f7.webp", imageAlt: "Mercedes GLC 300" },
];

const priceFormatter = new Intl.NumberFormat("vi-VN");
export const formatPrice = (amount: number) => `${priceFormatter.format(amount || 0)} đ`;
export const rentalDiscount = (days: number) => days >= 30 ? .25 : days >= 7 ? .1 : 0;
