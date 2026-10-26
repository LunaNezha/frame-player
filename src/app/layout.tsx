import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const montserrat = localFont({
  src: "../assets/fonts/Montserrat/Montserrat-Regular.ttf",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "FRAME | React & Next.js Custom Video Player",
    template: "%s | FRAME Video Player",
  },
  description:
    "A customizable React and Next.js video player with MP4, WebM, and HLS playback, glass controls, keyboard shortcuts, and TypeScript-powered theming.",
  applicationName: "FRAME Video Player",
  keywords: [
    "React video player",
    "Next.js",
    "custom video player",
    "HLS",
    "TypeScript",
    "Tailwind CSS",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "FRAME | React & Next.js Custom Video Player",
    description:
      "Native playback. Custom controls. A reusable, typed video player for the modern web.",
    siteName: "FRAME Video Player",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "FRAME | React & Next.js Custom Video Player",
    description:
      "Customizable MP4, WebM, and HLS playback for React and Next.js.",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
