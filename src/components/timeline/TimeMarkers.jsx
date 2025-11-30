import React from "react";
import { formatTime } from "../../utils/cooldownCalculations";
import { calculateLabelLanes } from "../../utils/laneCalculations";

export default function TimeMarkers({
  timeline,
  timeMarkers,
  pixelsPerSecond,
  labelWidth,
  timelineWidth,
}) {
  const { items: attacksWithLanes, totalLanes } = calculateLabelLanes(
    timeline.attacks,
    pixelsPerSecond,
    labelWidth
  );

  const labelHeight = totalLanes === 1 ? 20 : 35 / totalLanes;

  return (
    <div
      className="relative mb-2"
      style={{
        height: "60px",
        minWidth: `${timelineWidth + labelWidth}px`,
        clipPath: `inset(0 0 0 ${labelWidth}px)`,
      }}
    >
      {/* Boss attack labels */}
      {attacksWithLanes.map((attack) => {
        const laneTop = 5 + attack.lane * labelHeight;

        // Calculate position, adjusting if it would overflow the right edge
        const idealLeft = attack.time * pixelsPerSecond + labelWidth;
        const labelWidthPx = attack.estimatedWidth;
        const timelineRightEdge = timelineWidth + labelWidth;

        // Check if label would overflow right edge when centered
        const wouldOverflowRight =
          idealLeft + labelWidthPx / 2 > timelineRightEdge;

        let leftPosition, transform;
        if (wouldOverflowRight) {
          // Align right edge of label with timeline right edge
          leftPosition = timelineRightEdge;
          transform = "translateX(-100%)";
        } else {
          // Center normally
          leftPosition = idealLeft;
          transform = "translateX(-50%)";
        }

        return (
          <div
            key={`attack-${attack.id}`}
            className="absolute bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap"
            style={{
              left: `${leftPosition}px`,
              top: `${laneTop}px`,
              transform: transform,
              fontSize: totalLanes > 2 ? "10px" : "12px",
              lineHeight:
                totalLanes === 1
                  ? "16px"
                  : `${Math.max(12, labelHeight - 4)}px`,
            }}
          >
            {attack.name}
          </div>
        );
      })}

      {/* Time markers */}
      {timeMarkers.map((time) => (
        <div
          key={time}
          className="absolute text-xs text-gray-400"
          style={{
            left: `${time * pixelsPerSecond + labelWidth}px`,
            bottom: "5px",
            transform: time === 0 ? "none" : "translateX(-50%)",
          }}
        >
          {formatTime(time)}
        </div>
      ))}
    </div>
  );
}
