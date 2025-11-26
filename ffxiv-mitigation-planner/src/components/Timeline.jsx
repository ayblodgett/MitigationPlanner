import React from "react";
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
}) {
  const timelineWidth = timeline.duration * pixelsPerSecond;
  const labelWidth = 128; // Must match ml-32 (32 * 4px = 128px)

  const markerInterval = timeline.duration > 300 ? 30 : 10;
  const timeMarkers = Array.from(
    { length: Math.floor(timeline.duration / markerInterval) + 1 },
    (_, i) => i * markerInterval
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3">
        Boss Timeline - {timeline.name}
      </h2>

      <div className="overflow-x-auto">
        {/* Time markers - now aligned with timeline */}
        <div
          className="relative mb-2"
          style={{
            height: "30px",
            minWidth: `${timelineWidth + labelWidth}px`,
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

        {/* Timeline rows - one per party member */}
        <div className="relative">
          {PARTY_SLOTS.map((slot, index) => {
            const jobId = partyComp[slot];
            const job = jobId ? JOBS[jobId] : null;
            const slotPlacements = placements.filter((p) => p.slot === slot);

            return (
              <div key={slot} className="relative mb-1">
                {/* Row label */}
                <div
                  className="absolute left-0 z-20 bg-gray-800 px-2 py-1 text-sm font-semibold flex flex-col justify-center"
                  style={{
                    width: "120px",
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  <div>{SLOT_LABELS[slot]}</div>
                  {job && <div className="text-xs opacity-75">{job.name}</div>}
                </div>

                {/* Drop zone row */}
                <div
                  className="relative bg-gray-700 rounded ml-32"
                  style={{
                    width: `${timelineWidth}px`,
                    height: `${ROW_HEIGHT}px`,
                    backgroundImage: `repeating-linear-gradient(90deg, #4a5568 0px, #4a5568 1px, transparent 1px, transparent ${
                      pixelsPerSecond * 5
                    }px)`,
                  }}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropOnRow(e, slot)}
                >
                  {/* Boss attacks (show on all rows) */}
                  {timeline.attacks.map((attack, idx) => (
                    <div
                      key={idx}
                      className="absolute w-1 bg-red-500 opacity-50"
                      style={{
                        left: `${attack.time * pixelsPerSecond}px`,
                        top: 0,
                        height: "100%",
                      }}
                    >
                      {index === 0 && (
                        <div className="absolute top-1 left-2 bg-red-900 px-1 py-0.5 rounded text-xs whitespace-nowrap z-10">
                          {attack.name}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Placed abilities for this slot */}
                  {slotPlacements.map((placement) => (
                    <div
                      key={placement.placementId}
                      draggable
                      onDragStart={() => onDragStart(placement, "timeline")}
                      className="absolute rounded cursor-move group"
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
                        onClick={() => onRemovePlacement(placement.placementId)}
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
    </div>
  );
}
