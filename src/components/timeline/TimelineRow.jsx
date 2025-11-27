import React from "react";
import { Trash2 } from "lucide-react";
import { ROW_HEIGHT } from "../../data/bossTimelines";
import {
  checkCooldownConflict,
  formatTime,
} from "../../utils/cooldownCalculations";

export default function TimelineRow({
  slot,
  job,
  timeline,
  placementsWithLanes,
  pixelsPerSecond,
  timelineWidth,
  labelWidth,
  onDragOver,
  onDragLeave,
  onDropOnRow,
  onDragStart,
  onRemovePlacement,
  setHoveredAbility,
  setTooltipPosition,
  placements,
}) {
  return (
    <div className="relative mb-1" style={{ height: `${ROW_HEIGHT}px` }}>
      <div
        className="relative bg-gray-700 rounded"
        style={{
          width: `${timelineWidth}px`,
          height: `${ROW_HEIGHT}px`,
          marginLeft: `${labelWidth}px`,
          backgroundImage: `repeating-linear-gradient(90deg, #4a5568 0px, #4a5568 1px, transparent 1px, transparent ${
            pixelsPerSecond * 5
          }px)`,
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDropOnRow(e, slot)}
      >
        {/* Boss attack vertical lines */}
        {timeline.attacks.map((attack, idx) => (
          <div
            key={idx}
            className="absolute w-1 bg-red-500 opacity-30"
            style={{
              left: `${attack.time * pixelsPerSecond}px`,
              top: 0,
              height: "100%",
            }}
          />
        ))}

        {/* Placed abilities */}
        {placementsWithLanes.map((placement) => {
          const hasSweetSpot =
            placement.sweetSpotDuration && placement.sweetSpotDuration > 0;
          const sweetSpotWidth = hasSweetSpot
            ? placement.sweetSpotDuration * pixelsPerSecond
            : 0;
          const endTime = placement.startTime + placement.duration;

          const totalLanes = placement.totalLanes;
          const laneHeight = (ROW_HEIGHT - 20) / totalLanes;
          const laneTop = 10 + placement.lane * laneHeight;
          const actualHeight = laneHeight - 2;

          return (
            <div
              key={placement.placementId}
              draggable
              onDragStart={() => onDragStart(placement, "timeline")}
              onMouseEnter={(e) => {
                setHoveredAbility(placement);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredAbility(null)}
              className="absolute rounded cursor-move group ability-block overflow-hidden"
              style={{
                left: `${placement.startTime * pixelsPerSecond}px`,
                width: `${placement.duration * pixelsPerSecond}px`,
                top: `${laneTop}px`,
                height: `${actualHeight}px`,
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
              {hasSweetSpot && (
                <div
                  className="absolute top-0 left-0 h-full pointer-events-none"
                  style={{
                    width: `${sweetSpotWidth}px`,
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                  }}
                />
              )}

              <div className="px-2 py-1 relative z-10">
                <div className="text-sm font-semibold truncate">
                  {placement.name}
                </div>
                {actualHeight > 25 && (
                  <div className="text-xs opacity-75">
                    {formatTime(placement.startTime)} - {formatTime(endTime)}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setHoveredAbility(null);
                  onRemovePlacement(placement.placementId);
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded p-1 z-10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
