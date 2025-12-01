import React from "react";
import { JOBS, SLOT_LABELS } from "../data/jobs";

export default function PlayerAbilities({
  selectedSlot,
  partyComp,
  abilities,
  onDragStart,
}) {
  const jobId = partyComp[selectedSlot];
  const jobName = jobId ? JOBS[jobId].name : "None";
  const jobIcon = jobId ? JOBS[jobId].icon : null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        {jobIcon && <img src={jobIcon} alt="" className="w-8 h-8" />}
        <span>
          Your Abilities - {SLOT_LABELS[selectedSlot]} ({jobName})
        </span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {abilities.length > 0 ? (
          abilities.map((ability, idx) => (
            <div
              key={`${ability.slot}-${ability.id}-${idx}`}
              draggable
              onDragStart={() => onDragStart(ability, "palette")}
              className="px-3 py-2 rounded cursor-move hover:opacity-80 transition-opacity"
              style={{ backgroundColor: ability.color, color: "#000" }}
            >
              <div className="flex items-center gap-2 mb-1">
                {ability.icon && (
                  <img src={ability.icon} alt="" className="w-6 h-6" />
                )}
                <div className="font-semibold text-sm">{ability.name}</div>
              </div>
              <div className="text-xs opacity-75">
                {ability.duration}s • CD: {ability.cooldown}s
                {ability.charges &&
                  ability.charges > 1 &&
                  ` • ${ability.charges} charges`}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">
            No job selected or no abilities available
          </div>
        )}
      </div>
    </div>
  );
}
