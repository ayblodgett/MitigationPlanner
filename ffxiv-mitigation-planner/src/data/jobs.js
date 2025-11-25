export const JOBS = {
  PLD: {
    name: "Paladin",
    role: "Tank",
    color: "#A8D2E6",
    abilities: [
      { id: "rampart", name: "Rampart", duration: 20, cooldown: 90 },
      { id: "sentinel", name: "Sentinel", duration: 15, cooldown: 120 },
      { id: "passage", name: "Passage of Arms", duration: 18, cooldown: 120 },
      { id: "divine-veil", name: "Divine Veil", duration: 30, cooldown: 90 },
    ],
  },
  WAR: {
    name: "Warrior",
    role: "Tank",
    color: "#CF2621",
    abilities: [
      { id: "rampart", name: "Rampart", duration: 20, cooldown: 90 },
      { id: "vengeance", name: "Vengeance", duration: 15, cooldown: 120 },
      { id: "shake", name: "Shake It Off", duration: 15, cooldown: 90 },
      { id: "reprisal", name: "Reprisal", duration: 10, cooldown: 60 },
    ],
  },
  WHM: {
    name: "White Mage",
    role: "Healer",
    color: "#FFF0DC",
    abilities: [
      { id: "temperance", name: "Temperance", duration: 20, cooldown: 120 },
      {
        id: "liturgy",
        name: "Liturgy of the Bell",
        duration: 20,
        cooldown: 180,
      },
      { id: "aquaveil", name: "Aquaveil", duration: 8, cooldown: 60 },
    ],
  },
  SCH: {
    name: "Scholar",
    role: "Healer",
    color: "#8657FF",
    abilities: [
      { id: "sacred-soil", name: "Sacred Soil", duration: 15, cooldown: 30 },
      { id: "expedient", name: "Expedient", duration: 20, cooldown: 120 },
      {
        id: "fey-illumination",
        name: "Fey Illumination",
        duration: 20,
        cooldown: 120,
      },
    ],
  },
};

export const PARTY_SLOTS = {
  tank1: { label: "Tank 1", role: "Tank" },
  tank2: { label: "Tank 2", role: "Tank" },
  healer1: { label: "Healer 1", role: "Healer" },
  healer2: { label: "Healer 2", role: "Healer" },
  dps1: { label: "DPS 1", role: "DPS" },
  dps2: { label: "DPS 2", role: "DPS" },
  dps3: { label: "DPS 3", role: "DPS" },
  dps4: { label: "DPS 4", role: "DPS" },
};
