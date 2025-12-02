import React from "react";
import { formatTime } from "../../utils/cooldownCalculations";
import { calculateAbilityLanes } from "../../utils/laneCalculations";
import { ROW_HEIGHT } from "../../data/bossTimelines";

export default function DragPreview({
  dragPreview,
  slot,
  draggedAbility,
  draggedFrom,
  pixelsPerSecond,
  placements,
}) {
  if (!dragPreview || dragPreview.slot !== slot || !draggedAbility) {
    return null;
  }

  // Calculate what the lane height would be if we placed this ability
  // Need to temporarily add it to the placements to calculate lanes
  const tempPlacement = {
    ...draggedAbility,
    startTime: dragPreview.startTime,
    placementId: "temp-preview",
  };

  // If dragging from timeline, exclude the original placement
  const filteredPlacements =
    draggedFrom === "timeline"
      ? placements.filter((p) => p.placementId !== draggedAbility.placementId)
      : placements;

  const placementsWithPreview = [...filteredPlacements, tempPlacement];
  const placementsWithLanes = calculateAbilityLanes(placementsWithPreview);

  // Find our preview placement in the calculated lanes
  const previewWithLane = placementsWithLanes.find(
    (p) => p.placementId === "temp-preview"
  );

  if (!previewWithLane) {
    // Fallback to default size if calculation fails
    return (
      <div
        className="absolute rounded pointer-events-none overflow-hidden"
        style={{
          left: `${dragPreview.startTime * pixelsPerSecond}px`,
          width: `${draggedAbility.duration * pixelsPerSecond}px`,
          top: "10px",
          height: "40px",
          backgroundColor: draggedAbility.color,
          opacity: 0.7,
          border: "2px dashed #fff",
          zIndex: 10,
        }}
      />
    );
  }

  // Calculate actual height based on lanes
  const totalLanes = previewWithLane.totalLanes;
  const laneHeight = (ROW_HEIGHT - 20) / totalLanes;
  const laneTop = 10 + previewWithLane.lane * laneHeight;
  const actualHeight = laneHeight - 2;

  return (
    <div
      className="absolute rounded pointer-events-none"
      style={{
        left: `${dragPreview.startTime * pixelsPerSecond}px`,
        width: `${draggedAbility.duration * pixelsPerSecond}px`,
        top: `${laneTop}px`,
        height: `${actualHeight}px`,
        backgroundColor: draggedAbility.color,
        opacity: 0.7,
        border:
          draggedFrom === "timeline" ? "2px solid white" : "2px dashed #fff",
        zIndex: 10,
        overflow: "visible",
      }}
    >
      {/* Sweet spot indicator */}
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

      {/* Icon */}
      {draggedAbility.icon && (
        <div className="absolute left-0 top-0">
          <img
            src={draggedAbility.icon}
            alt=""
            style={{
              height: `${Math.max(actualHeight, 20)}px`,
              width: `${Math.max(actualHeight, 20)}px`,
              opacity: 0.9,
            }}
          />
        </div>
      )}

      {/* Timestamps */}
      {actualHeight > 25 && (
        <div
          className="absolute left-0 right-0 bottom-0 px-2 py-0.5 flex justify-center"
          style={{
            color: "#000",
            fontSize: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <span className="font-semibold">
            {formatTime(dragPreview.startTime)} -{" "}
            {formatTime(dragPreview.startTime + draggedAbility.duration)}
          </span>
        </div>
      )}
    </div>
  );
}
