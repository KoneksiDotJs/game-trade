"use client";

import { routes } from "@/constants/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaGamepad, FaList, FaTags } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const menuItems = [
  { href: routes.admin.dashboard, label: "Dashboard", icon: MdDashboard },
  { href: routes.admin.users, label: "Users", icon: FaUsers },
  { href: routes.admin.games, label: "Games", icon: FaGamepad },
  { href: routes.admin.categories, label: "Categories", icon: FaTags },
  { href: "/admin/listings", label: "Listings", icon: FaList },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-white">Game Trade</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
