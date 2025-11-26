import React from "react";
import { JOBS, PARTY_SLOTS, SLOT_LABELS } from "../data/jobs";

export default function PartyComposition({ partyComp, setPartyComp }) {
  const getSlotRole = (slot) => {
    if (slot.startsWith("tank")) return "Tank";
    if (slot.startsWith("healer")) return "Healer";
    if (slot.startsWith("dps")) return "DPS";
    return null;
  };

  const getJobsByCategory = (slotRole) => {
    if (slotRole === "Tank") {
      return {
        Tanks: Object.entries(JOBS).filter(([_, job]) => job.role === "Tank"),
      };
    } else if (slotRole === "Healer") {
      return {
        Healers: Object.entries(JOBS).filter(
          ([_, job]) => job.role === "Healer"
        ),
      };
    } else if (slotRole === "DPS") {
      return {
        Melee: Object.entries(JOBS).filter(([_, job]) => job.role === "Melee"),
        "Physical Ranged": Object.entries(JOBS).filter(
          ([_, job]) => job.role === "Physical_Ranged"
        ),
        "Magical Ranged": Object.entries(JOBS).filter(
          ([_, job]) => job.role === "Magical_Ranged"
        ),
      };
    }
    return {};
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3">Party Composition</h2>
      <div className="grid grid-cols-4 gap-3">
        {PARTY_SLOTS.map((slot) => {
          const slotRole = getSlotRole(slot);
          const jobCategories = getJobsByCategory(slotRole);

          return (
            <div key={slot}>
              <label className="block text-sm text-gray-400 mb-1">
                {SLOT_LABELS[slot]}
              </label>
              <select
                value={partyComp[slot] || ""}
                onChange={(e) =>
                  setPartyComp({ ...partyComp, [slot]: e.target.value || null })
                }
                className="w-full bg-gray-700 rounded px-3 py-2"
              >
                <option value="">None</option>
                {Object.entries(jobCategories).map(([categoryName, jobs]) => (
                  <optgroup key={categoryName} label={categoryName}>
                    {jobs.map(([id, job]) => (
                      <option key={id} value={id}>
                        {job.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
