/**
 * Calculate valid drop zones for an ability considering cooldown conflicts
 * Returns an array of time ranges where the ability can be placed
 */
export function calculateValidDropZones(
  placements,
  ability,
  timelineDuration,
  excludePlacementId = null
) {
  if (!ability) return [{ start: 0, end: timelineDuration }];

  // Get all existing placements of this ability (excluding the one being moved)
  const existingPlacements = placements
    .filter(
      (p) =>
        p.slot === ability.slot &&
        p.id === ability.id &&
        p.placementId !== excludePlacementId
    )
    .sort((a, b) => a.startTime - b.startTime);

  // If no existing placements, entire timeline is valid
  if (existingPlacements.length === 0) {
    return [{ start: 0, end: timelineDuration - ability.duration }];
  }

  const maxCharges = ability.charges || 1;

  // Single-charge abilities
  if (maxCharges === 1) {
    return calculateSimpleValidZones(
      existingPlacements,
      ability,
      timelineDuration
    );
  }

  // Multi-charge abilities
  return calculateMultiChargeValidZones(
    existingPlacements,
    ability,
    timelineDuration,
    maxCharges
  );
}

/**
 * Calculate valid zones for single-charge abilities
 */
function calculateSimpleValidZones(
  existingPlacements,
  ability,
  timelineDuration
) {
  const validZones = [];
  const maxEndTime = timelineDuration - ability.duration;

  // For each existing placement, it blocks:
  // - From (startTime - cooldown) to startTime
  // - From startTime to (startTime + cooldown)
  const blockedRanges = existingPlacements.map((p) => ({
    start: Math.max(0, p.startTime - ability.cooldown),
    end: Math.min(maxEndTime, p.startTime + ability.cooldown),
  }));

  // Sort and merge overlapping blocked ranges
  const mergedBlocked = mergeRanges(blockedRanges);

  // Valid zones are the gaps between blocked ranges
  let currentStart = 0;

  for (const blocked of mergedBlocked) {
    if (currentStart < blocked.start) {
      validZones.push({ start: currentStart, end: blocked.start });
    }
    currentStart = Math.max(currentStart, blocked.end);
  }

  // Add final zone after last blocked range
  if (currentStart <= maxEndTime) {
    validZones.push({ start: currentStart, end: maxEndTime });
  }

  return validZones;
}

/**
 * Merge overlapping ranges
 */
function mergeRanges(ranges) {
  if (ranges.length === 0) return [];

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      // Overlapping ranges, merge them
      last.end = Math.max(last.end, current.end);
    } else {
      // Non-overlapping, add as new range
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Calculate valid zones for multi-charge abilities
 * Tests every second of the timeline to see if placement would be valid
 */
function calculateMultiChargeValidZones(
  existingPlacements,
  ability,
  timelineDuration,
  maxCharges
) {
  const maxEndTime = timelineDuration - ability.duration;
  const validZones = [];
  let currentZoneStart = null;

  // Test each second of the timeline
  for (let time = 0; time <= maxEndTime; time++) {
    const isValid = testMultiChargePlacement(
      existingPlacements,
      ability,
      time,
      maxCharges
    );

    if (isValid) {
      // Start new zone or continue existing one
      if (currentZoneStart === null) {
        currentZoneStart = time;
      }
    } else {
      // End current zone if one exists
      if (currentZoneStart !== null) {
        validZones.push({ start: currentZoneStart, end: time - 1 });
        currentZoneStart = null;
      }
    }
  }

  // Close final zone if still open
  if (currentZoneStart !== null) {
    validZones.push({ start: currentZoneStart, end: maxEndTime });
  }

  return validZones;
}

/**
 * Test if a multi-charge ability can be placed at a specific time
 */
function testMultiChargePlacement(
  existingPlacements,
  ability,
  testTime,
  maxCharges
) {
  // Create temporary placement list with test time
  const allPlacements = [
    ...existingPlacements,
    { startTime: testTime, placementId: "temp" },
  ].sort((a, b) => a.startTime - b.startTime);

  // Simulate charge usage
  let currentCharges = maxCharges;
  let lastRechargeCheckTime = 0;

  for (const placement of allPlacements) {
    // Calculate recharged charges
    const timePassed = placement.startTime - lastRechargeCheckTime;
    const chargesRecharged = Math.floor(timePassed / ability.cooldown);

    currentCharges = Math.min(maxCharges, currentCharges + chargesRecharged);

    if (chargesRecharged > 0) {
      lastRechargeCheckTime =
        lastRechargeCheckTime + chargesRecharged * ability.cooldown;
    }

    // Try to use a charge
    if (currentCharges > 0) {
      currentCharges--;
      if (placement.placementId === "temp") {
        return true; // Valid placement
      }
    } else {
      if (placement.placementId === "temp") {
        return false; // No charge available - invalid
      }
    }
  }

  return false;
}

/**
 * Snap a time value to the nearest valid drop zone boundary or stay within zone
 * Also snaps to timeline start (0) and end boundaries
 */
export function snapToValidZone(time, validZones, ability) {
  if (!validZones || validZones.length === 0) return time;

  // Collect all snap points: zone boundaries + timeline boundaries
  const snapPoints = [0]; // Always include timeline start

  validZones.forEach((zone) => {
    snapPoints.push(zone.start, zone.end);
  });

  // Add timeline end
  const lastZone = validZones[validZones.length - 1];
  if (lastZone && lastZone.end !== snapPoints[snapPoints.length - 1]) {
    snapPoints.push(lastZone.end);
  }

  // Remove duplicates and sort
  const uniqueSnapPoints = [...new Set(snapPoints)].sort((a, b) => a - b);

  // Define snap threshold (in seconds) - snap if within this distance
  const snapThreshold = 2;

  // Find the closest snap point within threshold
  let closestSnap = null;
  let closestDistance = Infinity;

  for (const snapPoint of uniqueSnapPoints) {
    const distance = Math.abs(time - snapPoint);
    if (distance <= snapThreshold && distance < closestDistance) {
      closestDistance = distance;
      closestSnap = snapPoint;
    }
  }

  // If we found a close snap point, use it
  if (closestSnap !== null) {
    return closestSnap;
  }

  // Otherwise, check if we're in a valid zone
  for (const zone of validZones) {
    if (time >= zone.start && time <= zone.end) {
      // Already in valid zone, no snapping needed
      return time;
    }

    // If time is before this zone, snap to zone start
    if (time < zone.start) {
      return zone.start;
    }
  }

  // If we're past all zones, snap to the end of the last zone
  return lastZone.end;
}
