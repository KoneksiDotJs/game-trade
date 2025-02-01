"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Card } from "@/components/admin/Card";
import { FaFolder, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import api from "@/lib/api/client";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  description: string;
  games: Array<{
    id: number;
    title: string;
  }>;
}

import { Column } from "@/components/admin/DataTable";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  category?: Category;
}

function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Category Name"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            placeholder="Description"
            rows={4}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              {isLoading ? "Loading..." : category ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to fetch categories: ${message}`);
    } finally {
      setLoading(false);
    }
  };

// Update error handling in API calls
const handleCreate = async (data: { name: string; description: string }) => {
    try {
      await api.post("/categories", data);
      toast.success("Category created successfully");
      fetchCategories();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create category: ${message}`);
    }
  };
  
  const handleUpdate = async (data: { name: string; description: string }) => {
    if (!selectedCategory) return;
    try {
      await api.put(`/categories/${selectedCategory.id}`, data);
      toast.success("Category updated successfully");
      fetchCategories();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update category: ${message}`);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to delete category: ${message}`);
    }
  };

// Update columns type definition
const columns: Column<Category>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    {
      key: "games",
      label: "Games Count",
      render: (value: string | number | Array<{id: number; title: string}>) => Array.isArray(value) ? value.length : 0,
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: string | number | Array<{ id: number; title: string }>, row?: Category) => {
        if (!row) return null;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedCategory(row);
                setIsModalOpen(true);
              }}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              disabled={row.games.length > 0}
              className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
              title={row.games.length > 0 ? "Cannot delete category with games" : "Delete category"}
            >
              <FaTrash />
            </button>
          </div>
        );
      },
    },
  ];
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories Management</h1>
        <button
          onClick={() => {
            setSelectedCategory(undefined);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Add Category
        </button>
      </div>

      <Card
        title="Total Categories"
        value={categories.length}
        icon={<FaFolder className="h-6 w-6 text-indigo-500" />}
      />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <DataTable columns={columns} data={categories} />
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(undefined);
        }}
        onSubmit={selectedCategory ? handleUpdate : handleCreate}
        category={selectedCategory}
      />
    </div>
  );
}
