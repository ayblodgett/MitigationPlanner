import React from "react";

export default function AbilityPalette({ abilities, onDragStart }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-3">Available Abilities</h2>
      <div className="flex flex-wrap gap-2">
        {abilities.map((ability, idx) => (
          <div
            key={`${ability.slot}-${ability.id}-${idx}`}
            draggable
            onDragStart={() => onDragStart(ability, "palette")}
            className="px-3 py-2 rounded cursor-move hover:opacity-80 transition-opacity"
            style={{ backgroundColor: ability.color, color: "#000" }}
          >
            <div className="font-semibold text-sm">{ability.name}</div>
            <div className="text-xs opacity-75">
              {ability.jobName} • {ability.duration}s • CD: {ability.cooldown}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
