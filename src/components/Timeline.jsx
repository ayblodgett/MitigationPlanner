import React, { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { JOBS, PARTY_SLOTS, SLOT_LABELS } from "../data/jobs";
import { ROW_HEIGHT } from "../data/bossTimelines";
import {
  checkCooldownConflict,
  formatTime,
} from "../utils/cooldownCalculations";

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
}) {
  const timelineContainerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 });

  const timelineWidth = timeline.duration * pixelsPerSecond;
  const labelWidth = 128;

  // Dynamic marker interval based on zoom level
  const getMarkerInterval = () => {
    const pixelsPerMarker = 100; // Target: ~100 pixels between markers
    const secondsPerMarker = pixelsPerMarker / pixelsPerSecond;

    // Round to nearest "nice" interval
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

  // Handle scroll wheel zoom
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.target.closest(".timeline-scroll-area")) {
        e.preventDefault();

        const delta = -Math.sign(e.deltaY);
        const newZoom = Math.max(1, Math.min(8, zoom + delta));

        if (newZoom !== zoom) {
          const scrollLeft = container.scrollLeft;
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          const scrollRatio = scrollLeft / (scrollWidth - clientWidth);

          onZoomChange(newZoom);

          requestAnimationFrame(() => {
            const newScrollWidth = container.scrollWidth;
            const newClientWidth = container.clientWidth;
            container.scrollLeft =
              scrollRatio * (newScrollWidth - newClientWidth);
          });
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, onZoomChange]);

  // Handle click and drag to pan
  const handleMouseDown = (e) => {
    if (
      e.target.closest(".ability-block") ||
      e.target.closest("button") ||
      e.target.closest(".frozen-label")
    ) {
      return;
    }

    const container = timelineContainerRef.current;
    if (!container) return;

    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      scrollLeft: container.scrollLeft,
    });

    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const container = timelineContainerRef.current;
    if (!container) return;

    const dx = e.clientX - panStart.x;
    container.scrollLeft = panStart.scrollLeft - dx;
  };

  const handleMouseUp = () => {
    if (!isPanning) return;

    const container = timelineContainerRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "";
    }

    setIsPanning(false);
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3">
        Boss Timeline - {timeline.name}{" "}
        <span className="text-sm text-gray-400">
          (Scroll to zoom: {zoom}x, Click and drag to pan)
        </span>
      </h2>

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

          <div
            className="relative mb-2"
            style={{
              height: "60px",
              minWidth: `${timelineWidth + labelWidth}px`,
              clipPath: `inset(0 0 0 ${labelWidth}px)`,
            }}
          >
            {/* Boss timeline labels  */}
            {timeline.attacks.map((attack, idx) => (
              <div
                key={`attack-${idx}`}
                className="absolute bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap"
                style={{
                  left: `${attack.time * pixelsPerSecond + labelWidth}px`,
                  top: "5px",
                  transform: "translateX(-50%)",
                }}
              >
                {attack.name}
              </div>
            ))}

            {/* Time markers */}
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute text-xs text-gray-400"
                style={{
                  left: `${time * pixelsPerSecond + labelWidth}px`,
                  bottom: "5px",
                  transform: time === 0 ? "none" : "translateX(-50%)", // Don't center 0:00 otherwise it's out of bounds
                }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          {/* Timeline rows */}
          <div className="relative">
            {PARTY_SLOTS.map((slot, index) => {
              const jobId = partyComp[slot];
              const job = jobId ? JOBS[jobId] : null;
              const slotPlacements = placements.filter((p) => p.slot === slot);

              return (
                <div
                  key={slot}
                  className="relative mb-1"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  {/* Drop zone row */}
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
                            opacity: 0.5,
                            border: "2px dashed #fff",
                          }}
                        >
                          {/* Ability sweet spot overlay in preview */}
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
                            className="px-2 py-1 text-sm font-semibold truncate"
                            style={{ color: "#000" }}
                          >
                            {draggedAbility.name}
                          </div>
                        </div>
                      )}

                    {/* Placed abilities */}
                    {slotPlacements.map((placement) => {
                      const hasSweetSpot =
                        placement.sweetSpotDuration &&
                        placement.sweetSpotDuration > 0;
                      const sweetSpotWidth = hasSweetSpot
                        ? placement.sweetSpotDuration * pixelsPerSecond
                        : 0;

                      return (
                        <div
                          key={placement.placementId}
                          draggable
                          onDragStart={() => onDragStart(placement, "timeline")}
                          className="absolute rounded cursor-move group ability-block overflow-hidden"
                          style={{
                            left: `${placement.startTime * pixelsPerSecond}px`,
                            width: `${placement.duration * pixelsPerSecond}px`,
                            top: "10px",
                            height: "40px",
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
                          {/* Ability sweet spot overlay on placed abilities */}
                          {hasSweetSpot && (
                            <div
                              className="absolute top-0 left-0 h-full pointer-events-none"
                              style={{
                                width: `${sweetSpotWidth}px`,
                                backgroundColor: "rgba(0, 0, 0, 0.2)", // 20% darker
                              }}
                            />
                          )}

                          <div className="px-2 py-1 text-sm font-semibold truncate relative z-10">
                            {placement.name}
                          </div>
                          <button
                            onClick={() =>
                              onRemovePlacement(placement.placementId)
                            }
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
            })}
          </div>
        </div>

        {/* Party composition column  */}
        <div
          className="absolute top-0 left-0 pointer-events-none bg-gray-800"
          style={{ width: `${labelWidth}px` }}
        >
          {/* Empty space for time markers + attack labels */}
          <div style={{ height: "60px", marginBottom: "8px" }} />

          {/* Labels */}
          {PARTY_SLOTS.map((slot) => {
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
          })}
        </div>
      </div>
    </div>
  );
}
