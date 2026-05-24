import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cab Driver",
  description: "Driver ride requests and live GPS streaming"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
