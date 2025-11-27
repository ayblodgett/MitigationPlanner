import React from "react";
import { formatTime } from "../../utils/cooldownCalculations";

export default function AbilityTooltip({ hoveredAbility, tooltipPosition }) {
  if (!hoveredAbility) return null;

  return (
    <div
      className="fixed bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm shadow-lg z-50 pointer-events-none"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y - 10}px`,
        transform: "translate(-50%, -100%)",
        minWidth: "200px",
      }}
    >
      <div className="font-semibold text-white mb-1">{hoveredAbility.name}</div>
      <div className="text-gray-300 text-xs space-y-1">
        <div>Job: {hoveredAbility.jobName}</div>
        <div>Duration: {hoveredAbility.duration}s</div>
        <div>Cooldown: {hoveredAbility.cooldown}s</div>
        {hoveredAbility.charges && hoveredAbility.charges > 1 && (
          <div>Charges: {hoveredAbility.charges}</div>
        )}
        {hoveredAbility.sweetSpotDuration && (
          <div>Sweet Spot: First {hoveredAbility.sweetSpotDuration}s</div>
        )}
        <div className="border-t border-gray-600 pt-1 mt-1">
          Placed: {formatTime(hoveredAbility.startTime)} -{" "}
          {formatTime(hoveredAbility.startTime + hoveredAbility.duration)}
        </div>
      </div>
    </div>
  );
}
