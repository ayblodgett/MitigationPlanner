import React from "react";
import { JOBS, PARTY_SLOTS } from "../data/jobs";

export default function PartyComposition({ partyComp, setPartyComp }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3">Party Composition</h2>
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(PARTY_SLOTS).map(([slotId, slotInfo]) => (
          <div key={slotId}>
            <label className="block text-sm text-gray-400 mb-1">
              {slotInfo.label}
            </label>
            <select
              value={partyComp[slotId] || ""}
              onChange={(e) =>
                setPartyComp({ ...partyComp, [slotId]: e.target.value || null })
              }
              className="w-full bg-gray-700 rounded px-3 py-2"
            >
              <option value="">None</option>
              {Object.entries(JOBS)
                .filter(([_, job]) => job.role === slotInfo.role)
                .map(([id, job]) => (
                  <option key={id} value={id}>
                    {job.name}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
