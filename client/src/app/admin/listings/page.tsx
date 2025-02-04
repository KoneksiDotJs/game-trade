"use client"

import { Card } from "@/components/admin/Card";
import { DataTable } from "@/components/admin/DataTable";
import api from "@/lib/api/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaList, FaTrash } from "react-icons/fa";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row?: T) => React.ReactNode;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  status: "ACTIVE" | "PENDING";
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
  game: {
    id: number;
    title: string;
  };
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  listing?: Listing;
}

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  listing,
}: DeleteModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <FaTrash className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Delete Listing</h3>
        </div>

        <p className="mb-4">
          Are you sure you want to delete listing &quot;{listing.title}&quot;? This action
          cannot be undone.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            try {
              await onConfirm(reason);
              onClose();
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter reason for deletion (violation of community guidelines)..."
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await api.get("/listings");
      setListings(response.data.data);
    } catch {
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason: string) => {
    if (!selectedListing) return;
    try {
      await api.delete(`/listings/${selectedListing.id}`, {
        data: { reason },
      });
      toast.success("Listing deleted successfully");
      fetchListings();
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const columns: Column<Listing>[] = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "user",
      label: "Seller",
      render: (value) => {
        const user = value as Listing['user'];
        return user.username;
      },
    },
    {
      key: "game",
      label: "Game",
      render: (value) => {
        const game = value as Listing['game'];
        return game.title;
      },
    },
    {
      key: "price",
      label: "Price",
      render: (value) => `$${(value as number).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            (value as Listing['status']) === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : (value as Listing['status']) === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : ""
          }`}
        >
          {String(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: unknown, row?: Listing) => row ? (
        <div className="flex gap-2">
          {row.status === "ACTIVE" && (
            <button
              onClick={() => {
                setSelectedListing(row);
                setIsDeleteModalOpen(true);
              }}
              className="p-2 text-red-600 hover:text-red-800"
              title="Delete for community guidelines violation"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ) : null,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Listings Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Total Listings"
          value={listings.length}
          icon={<FaList className="h-6 w-6 text-blue-500" />}
        />
        <Card
          title="Pending Review"
          value={listings.filter((l) => l.status === "PENDING").length}
          icon={<FaList className="h-6 w-6 text-yellow-500" />}
        />
        <Card
          title="Active Listings"
          value={listings.filter((l) => l.status === "ACTIVE").length}
          icon={<FaList className="h-6 w-6 text-green-500" />}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <DataTable columns={columns} data={listings} />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedListing(undefined);
        }}
        onConfirm={handleDelete}
        listing={selectedListing}
      />
    </div>
  );
}
