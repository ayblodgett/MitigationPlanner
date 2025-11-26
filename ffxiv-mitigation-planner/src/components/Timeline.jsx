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
  onDropOnRow,
  onDragStart,
  onRemovePlacement,
  pixelsPerSecond,
  zoom,
  onZoomChange,
}) {
  const timelineContainerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 });

  const timelineWidth = timeline.duration * pixelsPerSecond;
  const labelWidth = 128;
  const attackLabelHeight = 40; // Height for boss attack labels row

  const markerInterval = timeline.duration > 300 ? 30 : 10;
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

          {/* Time markers - with clip path */}
          <div
            className="relative mb-2"
            style={{
              height: "30px",
              minWidth: `${timelineWidth + labelWidth}px`,
              clipPath: `inset(0 0 0 ${labelWidth}px)`,
            }}
          >
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute text-xs text-gray-400"
                style={{ left: `${time * pixelsPerSecond + labelWidth}px` }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          {/* Boss attack timeline - separate row above all player rows */}
          <div
            className="relative mb-2"
            style={{ height: `${attackLabelHeight}px` }}
          >
            <div
              className="relative"
              style={{
                width: `${timelineWidth}px`,
                height: `${attackLabelHeight}px`,
                marginLeft: `${labelWidth}px`,
              }}
            >
              {/* Boss attack labels only (no vertical lines) */}
              {timeline.attacks.map((attack, idx) => (
                <div
                  key={idx}
                  className="absolute bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap"
                  style={{
                    left: `${attack.time * pixelsPerSecond}px`,
                    top: "50%",
                    transform: "translate(-50%, -50%)", // Center the label on the attack time
                  }}
                >
                  {attack.name}
                </div>
              ))}
            </div>
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
                    onDrop={(e) => onDropOnRow(e, slot)}
                  >
                    {/* Boss attack vertical lines (no labels) */}
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
                    {slotPlacements.map((placement) => (
                      <div
                        key={placement.placementId}
                        draggable
                        onDragStart={() => onDragStart(placement, "timeline")}
                        className="absolute rounded cursor-move group ability-block"
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
                        <div className="px-2 py-1 text-sm font-semibold truncate">
                          {placement.name}
                        </div>
                        <button
                          onClick={() =>
                            onRemovePlacement(placement.placementId)
                          }
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frozen label column - overlaid on top with solid background */}
        <div
          className="absolute top-0 left-0 pointer-events-none bg-gray-800"
          style={{ width: `${labelWidth}px` }}
        >
          {/* Empty space for time markers */}
          <div style={{ height: "30px", marginBottom: "8px" }} />

          {/* Empty space for boss attack row */}
          <div
            style={{ height: `${attackLabelHeight}px`, marginBottom: "8px" }}
          />

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
