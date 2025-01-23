"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";

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
    console.log("Auth Check:", { token, user, adminOnly }); // Debug log

    const checkAuth = () => {
      if (!token) {
        router.push(routes.admin.login);
        return;
      } else if (adminOnly && user?.role !== "ADMIN") {
        router.push(routes.admin.login);
        return;
      }
    };

    checkAuth();
  }, [token, user, adminOnly, router, isInitialized]);

  // Show loading only during initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Once initialized, only show children if authenticated
  if (token && (!adminOnly || user?.role === "ADMIN")) {
    return <>{children}</>;
  }

  return null;
}
