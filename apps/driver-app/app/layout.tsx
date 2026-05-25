import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cab Driver",
  description: "Driver ride requests and live GPS streaming",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* React uses camelCase for HTML attributes, so we use httpEquiv */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' http: https: ws: wss:;" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
