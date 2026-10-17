import type { ComponentType } from "react";

/** Đường dẫn (không có dấu "/" đầu) -> màn hình hiển thị. */
export type ScreenRegistry = Record<string, ComponentType>;

/** Đường dẫn -> tiêu đề trang. */
export type PageTitleMap = Record<string, string>;
