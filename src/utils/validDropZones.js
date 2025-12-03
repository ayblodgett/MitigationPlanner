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

  // For single-charge abilities, use simple cooldown blocking
  if (maxCharges === 1) {
    return calculateSimpleValidZones(
      existingPlacements,
      ability,
      timelineDuration
    );
  }

  // For multi-charge abilities, use simulation-based approach
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
  let currentStart = 0;

  for (const placement of existingPlacements) {
    const blockStart = placement.startTime;
    const blockEnd = placement.startTime + ability.cooldown;

    // Add zone before this blocked period if there's space
    if (currentStart < blockStart) {
      validZones.push({ start: currentStart, end: blockStart });
    }

    // Move start past this blocked period
    currentStart = Math.max(currentStart, blockEnd);
  }

  // Add final zone after last placement
  const maxEndTime = timelineDuration - ability.duration;
  if (currentStart <= maxEndTime) {
    validZones.push({ start: currentStart, end: maxEndTime });
  }

  return validZones;
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
 */
export function snapToValidZone(time, validZones, ability) {
  if (!validZones || validZones.length === 0) return time;

  // Find which zone this time falls into
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
  const lastZone = validZones[validZones.length - 1];
  return lastZone.end;
}
