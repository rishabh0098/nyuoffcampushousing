import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Geist } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "NYU Off-Campus Housing",
  description: "NYU-only showcase for off-campus housing listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
      // The inline script below adds/removes the `dark` class before React
      // hydrates (to avoid a flash of the wrong theme), so the class list
      // React sees on the client intentionally differs from what the server
      // rendered. This is the documented fix for that expected mismatch.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-surface text-ink">
        {/* Runs before paint to avoid a flash of the wrong theme (ThemeToggle
            reads this same localStorage key once mounted). `next/script` with
            beforeInteractive scripts are always hoisted into <head> by
            Next.js itself — they must NOT be manually wrapped in a <head>
            tag here, which is what caused the "script tag" console error. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
        <div className="flex min-h-screen flex-col">
          {children}
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
