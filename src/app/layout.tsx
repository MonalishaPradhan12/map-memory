
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import TitleBlink from "@/components/TitleBlink";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
console.log("adsese",adsenseId)
export const metadata: Metadata = {
  title: "World Map Memory",
  description:
    "Learn the countries and capitals of the world, one color at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3fb" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem("theme");
    var isDark = theme
      ? theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.className}
      suppressHydrationWarning
    >
      <head>
        {/* Initialize theme before hydration */}
        <Script
          id="theme-initialization"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />

        {/* Google AdSense */}
        {adsenseId && (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>

      <body>
        {children}
        <TitleBlink />
        <Analytics />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
