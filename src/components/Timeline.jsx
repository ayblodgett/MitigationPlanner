import React, { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { PARTY_SLOTS } from "../data/jobs";
import { formatTime } from "../utils/cooldownCalculations";
import { calculateAbilityLanes } from "../utils/laneCalculations";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { useTimelinePan } from "../hooks/useTimelinePan";
import TimeMarkers from "./timeline/TimeMarkers";
import TimelineRow from "./timeline/TimelineRow";
import DragPreview from "./timeline/DragPreview";
import PartyList from "./timeline/PartyList";
import AbilityTooltip from "./timeline/AbilityTooltip";

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
  onClearAll,
}) {
  const timelineContainerRef = useRef(null);
  const [hoveredAbility, setHoveredAbility] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const timelineWidth = timeline.duration * pixelsPerSecond;
  const labelWidth = 128;

  // Use custom hooks for zoom and pan
  useTimelineZoom(timelineContainerRef, zoom, onZoomChange);
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
      {/* Timeline header with Clear button */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">
          Boss Timeline - {timeline.name}{" "}
          <span className="text-sm text-gray-400">
            (Scroll to zoom: {zoom}x, Click and drag to pan)
          </span>
        </h2>

        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          <RotateCcw size={16} />
          Clear Timeline
        </button>
      </div>

      <div className="relative">
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

          <TimeMarkers
            timeline={timeline}
            timeMarkers={timeMarkers}
            pixelsPerSecond={pixelsPerSecond}
            labelWidth={labelWidth}
            timelineWidth={timelineWidth}
          />

          <div className="relative">
            {PARTY_SLOTS.filter((slot) => partyComp[slot] !== null).map(
              (slot) => {
                const slotPlacements = placements.filter(
                  (p) => p.slot === slot
                );
                const placementsWithLanes =
                  calculateAbilityLanes(slotPlacements);

                return (
                  <React.Fragment key={slot}>
                    <DragPreview
                      dragPreview={dragPreview}
                      slot={slot}
                      draggedAbility={draggedAbility}
                      pixelsPerSecond={pixelsPerSecond}
                    />

                    <TimelineRow
                      slot={slot}
                      job={partyComp[slot]}
                      timeline={timeline}
                      placementsWithLanes={placementsWithLanes}
                      pixelsPerSecond={pixelsPerSecond}
                      timelineWidth={timelineWidth}
                      labelWidth={labelWidth}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDropOnRow={onDropOnRow}
                      onDragStart={onDragStart}
                      onRemovePlacement={onRemovePlacement}
                      setHoveredAbility={setHoveredAbility}
                      setTooltipPosition={setTooltipPosition}
                      placements={placements}
                    />
                  </React.Fragment>
                );
              }
            )}
          </div>
        </div>

        <PartyList partyComp={partyComp} labelWidth={labelWidth} />
      </div>

      <AbilityTooltip
        hoveredAbility={hoveredAbility}
        tooltipPosition={tooltipPosition}
      />
    </div>
  );
}
