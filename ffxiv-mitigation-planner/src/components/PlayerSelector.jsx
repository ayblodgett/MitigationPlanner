import React from "react";
import { JOBS, PARTY_SLOTS, SLOT_LABELS } from "../data/jobs";

export default function PlayerSelector({
  partyComp,
  selectedSlot,
  onSelectSlot,
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3">Select Your Role</h2>
      <div className="flex gap-2">
        {PARTY_SLOTS.map((slot) => {
          const jobId = partyComp[slot];
          const job = jobId ? JOBS[jobId] : null;
          return (
            <button
              key={slot}
              onClick={() => onSelectSlot(slot)}
              className={`px-4 py-2 rounded transition-colors ${
                selectedSlot === slot
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              disabled={!jobId}
            >
              {SLOT_LABELS[slot]}
              {job && <div className="text-xs opacity-75">{job.name}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
