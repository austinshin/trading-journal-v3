"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  Calendar,
  LineChart,
  Plus,
  Settings,
  Keyboard,
  List,
  Database,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart2 },
  {
    name: "Trading Journal",
    href: "/journal",
    icon: BookOpen,
    children: [
      { name: "All Trades", href: "/journal/trades", icon: TrendingUp },
      { name: "Calendar View", href: "/journal/calendar", icon: Calendar },
      { name: "Journal Stats", href: "/journal/stats", icon: LineChart },
      { name: "Add Trade", href: "/journal/add", icon: Plus },
    ],
  },
  { name: "Stock Watchlist", href: "/watchlist", icon: List },
  { name: "Cobra Hotkeys", href: "/hotkeys", icon: Keyboard },
  { name: "Supabase Testing", href: "/supabase-testing", icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">Trading Journal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${
                  isActive(item.href)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${
                    isActive(item.href)
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }
                `}
              />
              {item.name}
            </Link>

            {/* Subnav */}
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${
                        isActive(subItem.href)
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <subItem.icon
                      className={`
                        mr-3 h-4 w-4 flex-shrink-0
                        ${
                          isActive(subItem.href)
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white"
                        }
                      `}
                    />
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
          Settings
        </Link>
      </div>
    </div>
  );
} 