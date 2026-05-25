import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Pastikan file globals.css Anda ada

const inter = Inter({ subsets: ["latin"] });

// Konfigurasi Title dan Meta Description Web Anda
export const metadata: Metadata = {
  title: "Billy Adrian Fernanda | Creative Technologist",
  description: "Portofolio Billy Adrian Fernanda. Menggabungkan keahlian Graphic Design, Video Editing, dengan pengembangan Web Modern dan riset Machine Learning.",
  keywords: ["Billy Adrian Fernanda", "Portfolio", "Creative Technologist", "Next.js", "Graphic Design", "Machine Learning", "Universitas Majalengka"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}