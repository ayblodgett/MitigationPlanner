export function calculateAbilityLanes(abilities) {
  if (abilities.length === 0) return [];

  const sorted = [...abilities].sort((a, b) => a.startTime - b.startTime);
  const lanes = [];

  sorted.forEach((ability) => {
    const abilityEnd = ability.startTime + ability.duration;

    let laneIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      const laneAbilities = lanes[i];
      const hasOverlap = laneAbilities.some((existing) => {
        const existingEnd = existing.startTime + existing.duration;
        return !(
          abilityEnd <= existing.startTime || ability.startTime >= existingEnd
        );
      });

      if (!hasOverlap) {
        laneIndex = i;
        break;
      }

      if (i === lanes.length - 1) {
        laneIndex = lanes.length;
      }
    }

    if (laneIndex >= lanes.length) {
      lanes.push([]);
    }

    lanes[laneIndex].push({ ...ability, lane: laneIndex });
  });

  const totalLanes = lanes.length;
  return lanes.flat().map((ability) => ({ ...ability, totalLanes }));
}

export function calculateLabelLanes(items, pixelsPerSecond, labelWidth) {
  const itemsWithWidth = items.map((item, idx) => ({
    ...item,
    id: idx,
    estimatedWidth: item.name.length * 7 + 16,
  }));

  const lanes = [];
  itemsWithWidth.forEach((item) => {
    const itemLeft =
      item.time * pixelsPerSecond + labelWidth - item.estimatedWidth / 2;
    const itemRight =
      item.time * pixelsPerSecond + labelWidth + item.estimatedWidth / 2;

    let laneIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      const hasOverlap = lanes[i].some((existing) => {
        const existingLeft =
          existing.time * pixelsPerSecond +
          labelWidth -
          existing.estimatedWidth / 2;
        const existingRight =
          existing.time * pixelsPerSecond +
          labelWidth +
          existing.estimatedWidth / 2;
        return !(itemRight <= existingLeft || itemLeft >= existingRight);
      });

      if (!hasOverlap) {
        laneIndex = i;
        break;
      }

      if (i === lanes.length - 1) {
        laneIndex = lanes.length;
      }
    }

    if (laneIndex >= lanes.length) {
      lanes.push([]);
    }

    lanes[laneIndex].push({ ...item, lane: laneIndex });
  });

  return { items: lanes.flat(), totalLanes: lanes.length };
}
