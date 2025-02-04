"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Card } from "@/components/admin/Card";
import { FaGamepad, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import api from "@/lib/api/client";
import toast from "react-hot-toast";
import Image from "next/image";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row?: T) => React.ReactNode;
}

interface Game {
  id: number;
  title: string;
  description: string;
  releaseDate: string | null;
  categoryId: number;
  imageUrl: string | null;
  imageId: string | null;
  category: {
    id: number;
    name: string;
  };
  listings: Array<{
    id: number;
    status: string;
  }>;
}

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  game?: Game;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  game: Game | null;
}

function DeleteModal({ isOpen, onClose, onConfirm, game }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
            <FaTrash className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">Delete Game</h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{game?.title}</span>?
          </p>

          {game?.imageUrl && (
            <div className="w-24 h-24 relative mx-auto">
              <Image
                src={game.imageUrl}
                alt={game.title}
                fill
                className="object-cover rounded"
              />
            </div>
          )}

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              This action cannot be undone. This will permanently delete the
              game.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameModal({ isOpen, onClose, onSubmit, game }: GameModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    releaseDate: "",
    categoryId: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || "",
        description: game.description || "",
        releaseDate: game.releaseDate
          ? new Date(game.releaseDate).toISOString().split("T")[0]
          : "",
        categoryId: game.categoryId?.toString() || "",
      });
    } else {
      // Reset form when creating new game
      setFormData({
        title: "",
        description: "",
        releaseDate: "",
        categoryId: "",
      });
    }
  }, [game]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      // console.log('Form Data before append:', formData);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          data.append(key, value.toString());
          // console.log(`Appending ${key}:`, value);
        }
      });
      if (image) {
        // console.log('Image details:', {
        //   name: image.name,
        //   type: image.type,
        //   size: image.size
        // });
        data.append("image", image);
      }

            // Log final FormData
            // console.log('FormData entries:');
            // for (const pair of data.entries()) {
            //   console.log(pair[0], pair[1]);
            // }

      await onSubmit(data);
      onClose();
    } catch (error: unknown) {
      console.error('Form submission error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        formData,
        imageDetails: image ? {
          name: image.name,
          type: image.type,
          size: image.size
        } : null
      });
    } finally {
      setIsLoading(false);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {game ? "Edit Game" : "Add New Game"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {game?.imageUrl && (
            <div className="w-32 h-32 relative mx-auto mb-4">
              <Image
                src={game.imageUrl}
                alt={game.title}
                fill
                className="object-cover rounded"
              />
            </div>
          )}

          <div className="space-y-4">
            {/* Form fields with existing values */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Game Title"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Game Description"
              required
              rows={4}
            />
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) =>
                setFormData({ ...formData, releaseDate: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              accept="image/*"
            />
            {/* ...other fields... */}
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⌛</span>
                  {game ? "Updating..." : "Creating..."}
                </span>
              ) : game ? (
                "Update Game"
              ) : (
                "Create Game"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get("/games");
      setGames(response.data.data);
    } catch (error: unknown) {
      toast.error(
        "Failed to fetch game: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      await api.post("/games", formData);
      toast.success("Game created successfully");
      fetchGames();
    } catch (error: unknown) {
      toast.error(
        "Failed to create game: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedGame) return;
    try {
      // console.log('Update request details:', {
      //   gameId: selectedGame.id,
      //   formDataEntries: Array.from(formData.entries())
      // });
      await api.put(`/games/${selectedGame.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log('Update response:', response.data);
      
      toast.success("Game updated successfully");
      fetchGames();
    } catch (error: unknown) {
      // console.error('Update error details:', {
      //   error,
      //   message: error instanceof Error ? error.message : 'Unknown error',
      //   gameId: selectedGame.id,
      //   formDataEntries: Array.from(formData.entries())
      // });
      toast.error(
        "Failed to update game: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;
    try {
      await api.delete(`/games/${gameToDelete.id}`);
      toast.success("Game deleted successfully");
      fetchGames();
    } catch (error: unknown) {
      toast.error(
        "Failed to delete game: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsDeleteModalOpen(false);
      setGameToDelete(null);
    }
  };

  const columns: Column<Game>[] = [
    { key: "title", label: "Title", sortable: true },
    {
      key: "description",
      label: "Description",
      render: (value: Game[keyof Game]) => {
        const description = value as Game["description"];
        return description || "N/A";
      },
    },
    {
      key: "imageUrl",
      label: "Image",
      render: (value: Game[keyof Game]) =>
        typeof value === "string" && value ? (
          <div className="w-16 h-16 relative">
            <Image
              src={value}
              alt="Game"
              fill
              className="object-cover rounded"
            />
          </div>
        ) : null,
    },
    {
      key: "category",
      label: "Category",
      render: (value: Game[keyof Game]) => {
        const category = value as Game["category"];
        return category?.name || "N/A";
      },
    },
    {
      key: "releaseDate",
      label: "Release Date",
      render: (value: Game[keyof Game]) =>
        typeof value === "string"
          ? new Date(value).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: Game[keyof Game], game?: Game) =>
        game ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedGame(game);
                setIsModalOpen(true);
              }}
              // disabled={game.listings.length > 0}
              className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDeleteClick(game)}
              disabled={game.listings.length > 0}
              className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <FaTrash />
            </button>
          </div>
        ) : null,
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
        <h1 className="text-2xl font-semibold">Games Management</h1>
        <button
          onClick={() => {
            setSelectedGame(undefined);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add New Game
        </button>
      </div>

      <Card
        title="Total Games"
        value={games.length}
        icon={<FaGamepad className="h-6 w-6 text-indigo-500" />}
      />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <DataTable columns={columns} data={games} />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGameToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        game={gameToDelete}
      />

      <GameModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGame(undefined);
        }}
        onSubmit={selectedGame ? handleUpdate : handleCreate}
        game={selectedGame}
      />
    </div>
  );
}
