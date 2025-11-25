import React, { useState } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';

// Sample data - in real app, this would be loaded from JSON files
const JOBS = {
  PLD: {
    name: 'Paladin',
    role: 'Tank',
    color: '#A8D2E6',
    abilities: [
      { id: 'rampart', name: 'Rampart', duration: 20, cooldown: 90 },
      { id: 'sentinel', name: 'Sentinel', duration: 15, cooldown: 120 },
      { id: 'passage', name: 'Passage of Arms', duration: 18, cooldown: 120 },
      { id: 'divine-veil', name: 'Divine Veil', duration: 30, cooldown: 90 },
    ]
  },
  WAR: {
    name: 'Warrior',
    role: 'Tank',
    color: '#CF2621',
    abilities: [
      { id: 'rampart', name: 'Rampart', duration: 20, cooldown: 90 },
      { id: 'vengeance', name: 'Vengeance', duration: 15, cooldown: 120 },
      { id: 'shake', name: 'Shake It Off', duration: 15, cooldown: 90 },
      { id: 'reprisal', name: 'Reprisal', duration: 10, cooldown: 60 },
    ]
  },
  WHM: {
    name: 'White Mage',
    role: 'Healer',
    color: '#FFF0DC',
    abilities: [
      { id: 'temperance', name: 'Temperance', duration: 20, cooldown: 120 },
      { id: 'liturgy', name: 'Liturgy of the Bell', duration: 20, cooldown: 180 },
      { id: 'aquaveil', name: 'Aquaveil', duration: 8, cooldown: 60 },
    ]
  },
  SCH: {
    name: 'Scholar',
    role: 'Healer',
    color: '#8657FF',
    abilities: [
      { id: 'sacred-soil', name: 'Sacred Soil', duration: 15, cooldown: 30 },
      { id: 'expedient', name: 'Expedient', duration: 20, cooldown: 120 },
      { id: 'fey-illumination', name: 'Fey Illumination', duration: 20, cooldown: 120 },
    ]
  }
};

const BOSS_TIMELINE = [
  { time: 10, name: 'Tank Buster', type: 'physical' },
  { time: 25, name: 'Raidwide', type: 'magical' },
  { time: 45, name: 'Tank Buster', type: 'physical' },
  { time: 60, name: 'Heavy Raidwide', type: 'magical' },
  { time: 80, name: 'Tank Buster', type: 'physical' },
  { time: 95, name: 'Raidwide', type: 'magical' },
  { time: 115, name: 'Heavy Raidwide', type: 'magical' },
  { time: 135, name: 'Tank Buster', type: 'physical' },
  { time: 150, name: 'Enrage', type: 'magical' },
];

const TIMELINE_DURATION = 160; // seconds
const PIXELS_PER_SECOND = 4;

export default function MitigationPlanner() {
  const [partyComp, setPartyComp] = useState({
    tank1: 'PLD',
    tank2: 'WAR',
    healer1: 'WHM',
    healer2: 'SCH',
    dps1: null,
    dps2: null,
    dps3: null,
    dps4: null,
  });
  
  const [placements, setPlacements] = useState([]);
  const [draggedAbility, setDraggedAbility] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const getAvailableAbilities = () => {
    const abilities = [];
    Object.entries(partyComp).forEach(([slot, jobId]) => {
      if (jobId && JOBS[jobId]) {
        const job = JOBS[jobId];
        job.abilities.forEach(ability => {
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
  };

  const checkCooldownConflict = (ability, startTime, excludePlacementId = null) => {
    const jobPlacements = placements.filter(p => 
      p.slot === ability.slot && 
      p.id === ability.id &&
      p.placementId !== excludePlacementId
    );
    
    for (const placement of jobPlacements) {
      const placementEnd = placement.startTime + ability.duration;
      const newEnd = startTime + ability.duration;
      const cooldownEnd = placement.startTime + ability.cooldown;
      
      // Check if new placement is within cooldown window of existing placement
      if (startTime < cooldownEnd && startTime >= placement.startTime) {
        return true;
      }
    }
    return false;
  };

  const handleDragStart = (ability, from = 'palette') => {
    setDraggedAbility(ability);
    setDraggedFrom(from);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedAbility) return;

    const timelineRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;
    const startTime = Math.max(0, Math.round(x / PIXELS_PER_SECOND));

    if (startTime + draggedAbility.duration > TIMELINE_DURATION) {
      setDraggedAbility(null);
      setDraggedFrom(null);
      return;
    }

    const hasConflict = checkCooldownConflict(draggedAbility, startTime);
    
    if (!hasConflict) {
      if (draggedFrom === 'palette') {
        setPlacements([...placements, {
          ...draggedAbility,
          startTime,
          placementId: Date.now() + Math.random(),
        }]);
      } else if (draggedFrom === 'timeline') {
        // Moving existing placement
        setPlacements(placements.map(p => 
          p.placementId === draggedAbility.placementId 
            ? { ...p, startTime }
            : p
        ));
      }
    }

    setDraggedAbility(null);
    setDraggedFrom(null);
  };

  const removePlacement = (placementId) => {
    setPlacements(placements.filter(p => p.placementId !== placementId));
  };

  const clearAll = () => {
    setPlacements([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">FFXIV Mitigation Planner</h1>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            <RotateCcw size={16} />
            Clear All
          </button>
        </div>

        {/* Party Composition */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Party Composition</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(partyComp).map(([slot, jobId]) => (
              <div key={slot}>
                <label className="block text-sm text-gray-400 mb-1 capitalize">
                  {slot.replace(/\d/, ' $&')}
                </label>
                <select
                  value={jobId || ''}
                  onChange={(e) => setPartyComp({ ...partyComp, [slot]: e.target.value || null })}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                >
                  <option value="">None</option>
                  {Object.entries(JOBS)
                    .filter(([_, job]) => 
                      (slot.startsWith('tank') && job.role === 'Tank') ||
                      (slot.startsWith('healer') && job.role === 'Healer') ||
                      (slot.startsWith('dps') && job.role === 'DPS')
                    )
                    .map(([id, job]) => (
                      <option key={id} value={id}>{job.name}</option>
                    ))
                  }
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Available Abilities */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Available Abilities</h2>
          <div className="flex flex-wrap gap-2">
            {getAvailableAbilities().map((ability, idx) => (
              <div
                key={`${ability.slot}-${ability.id}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(ability, 'palette')}
                className="px-3 py-2 rounded cursor-move hover:opacity-80 transition-opacity"
                style={{ backgroundColor: ability.color, color: '#000' }}
              >
                <div className="font-semibold text-sm">{ability.name}</div>
                <div className="text-xs opacity-75">
                  {ability.jobName} • {ability.duration}s • CD: {ability.cooldown}s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Boss Timeline</h2>
          
          {/* Time markers */}
          <div className="relative mb-2" style={{ height: '30px' }}>
            {Array.from({ length: Math.ceil(TIMELINE_DURATION / 10) + 1 }, (_, i) => i * 10).map(time => (
              <div
                key={time}
                className="absolute text-xs text-gray-400"
                style={{ left: `${time * PIXELS_PER_SECOND}px` }}
              >
                {time}s
              </div>
            ))}
          </div>

          {/* Timeline area */}
          <div
            className="relative bg-gray-700 rounded"
            style={{ 
              width: `${TIMELINE_DURATION * PIXELS_PER_SECOND}px`,
              minHeight: '400px',
              backgroundImage: 'repeating-linear-gradient(90deg, #4a5568 0px, #4a5568 1px, transparent 1px, transparent 40px)',
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Boss attacks */}
            {BOSS_TIMELINE.map((attack, idx) => (
              <div
                key={idx}
                className="absolute w-1 bg-red-500"
                style={{
                  left: `${attack.time * PIXELS_PER_SECOND}px`,
                  top: 0,
                  height: '100%',
                }}
              >
                <div className="absolute top-2 left-2 bg-red-900 px-2 py-1 rounded text-xs whitespace-nowrap">
                  {attack.name}
                </div>
              </div>
            ))}

            {/* Placed abilities */}
            {placements.map((placement) => (
              <div
                key={placement.placementId}
                draggable
                onDragStart={() => handleDragStart(placement, 'timeline')}
                className="absolute rounded cursor-move group"
                style={{
                  left: `${placement.startTime * PIXELS_PER_SECOND}px`,
                  width: `${placement.duration * PIXELS_PER_SECOND}px`,
                  top: `${50 + (placements.filter(p => 
                    p.startTime < placement.startTime + placement.duration &&
                    placement.startTime < p.startTime + p.duration &&
                    placements.indexOf(p) < placements.indexOf(placement)
                  ).length * 50)}px`,
                  height: '40px',
                  backgroundColor: placement.color,
                  color: '#000',
                  border: checkCooldownConflict(placement, placement.startTime, placement.placementId) 
                    ? '2px solid red' 
                    : 'none',
                }}
              >
                <div className="px-2 py-1 text-sm font-semibold truncate">
                  {placement.name}
                </div>
                <button
                  onClick={() => removePlacement(placement.placementId)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
