const backendUrl = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");

/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
  async redirects() {
    const routes = [
      ["/kham-pha-xe", "/explore"],
      ["/chuyen-xe-cua-toi", "/my-trips"],
      ["/dang-nhap", "/login"],
      ["/dang-ky", "/register"],
      ["/tai-khoan/xac-minh/thu-gon", "/account/verification/compact"],
      ["/tai-khoan/ngan-hang/mac-dinh", "/account/bank/default"],
      ["/tai-khoan/ngan-hang/them", "/account/bank/add"],
      ["/tai-khoan/ho-so-tai-xe", "/account/driver"],
      ["/tai-khoan/xac-minh", "/account/verification"],
      ["/tai-khoan/ngan-hang", "/account/bank"],
      ["/tai-khoan/don-thue", "/account/orders"],
      ["/tai-khoan/lich-su", "/account/history"],
      ["/tai-khoan", "/account"],
      ["/dat-xe/xac-nhan", "/booking/confirm"],
      ["/dat-xe/thanh-cong", "/booking/success"],
      ["/thanh-toan/thanh-cong", "/payment/success"],
      ["/thanh-toan/that-bai", "/payment/failed"],
      ["/thanh-toan", "/payment"],
      ["/ban-giao/nhan-xe", "/handover/pickup"],
      ["/ban-giao/tra-xe", "/handover/return"],
      ["/danh-gia", "/reviews"],
      ["/tranh-chap", "/disputes"],
      ["/cach-tinh-gia", "/pricing"],
      ["/quen-mat-khau", "/forgot-password"],
      ["/cho-thue-xe", "/list-your-car"],
      ["/lien-he", "/contact"],
      ["/tin-tuc-huong-dan", "/guides"],
      ["/cau-hoi-thuong-gap", "/faq"],
      ["/thue-xe-dai-han", "/long-term"],
      ["/chinh-sach-bao-hiem", "/insurance"],
      ["/quy-dinh-dat-coc", "/deposit-policy"],
      ["/chinh-sach-huy-chuyen", "/cancellation-policy"],
      ["/chinh-sach-bao-mat", "/privacy"],
      ["/dieu-khoan-su-dung", "/terms"],
      ["/hop-dong-mau", "/sample-contract"],
      ["/mau-thiet-ke/ngan-hang", "/design/banks"],
      ["/thanh-phan/dieu-huong", "/components/navigation"],
      ["/xe/:path*", "/cars/:path*"],
      ["/don-thue/:id/da-xac-nhan", "/orders/:id/confirmed"],
      ["/don-thue/:path*", "/orders/:path*"],
    ];
    return routes.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};

export default nextConfig;
