import "@/styles/globals.css";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { HeroSection } from "@/components/common/HeroSection";
import ErrorBoundary from "@/components/error/ErrorBoundary";

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
    <ErrorBoundary>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            <div className="min-h-screen bg-white dark:bg-gray-900">
              <Header />
              <HeroSection />
              <div className="flex">
                <main className="flex-1 p-4">{children}</main>
              </div>
              <Footer />
              <Toaster position="top-right" />
            </div>
          </Providers>
        </body>
      </html>
    </ErrorBoundary>
  );
}
