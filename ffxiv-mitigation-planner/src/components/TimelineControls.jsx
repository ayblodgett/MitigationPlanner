import React from "react";
import { RotateCcw } from "lucide-react";

export default function TimelineControls({ onClearAll }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">FFXIV Mitigation Planner</h1>
      <button
        onClick={onClearAll}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
      >
        <RotateCcw size={16} />
        Clear All
      </button>
    </div>
  );
}
