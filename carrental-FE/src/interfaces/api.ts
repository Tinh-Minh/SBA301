/** Kiểu dữ liệu chung của mọi API backend (dto/response/ApiResponse, PageResponse). */

/** Ngày giờ dạng "yyyy-MM-ddTHH:mm:ss" (LocalDateTime phía backend, giờ Việt Nam). */
export type DateTimeString = string;

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
  errors: FieldError[];
  traceId: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Tham số phân trang gửi lên (?page=0&size=10&sortBy=createdAt&direction=desc). */
export interface PageParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}
