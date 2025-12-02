import { getAbilityIcon } from "./iconLoader";

/**
 * Automatically assigns icons to abilities based on their IDs
 * @param {Array} abilities - Array of ability objects
 * @returns {Array} - Abilities with icons assigned
 */
export function assignIcons(abilities) {
  return abilities.map((ability) => ({
    ...ability,
    icon: getAbilityIcon(ability.id),
  }));
}

/**
 * Process role abilities - assigns icons automatically
 * @param {Object} roleAbilities - Object with role keys and ability arrays
 * @returns {Object} - Role abilities with icons assigned
 */
export function processRoleAbilities(roleAbilities) {
  const processed = {};
  for (const [role, abilities] of Object.entries(roleAbilities)) {
    processed[role] = assignIcons(abilities);
  }
  return processed;
}
