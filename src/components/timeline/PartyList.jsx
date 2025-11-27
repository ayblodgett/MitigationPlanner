import React from "react";
import { PARTY_SLOTS, SLOT_LABELS } from "../../data/jobs";
import { JOBS } from "../../data/jobs";
import { ROW_HEIGHT } from "../../data/bossTimelines";

export default function PartyList({ partyComp, labelWidth }) {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none bg-gray-800"
      style={{ width: `${labelWidth}px` }}
    >
      <div style={{ height: "60px", marginBottom: "8px" }} />

      {PARTY_SLOTS.filter((slot) => partyComp[slot] !== null).map((slot) => {
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
  );
}
