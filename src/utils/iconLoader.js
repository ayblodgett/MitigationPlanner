/**
 * Utility to auto-import icons from assets folder
 * Supports jobs and abilities
 */

// Auto-import all job icons
const jobIconModules = import.meta.glob("../assets/icons/jobs/*.png", {
  eager: true,
});

// Auto-import all ability icons
const abilityIconModules = import.meta.glob("../assets/icons/abilities/*.png", {
  eager: true,
});

/**
 * Convert glob import results to { id: path } object
 * @param {Object} modules - Result from import.meta.glob
 * @returns {Object} - { iconId: iconPath }
 */
function parseIconModules(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, module]) => {
      // Extract filename without extension
      // e.g., "../assets/icons/jobs/PLD.png" → "PLD"
      const id = path.match(/\/([^/]+)\.png$/)[1];
      return [id, module.default];
    })
  );
}

export const jobIcons = parseIconModules(jobIconModules);
export const abilityIcons = parseIconModules(abilityIconModules);

/**
 * Get icon path by ID, with fallback
 * @param {string} id - Icon identifier
 * @param {string} type - 'job' or 'ability'
 * @returns {string} - Icon path or placeholder
 */
export function getIcon(id, type = "ability") {
  const icons = type === "job" ? jobIcons : abilityIcons;
  return icons[id] || null; // Return null if not found
}
