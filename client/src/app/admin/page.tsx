"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/admin/Card";
import { DataTable } from "@/components/admin/DataTable";
import { FaUsers, FaGamepad, FaShoppingCart } from "react-icons/fa";
import api from "@/lib/api/client";
import { Chart } from "@/components/admin/Chart";

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

interface ListingStats {
  period: {
    stats: Array<{
      date: string;
      newListings: number;
      revenue: number | string;
    }>;
    comparison: {
      current: number;
      previous: number;
      percentage: number;
      trend: "up" | "down" | "stable";
    };
  };
  statusDistribution: Array<{
    status: string;
    count: {
      _all: number;
    };
    averagePrice: string;
  }>;
  priceStatistics: Array<{
    gameId: number;
    listingCount: number;
    averagePrice: string;
    minPrice: string;
    maxPrice: string;
  }>;
  popularGames: Array<{
    id: number;
    title: string;
    category: string;
    listingCount: number;
  }>;
}

interface TransactionStats {
  period: {
    stats: Array<{
      date: string;
      transactions: number;
      revenue: number;
    }>;
    comparison: {
      current: number;
      previous: number;
      percentage: number;
      trend: "up" | "down" | "stable";
    };
  };
}

interface UserStats {
  period: {
    stats: Array<{
      date: string;
      newUsers: number;
    }>;
    comparison: {
      current: number;
      previous: number;
      percentage: number;
      trend: "up" | "down" | "stable";
    };
  };
}

interface TimeRange {
  start: Date;
  end: Date;
  period: "daily" | "monthly" | "yearly";
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
  const [listingStats, setListingStats] = useState<ListingStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
    period: "daily",
  });
  const [transactionStats, setTransactionStats] =
    useState<TransactionStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        usersRes,
        listingsRes,
        listingStatsRes,
        transactionStatsRes,
        userStatsRes,
      ] = await Promise.all([
        api.get("/users"),
        api.get("/listings"),
        api.get("/listings/admin/stats", {
          params: {
            start: timeRange.start.toISOString(),
            end: timeRange.end.toISOString(),
            period: timeRange.period,
          },
        }),
        api.get("/transactions/admin/stats", {
          params: {
            start: timeRange.start.toISOString(),
            end: timeRange.end.toISOString(),
            period: timeRange.period,
          },
        }),
        api.get("/users/admin/stats", {
          params: {
            start: timeRange.start.toISOString(),
            end: timeRange.end.toISOString(),
            period: timeRange.period,
          },
        }),
      ]);
      setUsers(usersRes.data.data);
      setListings(listingsRes.data.data);
      setListingStats(listingStatsRes.data.data);
      setTransactionStats(transactionStatsRes.data.data);
      setUserStats(userStatsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const chartData = {
    listings:
      listingStats?.period.stats.map((stat) => ({
        name: stat.date,
        value: stat.newListings,
      })) || [],
    prices:
      listingStats?.period.stats.map((stat) => ({
        name: stat.date,
        value:
          typeof stat.revenue === "string"
            ? parseFloat(stat.revenue)
            : stat.revenue,
      })) || [],
  };
  const revenueData =
    transactionStats?.period.stats.map((stat) => ({
      name: stat.date,
      value: stat.revenue,
    })) || [];

  const userGrowthData =
    userStats?.period.stats.map((stat) => ({
      name: stat.date,
      value: stat.newUsers,
    })) || [];

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

      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <select
          value={timeRange.period}
          onChange={(e) =>
            setTimeRange((prev) => ({
              ...prev,
              period: e.target.value as TimeRange["period"],
            }))
          }
          className="rounded border p-2"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input
          type="date"
          value={timeRange.start.toISOString().split("T")[0]}
          onChange={(e) =>
            setTimeRange((prev) => ({
              ...prev,
              start: new Date(e.target.value),
            }))
          }
          className="rounded border p-2"
        />
        <span>to</span>
        <input
          type="date"
          value={timeRange.end.toISOString().split("T")[0]}
          onChange={(e) =>
            setTimeRange((prev) => ({
              ...prev,
              end: new Date(e.target.value),
            }))
          }
          className="rounded border p-2"
        />
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Apply
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <Chart title="Revenue" data={revenueData} format="currency" />
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Period</p>
              <p className="text-2xl font-bold">
                ${transactionStats?.period.comparison.current.toLocaleString()}
              </p>
            </div>
            <div
              className={`flex items-center ${
                transactionStats?.period.comparison.trend === "up"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              <span className="text-lg font-semibold">
                {transactionStats?.period.comparison.percentage.toFixed(1)}%
              </span>
              {transactionStats?.period.comparison.trend === "up" ? "↑" : "↓"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <Chart title="New Users" data={userGrowthData} />
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Period</p>
              <p className="text-2xl font-bold">
                {userStats?.period.comparison.current.toLocaleString()}
              </p>
            </div>
            <div
              className={`flex items-center ${
                userStats?.period.comparison.trend === "up"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              <span className="text-lg font-semibold">
                {userStats?.period.comparison.percentage.toFixed(1)}%
              </span>
              {userStats?.period.comparison.trend === "up" ? "↑" : "↓"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart title="Daily New Listings" data={chartData.listings} />
        <Chart
          title="Average Price Trend"
          data={chartData.prices}
          format="currency"
        />
      </div>

      {/* Status Distribution */}
      <div className="space-y-4">
        {listingStats?.statusDistribution.map((stat) => (
          <div key={stat.status} className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              {stat.status}
            </span>
            <div className="text-right">
              <span className="font-semibold">{stat.count._all} listings</span>
              <span className="text-sm text-gray-500 ml-2">
                (avg. ${parseFloat(stat.averagePrice).toFixed(2)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Games */}
      <div className="space-y-4">
        {listingStats?.popularGames.map((game) => (
          <div key={game.id} className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-300">
                {game.title}
              </span>
              <span className="text-sm text-gray-500">{game.category}</span>
            </div>
            <span className="font-semibold">{game.listingCount} listings</span>
          </div>
        ))}
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
