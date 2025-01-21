"use client";

import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { HeroSection } from "@/components/common/HeroSection";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <HeroSection />
      <div className="flex">
        <main className="flex-1 p-4">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
