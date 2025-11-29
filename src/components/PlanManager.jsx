import React, { useState, useRef } from "react";
import { Save, Download, Upload, Trash2, Plus } from "lucide-react";
import {
  getPlansByBoss,
  savePlan,
  deletePlan,
  generatePlanId,
  exportPlan,
  importPlan,
} from "../utils/planStorage";

export default function PlanManager({
  currentTimeline,
  currentPlanId,
  onPlanChange,
  partyComp,
  placements,
}) {
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const fileInputRef = useRef(null);

  const plansForBoss = getPlansByBoss(currentTimeline);
  const currentPlan = plansForBoss.find((p) => p.planId === currentPlanId);

  const handleSave = () => {
    if (!currentPlanId) {
      // No plan selected, prompt for name
      setShowSaveAsDialog(true);
      return;
    }

    savePlan(currentPlanId, {
      bossId: currentTimeline,
      planName: currentPlan?.planName || "Untitled Plan",
      partyComp,
      placements,
    });

    alert("Plan saved!");
  };

  const handleSaveAs = () => {
    if (!newPlanName.trim()) {
      alert("Please enter a plan name");
      return;
    }

    const newPlanId = generatePlanId(currentTimeline, newPlanName);
    savePlan(newPlanId, {
      bossId: currentTimeline,
      planName: newPlanName,
      partyComp,
      placements,
    });

    setShowSaveAsDialog(false);
    setNewPlanName("");
    onPlanChange(newPlanId);
    alert("Plan saved as new!");
  };

  const handleDelete = () => {
    if (!currentPlanId) return;

    if (confirm(`Delete plan "${currentPlan?.planName}"?`)) {
      deletePlan(currentPlanId);
      onPlanChange(null);
      alert("Plan deleted");
    }
  };

  const handleExport = () => {
    const planData = {
      bossId: currentTimeline,
      planName: currentPlan?.planName || "Untitled Plan",
      partyComp,
      placements,
      exportedAt: new Date().toISOString(),
    };

    exportPlan(planData);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importPlan(file, (data) => {
      const newPlanId = generatePlanId(
        data.bossId || currentTimeline,
        data.planName || "Imported Plan"
      );
      savePlan(newPlanId, {
        bossId: data.bossId || currentTimeline,
        planName: data.planName || "Imported Plan",
        partyComp: data.partyComp,
        placements: data.placements,
      });

      onPlanChange(newPlanId);
      alert("Plan imported successfully!");
    });

    // Reset input
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      {/* Plan Selector */}
      <select
        value={currentPlanId || ""}
        onChange={(e) => onPlanChange(e.target.value || null)}
        className="bg-gray-700 rounded px-3 py-2"
      >
        <option value="">New Plan (Unsaved)</option>
        {plansForBoss.map((plan) => (
          <option key={plan.planId} value={plan.planId}>
            {plan.planName}
          </option>
        ))}
      </select>

      {/* Action Buttons */}
      <button
        onClick={handleSave}
        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        title="Save"
      >
        <Save size={16} />
        Save
      </button>

      <button
        onClick={() => setShowSaveAsDialog(true)}
        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        title="Save As"
      >
        <Plus size={16} />
        Save As
      </button>

      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        title="Export"
      >
        <Download size={16} />
      </button>

      <button
        onClick={handleImport}
        className="flex items-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        title="Import"
      >
        <Upload size={16} />
      </button>

      {currentPlanId && (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Save As Dialog */}
      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Save Plan As</h3>
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Enter plan name..."
              className="w-full bg-gray-700 rounded px-3 py-2 mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSaveAs();
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveAsDialog(false);
                  setNewPlanName("");
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAs}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
