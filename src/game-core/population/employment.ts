/**
 * Employment System - Job Matching
 * Phase 4: Population System
 */

import { Pop, PopProfession, PopStratum, EmploymentStatus, POP_TYPES } from './types';

/**
 * Job Opening - available position in a building
 */
export interface JobOpening {
  id: string;
  buildingId: string;
  profession: PopProfession;
  wage: number;
  available: number;
  requiredSkills: string[];
  preferredStratum: PopStratum | null;
}

/**
 * Employment Market - labor market for a state
 */
export interface EmploymentMarket {
  stateId: string;
  jobOpenings: JobOpening[];
  unemployedPops: Pop[];
  employedPops: Pop[];
  averageWage: number;
  unemploymentRate: number;
}

/**
 * Job Match Result - result of a job matching attempt
 */
export interface JobMatchResult {
  popId: string;
  buildingId: string;
  wage: number;
  success: boolean;
}

/**
 * Building with job openings
 */
export interface BuildingWithJobs {
  jobOpenings: JobOpening[];
  level: number;
  stateId: string;
}

/**
 * Calculate unemployment rate for a market
 */
export function calculateUnemploymentRate(market: EmploymentMarket): number {
  const total = market.employedPops.length + market.unemployedPops.length;
  if (total === 0) return 0;
  return (market.unemployedPops.length / total) * 100;
}

/**
 * Match a single pop to a job
 */
export function matchJob(pop: Pop, market: EmploymentMarket): JobMatchResult {
  const compatibleJobs = market.jobOpenings.filter((job: JobOpening): boolean => {
    if (job.profession !== pop.profession) return false;
    if (job.preferredStratum !== null && job.preferredStratum !== pop.stratum) return false;
    if (job.available <= 0) return false;
    return true;
  });

  if (compatibleJobs.length === 0) {
    return {
      popId: pop.id,
      buildingId: '',
      wage: 0,
      success: false,
    };
  }

  const bestJob = compatibleJobs.reduce((best: JobOpening, job: JobOpening): JobOpening => 
    job.wage > best.wage ? job : best
  );

  return {
    popId: pop.id,
    buildingId: bestJob.buildingId,
    wage: bestJob.wage,
    success: true,
  };
}

/**
 * Process all unemployed pops in a market
 */
export function processUnemployedPops(pops: Pop[], market: EmploymentMarket): JobMatchResult[] {
  const results: JobMatchResult[] = [];
  const unemployed = pops.filter((p: Pop): boolean => !p.employed);

  for (const pop of unemployed) {
    const result = matchJob(pop, market);
    if (result.success) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Update pop employment status based on matching results
 */
export function updateEmployment(pops: Pop[], results: JobMatchResult[]): Pop[] {
  return pops.map((pop: Pop): Pop => {
    const match = results.find((m: JobMatchResult): boolean => m.popId === pop.id);
    if (match?.success) {
      return {
        ...pop,
        employed: true,
        workplaceId: match.buildingId,
        income: match.wage,
        employmentStatus: EmploymentStatus.EMPLOYED,
      };
    }
    return pop;
  });
}

/**
 * Create employment market for a state
 */
export function createEmploymentMarket(stateId: string): EmploymentMarket {
  return {
    stateId,
    jobOpenings: [],
    unemployedPops: [],
    employedPops: [],
    averageWage: 0,
    unemploymentRate: 0,
  };
}

/**
 * Add pops to a market
 */
export function addPopsToMarket(market: EmploymentMarket, pops: Pop[]): EmploymentMarket {
  const employed: Pop[] = [];
  const unemployed: Pop[] = [];

  for (const pop of pops) {
    if (pop.employed) {
      employed.push(pop);
    } else {
      unemployed.push(pop);
    }
  }

  return {
    ...market,
    employedPops: [...market.employedPops, ...employed],
    unemployedPops: [...market.unemployedPops, ...unemployed],
  };
}

/**
 * Add job openings to a market
 */
export function addJobOpeningsToMarket(market: EmploymentMarket, openings: JobOpening[]): EmploymentMarket {
  return {
    ...market,
    jobOpenings: [...market.jobOpenings, ...openings],
  };
}

/**
 * Process labor market for all states
 */
export function processLaborMarket(
  pops: Pop[],
  buildings: Map<string, BuildingWithJobs>
): Pop[] {
  // Group pops by state
  const statePopsMap = new Map<string, Pop[]>();

  for (const pop of pops) {
    const existing = statePopsMap.get(pop.stateId) || [];
    existing.push(pop);
    statePopsMap.set(pop.stateId, existing);
  }

  // Group job openings by state
  const stateJobsMap = new Map<string, JobOpening[]>();

  for (const [buildingId, building] of buildings) {
    const stateId = building.stateId;
    const existing = stateJobsMap.get(stateId) || [];
    for (const job of building.jobOpenings) {
      existing.push({
        ...job,
        id: `${stateId}_${job.id}`,
      });
    }
    stateJobsMap.set(stateId, existing);
  }

  // Process each state
  let updatedPops = pops;

  for (const [stateId, statePops] of statePopsMap) {
    let market = createEmploymentMarket(stateId);
    market = addPopsToMarket(market, statePops);

    const jobOpenings = stateJobsMap.get(stateId) || [];
    market = addJobOpeningsToMarket(market, jobOpenings);

    const results = processUnemployedPops(statePops, market);
    updatedPops = updateEmployment(updatedPops, results);
  }

  return updatedPops;
}

/**
 * Calculate base wage for a profession
 */
export function calculateBaseWage(
  profession: PopProfession,
  buildingLevel: number,
  stateSoL: number,
  marketCompetition: number
): number {
  const popType = POP_TYPES[profession];
  const baseWage = popType.wageWeight * 10;

  const scaleBonus = Math.min(buildingLevel * 0.01, 0.50);
  const solAdjustment = 1 + (stateSoL / 100) * 0.5;
  const competitionFactor = 1 + (marketCompetition / 100) * 0.3;

  return Math.round(baseWage * (1 + scaleBonus) * solAdjustment * competitionFactor);
}

/**
 * Create a job opening
 */
export function createJobOpening(
  buildingId: string,
  profession: PopProfession,
  wage: number,
  available: number,
  requiredSkills: string[] = [],
  preferredStratum: PopStratum | null = null
): JobOpening {
  return {
    id: `${buildingId}_${profession}`,
    buildingId,
    profession,
    wage,
    available,
    requiredSkills,
    preferredStratum,
  };
}