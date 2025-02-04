"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/admin/Card";
import { DataTable } from "@/components/admin/DataTable";
import { FaUsers, FaGamepad, FaShoppingCart } from "react-icons/fa";
import api from "@/lib/api/client";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  status: string;
  price: number;
  user: {
    id: number;
    username: string;
  };
  createdAt: string;
}

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row?: T) => React.ReactNode;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          api.get("/users"),
          api.get("/listings"),
        ]);
        setUsers(usersRes.data.data);
        setListings(listingsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userColumns: Column<User>[] = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "isVerified",
      label: "Status",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {Boolean(value) ? "Verified" : "Unverified"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
    },
  ];

  const listingColumns: Column<Listing>[] = [
    { key: "title", label: "Title" },
    {
      key: "user.username",
      label: "Seller",
      render: (_: unknown, row?: Listing) => row?.user?.username || "N/A",
    },
    {
      key: "price",
      label: "Price",
      render: (value: unknown) => `$${(value as number).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            (value as string) === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : (value as string) === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Listed",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Users"
          value={users.length}
          icon={<FaUsers className="h-6 w-6 text-blue-500" />}
        />
        <Card
          title="Active Listings"
          value={listings.filter((l) => l.status === "ACTIVE").length}
          icon={<FaGamepad className="h-6 w-6 text-green-500" />}
        />
        <Card
          title="Pending Reviews"
          value={listings.filter((l) => l.status === "PENDING").length}
          icon={<FaShoppingCart className="h-6 w-6 text-yellow-500" />}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          User Management
        </h2>
        <DataTable columns={userColumns} data={users} />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Listing Management
        </h2>
        <DataTable columns={listingColumns} data={listings} />
      </div>
    </div>
  );
}
