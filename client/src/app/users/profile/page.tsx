"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api/client";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { AccountSettings } from "@/components/profile/AccountSettings";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/lib/store/auth";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "settings"
  >("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data.data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load profile";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Profile Settings
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "profile"
                      ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "security"
                      ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "settings"
                      ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "profile" && profile && (
                <ProfileForm
                  profile={{
                    username: profile.username,
                    email: profile.email,
                    avatarUrl: profile.avatarUrl,
                  }}
                  setProfile={(updatedProfile) =>
                    setProfile({ ...profile, ...updatedProfile })
                  }
                />
              )}
              {activeTab === "security" && <ChangePasswordForm />}
              {activeTab === "settings" && <AccountSettings />}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
