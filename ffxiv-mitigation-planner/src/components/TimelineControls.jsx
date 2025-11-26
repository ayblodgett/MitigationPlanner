import React from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { formatTime } from "../utils/cooldownCalculations";

export default function TimelineControls({
  onClearAll,
  currentTimeline,
  onTimelineChange,
  availableTimelines,
  zoom,
  onZoomChange,
  snapInterval,
  onSnapIntervalChange,
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
        {/* Snap Interval */}
        <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
          <label className="text-sm">Snap:</label>
          <select
            value={snapInterval}
            onChange={(e) => onSnapIntervalChange(Number(e.target.value))}
            className="bg-gray-700 rounded px-2 py-1 text-sm"
          >
            <option value={0.1}>0.1s</option>
            <option value={0.5}>0.5s</option>
            <option value={1}>1s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
          <button
            onClick={() => onZoomChange(Math.max(1, zoom - 1))}
            className="hover:bg-gray-700 rounded p-1"
            disabled={zoom <= 1}
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-sm w-12 text-center">{zoom}x</span>
          <button
            onClick={() => onZoomChange(Math.min(8, zoom + 1))}
            className="hover:bg-gray-700 rounded p-1"
            disabled={zoom >= 8}
          >
            <ZoomIn size={16} />
          </button>
        </div>

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
