"use client";

import { RefreshCw, Search, Plus, ArrowRight, ChevronDown } from "lucide-react";

export default function StyleGuidePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* Typography */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Typography</h2>
        <div className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Heading 1 (text-3xl)</h1>
            <p className="text-sm text-gray-400 mt-1">Used for main page titles</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Heading 2 (text-xl)</h2>
            <p className="text-sm text-gray-400 mt-1">Used for section headers</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Heading 3 (text-lg)</h3>
            <p className="text-sm text-gray-400 mt-1">Used for card titles and subsections</p>
          </div>
          <div>
            <p className="text-base">Body Text (text-base)</p>
            <p className="text-sm text-gray-400 mt-1">Default paragraph text</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Small Text (text-sm)</p>
            <p className="text-sm text-gray-400 mt-1">Used for secondary information and labels</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Extra Small (text-xs)</p>
            <p className="text-sm text-gray-400 mt-1">Used for metadata and timestamps</p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Backgrounds */}
          <div className="space-y-2">
            <div className="h-20 bg-black rounded-lg"></div>
            <p className="text-sm font-medium">Background (black)</p>
            <p className="text-xs text-gray-400">Main app background</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gray-900/50 rounded-lg border border-gray-800/60"></div>
            <p className="text-sm font-medium">Card Background</p>
            <p className="text-xs text-gray-400">bg-gray-900/50</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-gray-800 rounded-lg"></div>
            <p className="text-sm font-medium">Hover State</p>
            <p className="text-xs text-gray-400">bg-gray-800</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 border border-gray-800/60 rounded-lg"></div>
            <p className="text-sm font-medium">Borders</p>
            <p className="text-xs text-gray-400">border-gray-800/60</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Buttons</h2>
        <div className="space-y-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60">
          {/* Primary Button */}
          <div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <Plus className="h-4 w-4" />
              Primary Button
            </button>
            <p className="text-sm text-gray-400 mt-2">Used for main actions</p>
          </div>

          {/* Secondary Button */}
          <div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 rounded-lg font-medium border border-gray-800/60 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Secondary Button
            </button>
            <p className="text-sm text-gray-400 mt-2">Used for secondary actions</p>
          </div>

          {/* Ghost Button */}
          <div>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-md transition-colors">
              <ArrowRight className="h-4 w-4" />
              Ghost Button
            </button>
            <p className="text-sm text-gray-400 mt-2">Used for tertiary actions</p>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Form Elements</h2>
        <div className="space-y-6 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60">
          {/* Search Input */}
          <div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 pl-10 pr-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">Search input with icon</p>
          </div>

          {/* Regular Input */}
          <div>
            <input
              type="text"
              placeholder="Regular input"
              className="block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
            />
            <p className="text-sm text-gray-400 mt-2">Standard text input</p>
          </div>

          {/* Select */}
          <div>
            <div className="relative">
              <select className="block w-full rounded-lg border border-gray-800/60 bg-gray-900/50 px-4 py-2.5 text-gray-100 appearance-none focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Select dropdown</p>
          </div>
        </div>
      </section>

      {/* Status Indicators */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Status Indicators</h2>
        <div className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-gray-800/60">
          {/* Risk Levels */}
          <div className="space-x-2">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-red-500/10 text-red-400">
              High Risk
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-yellow-500/10 text-yellow-400">
              Medium Risk
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-green-500/10 text-green-400">
              Low Risk
            </span>
          </div>

          {/* Change Indicators */}
          <div className="space-x-2">
            <span className="text-green-400">+2.45%</span>
            <span className="text-red-400">-1.23%</span>
          </div>

          {/* Alert States */}
          <div className="space-y-2">
            <div className="rounded-lg border border-red-900/10 bg-red-500/10 p-4 text-sm text-red-400">
              Error message
            </div>
            <div className="rounded-lg border border-yellow-900/10 bg-yellow-500/10 p-4 text-sm text-yellow-400">
              Warning message
            </div>
            <div className="rounded-lg border border-green-900/10 bg-green-500/10 p-4 text-sm text-green-400">
              Success message
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Standard Card */}
          <div className="card-hover bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
            <h3 className="text-lg font-medium">Standard Card</h3>
            <p className="text-sm text-gray-400 mt-2">
              Used for general content containers
            </p>
          </div>

          {/* Stats Card */}
          <div className="card-hover bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400">Total Trades</h3>
            <p className="text-2xl font-semibold mt-1">127</p>
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-green-500/10 text-green-400">
                +12% vs last week
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 