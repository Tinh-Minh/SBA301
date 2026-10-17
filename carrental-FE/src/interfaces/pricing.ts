/** Một phân khúc xe trong bảng giá tham khảo. */
export interface PricingSegment {
  id: string;
  name: string;
  models: string;
  seats: string;
  /** Giá tự lái mỗi ngày (VND). */
  daily: number;
  range: string;
  image: string;
  imageAlt: string;
}
