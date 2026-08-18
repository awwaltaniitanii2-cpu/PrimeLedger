import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PrimeLedger | Private Capital OS",
    template: "%s | PrimeLedger",
  },
  description:
    "PrimeLedger is a private capital operating system for portfolio intelligence, early investments, live markets, and secure client access.",
  applicationName: "PrimeLedger",
  keywords: [
    "PrimeLedger",
    "Private Capital",
    "Investment Platform",
    "Portfolio Management",
    "Wealth Management",
    "Live Markets",
  ],
  authors: [{ name: "PrimeLedger" }],
  creator: "PrimeLedger",
  publisher: "PrimeLedger",
  openGraph: {
    title: "PrimeLedger | Private Capital OS",
    description:
      "A private capital operating system for portfolio intelligence, early investments, live markets, and secure client access.",
    url: "https://primeledger-production.up.railway.app",
    siteName: "PrimeLedger",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040509",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}