import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cab Customer",
  description: "Customer ride booking and live tracking"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Added standard antialiased layout body flags for crisp Tailwind rendering */}
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}