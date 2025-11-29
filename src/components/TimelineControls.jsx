import React from "react";
import { formatTime } from "../utils/cooldownCalculations";
import PlanManager from "./PlanManager";

export default function TimelineControls({
  currentTimeline,
  onTimelineChange,
  availableTimelines,
  currentPlanId,
  onPlanChange,
  partyComp,
  placements,
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">FFXIV Mitigation Planner</h1>
        {/* Boss selector and plan management */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Boss:</label>
            <select
              value={currentTimeline}
              onChange={(e) => onTimelineChange(e.target.value)}
              className="bg-gray-700 rounded px-4 py-2"
            >
              {Object.entries(availableTimelines).map(([id, timeline]) => (
                <option key={id} value={id}>
                  {timeline.name} ({formatTime(timeline.duration)})
                </option>
              ))}
            </select>
          </div>

          <PlanManager
            currentTimeline={currentTimeline}
            currentPlanId={currentPlanId}
            onPlanChange={onPlanChange}
            partyComp={partyComp}
            placements={placements}
          />
        </div>
      </div>
    </div>
  );
}
