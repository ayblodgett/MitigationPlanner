import React from "react";
import { ROW_HEIGHT } from "../../data/bossTimelines";

export default function ValidDropZones({
  validZones,
  pixelsPerSecond,
  timelineDuration,
  slot,
  draggedAbility,
}) {
  // Only show zones if we're dragging an ability that matches this slot
  if (!validZones || !draggedAbility || draggedAbility.slot !== slot) {
    return null;
  }

  // Create invalid zone overlays (areas between valid zones)
  const invalidZones = [];
  let lastEnd = 0;

  validZones.forEach((zone) => {
    // Add invalid zone before this valid zone
    if (zone.start > lastEnd) {
      invalidZones.push({
        start: lastEnd,
        end: zone.start,
      });
    }
    lastEnd = zone.end;
  });

  // Add invalid zone after last valid zone
  const maxTime = timelineDuration - draggedAbility.duration;
  if (lastEnd < maxTime) {
    invalidZones.push({
      start: lastEnd,
      end: maxTime,
    });
  }

  return (
    <>
      {invalidZones.map((zone, index) => (
        <div
          key={`invalid-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: `${zone.start * pixelsPerSecond}px`,
            width: `${(zone.end - zone.start) * pixelsPerSecond}px`,
            top: 0,
            height: `${ROW_HEIGHT}px`,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 5,
          }}
        />
      ))}
    </>
  );
}
