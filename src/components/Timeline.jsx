import React, { useRef, useEffect, useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import { JOBS, PARTY_SLOTS, SLOT_LABELS } from "../data/jobs";
import { ROW_HEIGHT, PIXELS_PER_SECOND } from "../data/bossTimelines";
import {
  checkCooldownConflict,
  formatTime,
} from "../utils/cooldownCalculations";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { useTimelinePan } from "../hooks/useTimelinePan";

// Helper function to calculate lanes for overlapping abilities
const calculateAbilityLanes = (abilities) => {
  if (abilities.length === 0) return [];

  const sorted = [...abilities].sort((a, b) => a.startTime - b.startTime);
  const lanes = [];

  sorted.forEach((ability) => {
    const abilityEnd = ability.startTime + ability.duration;

    let laneIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      const laneAbilities = lanes[i];
      const hasOverlap = laneAbilities.some((existing) => {
        const existingEnd = existing.startTime + existing.duration;
        return !(
          abilityEnd <= existing.startTime || ability.startTime >= existingEnd
        );
      });

      if (!hasOverlap) {
        laneIndex = i;
        break;
      }

      if (i === lanes.length - 1) {
        laneIndex = lanes.length;
      }
    }

    if (laneIndex >= lanes.length) {
      lanes.push([]);
    }

    lanes[laneIndex].push({ ...ability, lane: laneIndex });
  });

  const totalLanes = lanes.length;
  return lanes.flat().map((ability) => ({ ...ability, totalLanes }));
};

export default function Timeline({
  timeline,
  placements,
  partyComp,
  onDragOver,
  onDragLeave,
  onDropOnRow,
  onDragStart,
  onRemovePlacement,
  pixelsPerSecond,
  zoom,
  onZoomChange,
  draggedAbility,
  dragPreview,
  draggedFrom,
  onClearAll,
}) {
  const timelineContainerRef = useRef(null);
  const timelineWrapperRef = useRef(null);
  const [hoveredAbility, setHoveredAbility] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const timelineWidth = timeline.duration * pixelsPerSecond;
  const labelWidth = 128;

  // Calculate minimum zoom to fill container
  const [minZoom, setMinZoom] = useState(1);

  useEffect(() => {
    const updateMinZoom = () => {
      if (timelineWrapperRef.current) {
        const containerWidth =
          timelineWrapperRef.current.clientWidth - labelWidth;
        const basePixelsPerSecond = PIXELS_PER_SECOND;
        const baseTimelineWidth = timeline.duration * basePixelsPerSecond;

        const neededZoom = (containerWidth / baseTimelineWidth) * 4;
        const calculatedMinZoom = Math.max(1, Math.ceil(neededZoom * 10) / 10);

        setMinZoom(calculatedMinZoom);

        if (zoom < calculatedMinZoom) {
          onZoomChange(calculatedMinZoom);
        }
      }
    };

    updateMinZoom();
    window.addEventListener("resize", updateMinZoom);

    return () => window.removeEventListener("resize", updateMinZoom);
  }, [timeline.duration, zoom, onZoomChange, labelWidth]);

  // Use custom hooks for zoom and pan
  useTimelineZoom(timelineContainerRef, zoom, onZoomChange, minZoom);
  const { isPanning, handleMouseDown } = useTimelinePan(timelineContainerRef);

  // Dynamic marker interval based on zoom level
  const getMarkerInterval = () => {
    const pixelsPerMarker = 100;
    const secondsPerMarker = pixelsPerMarker / pixelsPerSecond;

    if (secondsPerMarker <= 7.5) return 5;
    if (secondsPerMarker <= 12.5) return 10;
    if (secondsPerMarker <= 22.5) return 15;
    if (secondsPerMarker <= 45) return 30;
    if (secondsPerMarker <= 90) return 60;
    if (secondsPerMarker <= 180) return 120;
    return 300;
  };

  const markerInterval = getMarkerInterval();
  const timeMarkers = Array.from(
    { length: Math.floor(timeline.duration / markerInterval) + 1 },
    (_, i) => i * markerInterval
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Timeline title & clear button */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">
          Boss Timeline - {timeline.name}{" "}
          <span className="text-sm text-gray-400">
            (Ctrl+Scroll to zoom, scroll or drag to pan)
          </span>
        </h2>

        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          <RotateCcw size={14} />
          Clear Timeline
        </button>
      </div>

      <div className="relative" ref={timelineWrapperRef}>
        <div
          ref={timelineContainerRef}
          className="overflow-x-auto timeline-scroll-area"
          style={{
            cursor: isPanning ? "grabbing" : "grab",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onMouseDown={handleMouseDown}
        >
          <style>{`
            .timeline-scroll-area::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Header row */}
          <div
            className="relative mb-2"
            style={{
              height: "60px",
              minWidth: `${timelineWidth + labelWidth}px`,
              clipPath: `inset(0 0 0 ${labelWidth}px)`,
            }}
          >
            {/* Boss attack labels */}
            {(() => {
              const attacks = timeline.attacks.map((attack, idx) => ({
                ...attack,
                id: idx,
                estimatedWidth: attack.name.length * 7 + 16,
              }));

              const lanes = [];
              attacks.forEach((attack) => {
                const attackLeft =
                  attack.time * pixelsPerSecond +
                  labelWidth -
                  attack.estimatedWidth / 2;
                const attackRight =
                  attack.time * pixelsPerSecond +
                  labelWidth +
                  attack.estimatedWidth / 2;

                let laneIndex = 0;
                for (let i = 0; i < lanes.length; i++) {
                  const hasOverlap = lanes[i].some((existing) => {
                    const existingLeft =
                      existing.time * pixelsPerSecond +
                      labelWidth -
                      existing.estimatedWidth / 2;
                    const existingRight =
                      existing.time * pixelsPerSecond +
                      labelWidth +
                      existing.estimatedWidth / 2;
                    return !(
                      attackRight <= existingLeft || attackLeft >= existingRight
                    );
                  });

                  if (!hasOverlap) {
                    laneIndex = i;
                    break;
                  }

                  if (i === lanes.length - 1) {
                    laneIndex = lanes.length;
                  }
                }

                if (laneIndex >= lanes.length) {
                  lanes.push([]);
                }

                lanes[laneIndex].push({ ...attack, lane: laneIndex });
              });

              const totalLanes = lanes.length;
              const attacksWithLanes = lanes.flat();
              const labelHeight = 35 / totalLanes;

              return attacksWithLanes.map((attack) => {
                const laneTop = 5 + attack.lane * labelHeight;

                return (
                  <div
                    key={`attack-${attack.id}`}
                    className="absolute bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap"
                    style={{
                      left: `${attack.time * pixelsPerSecond + labelWidth}px`,
                      top: `${laneTop}px`,
                      transform: "translateX(-50%)",
                      fontSize: totalLanes > 2 ? "10px" : "12px",
                      lineHeight: `${Math.max(12, labelHeight - 4)}px`,
                    }}
                  >
                    {attack.name}
                  </div>
                );
              });
            })()}

            {/* Time markers */}
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute text-xs text-gray-400"
                style={{
                  left: `${time * pixelsPerSecond + labelWidth}px`,
                  bottom: "5px",
                  transform: time === 0 ? "none" : "translateX(-50%)",
                }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          {/* Timeline rows */}
          <div className="relative">
            {PARTY_SLOTS.filter((slot) => partyComp[slot] !== null).map(
              (slot) => {
                const jobId = partyComp[slot];
                const job = jobId ? JOBS[jobId] : null;
                const slotPlacements = placements.filter(
                  (p) => p.slot === slot
                );

                const placementsWithLanes =
                  calculateAbilityLanes(slotPlacements);

                return (
                  <div
                    key={slot}
                    className="relative mb-1"
                    style={{ height: `${ROW_HEIGHT}px` }}
                  >
                    {/* Drop zone */}
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

                      {/* Click and drag preview */}
                      {dragPreview &&
                        dragPreview.slot === slot &&
                        draggedAbility && (
                          <div
                            className="absolute rounded pointer-events-none overflow-hidden"
                            style={{
                              left: `${
                                dragPreview.startTime * pixelsPerSecond
                              }px`,
                              width: `${
                                draggedAbility.duration * pixelsPerSecond
                              }px`,
                              top: "10px",
                              height: "40px",
                              backgroundColor: draggedAbility.color,
                              opacity: draggedFrom === "timeline" ? 1 : 0.5,
                              border:
                                draggedFrom === "timeline"
                                  ? "2px solid white"
                                  : "2px dashed #fff",
                            }}
                          >
                            {draggedAbility.sweetSpotDuration &&
                              draggedAbility.sweetSpotDuration > 0 && (
                                <div
                                  className="absolute top-0 left-0 h-full"
                                  style={{
                                    width: `${
                                      draggedAbility.sweetSpotDuration *
                                      pixelsPerSecond
                                    }px`,
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
                                {formatTime(
                                  dragPreview.startTime +
                                    draggedAbility.duration
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Placed abilities */}
                      {placementsWithLanes.map((placement) => {
                        const hasSweetSpot =
                          placement.sweetSpotDuration &&
                          placement.sweetSpotDuration > 0;
                        const sweetSpotWidth = hasSweetSpot
                          ? placement.sweetSpotDuration * pixelsPerSecond
                          : 0;
                        const endTime =
                          placement.startTime + placement.duration;

                        const totalLanes = placement.totalLanes;
                        const laneHeight = (ROW_HEIGHT - 20) / totalLanes;
                        const laneTop = 10 + placement.lane * laneHeight;
                        const actualHeight = laneHeight - 2;

                        // Check if this ability is currently being dragged
                        const isBeingDragged =
                          draggedAbility &&
                          draggedAbility.placementId ===
                            placement.placementId &&
                          draggedFrom === "timeline";

                        return (
                          <React.Fragment key={placement.placementId}>
                            {/* Original position ghost (shown when dragging) */}
                            {isBeingDragged && (
                              <div
                                className="absolute rounded overflow-hidden pointer-events-none"
                                style={{
                                  left: `${
                                    placement.startTime * pixelsPerSecond
                                  }px`,
                                  width: `${
                                    placement.duration * pixelsPerSecond
                                  }px`,
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
                                  className="px-2 py-0.5 relative z-10 flex flex-col justify-center"
                                  style={{ height: "100%" }}
                                >
                                  <div className="text-sm font-semibold truncate">
                                    {placement.name}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Ability bar */}
                            <div
                              draggable
                              onDragStart={() =>
                                onDragStart(placement, "timeline")
                              }
                              onMouseEnter={(e) => {
                                setHoveredAbility(placement);
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
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
                                left: `${
                                  placement.startTime * pixelsPerSecond
                                }px`,
                                width: `${
                                  placement.duration * pixelsPerSecond
                                }px`,
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
                                className="px-2 py-0.5 relative z-10 flex flex-col justify-center"
                                style={{ height: "100%" }}
                              >
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
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Party comp column */}
        <div
          className="absolute top-0 left-0 pointer-events-none bg-gray-800"
          style={{ width: `${labelWidth}px` }}
        >
          <div style={{ height: "60px", marginBottom: "8px" }} />

          {/* Labels */}
          {PARTY_SLOTS.filter((slot) => partyComp[slot] !== null).map(
            (slot) => {
              const jobId = partyComp[slot];
              const job = jobId ? JOBS[jobId] : null;

              return (
                <div
                  key={slot}
                  className="bg-gray-800 px-2 py-1 text-sm font-semibold flex flex-col justify-center frozen-label pointer-events-auto mb-1"
                  style={{
                    width: "120px",
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  <div>{SLOT_LABELS[slot]}</div>
                  {job && <div className="text-xs opacity-75">{job.name}</div>}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredAbility && (
        <div
          className="fixed bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm shadow-lg z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: "translate(-50%, -100%)",
            minWidth: "200px",
          }}
        >
          <div className="font-semibold text-white mb-1">
            {hoveredAbility.name}
          </div>
          <div className="text-gray-300 text-xs space-y-1">
            <div>Job: {hoveredAbility.jobName}</div>
            <div>Duration: {hoveredAbility.duration}s</div>
            <div>Cooldown: {hoveredAbility.cooldown}s</div>
            {hoveredAbility.charges && hoveredAbility.charges > 1 && (
              <div>Charges: {hoveredAbility.charges}</div>
            )}
            {hoveredAbility.sweetSpotDuration && (
              <div>Sweet Spot: First {hoveredAbility.sweetSpotDuration}s</div>
            )}
            <div className="border-t border-gray-600 pt-1 mt-1">
              Placed: {formatTime(hoveredAbility.startTime)} -{" "}
              {formatTime(hoveredAbility.startTime + hoveredAbility.duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
