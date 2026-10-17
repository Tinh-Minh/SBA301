import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { InformationPage } from "@/components/InformationPage";
import { Interactions } from "@/components/Interactions";
import { ReferenceFooter } from "@/components/ReferenceFooter";
import { RoutePage } from "@/components/RoutePage";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { screens } from "@/pages";
import NotFound from "@/pages/NotFound";
import { pageRedirects, pageTitles } from "@/services/pageService";

/** Bố cục chung + khai báo toàn bộ đường dẫn của ứng dụng. */
export default function App() {
  useScrollToTop();

  return (
    <>
      <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
      <AuthProvider>
        <Header />
        <Interactions>
          <div id="noi-dung">
            <Suspense fallback={<main className="min-h-[75vh]" aria-busy="true" />}>
            <Routes>
              {Object.entries(pageRedirects).map(([from, to]) => (
                <Route key={from} path={`/${from}`} element={<Navigate to={to} replace />} />
              ))}
              {Object.entries(screens).map(([path, Screen]) => (
                <Route key={path} path={`/${path}`} element={<RoutePage title={pageTitles[path]}><Screen /></RoutePage>} />
              ))}
              {Object.entries(pageTitles).filter(([path]) => !screens[path]).map(([path, title]) => (
                <Route key={path} path={`/${path}`} element={<RoutePage title={title}><InformationPage slug={path} title={title} /></RoutePage>} />
              ))}
              <Route path="*" element={<RoutePage title="Không tìm thấy trang"><NotFound /></RoutePage>} />
            </Routes>
            </Suspense>
          </div>
          <ReferenceFooter />
        </Interactions>
      </AuthProvider>
    </>
  );
}
