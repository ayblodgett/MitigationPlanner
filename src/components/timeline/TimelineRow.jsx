import React from "react";
import { Trash2 } from "lucide-react";
import { ROW_HEIGHT } from "../../data/bossTimelines";
import { checkCooldownConflict } from "../../utils/cooldownCalculations";

export default function TimelineRow({
  slot,
  placementsWithLanes,
  pixelsPerSecond,
  onDragStart,
  onRemovePlacement,
  setHoveredAbility,
  setTooltipPosition,
  placements,
  draggedAbility,
  draggedFrom,
}) {
  return (
    <>
      {placementsWithLanes.map((placement) => {
        const hasSweetSpot =
          placement.sweetSpotDuration && placement.sweetSpotDuration > 0;
        const sweetSpotWidth = hasSweetSpot
          ? placement.sweetSpotDuration * pixelsPerSecond
          : 0;

        const totalLanes = placement.totalLanes;
        const laneHeight = (ROW_HEIGHT - 20) / totalLanes;
        const laneTop = 10 + placement.lane * laneHeight;
        const actualHeight = laneHeight - 2;

        const isBeingDragged =
          draggedAbility &&
          draggedAbility.placementId === placement.placementId &&
          draggedFrom === "timeline";

        return (
          <React.Fragment key={placement.placementId}>
            {/* Original position ghost */}
            {isBeingDragged && (
              <div
                className="absolute rounded overflow-hidden pointer-events-none"
                style={{
                  left: `${placement.startTime * pixelsPerSecond}px`,
                  width: `${placement.duration * pixelsPerSecond}px`,
                  top: `${laneTop}px`,
                  height: `${actualHeight}px`,
                  backgroundColor: placement.color,
                  opacity: 0.3,
                  color: "#000",
                }}
              >
                {hasSweetSpot && (
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: `${sweetSpotWidth}px`,
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                    }}
                  />
                )}
                <div
                  className="px-2 py-0.5 relative z-10 flex items-center gap-1"
                  style={{ height: "100%" }}
                >
                  {placement.icon && (
                    <img
                      src={placement.icon}
                      alt=""
                      className="w-4 h-4 flex-shrink-0"
                    />
                  )}
                  <div className="text-sm font-semibold truncate">
                    {placement.name}
                  </div>
                </div>
              </div>
            )}

            {/* Ability bar */}
            <div
              draggable
              onDragStart={(e) => {
                setHoveredAbility(null);
                const barRect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - barRect.left;
                const clickOffsetInSeconds = clickX / pixelsPerSecond;
                onDragStart(placement, "timeline", clickOffsetInSeconds);
              }}
              onMouseEnter={(e) => {
                setHoveredAbility(placement);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => {
                setHoveredAbility(null);
              }}
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
                  : isBeingDragged
                  ? "2px solid white"
                  : "none",
                opacity: isBeingDragged ? 0 : 1,
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

              <div
                className="px-2 py-0.5 relative z-10 flex items-center gap-1"
                style={{ height: "100%" }}
              >
                {/* Add icon here */}
                {placement.icon && (
                  <img
                    src={placement.icon}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                <div className="text-sm font-semibold truncate">
                  {placement.name}
                </div>
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
          </React.Fragment>
        );
      })}
    </>
  );
}
