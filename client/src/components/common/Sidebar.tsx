"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGamepad, FaShoppingCart, FaUser, FaEnvelope } from "react-icons/fa";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/games", label: "Games", icon: FaGamepad },
    { href: "/listings", label: "Listings", icon: FaShoppingCart },
    { href: "/users/profile", label: "Profile", icon: FaUser },
    { href: "/messages", label: "Messages", icon: FaEnvelope },
  ];

  return (
    <aside className="bg-white dark:bg-gray-800 w-64 min-h-screen shadow-lg">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-200 
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : ""
                }`}
              >
                <item.icon
                  className={`${
                    pathname === item.href
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
