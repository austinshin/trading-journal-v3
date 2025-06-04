"use client";

import React from "react";

interface Props {
  level: "High" | "Medium" | "Low" | "Unknown";
}

const COLORS: Record<Props["level"], string> = {
  High: "bg-red-600 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-green-600 text-white",
  Unknown: "bg-gray-400 text-black",
};

export default function RiskBadge({ level }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold shadow-sm ${COLORS[level]}`}
    >
      {level}
    </span>
  );
} 