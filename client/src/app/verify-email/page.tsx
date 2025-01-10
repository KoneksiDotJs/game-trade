"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api/client";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get("/auth/verify-email", { params: { token } });
        setStatus("success");
        toast.success("Email verified successfully!");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
        toast.error("Verification failed. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        {status === "loading" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Verifying your email...
            </h2>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The verification link is invalid or has expired.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
