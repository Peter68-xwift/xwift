"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Package, User, Wallet, CreditCard } from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/user-dashboard",
      active: pathname === "/user-dashboard",
    },
    {
      name: "Packages",
      icon: Package,
      path: "/user-dashboard/packages",
      active: pathname === "/user-dashboard/packages",
    },
    {
      name: "Subscriptions",
      path: "/user-dashboard/subscriptions",
      icon: CreditCard,
      active: pathname === "/user-dashboard/subscriptions",
    },
    {
      name: "Profile",
      icon: User,
      path: "/user-dashboard/profile",
      active: pathname === "/user-dashboard/profile",
    },
    {
      name: "Wallet",
      icon: Wallet,
      path: "/user-dashboard/wallet",
      active: pathname === "/user-dashboard/wallet",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-200 border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                item.active
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-1 ${
                  item.active ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  item.active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
