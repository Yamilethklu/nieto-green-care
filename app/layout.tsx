import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { SmsWidget } from "@/components/layout/SmsWidget";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Nieto Green Care | Central Texas Lawn Care", template: "%s | Nieto Green Care" },
  description: "Professional lawn care, landscaping, and property care in Central Texas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}<SmsWidget /></body>
    </html>
  );
}
