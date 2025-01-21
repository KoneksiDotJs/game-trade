"use client";

// import { useAuthStore } from "@/lib/store/auth";
import { FaUserCircle } from "react-icons/fa";

export function AdminHeader() {

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="flex items-center">
          <FaUserCircle className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
