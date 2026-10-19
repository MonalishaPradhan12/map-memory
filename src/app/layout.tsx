import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "India Map Memory",
  description: "Learn the states and union territories of India, one color at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e9e9ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={heading.variable}>
      <body>
        {children}
        <Analytics/>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}