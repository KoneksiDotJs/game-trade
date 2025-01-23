"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Card } from "@/components/admin/Card";
import { FaUsers, FaUserCheck, FaUserClock } from "react-icons/fa";
import api from "@/lib/api/client";
import toast from "react-hot-toast";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown) => React.ReactNode;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  isVerified: boolean;
  createdAt: string;
}

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function BanModal({ isOpen, onClose, onConfirm }: BanModalProps) {
  const [reason, setReason] = useState("");

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Ban User</h3>
        <textarea
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter ban reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error: unknown) {
      toast.error(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (user: User, reason?: string) => {
    try {
      const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
      await api.patch(`/users/${user.id}/status`, {
        status: newStatus,
        reason,
      });

      toast.success(`User ${newStatus.toLowerCase()} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(
        `Failed to update user status: ${
          error instanceof Error ? error.message : "An error occurred"
        }`
      );
    }
  };

  const columns: Column<User>[] = [
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    {
      key: "isVerified",
      label: "Status",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : value === "BANNED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, user: User) => (
        <button
          onClick={() => {
            if (user.status === "ACTIVE") {
              setSelectedUser(user);
              setIsBanModalOpen(true);
            } else {
              handleStatusChange(user);
            }
          }}
          className={`px-3 py-1 rounded text-sm ${
            user.status === "ACTIVE"
              ? "bg-red-100 text-red-800 hover:bg-red-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          {user.status === "ACTIVE" ? "Ban" : "Activate"}
        </button>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        User Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Users"
          value={users.length}
          icon={<FaUsers className="h-6 w-6 text-blue-500" />}
        />
        <Card
          title="Verified Users"
          value={users.filter((u) => u.isVerified).length}
          icon={<FaUserCheck className="h-6 w-6 text-green-500" />}
        />
        <Card
          title="Pending Verification"
          value={users.filter((u) => !u.isVerified).length}
          icon={<FaUserClock className="h-6 w-6 text-yellow-500" />}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable<User> columns={columns} data={filteredUsers} />
        <BanModal
          isOpen={isBanModalOpen}
          onClose={() => {
            setIsBanModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={(reason) => {
            if (selectedUser) {
              handleStatusChange(selectedUser, reason);
            }
            setIsBanModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </div>
    </div>
  );
}
