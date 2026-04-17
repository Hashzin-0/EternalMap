/**
 * Technology System - Phase 6
 * Tech Tree, Innovation, Unlocking
 */

export enum TechEra {
  ERA_1 = 'early_industrial',
  ERA_2 = 'late_industrial',
  ERA_3 = 'early_modern',
  ERA_4 = 'late_modern',
  ERA_5 = 'contemporary',
}

export enum TechTree {
  MILITARY = 'military',
  PRODUCTION = 'production',
  SOCIETY = 'society',
}

export interface Technology {
  readonly id: string;
  readonly nameKey: string;
  readonly tree: TechTree;
  readonly era: TechEra;
  readonly cost: number;
  readonly year: number;
  readonly requires: readonly string[];
  readonly unlocksBuildings: readonly string[];
  readonly unlocksProductionMethods: readonly string[];
  readonly unlocksLaws: readonly string[];
  readonly unlocksUnits: readonly string[];
}

export interface Innovation {
  readonly techId: string;
  readonly researched: boolean;
  readonly researchProgress: number;
  readonly unlockedDate: number | null;
}

export interface InnovationMetrics {
  readonly baseInnovation: number;
  readonly maxInnovation: number;
  readonly currentInnovation: number;
  readonly researchProgress: number;
}

export interface TechUnlock {
  readonly type: 'building' | 'production_method' | 'law' | 'unit';
  readonly id: string;
  readonly techId: string;
  readonly unlocked: boolean;
}

export interface TechSpreadEvent {
  readonly fromCountryId: string;
  readonly toCountryId: string;
  readonly techId: string;
  readonly method: 'trade' | 'emigration' | 'espionage' | 'research';
  readonly timestamp: number;
}

export interface CountryTechData {
  readonly innovation: number;
  readonly researchedTechs: readonly string[];
}

export interface ResearchQueue {
  readonly countryId: string;
  readonly currentTech: string | null;
  readonly queue: readonly string[];
  readonly progress: number;
}

export const TECHNOLOGIES: Record<string, Technology> = {
  // PRODUCTION - Era 1
  steam_power: {
    id: 'steam_power',
    nameKey: 'tech.steam_power',
    tree: TechTree.PRODUCTION,
    era: TechEra.ERA_1,
    cost: 300,
    year: 1836,
    requires: [],
    unlocksBuildings: ['railway', 'textile_mill'],
    unlocksProductionMethods: ['steam_engines'],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // PRODUCTION - Era 2
  steel_production: {
    id: 'steel_production',
    nameKey: 'tech.steel_production',
    tree: TechTree.PRODUCTION,
    era: TechEra.ERA_2,
    cost: 500,
    year: 1865,
    requires: ['steam_power'],
    unlocksBuildings: ['steel_mill'],
    unlocksProductionMethods: ['bessemer_process'],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // PRODUCTION - Era 3
  electrical_equipment: {
    id: 'electrical_equipment',
    nameKey: 'tech.electrical_equipment',
    tree: TechTree.PRODUCTION,
    era: TechEra.ERA_3,
    cost: 700,
    year: 1890,
    requires: ['steel_production'],
    unlocksBuildings: ['power_plant'],
    unlocksProductionMethods: ['electric_motors'],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // PRODUCTION - Era 4
  advanced_electronics: {
    id: 'advanced_electronics',
    nameKey: 'tech.advanced_electronics',
    tree: TechTree.PRODUCTION,
    era: TechEra.ERA_4,
    cost: 900,
    year: 1930,
    requires: ['electrical_equipment'],
    unlocksBuildings: ['electronics_factory'],
    unlocksProductionMethods: ['semiconductors'],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // PRODUCTION - Era 5
  computing: {
    id: 'computing',
    nameKey: 'tech.computing',
    tree: TechTree.PRODUCTION,
    era: TechEra.ERA_5,
    cost: 1200,
    year: 1960,
    requires: ['advanced_electronics'],
    unlocksBuildings: ['tech_campus'],
    unlocksProductionMethods: ['computers'],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // MILITARY - Era 1
  modern_army: {
    id: 'modern_army',
    nameKey: 'tech.modern_army',
    tree: TechTree.MILITARY,
    era: TechEra.ERA_1,
    cost: 400,
    year: 1840,
    requires: [],
    unlocksBuildings: ['barracks'],
    unlocksProductionMethods: ['modern_drill'],
    unlocksLaws: [],
    unlocksUnits: ['infantry', 'cavalry'],
  },

  // MILITARY - Era 2
  ironclad_ships: {
    id: 'ironclad_ships',
    nameKey: 'tech.ironclad_ships',
    tree: TechTree.MILITARY,
    era: TechEra.ERA_2,
    cost: 600,
    year: 1865,
    requires: ['modern_army'],
    unlocksBuildings: ['naval_base'],
    unlocksProductionMethods: ['iron_plating'],
    unlocksLaws: [],
    unlocksUnits: ['ironclad', 'cruiser'],
  },

  // MILITARY - Era 3
  tanks: {
    id: 'tanks',
    nameKey: 'tech.tanks',
    tree: TechTree.MILITARY,
    era: TechEra.ERA_3,
    cost: 800,
    year: 1915,
    requires: ['ironclad_ships'],
    unlocksBuildings: ['tank_factory'],
    unlocksProductionMethods: ['armored_vehicles'],
    unlocksLaws: [],
    unlocksUnits: ['tank', 'mechanized_infantry'],
  },

  // MILITARY - Era 4
  air_power: {
    id: 'air_power',
    nameKey: 'tech.air_power',
    tree: TechTree.MILITARY,
    era: TechEra.ERA_4,
    cost: 1000,
    year: 1940,
    requires: ['tanks'],
    unlocksBuildings: ['air_base'],
    unlocksProductionMethods: ['jet_engines'],
    unlocksLaws: [],
    unlocksUnits: ['fighter', 'bomber', 'jet_fighter'],
  },

  // MILITARY - Era 5
  nuclear_weapons: {
    id: 'nuclear_weapons',
    nameKey: 'tech.nuclear_weapons',
    tree: TechTree.MILITARY,
    era: TechEra.ERA_5,
    cost: 1500,
    year: 1950,
    requires: ['air_power'],
    unlocksBuildings: ['nuclear_facility'],
    unlocksProductionMethods: ['nuclear_warheads'],
    unlocksLaws: [],
    unlocksUnits: ['nuclear_submarine', 'icbm'],
  },

  // SOCIETY - Era 1
  public_schools: {
    id: 'public_schools',
    nameKey: 'tech.public_schools',
    tree: TechTree.SOCIETY,
    era: TechEra.ERA_1,
    cost: 250,
    year: 1840,
    requires: [],
    unlocksBuildings: ['school'],
    unlocksProductionMethods: [],
    unlocksLaws: ['compulsory_education'],
    unlocksUnits: [],
  },

  // SOCIETY - Era 2
  universities: {
    id: 'universities',
    nameKey: 'tech.universities',
    tree: TechTree.SOCIETY,
    era: TechEra.ERA_2,
    cost: 400,
    year: 1870,
    requires: ['public_schools'],
    unlocksBuildings: ['university'],
    unlocksProductionMethods: [],
    unlocksLaws: [],
    unlocksUnits: [],
  },

  // SOCIETY - Era 3
  advanced_healthcare: {
    id: 'advanced_healthcare',
    nameKey: 'tech.advanced_healthcare',
    tree: TechTree.SOCIETY,
    era: TechEra.ERA_3,
    cost: 600,
    year: 1900,
    requires: ['universities'],
    unlocksBuildings: ['hospital'],
    unlocksProductionMethods: ['modern_medicine'],
    unlocksLaws: ['public_health'],
    unlocksUnits: [],
  },

  // SOCIETY - Era 4
  social_security: {
    id: 'social_security',
    nameKey: 'tech.social_security',
    tree: TechTree.SOCIETY,
    era: TechEra.ERA_4,
    cost: 700,
    year: 1935,
    requires: ['advanced_healthcare'],
    unlocksBuildings: [],
    unlocksProductionMethods: [],
    unlocksLaws: ['social_insurance', 'pensions'],
    unlocksUnits: [],
  },

  // SOCIETY - Era 5
  advanced_education: {
    id: 'advanced_education',
    nameKey: 'tech.advanced_education',
    tree: TechTree.SOCIETY,
    era: TechEra.ERA_5,
    cost: 1000,
    year: 1960,
    requires: ['social_security'],
    unlocksBuildings: ['research_institute'],
    unlocksProductionMethods: [],
    unlocksLaws: ['universal_college'],
    unlocksUnits: [],
  },
} as const;

export function calculateInnovation(
  base: number,
  literacy: number,
  bureaucracy: number
): number {
  const cappedLiteracy = Math.min(literacy, 80);
  const innovation = base + cappedLiteracy * 1.5 + bureaucracy * 0.3;
  return Math.round(Math.min(200, Math.max(0, innovation)));
}

export function calculateResearchProgress(
  innovation: number,
  researchPoints: number,
  techCost: number
): number {
  if (techCost <= 0) return 0;
  return (innovation * researchPoints) / techCost;
}

export function canResearchTech(
  techId: string,
  researchedTechs: readonly string[],
  currentYear: number
): boolean {
  const tech = TECHNOLOGIES[techId];
  if (!tech) return false;

  if (currentYear < tech.year) return false;

  return tech.requires.every((reqId) => researchedTechs.includes(reqId));
}

export function getUnlockedBuildings(
  researchedTechs: readonly string[],
  allBuildings: Record<string, { id: string }>
): readonly string[] {
  const unlocked: string[] = [];

  for (const techId of researchedTechs) {
    const tech = TECHNOLOGIES[techId];
    if (tech?.unlocksBuildings) {
      for (const buildingId of tech.unlocksBuildings) {
        if (allBuildings[buildingId]) {
          if (!unlocked.includes(buildingId)) {
            unlocked.push(buildingId);
          }
        }
      }
    }
  }

  return unlocked;
}

export function getUnlockedLaws(
  researchedTechs: readonly string[]
): readonly string[] {
  const unlocked: string[] = [];

  for (const techId of researchedTechs) {
    const tech = TECHNOLOGIES[techId];
    if (tech?.unlocksLaws) {
      for (const lawId of tech.unlocksLaws) {
        if (!unlocked.includes(lawId)) {
          unlocked.push(lawId);
        }
      }
    }
  }

  return unlocked;
}

export function getUnlockedProductionMethods(
  researchedTechs: readonly string[]
): readonly string[] {
  const unlocked: string[] = [];

  for (const techId of researchedTechs) {
    const tech = TECHNOLOGIES[techId];
    if (tech?.unlocksProductionMethods) {
      for (const pmId of tech.unlocksProductionMethods) {
        if (!unlocked.includes(pmId)) {
          unlocked.push(pmId);
        }
      }
    }
  }

  return unlocked;
}

export function getUnlockedUnits(
  researchedTechs: readonly string[]
): readonly string[] {
  const unlocked: string[] = [];

  for (const techId of researchedTechs) {
    const tech = TECHNOLOGIES[techId];
    if (tech?.unlocksUnits) {
      for (const unitId of tech.unlocksUnits) {
        if (!unlocked.includes(unitId)) {
          unlocked.push(unitId);
        }
      }
    }
  }

  return unlocked;
}

export function calculateTechSpreadChance(
  fromInnovation: number,
  toInnovation: number,
  relation: number
): number {
  const innovationDiff = (fromInnovation - toInnovation) * 0.1;
  const relationBonus = (relation + 100) / 400;
  return Math.max(0, Math.min(30, innovationDiff + relationBonus * 10));
}

export function processTechSpread(
  countries: Map<string, CountryTechData>,
  _tradeVolume: Record<string, number>
): readonly TechSpreadEvent[] {
  const events: TechSpreadEvent[] = [];

  for (const [countryId, techData] of countries) {
    const otherCountries = Array.from(countries.entries()).filter(
      ([id]) => id !== countryId
    );

    for (const [otherId, otherData] of otherCountries) {
      const spreadChance = calculateTechSpreadChance(
        otherData.innovation,
        techData.innovation,
        50
      );

      if (Math.random() * 100 < spreadChance) {
        const newTechs = otherData.researchedTechs.filter(
          (t) => !techData.researchedTechs.includes(t)
        );

        if (newTechs.length > 0) {
          const randomIndex = Math.floor(Math.random() * newTechs.length);
          const randomTech = newTechs[randomIndex];

          events.push({
            fromCountryId: otherId,
            toCountryId: countryId,
            techId: randomTech,
            method: 'trade',
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  return events;
}

export function createEmptyResearchQueue(countryId: string): ResearchQueue {
  return {
    countryId,
    currentTech: null,
    queue: [],
    progress: 0,
  };
}

export function addToResearchQueue(
  queue: ResearchQueue,
  techId: string
): ResearchQueue {
  if (queue.queue.includes(techId) || queue.currentTech === techId) {
    return queue;
  }

  return {
    ...queue,
    queue: [...queue.queue, techId],
  };
}

export function removeFromResearchQueue(
  queue: ResearchQueue,
  techId: string
): ResearchQueue {
  if (queue.currentTech === techId) {
    return {
      ...queue,
      currentTech: null,
      progress: 0,
    };
  }

  return {
    ...queue,
    queue: queue.queue.filter((id) => id !== techId),
  };
}

export function processResearch(
  queue: ResearchQueue,
  innovation: number,
  daysElapsed: number
): ResearchQueue {
  if (!queue.currentTech && queue.queue.length === 0) {
    return queue;
  }

  if (!queue.currentTech && queue.queue.length > 0) {
    const nextTech = queue.queue[0];
    const tech = TECHNOLOGIES[nextTech];

    if (!tech) {
      return {
        ...queue,
        queue: queue.queue.slice(1),
      };
    }

    return {
      ...queue,
      currentTech: nextTech,
      progress: 0,
      queue: queue.queue.slice(1),
    };
  }

  if (!queue.currentTech) return queue;

  const tech = TECHNOLOGIES[queue.currentTech];
  if (!tech) {
    return {
      ...queue,
      currentTech: null,
      progress: 0,
    };
  }

  const progressGain = (innovation * daysElapsed * 0.1) / tech.cost;
  const newProgress = queue.progress + progressGain;

  if (newProgress >= 100) {
    return {
      ...queue,
      currentTech: null,
      progress: 0,
    };
  }

  return {
    ...queue,
    progress: newProgress,
  };
}

export function getResearchedTechsFromQueue(queue: ResearchQueue): readonly string[] {
  return queue.currentTech ? [queue.currentTech, ...queue.queue] : [...queue.queue];
}

export function getTechsByEra(era: TechEra): readonly Technology[] {
  return Object.values(TECHNOLOGIES).filter((tech) => tech.era === era);
}

export function getTechsByTree(tree: TechTree): readonly Technology[] {
  return Object.values(TECHNOLOGIES).filter((tech) => tech.tree === tree);
}

export function getAvailableTechs(
  researchedTechs: readonly string[],
  currentYear: number
): readonly Technology[] {
  return Object.values(TECHNOLOGIES).filter(
    (tech) =>
      canResearchTech(tech.id, researchedTechs, currentYear) &&
      !researchedTechs.includes(tech.id)
  );
}

export function getTechProgress(
  techId: string,
  queue: ResearchQueue
): number {
  if (queue.currentTech === techId) {
    return queue.progress;
  }
  return 0;
}