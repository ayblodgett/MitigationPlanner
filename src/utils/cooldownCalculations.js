import { getJobAbilities } from "../data/jobs";

export function checkCooldownConflict(
  placements,
  ability,
  startTime,
  excludePlacementId = null
) {
  const jobPlacements = placements
    .filter(
      (p) =>
        p.slot === ability.slot &&
        p.id === ability.id &&
        p.placementId !== excludePlacementId
    )
    .sort((a, b) => a.startTime - b.startTime); // Sort by time

  // If ability has no charges or only 1 charge, use original logic
  const maxCharges = ability.charges || 1;
  if (maxCharges === 1) {
    for (const placement of jobPlacements) {
      const cooldownEnd = placement.startTime + ability.cooldown;
      if (startTime < cooldownEnd && startTime >= placement.startTime) {
        return true;
      }
    }
    return false;
  }

  // For abilities with multiple charges
  // Simulate charge usage over time
  let currentCharges = maxCharges;
  let lastRechargeCheckTime = 0;

  // Add the new placement to check into the list temporarily
  const allPlacements = [
    ...jobPlacements,
    { startTime, placementId: "temp" },
  ].sort((a, b) => a.startTime - b.startTime);

  for (const placement of allPlacements) {
    // Calculate how many charges have recharged since last check
    const timePassed = placement.startTime - lastRechargeCheckTime;
    const chargesRecharged = Math.floor(timePassed / ability.cooldown);

    // Add recharged charges, but don't exceed max
    currentCharges = Math.min(maxCharges, currentCharges + chargesRecharged);

    // Update last recharge check time based on actual recharges
    if (chargesRecharged > 0) {
      lastRechargeCheckTime =
        lastRechargeCheckTime + chargesRecharged * ability.cooldown;
    }

    // Try to use a charge
    if (currentCharges > 0) {
      currentCharges--;
      // If this is the new placement we're checking, it's valid
      if (placement.placementId === "temp") {
        return false; // No conflict
      }
    } else {
      // No charges available
      if (placement.placementId === "temp") {
        return true; // Conflict
      }
      // If an existing placement has no charge, something exploded
    }
  }

  return false;
}

export function getAbilitiesForSlot(partyComp, slot, jobs) {
  const jobId = partyComp[slot];
  if (!jobId || !jobs[jobId]) return [];

  const job = jobs[jobId];
  const allAbilities = getJobAbilities(jobId);

  return allAbilities.map((ability) => ({
    ...ability,
    jobId,
    jobName: job.name,
    color: job.color,
    slot,
  }));
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
