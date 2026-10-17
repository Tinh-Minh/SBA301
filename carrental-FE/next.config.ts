import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Chỉ file *.next.tsx / *.next.ts trong src/app là file định tuyến của Next.
  // Nhờ vậy thư mục src/pages (theo cấu trúc môn học) chỉ chứa component màn hình,
  // không bị Next hiểu nhầm thành Pages Router.
  pageExtensions: ["next.tsx", "next.ts"],
};

export default nextConfig;
