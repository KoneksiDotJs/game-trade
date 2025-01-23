"use client";

import { useAuthStore } from "@/lib/store/auth";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import toast from "react-hot-toast";

export function AdminHeader() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push(routes.admin.login);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <FaUserCircle className="h-8 w-8 text-gray-400" />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
          >
            <FaSignOutAlt className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
