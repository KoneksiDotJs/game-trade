import { GameCard } from "@/components/card/GameCard";
import { ListingCard } from "@/components/card/ListingCard";

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

      {/* Featured Games Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Popular Games
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
