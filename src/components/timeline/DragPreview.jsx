import React from "react";
import { formatTime } from "../../utils/cooldownCalculations";

export default function DragPreview({
  dragPreview,
  slot,
  draggedAbility,
  pixelsPerSecond,
}) {
  if (!dragPreview || dragPreview.slot !== slot || !draggedAbility) {
    return null;
  }

  return (
    <div
      className="absolute rounded pointer-events-none overflow-hidden"
      style={{
        left: `${dragPreview.startTime * pixelsPerSecond}px`,
        width: `${draggedAbility.duration * pixelsPerSecond}px`,
        top: "10px",
        height: "40px",
        backgroundColor: draggedAbility.color,
        opacity: 0.5,
        border: "2px dashed #fff",
      }}
    >
      {draggedAbility.sweetSpotDuration &&
        draggedAbility.sweetSpotDuration > 0 && (
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: `${draggedAbility.sweetSpotDuration * pixelsPerSecond}px`,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
          />
        )}

      <div
        className="px-2 py-0.5 flex flex-col justify-center"
        style={{ color: "#000", height: "100%" }}
      >
        <div className="text-sm font-semibold truncate">
          {draggedAbility.name}
        </div>
        <div className="text-xs opacity-75">
          {formatTime(dragPreview.startTime)} -{" "}
          {formatTime(dragPreview.startTime + draggedAbility.duration)}
        </div>
      </div>
    </div>
  );
}
