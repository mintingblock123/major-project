// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-700">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
