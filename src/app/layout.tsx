import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutriScan AI | Your Personal Nutrition Guide",
  description: "Scan barcodes, analyze ingredients, and get personalized diet plans.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <main style={{ paddingBottom: '80px' }}>
            {children}
          </main>
          <Navbar />
        </UserProvider>
      </body>
    </html>
  );
}
