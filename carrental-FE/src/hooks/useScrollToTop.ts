import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Cuộn lên đầu trang mỗi khi đổi đường dẫn (giữ nguyên khi chỉ đổi #hash). */
export function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
