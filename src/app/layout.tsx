import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aha Therapy – AI Projective Testing System",
  description:
    "AI-powered projective psychological test administration, scoring, interpretation and reporting (Rorschach, TAT, SCT, DAP/HTP).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-serif bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
