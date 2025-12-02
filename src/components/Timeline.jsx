import React, { useRef, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { PARTY_SLOTS } from "../data/jobs";
import { ROW_HEIGHT, PIXELS_PER_SECOND } from "../data/bossTimelines";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { useTimelinePan } from "../hooks/useTimelinePan";
import { calculateAbilityLanes } from "../utils/laneCalculations";
import TimeMarkers from "./timeline/TimeMarkers";
import TimelineRow from "./timeline/TimelineRow";
import PartyList from "./timeline/PartyList";
import AbilityTooltip from "./timeline/AbilityTooltip";
import DragPreview from "./timeline/DragPreview";

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
          <TimeMarkers
            timeline={timeline}
            timeMarkers={timeMarkers}
            pixelsPerSecond={pixelsPerSecond}
            labelWidth={labelWidth}
            timelineWidth={timelineWidth}
          />

          {/* Timeline rows */}
          <div className="relative">
            {PARTY_SLOTS.filter((slot) => partyComp[slot] !== null).map(
              (slot) => {
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
                      <DragPreview
                        dragPreview={dragPreview}
                        slot={slot}
                        draggedAbility={draggedAbility}
                        draggedFrom={draggedFrom}
                        pixelsPerSecond={pixelsPerSecond}
                        placements={slotPlacements}
                      />

                      {/* Placed abilities */}
                      <TimelineRow
                        slot={slot}
                        placementsWithLanes={placementsWithLanes}
                        pixelsPerSecond={pixelsPerSecond}
                        onDragStart={onDragStart}
                        onRemovePlacement={onRemovePlacement}
                        setHoveredAbility={setHoveredAbility}
                        setTooltipPosition={setTooltipPosition}
                        placements={placements}
                        draggedAbility={draggedAbility}
                        draggedFrom={draggedFrom}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Party comp column */}
        <PartyList partyComp={partyComp} labelWidth={labelWidth} />
      </div>

      {/* Tooltip */}
      <AbilityTooltip
        hoveredAbility={hoveredAbility}
        tooltipPosition={tooltipPosition}
      />
    </div>
  );
}
