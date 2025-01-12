"use client";

import Link from "next/link";

export function HeroSection() {
  return (
      <section
        className="relative h-[400px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/assets/images/home-banner-v2-min.png')`,
        }}
      >
        <div className="max-w-screen-2xl mx-auto h-full flex flex-col justify-center px-6">
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
  );
}
