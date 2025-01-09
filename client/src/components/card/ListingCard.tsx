import Image from "next/image";

interface Listing {
  imageUrl: string;
  title: string;
  description: string;
  price: number;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="aspect-video relative">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
          {listing.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {listing.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
            ${listing.price}
          </span>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
