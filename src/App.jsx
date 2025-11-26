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
    tank2: "DRK",
    healer1: "SCH",
    healer2: "AST",
    dps1: "DRG",
    dps2: "RDM",
    dps3: "BRD",
    dps4: "PCT",
  });

  const [placements, setPlacements] = useState([]);
  const [draggedAbility, setDraggedAbility] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
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

  const snapToGrid = (time) => {
    return Math.round(time); // Always snap to nearest second
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    // Calculate preview position if dragging an ability
    if (draggedAbility) {
      const rowRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rowRect.left;
      const rawTime = Math.max(0, x / pixelsPerSecond);

      // Center the ability on the cursor position
      const halfDuration = draggedAbility.duration / 2;
      const startTime = snapToGrid(rawTime - halfDuration);

      // Only show preview if within timeline bounds
      if (
        startTime >= 0 &&
        startTime + draggedAbility.duration <= timeline.duration
      ) {
        setDragPreview({
          startTime,
          slot: draggedAbility.slot,
        });
      } else {
        setDragPreview(null);
      }
    }
  };

  const handleDragLeave = (e) => {
    // Clear preview when leaving the timeline
    if (
      e.currentTarget === e.target ||
      !e.currentTarget.contains(e.relatedTarget)
    ) {
      setDragPreview(null);
    }
  };

  const handleDropOnRow = (e, slot) => {
    e.preventDefault();
    e.stopPropagation();

    setDragPreview(null); // Clear preview on drop

    if (!draggedAbility) return;

    // Only allow dropping if ability belongs to this slot
    if (draggedAbility.slot !== slot) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      return;
    }

    const rowRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rowRect.left;
    const rawTime = Math.max(0, x / pixelsPerSecond);

    // Center the ability on the cursor position
    const halfDuration = draggedAbility.duration / 2;
    const startTime = Math.max(0, snapToGrid(rawTime - halfDuration));

    if (startTime + draggedAbility.duration > timeline.duration) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      return;
    }

    // When moving existing abilities, exclude the ability being moved from conflict check
    const excludeId =
      draggedFrom === "timeline" ? draggedAbility.placementId : null;
    const hasConflict = checkCooldownConflict(
      placements,
      draggedAbility,
      startTime,
      excludeId
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
          onDragLeave={handleDragLeave}
          onDropOnRow={handleDropOnRow}
          onDragStart={handleDragStart}
          onRemovePlacement={removePlacement}
          pixelsPerSecond={pixelsPerSecond}
          zoom={zoom}
          onZoomChange={setZoom}
          draggedAbility={draggedAbility}
          dragPreview={dragPreview}
        />
      </div>
    </div>
  );
}
