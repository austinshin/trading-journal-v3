import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import AuthButton from "../components/AuthButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Personal trading journal and analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {/* Header with Auth */}
            <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
              <div className="container mx-auto px-6 py-4">
                <div className="flex justify-end">
                  <AuthButton />
                </div>
              </div>
            </div>
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
