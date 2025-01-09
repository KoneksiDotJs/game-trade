import Image from "next/image";
import Link from "next/link";

interface Game {
  id: string;
  imageUrl: string;
  title: string;
  listingsCount: number;
}

export function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="relative overflow-hidden rounded-lg group bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <Image
          src={game.imageUrl}
          alt={game.title}
          width={300}
          height={400}
          className="w-full h-[250px] object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900/90 dark:from-black/90 to-transparent">
          <h3 className="text-xl font-bold text-white">{game.title}</h3>
          <p className="text-sm text-gray-200 dark:text-gray-300">
            {game.listingsCount} Listings
          </p>
        </div>
      </div>
    </Link>
  );
}
