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

        // Check if this ability is currently being dragged
        const isBeingDragged =
          draggedAbility &&
          draggedAbility.placementId === placement.placementId &&
          draggedFrom === "timeline";

        return (
          <React.Fragment key={placement.placementId}>
            {/* Original position ghost (shown when dragging) */}
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

                {/* Icon in ghost */}
                {placement.icon && (
                  <div className="absolute left-0 top-0">
                    <img
                      src={placement.icon}
                      alt=""
                      className="opacity-70"
                      style={{
                        height: `${Math.max(actualHeight, 20)}px`,
                        width: `${Math.max(actualHeight, 20)}px`,
                      }}
                    />
                  </div>
                )}
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
              className="absolute rounded cursor-move group ability-block"
              style={{
                left: `${placement.startTime * pixelsPerSecond}px`,
                width: `${placement.duration * pixelsPerSecond}px`,
                top: `${laneTop}px`,
                height: `${actualHeight}px`,
                backgroundColor: placement.color,
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
                overflow: "visible",
              }}
            >
              {/* Sweet spot indicator */}
              {hasSweetSpot && (
                <div
                  className="absolute top-0 left-0 h-full pointer-events-none"
                  style={{
                    width: `${sweetSpotWidth}px`,
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                  }}
                />
              )}

              {/* Icon */}
              {placement.icon && (
                <div
                  className="absolute left-0 top-0 pointer-events-none"
                  style={{
                    zIndex: 10,
                    height: `${actualHeight}px`,
                    minHeight: "20px",
                  }}
                >
                  <img
                    src={placement.icon}
                    alt={placement.name}
                    style={{
                      height: `${Math.max(actualHeight, 20)}px`,
                      width: `${Math.max(actualHeight, 20)}px`,
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                    }}
                  />
                </div>
              )}

              {/* Delete button - only visible on hover */}
              <button
                onClick={() => {
                  setHoveredAbility(null);
                  onRemovePlacement(placement.placementId);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 rounded p-0.5 z-20 transition-opacity"
                title={`Remove ${placement.name}`}
              >
                <Trash2 size={10} />
              </button>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
