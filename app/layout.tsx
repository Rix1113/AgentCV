import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estonian Job Agent",
  description: "Generate tailored Estonian CVs, motivation letters, and statements from a CV and job ad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
