import type { ReactNode } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/** Bọc một màn hình trong Route để đặt tiêu đề trang. */
export function RoutePage({ title, children }: { title?: string; children: ReactNode }) {
  useDocumentTitle(title);
  return <>{children}</>;
}
