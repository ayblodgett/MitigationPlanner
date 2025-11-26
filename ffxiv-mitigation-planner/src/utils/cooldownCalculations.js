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
  // Check if we have enough charges available at the requested time
  let availableCharges = maxCharges;
  let lastRechargeTime = 0;

  for (const placement of jobPlacements) {
    // Calculate how many charges have recharged since last use
    const timeSinceLastUse = placement.startTime - lastRechargeTime;
    const rechargedCharges = Math.floor(timeSinceLastUse / ability.cooldown);
    availableCharges = Math.min(
      maxCharges,
      availableCharges + rechargedCharges
    );

    // Use one charge
    availableCharges--;
    lastRechargeTime = placement.startTime;

    if (availableCharges < 0) {
      // This shouldn't happen, but if it does, there's a conflict
      return true;
    }
  }

  // Now check if we can place the new ability at startTime
  const timeSinceLastUse = startTime - lastRechargeTime;
  const rechargedCharges = Math.floor(timeSinceLastUse / ability.cooldown);
  availableCharges = Math.min(maxCharges, availableCharges + rechargedCharges);

  return availableCharges <= 0;
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
