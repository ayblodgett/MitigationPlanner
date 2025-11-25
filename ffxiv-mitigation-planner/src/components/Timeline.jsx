import React from "react";
import { Trash2 } from "lucide-react";
import { PIXELS_PER_SECOND } from "../data/bossTimelines";
import { checkCooldownConflict } from "../utils/cooldownCalculations";

export default function Timeline({
  timeline,
  placements,
  onDragOver,
  onDrop,
  onDragStart,
  onRemovePlacement,
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3">
        Boss Timeline - {timeline.name}
      </h2>

      {/* Time markers */}
      <div className="relative mb-2" style={{ height: "30px" }}>
        {Array.from(
          { length: Math.ceil(timeline.duration / 10) + 1 },
          (_, i) => i * 10
        ).map((time) => (
          <div
            key={time}
            className="absolute text-xs text-gray-400"
            style={{ left: `${time * PIXELS_PER_SECOND}px` }}
          >
            {time}s
          </div>
        ))}
      </div>

      {/* Timeline area */}
      <div
        className="relative bg-gray-700 rounded"
        style={{
          width: `${timeline.duration * PIXELS_PER_SECOND}px`,
          minHeight: "400px",
          backgroundImage:
            "repeating-linear-gradient(90deg, #4a5568 0px, #4a5568 1px, transparent 1px, transparent 40px)",
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Boss attacks */}
        {timeline.attacks.map((attack, idx) => (
          <div
            key={idx}
            className="absolute w-1 bg-red-500"
            style={{
              left: `${attack.time * PIXELS_PER_SECOND}px`,
              top: 0,
              height: "100%",
            }}
          >
            <div className="absolute top-2 left-2 bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap">
              {attack.name}
            </div>
          </div>
        ))}

        {/* Placed abilities */}
        {placements.map((placement) => (
          <div
            key={placement.placementId}
            draggable
            onDragStart={() => onDragStart(placement, "timeline")}
            className="absolute rounded cursor-move group"
            style={{
              left: `${placement.startTime * PIXELS_PER_SECOND}px`,
              width: `${placement.duration * PIXELS_PER_SECOND}px`,
              top: `${
                50 +
                placements.filter(
                  (p) =>
                    p.startTime < placement.startTime + placement.duration &&
                    placement.startTime < p.startTime + p.duration &&
                    placements.indexOf(p) < placements.indexOf(placement)
                ).length *
                  50
              }px`,
              height: "40px",
              backgroundColor: placement.color,
              color: "#000",
              border: checkCooldownConflict(
                placements,
                placement,
                placement.startTime,
                placement.placementId
              )
                ? "2px solid red"
                : "none",
            }}
          >
            <div className="px-2 py-1 text-sm font-semibold truncate">
              {placement.name}
            </div>
            <button
              onClick={() => onRemovePlacement(placement.placementId)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
