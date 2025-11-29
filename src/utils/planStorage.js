const STORAGE_PREFIX = "ffxiv-mit-plan-";

export function getAllPlans() {
  const plans = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const planId = key.replace(STORAGE_PREFIX, "");
        plans[planId] = data;
      } catch (e) {
        console.error("Error loading plan:", key, e);
      }
    }
  }

  return plans;
}

export function getPlansByBoss(bossId) {
  const allPlans = getAllPlans();
  return Object.entries(allPlans)
    .filter(([_, plan]) => plan.bossId === bossId)
    .map(([planId, plan]) => ({ planId, ...plan }));
}

export function savePlan(planId, data) {
  const key = STORAGE_PREFIX + planId;
  localStorage.setItem(
    key,
    JSON.stringify({
      ...data,
      lastModified: new Date().toISOString(),
    })
  );
}

export function loadPlan(planId) {
  const key = STORAGE_PREFIX + planId;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function deletePlan(planId) {
  const key = STORAGE_PREFIX + planId;
  localStorage.removeItem(key);
}

export function generatePlanId(bossId, planName) {
  const sanitized = planName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `${bossId}-${sanitized}-${Date.now()}`;
}

export function exportPlan(plan) {
  const dataStr = JSON.stringify(plan, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${plan.planName || "mitigation-plan"}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

export function importPlan(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      callback(data);
    } catch (error) {
      console.error("Error importing plan:", error);
      alert("Failed to import plan. Invalid file format.");
    }
  };
  reader.readAsText(file);
}
