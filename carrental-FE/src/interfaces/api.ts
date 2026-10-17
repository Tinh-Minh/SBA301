/** Khung response chung của backend (ApiResponseDTO). */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/** Kết quả phân trang (PageResponseDTO). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Tham số phân trang/sắp xếp gửi lên API danh sách. */
export interface PageParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}
