import { useEffect } from "react";

const SITE_NAME = "CarDB";
const DEFAULT_TITLE = "CarDB — Đồng hành mọi chuyến đi";

/** Đặt tiêu đề tab trình duyệt theo dạng "<tiêu đề> | CarDB". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  }, [title]);
}
