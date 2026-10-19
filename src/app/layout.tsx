import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "India Map Memory",
  description: "Learn the states and union territories of India, one color at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
