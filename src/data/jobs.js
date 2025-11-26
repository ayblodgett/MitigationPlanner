// Role-wide abilities that all jobs in a role share
const ROLE_ABILITIES = {
  Tank: [
    { id: "rampart", name: "Rampart", duration: 20, cooldown: 90 },
    { id: "reprisal", name: "Reprisal", duration: 15, cooldown: 60 },
  ],
  Healer: [],
  Melee: [
    { id: "second-wind", name: "Second Wind", duration: 2, cooldown: 120 },
    { id: "bloodbath", name: "Bloodbath", duration: 20, cooldown: 90 },
    { id: "feint", name: "Feint", duration: 10, cooldown: 90 },
  ],
  Physical_Ranged: [
    { id: "second-wind", name: "Second Wind", duration: 2, cooldown: 120 },
  ],
  Magical_Ranged: [{ id: "addle", name: "Addle", duration: 10, cooldown: 90 }],
};

// Job-specific abilities only
// TODO: tanks sweet spots
export const JOBS = {
  PLD: {
    name: "Paladin",
    role: "Tank",
    color: "#A8D2E6",
    abilities: [
      {
        id: "sheltron",
        name: "Holy Sheltron",
        duration: 8,
        cooldown: 5,
        sweetSpotDuration: 4,
        isPersonal: true,
      },
      {
        id: "guardian",
        name: "Guardian",
        duration: 15,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "cover",
        name: "Cover",
        duration: 12,
        cooldown: 120,
        isTargeted: true,
      },
      {
        id: "hallowed-ground",
        name: "Hallowed Ground",
        duration: 10,
        cooldown: 420,
        isPersonal: true,
      },
      {
        id: "bulwark",
        name: "Bulwark",
        duration: 10,
        cooldown: 90,
        isPersonal: true,
      },
      { id: "divine-veil", name: "Divine Veil", duration: 30, cooldown: 90 },
      {
        id: "intervention",
        name: "Intervention",
        duration: 8,
        cooldown: 10,
        isPersonal: false,
        isTargeted: true,
      },
      { id: "passage", name: "Passage of Arms", duration: 18, cooldown: 120 },
    ],
  },
  WAR: {
    name: "Warrior",
    role: "Tank",
    color: "#CF2621",
    abilities: [
      {
        id: "thrill",
        name: "Thrill of Battle",
        duration: 10,
        cooldown: 90,
        isPersonal: true,
      },
      {
        id: "damnation",
        name: "Damnation",
        duration: 15,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "holmgang",
        name: "Holmgang",
        duration: 10,
        cooldown: 240,
        isPersonal: true,
      },
      {
        id: "bloodwhetting",
        name: "Bloodwhetting",
        duration: 8,
        cooldown: 25,
        sweetSpotDuration: 4,
        isPersonal: true,
      },
      { id: "shake", name: "Shake It Off", duration: 30, cooldown: 90 },
      {
        id: "nascent-flash",
        name: "Nascent Flash",
        duration: 8,
        cooldown: 25,
        sweetSpotDuration: 4,
        isPersonal: false,
        isTargeted: true,
      },
    ],
  },
  DRK: {
    name: "Dark Knight",
    role: "Tank",
    color: "#D126CC",
    abilities: [
      {
        id: "shadowed-vigil",
        name: "Shadowed Vigil",
        duration: 15,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "dark-mind",
        name: "Dark Mind",
        duration: 10,
        cooldown: 60,
        isPersonal: true,
      },
      // TODO: living dead duration, how??
      {
        id: "living-dead",
        name: "Living Dead",
        duration: 10,
        cooldown: 300,
        isPersonal: true,
      },
      {
        id: "dark-missionary",
        name: "Dark Missionary",
        duration: 15,
        cooldown: 90,
      },
      // TODO: TBN can be on self or others, how to handle?
      {
        id: "tbn",
        name: "The Blackest Night",
        duration: 7,
        cooldown: 15,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "oblation",
        name: "Oblation",
        duration: 8,
        cooldown: 60,
        charges: 2,
        isPersonal: true,
        isTargeted: true,
      },
    ],
  },
  GNB: {
    name: "Gunbreaker",
    role: "Tank",
    color: "#796D30",
    abilities: [
      {
        id: "camouflage",
        name: "Camouflage",
        duration: 20,
        cooldown: 90,
        isPersonal: true,
      },
      {
        id: "great-nebula",
        name: "Great Nebula",
        duration: 15,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "superbolide",
        name: "Superbolide",
        duration: 10,
        cooldown: 360,
        isPersonal: true,
      },
      {
        id: "heart-of-light",
        name: "Heart of Light",
        duration: 15,
        cooldown: 90,
      },
      {
        id: "heart-of-corundum",
        name: "Heart of Corundum",
        duration: 8,
        cooldown: 25,
        sweetSpotDuration: 4,
        isPersonal: true,
        isTargeted: true,
      },
    ],
  },

  // Healers
  WHM: {
    name: "White Mage",
    role: "Healer",
    color: "#FFF0DC",
    abilities: [
      // TODO: instant effect abilities?
      {
        id: "benediction",
        name: "Benediction",
        duration: 2,
        cooldown: 180,
        isPersonal: true,
        isTargeted: true,
      },
      { id: "asylum", name: "Asylum", duration: 24, cooldown: 90 },
      {
        id: "divine-benison",
        name: "Divine Benison",
        duration: 15,
        cooldown: 30,
        charges: 2,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "plenary-indulgence",
        name: "Plenary Indulgence",
        duration: 10,
        cooldown: 60,
      },
      { id: "temperance", name: "Temperance", duration: 20, cooldown: 120 },
      {
        id: "aquaveil",
        name: "Aquaveil",
        duration: 8,
        cooldown: 60,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "liturgy",
        name: "Liturgy of the Bell",
        duration: 20,
        cooldown: 180,
      },
      // TODO: implement combo actions like this, sun sign, etc.
      {
        id: "divine-caress",
        name: "Divine Caress",
        duration: 10,
        cooldown: 120,
      },
    ],
  },
  // TODO: shield healer abilities in general lol. succor?
  SCH: {
    name: "Scholar",
    role: "Healer",
    color: "#8657FF",
    abilities: [
      {
        id: "fey-illumination",
        name: "Fey Illumination",
        duration: 20,
        cooldown: 120,
        petAbility: true,
      },
      { id: "sacred-soil", name: "Sacred Soil", duration: 15, cooldown: 30 },
      // TODO: sch deployment duration?
      {
        id: "deployment-tactics",
        name: "Deployment Tactics",
        duration: 30,
        cooldown: 90,
      },
      // TODO: lock out other abilities while dissipation/seraph are active?
      {
        id: "dissipation",
        name: "Dissipation",
        duration: 30,
        cooldown: 180,
        isPersonal: true,
      },
      {
        id: "recitation",
        name: "Recitation",
        duration: 15,
        cooldown: 60,
        isPersonal: true,
      },
      {
        id: "fey-blessing",
        name: "Fey Blessing",
        duration: 30,
        cooldown: 180,
        petAbility: true,
      },
      {
        id: "summon-seraph",
        name: "Summon Seraph",
        duration: 22,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "consolation",
        name: "Consolation",
        duration: 30,
        cooldown: 0,
        charges: 2,
        petAbility: true,
      },
      {
        id: "protraction",
        name: "Protraction",
        duration: 10,
        cooldown: 60,
        isPersonal: true,
        isTargeted: true,
      },
      { id: "expedient", name: "Expedient", duration: 20, cooldown: 120 },
      {
        id: "seraphism",
        name: "Seraphism",
        duration: 20,
        cooldown: 180,
        isPersonal: true,
      },
    ],
  },
  // TODO: ast cards?
  AST: {
    name: "Astrologian",
    role: "Healer",
    color: "#FFE74A",
    abilities: [
      {
        id: "lightspeed",
        name: "Lightspeed",
        duration: 15,
        cooldown: 60,
        isPersonal: true,
      },
      {
        id: "synastry",
        name: "Synastry",
        duration: 20,
        cooldown: 120,
        isPersonal: false,
        isTargeted: true,
      },
      {
        id: "collective-unconscious",
        name: "Collective Unconscious",
        duration: 5,
        cooldown: 60,
      },
      {
        id: "celestial-opposition",
        name: "Celestial Opposition",
        duration: 15,
        cooldown: 60,
      },
      // TODO: ability to shorten length of abilities like star?
      { id: "earthly-star", name: "Earthly Star", duration: 20, cooldown: 60 },
      // TODO: extended abilities like horoscope?
      { id: "horoscope", name: "Horoscope", duration: 10, cooldown: 60 },
      // TODO: implement neutral shield GCDs
      {
        id: "neutral-sect",
        name: "Neutral Sect",
        duration: 20,
        cooldown: 120,
        isPersonal: true,
      },
      {
        id: "exaltation",
        name: "Exaltation",
        duration: 28,
        cooldown: 60,
        isPersonal: true,
        isTargeted: true,
      },
      { id: "macrocosmos", name: "Macrocosmos", duration: 15, cooldown: 180 },
      { id: "sun-sign", name: "Sun Sign", duration: 15, cooldown: 120 },
    ],
  },
  SGE: {
    name: "Sage",
    role: "Healer",
    color: "#80A0F0",
    abilities: [
      { id: "physis", name: "Physis", duration: 15, cooldown: 60 },
      {
        id: "soteria",
        name: "Soteria",
        duration: 15,
        cooldown: 60,
        isPersonal: true,
      },
      { id: "kerachole", name: "Kerachole", duration: 15, cooldown: 30 },
      { id: "ixochole", name: "Ixochole", duration: 2, cooldown: 30 },
      { id: "zoe", name: "Zoe", duration: 30, cooldown: 90, isPersonal: true },
      { id: "pepsis", name: "Pepsis", duration: 2, cooldown: 30 },
      {
        id: "taurochole",
        name: "Taurochole",
        duration: 15,
        cooldown: 45,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "haima",
        name: "Haima",
        duration: 15,
        cooldown: 120,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "rhizomata",
        name: "Rhizomata",
        duration: 2,
        cooldown: 90,
        isPersonal: true,
      },
      // TODO: shield and dr off one ability, different durations?
      { id: "holos", name: "Holos", duration: 20, cooldown: 120 },
      { id: "panhaima", name: "Panhaima", duration: 15, cooldown: 120 },
      {
        id: "krasis",
        name: "Krasis",
        duration: 10,
        cooldown: 60,
        isPersonal: true,
        isTargeted: true,
      },
      { id: "pneuma", name: "Pneuma", duration: 2, cooldown: 120 },
      { id: "philosophia", name: "Philosophia", duration: 20, cooldown: 180 },
    ],
  },

  // Melee DPS
  MNK: {
    name: "Monk",
    role: "Melee",
    color: "#D69C00",
    abilities: [
      { id: "mantra", name: "Mantra", duration: 15, cooldown: 90 },
      {
        id: "riddle-of-earth",
        name: "Riddle of Earth",
        duration: 10,
        cooldown: 60,
        isPersonal: true,
      },
    ],
  },
  DRG: {
    name: "Dragoon",
    role: "Melee",
    color: "#4164CD",
    abilities: [],
  },
  NIN: {
    name: "Ninja",
    role: "Melee",
    color: "#AF1964",
    abilities: [
      {
        id: "shade-shift",
        name: "Shade Shift",
        duration: 20,
        cooldown: 120,
        isPersonal: true,
      },
    ],
  },
  SAM: {
    name: "Samurai",
    role: "Melee",
    color: "#E46D04",
    abilities: [
      {
        id: "tengetsu",
        name: "Tengetsu",
        duration: 4,
        cooldown: 15,
        isPersonal: true,
      },
    ],
  },
  RPR: {
    name: "Reaper",
    role: "Melee",
    color: "#965A90",
    abilities: [
      {
        id: "arcane-crest",
        name: "Arcane Crest",
        duration: 5,
        cooldown: 30,
        isPersonal: true,
      },
    ],
  },
  VPR: {
    name: "Viper",
    role: "Melee",
    color: "#94661F",
    abilities: [],
  },

  // Physical Ranged DPS
  BRD: {
    name: "Bard",
    role: "Physical_Ranged",
    color: "#91BA5E",
    abilities: [
      {
        id: "the-wardens-paean",
        name: "The Warden's Paean",
        duration: 30,
        cooldown: 45,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "troubadour",
        name: "Troubadour",
        duration: 15,
        cooldown: 90,
      },
      {
        id: "natures-minne",
        name: "Nature's Minne",
        duration: 15,
        cooldown: 120,
      },
    ],
  },
  MCH: {
    name: "Machinist",
    role: "Physical_Ranged",
    color: "#6EE1D6",
    abilities: [
      {
        id: "tactician",
        name: "Tactician",
        duration: 15,
        cooldown: 90,
      },
      { id: "dismantle", name: "Dismantle", duration: 10, cooldown: 120 },
    ],
  },
  DNC: {
    name: "Dancer",
    role: "Physical_Ranged",
    color: "#E2B0AF",
    abilities: [
      { id: "curing-waltz", name: "Curing Waltz", duration: 2, cooldown: 60 },
      {
        id: "shield-samba",
        name: "Shield Samba",
        duration: 15,
        cooldown: 90,
      },
      {
        id: "improvisation",
        name: "Improvisation",
        duration: 30,
        cooldown: 120,
      },
    ],
  },

  // Magical Ranged DPS
  BLM: {
    name: "Black Mage",
    role: "Magical_Ranged",
    color: "#A579D6",
    abilities: [
      {
        id: "manaward",
        name: "Manaward",
        duration: 20,
        cooldown: 120,
        isPersonal: true,
      },
    ],
  },
  SMN: {
    name: "Summoner",
    role: "Magical_Ranged",
    color: "#2D9B78",
    abilities: [
      {
        id: "radiant-aegis",
        name: "Radiant Aegis",
        duration: 30,
        cooldown: 160,
        charges: 2,
        isPersonal: true,
      },
      {
        id: "rekindle",
        name: "Rekindle",
        duration: 30,
        cooldown: 20,
        isPersonal: true,
        isTargeted: true,
      },
      {
        id: "lux-solaris",
        name: "Lux Solaris",
        duration: 2,
        cooldown: 60,
      },
    ],
  },
  RDM: {
    name: "Red Mage",
    role: "Magical_Ranged",
    color: "#E87B7B",
    abilities: [
      {
        id: "magick-barrier",
        name: "Magick Barrier",
        duration: 10,
        cooldown: 120,
      },
    ],
  },
  PCT: {
    name: "Pictomancer",
    role: "Magical_Ranged",
    color: "#D4D422",
    abilities: [
      // TODO: coat/grassa cd are really awkward, idk what to do here rn
      { id: "tempera-coat", name: "Tempera Coat", duration: 10, cooldown: 60 },
      {
        id: "tempera-grassa",
        name: "Tempera Grassa",
        duration: 10,
        cooldown: 90,
      },
    ],
  },
};

// Helper function to get all abilities for a job (role + job-specific)
export function getJobAbilities(jobId) {
  const job = JOBS[jobId];
  if (!job) return [];

  const roleAbilities = ROLE_ABILITIES[job.role] || [];
  return [...roleAbilities, ...job.abilities];
}

export const PARTY_SLOTS = [
  "tank1",
  "tank2",
  "healer1",
  "healer2",
  "dps1",
  "dps2",
  "dps3",
  "dps4",
];

export const SLOT_LABELS = {
  tank1: "Tank 1",
  tank2: "Tank 2",
  healer1: "Healer 1",
  healer2: "Healer 2",
  dps1: "DPS 1",
  dps2: "DPS 2",
  dps3: "DPS 3",
  dps4: "DPS 4",
};
