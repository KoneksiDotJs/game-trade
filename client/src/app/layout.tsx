import "@/styles/globals.css";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GameTrade",
  description: "Game trading platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-4">{children}</main>
            </div>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
