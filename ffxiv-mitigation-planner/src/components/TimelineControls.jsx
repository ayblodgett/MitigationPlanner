import React from "react";
import { RotateCcw } from "lucide-react";
import { formatTime } from "../utils/cooldownCalculations";

export default function TimelineControls({
  onClearAll,
  currentTimeline,
  onTimelineChange,
  availableTimelines,
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">FFXIV Mitigation Planner</h1>

        <select
          value={currentTimeline}
          onChange={(e) => onTimelineChange(e.target.value)}
          className="bg-gray-700 rounded px-4 py-2 text-lg"
        >
          {Object.entries(availableTimelines).map(([id, timeline]) => (
            <option key={id} value={id}>
              {timeline.name} ({formatTime(timeline.duration)})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          <RotateCcw size={16} />
          Clear All
        </button>
      </div>
    </div>
  );
}
