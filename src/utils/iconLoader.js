/**
 * Utility to auto-import icons from assets folder
 * Supports jobs and abilities (shared + job-specific)
 */

// Job icons
const jobIconModules = import.meta.glob("../assets/icons/jobs/*.png", {
  eager: true,
});

// Shared ability icons (role abilities)
const sharedAbilityModules = import.meta.glob(
  "../assets/icons/abilities/Shared/*.png",
  {
    eager: true,
  }
);

// Job-specific ability icons (all subfolders)
const jobAbilityModules = import.meta.glob(
  "../assets/icons/abilities/*/*.png",
  {
    eager: true,
  }
);

function parseIconModules(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, module]) => {
      const id = path.match(/\/([^/]+)\.png$/)[1];
      return [id, module.default];
    })
  );
}

export const jobIcons = parseIconModules(jobIconModules);
const sharedAbilityIcons = parseIconModules(sharedAbilityModules);
const jobSpecificAbilityIcons = parseIconModules(jobAbilityModules);

// Combine shared and job-specific abilities
export const abilityIcons = {
  ...sharedAbilityIcons,
  ...jobSpecificAbilityIcons,
};

/**
 * Get icon for an ability by ID
 * @param {string} abilityId - The ability's ID (e.g., "divine-veil")
 * @returns {string|null} - Icon path or null if not found
 */
export function getAbilityIcon(abilityId) {
  return abilityIcons[abilityId] || null;
}

/**
 * Get icon for a job by ID
 * @param {string} jobId - The job's ID (e.g., "PLD")
 * @returns {string|null} - Icon path or null if not found
 */
export function getJobIcon(jobId) {
  return jobIcons[jobId] || null;
}
