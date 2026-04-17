/**
 * Population Growth - Birth and Death Rate System
 * Phase 4: Population System
 */

import { Pop, PopStratum, PopProfession, EmploymentStatus, POP_TYPES } from './types';

// =============================================================================
// GROWTH TYPES
// =============================================================================

export interface PopulationChange {
  stateId: string;
  births: number;
  deaths: number;
  netChange: number;
  growthRate: number; // percentage
}

export interface PopBirthDeath {
  popId: string;
  type: 'birth' | 'death';
  population: number;
  timestamp: number;
  cause: string;
}

// =============================================================================
// BASE RATES
// =============================================================================

// Base birth/death rates per 1000 population per year
export const BASE_RATES = {
  birthRate: 35,    // 35 per 1000
  deathRate: 25,   // 25 per 1000
  naturalGrowth: 10, // 10 per 1000 (1% per year)
} as const;

// Growth modifiers by stratum
export const STRATUM_MODIFIERS = {
  upper: { birthMultiplier: 0.3, deathMultiplier: 0.5 },
  middle: { birthMultiplier: 0.6, deathMultiplier: 0.7 },
  lower: { birthMultiplier: 1.0, deathMultiplier: 1.0 },
} as const;

type StratumKey = keyof typeof STRATUM_MODIFIERS;

// =============================================================================
// BIRTH RATE CALCULATION
// =============================================================================

/**
 * Calculate the birth rate for a pop based on various factors
 * @param pop - The population group
 * @param sol - Standard of Living (0-100+)
 * @param isEmployed - Whether the pop is employed
 * @returns Birth rate per 1000 population per year
 */
export function calculateBirthRate(
  pop: Pop,
  sol: number,
  isEmployed: boolean
): number {
  const stratumKey = pop.stratum as StratumKey;
  const modifier = STRATUM_MODIFIERS[stratumKey];
  let rate = BASE_RATES.birthRate * modifier.birthMultiplier;
  
  // SoL bonus: higher SoL = more births (up to a point)
  if (sol > 30) {
    rate *= 1 + (sol - 30) / 100; // up to +70%
  } else if (sol < 15) {
    rate *= 0.5; // half births in poverty
  }
  
  // Employment bonus
  if (isEmployed) {
    rate *= 1.2;
  }
  
  // Age not tracked, so use stratum as proxy
  // Lower stratum = younger population = higher birth rate
  if (pop.stratum === PopStratum.LOWER) {
    rate *= 1.3;
  }
  
  return Math.max(0, rate);
}

/**
 * Calculate expected births for a pop in a month
 * @param pop - The population group
 * @param sol - Standard of Living (0-100+)
 * @returns Number of expected births
 */
export function calculateExpectedBirths(
  pop: Pop,
  sol: number
): number {
  const birthRate = calculateBirthRate(pop, sol, pop.employed);
  // Monthly rate
  const monthlyRate = (birthRate / 1000) / 12;
  return Math.floor(pop.population * monthlyRate);
}

// =============================================================================
// DEATH RATE CALCULATION
// =============================================================================

/**
 * Calculate the death rate for a pop based on various factors
 * @param pop - The population group
 * @param sol - Standard of Living (0-100+)
 * @param needsMet - Percentage of needs met (0-100)
 * @returns Death rate per 1000 population per year
 */
export function calculateDeathRate(
  pop: Pop,
  sol: number,
  needsMet: number
): number {
  const stratumKey = pop.stratum as StratumKey;
  const modifier = STRATUM_MODIFIERS[stratumKey];
  let rate = BASE_RATES.deathRate * modifier.deathMultiplier;
  
  // SoL penalty: lower SoL = more deaths
  if (sol < 15) {
    rate *= 2.0; // double deaths in poverty
  } else if (sol < 30) {
    rate *= 1.3;
  } else if (sol > 60) {
    rate *= 0.7; // fewer deaths in luxury
  }
  
  // Needs satisfaction critical
  if (needsMet < 30) {
    rate *= 2.0;
  } else if (needsMet < 50) {
    rate *= 1.5;
  }
  
  // Militancy = civil unrest = deaths
  rate *= 1 + (pop.militancy / 200);
  
  return Math.max(5, rate); // minimum 5 per 1000
}

/**
 * Calculate expected deaths for a pop in a month
 * @param pop - The population group
 * @param sol - Standard of Living (0-100+)
 * @param needsMet - Percentage of needs met (0-100)
 * @returns Number of expected deaths
 */
export function calculateExpectedDeaths(
  pop: Pop,
  sol: number,
  needsMet: number
): number {
  const deathRate = calculateDeathRate(pop, sol, needsMet);
  const monthlyRate = (deathRate / 1000) / 12;
  return Math.floor(pop.population * monthlyRate);
}

// =============================================================================
// PROCESS POPULATION GROWTH
// =============================================================================

export interface PopulationGrowthResult {
  changes: PopulationChange[];
  events: PopBirthDeath[];
  newPops: Pop[];
  totalBirths: number;
  totalDeaths: number;
  totalNetChange: number;
}

/**
 * Calculate total population in a state
 * @param pops - All pops
 * @param stateId - State ID to calculate for
 * @returns Total population in the state
 */
function popPopulationInState(pops: Pop[], stateId: string): number {
  return pops.filter((p) => p.stateId === stateId).reduce((sum, p) => sum + p.population, 0);
}

/**
 * Process population growth for all pops
 * @param pops - Current population groups
 * @param stateSoL - Standard of Living by state
 * @param stateNeedsMet - Needs met percentage by state
 * @returns Population growth result with events and new pops
 */
export function processPopulationGrowth(
  pops: Pop[],
  stateSoL: Record<string, number>,
  stateNeedsMet: Record<string, number>
): PopulationGrowthResult {
  const events: PopBirthDeath[] = [];
  const newPops: Pop[] = [];
  const changesByState: Map<string, PopulationChange> = new Map();
  
  let totalBirths = 0;
  let totalDeaths = 0;
  
  for (const pop of pops) {
    const sol = stateSoL[pop.stateId] ?? 50;
    const needsMet = stateNeedsMet[pop.stateId] ?? 50;
    
    // Calculate births
    const births = calculateExpectedBirths(pop, sol);
    if (births > 0) {
      // Create new pop (child inherits parent's basic traits)
      const childPop: Pop = {
        ...pop,
        id: `pop_child_${pop.id}_${Date.now()}`,
        population: births,
        profession: PopProfession.LABORER, // Children start as laborers
        stratum: PopStratum.LOWER,
        wealth: 0,
        income: 0,
        employed: false,
        workplaceId: null,
        needsMet: 50,
        loyalty: 50,
        militancy: 0,
        radicals: 0,
        consciousness: 0,
        employmentStatus: EmploymentStatus.UNEMPLOYED,
      };
      newPops.push(childPop);
      
      events.push({
        popId: pop.id,
        type: 'birth',
        population: births,
        timestamp: Date.now(),
        cause: 'natural',
      });
      totalBirths += births;
    }
    
    // Calculate deaths
    const deaths = calculateExpectedDeaths(pop, sol, needsMet);
    if (deaths > 0 && pop.population > deaths) {
      pop.population -= deaths;
      
      events.push({
        popId: pop.id,
        type: 'death',
        population: deaths,
        timestamp: Date.now(),
        cause: needsMet < 30 ? 'starvation' : 'natural',
      });
      totalDeaths += deaths;
    }
    
    // Track state-level changes
    const current = changesByState.get(pop.stateId) ?? {
      stateId: pop.stateId,
      births: 0,
      deaths: 0,
      netChange: 0,
      growthRate: 0,
    };
    current.births += births;
    current.deaths += deaths;
    changesByState.set(pop.stateId, current);
  }
  
  // Calculate net changes and rates
  const changes: PopulationChange[] = [];
  for (const [, change] of changesByState) {
    const total = popPopulationInState(pops, change.stateId);
    // Account for new births in the total
    const changeForState = changesByState.get(change.stateId);
    const birthsInState = changeForState?.births ?? 0;
    const deathsInState = changeForState?.deaths ?? 0;
    const adjustedTotal = total + birthsInState - deathsInState;
    
    change.netChange = change.births - change.deaths;
    change.growthRate = adjustedTotal > 0 ? (change.netChange / adjustedTotal) * 100 : 0;
    changes.push(change);
  }
  
  const totalNetChange = totalBirths - totalDeaths;
  
  return {
    changes,
    events,
    newPops,
    totalBirths,
    totalDeaths,
    totalNetChange,
  };
}

// =============================================================================
// APPLY GROWTH
// =============================================================================

/**
 * Apply population growth by adding new pops to existing
 * @param existingPops - Current population groups
 * @param newPops - New population groups from growth
 * @returns Combined population array
 */
export function applyPopulationGrowth(
  existingPops: Pop[],
  newPops: Pop[]
): Pop[] {
  // Add new pops to existing
  return [...existingPops, ...newPops];
}
