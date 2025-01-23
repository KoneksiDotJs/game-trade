"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginDialog } from "../auth/LoginDialog";
import api from "@/lib/api/client";
import { RegisterDialog } from "../auth/RegisterDialog";
import Image from "next/image";

export function Header() {
  const { token, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ avatarUrl?: string } | null>(
    null
  );
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
      console.log("Login response:", response.data);

      if (data) {
        setAuth(data.token, data.user);
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
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await api.get("/users/profile");
          setUserProfile(response.data.data);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      }
    };
    fetchProfile();
  }, [token]);

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
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all"
                >
                  <Image
                    src={userProfile?.avatarUrl || "/images/default-avatar.png"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/users/profile"
                      className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/transactions"
                      className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Transactions
                    </Link>
                    <Link
                      href="/messages"
                      className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Messages
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaSignOutAlt className="inline mr-2" /> Logout
                    </button>
                  </div>
                )}
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
