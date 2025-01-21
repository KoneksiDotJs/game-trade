"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for auth state to be initialized
    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    const checkAuth = () => {
      if (!token) {
        router.push("/");
      } else if (adminOnly && user?.role !== "ADMIN") {
        router.push("/403");
      }
    };

    checkAuth();
  }, [token, user, adminOnly, router, isInitialized]);

  if (!isInitialized || !token || (adminOnly && user?.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
