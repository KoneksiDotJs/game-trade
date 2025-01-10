"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginDialog } from "../auth/LoginDialog";
import api from "@/lib/api/client";
import { RegisterDialog } from "../auth/RegisterDialog";

export function Header() {
  const { token, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };
  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleRegister = async (values: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      await api.post("/auth/register", values);
      toast.success(
        "Registration successful! Please check your email for verification."
      );
      setIsRegisterOpen(false);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { data } = response.data;
      // console.log("Login response:", response.data);

      if (data.token) {
        setAuth(data.token);
        toast.success("Login successful!");
        setIsLoginOpen(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          GameTrade
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FaSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FaMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          {token ? (
            <>
              <Link href="/listings/create" className="btn btn-primary">
                Create Listing
              </Link>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <FaUser />
                </label>
                <ul className="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link href="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link href="/transactions">Transactions</Link>
                  </li>
                  <li>
                    <Link href="/messages">Messages</Link>
                  </li>
                  <li>
                    <button onClick={logout} className="text-red-500">
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Login
              </button>

              <LoginDialog
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSubmit={handleLogin}
                onSwitchToRegister={handleSwitchToRegister}
              />
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Register
              </button>

              <RegisterDialog
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSubmit={handleRegister}
                onSwitchToLogin={handleSwitchToLogin}
              />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
