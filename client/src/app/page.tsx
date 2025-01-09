import { GameCard } from "@/components/card/GameCard";
import { ListingCard } from "@/components/card/ListingCard";
import Link from "next/link";

export default function HomePage() {
  const games = [
    { id: "1", title: "Game 1", imageUrl: "/game1.jpg", listingsCount: 0 },
    { id: "2", title: "Game 2", imageUrl: "/game2.jpg", listingsCount: 0 },
    { id: "3", title: "Game 3", imageUrl: "/game3.jpg", listingsCount: 0 },
    { id: "4", title: "Game 4", imageUrl: "/game4.jpg", listingsCount: 0 },
  ];

  const listings = [
    {
      id: 1,
      title: "Listing 1",
      price: 100,
      game: "Game 1",
      imageUrl: "/listing1.jpg",
      description: "Description for listing 1",
    },
    {
      id: 2,
      title: "Listing 2",
      price: 200,
      game: "Game 2",
      imageUrl: "/listing2.jpg",
      description: "Description for listing 2",
    },
    {
      id: 3,
      title: "Listing 3",
      price: 300,
      game: "Game 3",
      imageUrl: "/listing3.jpg",
      description: "Description for listing 3",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-32">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Game Trading Made Simple
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Buy, sell and trade game accounts securely
          </p>
          <div className="flex gap-4">
            <Link
              href="/listings"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Browse Games
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Start Trading
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Popular Games
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
