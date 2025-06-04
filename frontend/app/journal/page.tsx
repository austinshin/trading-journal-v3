"use client";

import Link from "next/link";
import { Calendar, LineChart, Plus } from "lucide-react";

const journalLinks = [
  {
    name: "Calendar View",
    href: "/journal/calendar",
    icon: Calendar,
    description: "View your trades on a calendar with daily P&L",
  },
  {
    name: "Journal Stats",
    href: "/journal/stats",
    icon: LineChart,
    description: "Analyze your trading performance metrics",
  },
  {
    name: "Add Trade",
    href: "/journal/add",
    icon: Plus,
    description: "Log a new trade with notes and screenshots",
  },
];

export default function JournalPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trading Journal</h1>
        <p className="text-gray-400 mt-2">
          Track and analyze your trading performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200">Today&apos;s P&L</h3>
          <p className="mt-2 text-3xl font-bold text-green-400">+$1,234.56</p>
          <p className="mt-1 text-sm text-gray-400">5 trades</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200">This Week</h3>
          <p className="mt-2 text-3xl font-bold text-green-400">+$4,321.00</p>
          <p className="mt-1 text-sm text-gray-400">23 trades</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-200">Win Rate</h3>
          <p className="mt-2 text-3xl font-bold text-white">67.3%</p>
          <p className="mt-1 text-sm text-gray-400">Last 100 trades</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {journalLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="group bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <link.icon className="h-8 w-8 text-gray-600 group-hover:text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-200 group-hover:text-white">
                  {link.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 