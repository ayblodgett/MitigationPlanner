import React, { useState } from "react";
import PartyComposition from "./components/PartyComposition";
import PlayerSelector from "./components/PlayerSelector";
import PlayerAbilities from "./components/PlayerAbilities";
import Timeline from "./components/Timeline";
import TimelineControls from "./components/TimelineControls";
import { JOBS } from "./data/jobs";
import { BOSS_TIMELINES, PIXELS_PER_SECOND } from "./data/bossTimelines";
import {
  checkCooldownConflict,
  getAbilitiesForSlot,
} from "./utils/cooldownCalculations";

export default function MitigationPlanner() {
  const [partyComp, setPartyComp] = useState({
    tank1: "PLD",
    tank2: "WAR",
    healer1: "WHM",
    healer2: "SCH",
    dps1: null,
    dps2: null,
    dps3: null,
    dps4: null,
  });

  const [placements, setPlacements] = useState([]);
  const [draggedAbility, setDraggedAbility] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [currentTimeline, setCurrentTimeline] = useState("sample-boss");
  const [zoom, setZoom] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState("tank1");

  const timeline = BOSS_TIMELINES[currentTimeline];
  const pixelsPerSecond = PIXELS_PER_SECOND * (zoom / 4);
  const selectedAbilities = getAbilitiesForSlot(partyComp, selectedSlot, JOBS);

  const handleTimelineChange = (newTimeline) => {
    setCurrentTimeline(newTimeline);
    setPlacements([]);
  };

  const handleDragStart = (ability, from = "palette") => {
    setDraggedAbility(ability);
    setDraggedFrom(from);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const snapToGrid = (time) => {
    return Math.round(time); // Always snap to nearest second
  };

  const handleDropOnRow = (e, slot) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedAbility) return;

    if (draggedAbility.slot !== slot) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      return;
    }

    const rowRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rowRect.left;
    const rawTime = Math.max(0, x / pixelsPerSecond);
    const startTime = snapToGrid(rawTime);

    if (startTime + draggedAbility.duration > timeline.duration) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      return;
    }

    const hasConflict = checkCooldownConflict(
      placements,
      draggedAbility,
      startTime
    );

    if (!hasConflict) {
      if (draggedFrom === "palette") {
        setPlacements([
          ...placements,
          {
            ...draggedAbility,
            startTime,
            placementId: Date.now() + Math.random(),
          },
        ]);
      } else if (draggedFrom === "timeline") {
        setPlacements(
          placements.map((p) =>
            p.placementId === draggedAbility.placementId
              ? { ...p, startTime }
              : p
          )
        );
      }
    }

    setDraggedAbility(null);
    setDraggedFrom(null);
  };

  const removePlacement = (placementId) => {
    setPlacements(placements.filter((p) => p.placementId !== placementId));
  };

  const clearAll = () => {
    setPlacements([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <TimelineControls
          onClearAll={clearAll}
          currentTimeline={currentTimeline}
          onTimelineChange={handleTimelineChange}
          availableTimelines={BOSS_TIMELINES}
        />

        <PartyComposition partyComp={partyComp} setPartyComp={setPartyComp} />

        <PlayerSelector
          partyComp={partyComp}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        <PlayerAbilities
          selectedSlot={selectedSlot}
          partyComp={partyComp}
          abilities={selectedAbilities}
          onDragStart={handleDragStart}
        />

        <Timeline
          timeline={timeline}
          placements={placements}
          partyComp={partyComp}
          onDragOver={handleDragOver}
          onDropOnRow={handleDropOnRow}
          onDragStart={handleDragStart}
          onRemovePlacement={removePlacement}
          pixelsPerSecond={pixelsPerSecond}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    </div>
  );
}
