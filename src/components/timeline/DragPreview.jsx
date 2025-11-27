import React from "react";

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
        className="px-2 py-1 text-sm font-semibold truncate"
        style={{ color: "#000" }}
      >
        {draggedAbility.name}
      </div>
    </div>
  );
}
