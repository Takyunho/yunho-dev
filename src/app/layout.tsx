import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "탁윤호 | 프론트엔드 개발자 포트폴리오",
  description:
    "React, Next.js, Three.js를 활용한 인터랙티브 3D 포트폴리오 사이트",
  keywords: ["프론트엔드", "개발자", "포트폴리오", "React", "Next.js", "Three.js"],
  authors: [{ name: "탁윤호" }],
  openGraph: {
    title: "탁윤호 | 프론트엔드 개발자 포트폴리오",
    description:
      "React, Next.js, Three.js를 활용한 인터랙티브 3D 포트폴리오 사이트",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
