import type { NextConfig } from "next";

/**
 * Header keamanan untuk semua halaman:
 * - portal tidak boleh dimuat di dalam iframe situs lain (anti-clickjacking)
 * - browser tidak menebak tipe file (anti MIME-sniffing)
 * - URL verifikasi / token tidak bocor lengkap lewat header Referer
 * - kamera, mikrofon, dan lokasi tidak dipakai aplikasi ini
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
