/**
 * Migration System - Pop movement between states
 * Phase 4: Population System
 */

import { Pop, PopStratum } from './types';

/**
 * Migration Types
 */
export enum MigrationType {
  INTRA_MARKET = 'intra_market',
  INTER_MARKET = 'inter_market',
  MASS = 'mass',
  COLONIZATION = 'colonization',
}

export enum MigrationCause {
  EMPLOYMENT = 'employment',
  STANDARD_OF_LIVING = 'sol',
  DISCRIMINATION = 'discrimination',
  PUSH_FACTOR = 'push_factor',
  PULL_FACTOR = 'pull_factor',
}

export interface MigrationEvent {
  id: string;
  popId: string;
  fromStateId: string;
  toStateId: string;
  type: MigrationType;
  cause: MigrationCause;
  population: number;
  timestamp: number;
  success: boolean;
}

/**
 * Migration Attractiveness Calculation
 */
export interface MigrationAttractiveness {
  stateId: string;
  score: number;
  employmentOpportunities: number;
  averageSoL: number;
  availableHousing: number;
  discrimination: number;
}

export function calculateMigrationAttractiveness(
  stateId: string,
  employmentRate: number,
  averageSoL: number,
  availableHousing: number,
  discrimination: number
): MigrationAttractiveness {
  const employmentScore = employmentRate * 0.25;
  const solScore = averageSoL * 0.30;
  const housingScore = Math.min(availableHousing / 100, 1) * 20;
  const discriminationPenalty = discrimination * 0.20;

  const score = 50 + employmentScore + solScore + housingScore - discriminationPenalty;

  return {
    stateId,
    score: Math.max(0, Math.min(100, score)),
    employmentOpportunities: employmentScore,
    averageSoL: solScore,
    availableHousing: housingScore,
    discrimination: discriminationPenalty,
  };
}

/**
 * Calculate migration probability for a pop
 */
export function calculateMigrationProbability(
  pop: Pop,
  currentAttractiveness: MigrationAttractiveness,
  targetAttractiveness: MigrationAttractiveness
): number {
  const solDiff = targetAttractiveness.score - currentAttractiveness.score;

  if (solDiff <= 0) return 0;

  const stratumMultiplier: Record<PopStratum, number> = {
    [PopStratum.UPPER]: 1.5,
    [PopStratum.MIDDLE]: 1.2,
    [PopStratum.LOWER]: 1.0,
  };

  const unemploymentBonus = pop.employed ? 0 : 20;
  const militancyBonus = pop.militancy * 0.1;

  const baseProbability = (solDiff / 100) * 30 * stratumMultiplier[pop.stratum];

  return Math.max(0, Math.min(100, baseProbability + unemploymentBonus + militancyBonus));
}

/**
 * Select best migration target for a pop
 */
export function selectMigrationTarget(
  pop: Pop,
  targetStates: MigrationAttractiveness[]
): string | null {
  const currentState = targetStates.find((t) => t.stateId === pop.stateId);
  if (!currentState) return null;

  const probabilities = targetStates
    .filter((t) => t.stateId !== pop.stateId)
    .map((target) => ({
      stateId: target.stateId,
      probability: calculateMigrationProbability(pop, currentState, target),
    }));

  probabilities.sort((a, b) => b.probability - a.probability);

  if (probabilities[0].probability > 0) {
    return probabilities[0].stateId;
  }

  return null;
}

/**
 * Process migration for all pops
 */
export interface MigrationResult {
  events: MigrationEvent[];
  migratedPops: string[];
  populationMoved: number;
}

export function processMigration(
  pops: Pop[],
  stateAttractiveness: Record<string, MigrationAttractiveness>,
  stateEmployment: Record<string, number>
): MigrationResult {
  const events: MigrationEvent[] = [];
  const migratedPopIds: string[] = [];
  let totalMoved = 0;

  for (const pop of pops) {
    if (pop.employed && pop.militancy < 30) continue;

    const currentStateAttr = stateAttractiveness[pop.stateId];
    if (!currentStateAttr) continue;

    const otherStates = Object.values(stateAttractiveness).filter(
      (s) => s.stateId !== pop.stateId
    );

    const targetStateId = selectMigrationTarget(pop, otherStates);
    if (!targetStateId) continue;

    const targetAttr = stateAttractiveness[targetStateId];
    const probability = calculateMigrationProbability(pop, currentStateAttr, targetAttr);

    const roll = Math.random() * 100;
    if (roll < probability) {
      const event: MigrationEvent = {
        id: `migration_${pop.id}_${Date.now()}`,
        popId: pop.id,
        fromStateId: pop.stateId,
        toStateId: targetStateId,
        type: pop.stateId.split('_')[0] === targetStateId.split('_')[0]
          ? MigrationType.INTRA_MARKET
          : MigrationType.INTER_MARKET,
        cause: pop.employed ? MigrationCause.EMPLOYMENT : MigrationCause.STANDARD_OF_LIVING,
        population: pop.population,
        timestamp: Date.now(),
        success: true,
      };

      events.push(event);
      migratedPopIds.push(pop.id);
      totalMoved += pop.population;
    }
  }

  return {
    events,
    migratedPops: migratedPopIds,
    populationMoved: totalMoved,
  };
}

/**
 * Apply migration results to pop array
 */
export function applyMigration(
  pops: Pop[],
  migratedPopIds: string[],
  targetStateIds: Record<string, string>
): Pop[] {
  return pops.map((pop) => {
    if (migratedPopIds.includes(pop.id)) {
      const newStateId = targetStateIds[pop.id];
      if (newStateId) {
        return { ...pop, stateId: newStateId, employed: false, workplaceId: null };
      }
    }
    return pop;
  });
}

/**
 * Mass migration for colonization scenarios
 */
export function processMassMigration(
  pops: Pop[],
  sourceStates: string[],
  targetStateId: string,
  capacity: number
): MigrationResult {
  const sourcePops = pops.filter(
    (p) =>
      sourceStates.includes(p.stateId) &&
      p.stratum !== PopStratum.UPPER
  );

  sourcePops.sort((a, b) => b.militancy - a.militancy);

  const events: MigrationEvent[] = [];
  const migratedPopIds: string[] = [];
  let totalMoved = 0;

  for (const pop of sourcePops) {
    if (totalMoved >= capacity) break;

    const event: MigrationEvent = {
      id: `mass_migration_${pop.id}_${Date.now()}`,
      popId: pop.id,
      fromStateId: pop.stateId,
      toStateId: targetStateId,
      type: MigrationType.MASS,
      cause: MigrationCause.PUSH_FACTOR,
      population: pop.population,
      timestamp: Date.now(),
      success: true,
    };

    events.push(event);
    migratedPopIds.push(pop.id);
    totalMoved += pop.population;
  }

  return {
    events,
    migratedPops: migratedPopIds,
    populationMoved: totalMoved,
  };
}