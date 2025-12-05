import React, { useState, useEffect } from "react";
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
import { loadPlan, savePlan } from "./utils/planStorage";
import {
  snapToValidZone,
  calculateValidDropZones,
} from "./utils/validDropZones";

export default function MitigationPlanner() {
  const [partyComp, setPartyComp] = useState({
    tank1: "PLD",
    tank2: "WAR",
    healer1: "AST",
    healer2: "SCH",
    dps1: "DRG",
    dps2: "RDM",
    dps3: "BRD",
    dps4: "PCT",
  });

  const [placements, setPlacements] = useState([]);
  const [draggedAbility, setDraggedAbility] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [isDraggingOnTimeline, setIsDraggingOnTimeline] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentTimeline, setCurrentTimeline] = useState("dancing-green");
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [zoom, setZoom] = useState(4);
  const [selectedSlot, setSelectedSlot] = useState("tank1");

  const timeline = BOSS_TIMELINES[currentTimeline];
  const pixelsPerSecond = PIXELS_PER_SECOND * (zoom / 4);
  const selectedAbilities = getAbilitiesForSlot(partyComp, selectedSlot, JOBS);

  // Auto-save when placements or party comp changes
  useEffect(() => {
    if (currentPlanId) {
      const planData = loadPlan(currentPlanId);
      if (planData) {
        savePlan(currentPlanId, {
          ...planData,
          partyComp,
          placements,
        });
      }
    }
  }, [placements, partyComp, currentPlanId]);

  const handleTimelineChange = (newTimeline) => {
    setCurrentTimeline(newTimeline);
    setCurrentPlanId(null);
    setPlacements([]);
  };

  const handlePlanChange = (planId) => {
    if (!planId) {
      setCurrentPlanId(null);
      setPlacements([]);
      return;
    }

    const plan = loadPlan(planId);
    if (plan) {
      setCurrentPlanId(planId);
      setPartyComp(plan.partyComp || partyComp);
      setPlacements(plan.placements || []);

      if (plan.bossId !== currentTimeline) {
        setCurrentTimeline(plan.bossId);
      }
    }
  };

  const handleDragStart = (ability, from = "palette", clickOffset = 0) => {
    setDraggedAbility(ability);
    setDraggedFrom(from);
    setDragOffset(clickOffset);
    setIsDraggingOnTimeline(false);
  };

  const snapToGrid = (time) => {
    return Math.round(time);
  };

  const completePlacement = (startTime, slot) => {
    if (!draggedAbility || draggedAbility.slot !== slot) {
      return false;
    }

    if (startTime < 0 || startTime > timeline.duration) {
      return false;
    }

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
      return true;
    }
    return false;
  };

  const handleDragOver = (e) => {
    e.preventDefault();

    setIsDraggingOnTimeline(true);

    if (draggedAbility) {
      const rowRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rowRect.left;
      const rawTime = Math.max(0, x / pixelsPerSecond);
      const startTime = snapToGrid(rawTime - dragOffset);

      // Only check if start time is within timeline bounds
      if (startTime >= 0 && startTime <= timeline.duration) {
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

    const previewToUse = dragPreview;

    setDragPreview(null);
    setIsDraggingOnTimeline(false);

    if (!draggedAbility) return;

    if (draggedAbility.slot !== slot) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      setDragOffset(0);
      return;
    }

    let startTime;
    if (previewToUse && previewToUse.slot === slot) {
      const excludeId =
        draggedFrom === "timeline" ? draggedAbility.placementId : null;
      const validZones = calculateValidDropZones(
        placements,
        draggedAbility,
        timeline.duration,
        excludeId
      );
      startTime = snapToValidZone(
        previewToUse.startTime,
        validZones,
        draggedAbility
      );
    } else {
      const rowRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rowRect.left;
      const rawTime = Math.max(0, x / pixelsPerSecond);
      const unsnappedTime = Math.max(0, snapToGrid(rawTime - dragOffset));

      // Snap to valid zones
      const excludeId =
        draggedFrom === "timeline" ? draggedAbility.placementId : null;
      const validZones = calculateValidDropZones(
        placements,
        draggedAbility,
        timeline.duration,
        excludeId
      );
      startTime = snapToValidZone(unsnappedTime, validZones, draggedAbility);
    }

    if (completePlacement(startTime, slot)) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      setDragOffset(0);
    } else {
      setDraggedAbility(null);
      setDraggedFrom(null);
      setDragOffset(0);
    }
  };

  const removePlacement = (placementId) => {
    setPlacements(placements.filter((p) => p.placementId !== placementId));
  };

  const clearAll = () => {
    if (confirm("Clear all abilities from the timeline?")) {
      setPlacements([]);
    }
  };

  // Global drop handler
  useEffect(() => {
    const handleGlobalDrop = (e) => {
      if (isDraggingOnTimeline && draggedAbility && dragPreview) {
        e.preventDefault();

        const slot = draggedAbility.slot;

        // Snap the preview time to valid zones before placing
        const excludeId =
          draggedFrom === "timeline" ? draggedAbility.placementId : null;
        const validZones = calculateValidDropZones(
          placements,
          draggedAbility,
          timeline.duration,
          excludeId
        );
        const startTime = snapToValidZone(
          dragPreview.startTime,
          validZones,
          draggedAbility
        );

        setDragPreview(null);
        setIsDraggingOnTimeline(false);

        if (completePlacement(startTime, slot)) {
          setDraggedAbility(null);
          setDraggedFrom(null);
          setDragOffset(0);
        } else {
          setDraggedAbility(null);
          setDraggedFrom(null);
          setDragOffset(0);
        }
      }
    };

    const handleGlobalDragEnd = (e) => {
      if (draggedAbility) {
        setDraggedAbility(null);
        setDraggedFrom(null);
        setDragPreview(null);
        setIsDraggingOnTimeline(false);
        setDragOffset(0);
      }
    };

    document.addEventListener("drop", handleGlobalDrop);
    document.addEventListener("dragend", handleGlobalDragEnd);

    return () => {
      document.removeEventListener("drop", handleGlobalDrop);
      document.removeEventListener("dragend", handleGlobalDragEnd);
    };
  }, [
    isDraggingOnTimeline,
    draggedAbility,
    dragPreview,
    draggedFrom,
    placements,
    timeline.duration,
    pixelsPerSecond,
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <TimelineControls
          currentTimeline={currentTimeline}
          onTimelineChange={handleTimelineChange}
          availableTimelines={BOSS_TIMELINES}
          currentPlanId={currentPlanId}
          onPlanChange={handlePlanChange}
          partyComp={partyComp}
          placements={placements}
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
          draggedFrom={draggedFrom}
          onClearAll={clearAll}
        />
      </div>
    </div>
  );
}
