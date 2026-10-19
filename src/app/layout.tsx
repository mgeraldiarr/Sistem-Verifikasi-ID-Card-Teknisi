import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MODENA | Sistem Verifikasi ID Card",
  description: "Portal HR MODENA untuk verifikasi kartu identitas karyawan",
  icons: {
    icon: "/logo-modena.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1C1C1A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={plexSans.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
