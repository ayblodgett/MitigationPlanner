export function checkCooldownConflict(
  placements,
  ability,
  startTime,
  excludePlacementId = null
) {
  const jobPlacements = placements.filter(
    (p) =>
      p.slot === ability.slot &&
      p.id === ability.id &&
      p.placementId !== excludePlacementId
  );

  for (const placement of jobPlacements) {
    const cooldownEnd = placement.startTime + ability.cooldown;

    // Check if new placement is within cooldown window of existing placement
    if (startTime < cooldownEnd && startTime >= placement.startTime) {
      return true;
    }
  }
  return false;
}

export function getAvailableAbilities(partyComp, jobs) {
  const abilities = [];
  Object.entries(partyComp).forEach(([slot, jobId]) => {
    if (jobId && jobs[jobId]) {
      const job = jobs[jobId];
      job.abilities.forEach((ability) => {
        abilities.push({
          ...ability,
          jobId,
          jobName: job.name,
          color: job.color,
          slot,
        });
      });
    }
  });
  return abilities;
}
