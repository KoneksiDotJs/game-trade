"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  if (!token) return null;

  return <>{children}</>;
}
