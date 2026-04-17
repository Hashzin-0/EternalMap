/**
 * Complete Game State Types
 * Aggregates all game systems into a single state interface
 */

// Use import types for proper typing
import type { Treasury } from '../economy/treasury'
import type { ConstructionQueue } from '../economy/construction'
import type { Pop } from '../population/types'
import type { GovernmentType, InterestGroup } from '../politics'
import type { ResearchQueue } from '../technology'
import type { DiplomaticState } from '../diplomacy'

/* =============================================================================
 * ECONOMY STATE
 * ========================================================================== */

export interface EconomyState {
  treasury: Treasury
  constructionQueue: ConstructionQueue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markets: Map<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tradeRoutes: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildings: Map<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goods: Map<string, any>
}

/* =============================================================================
 * POPULATION STATE
 * ========================================================================== */

export interface PopulationState {
  pops: Map<string, Pop>
  totalPopulation: number
  employedPopulation: number
  unemployedPopulation: number
  averageNeedsMet: number
  averageLoyalty: number
  averageMilitancy: number
  literacy: number
}

/* =============================================================================
 * POLITICS STATE
 * ========================================================================== */

export interface PoliticsState {
  government: GovernmentType
  legitimacy: number
  interestGroups: Map<string, InterestGroup>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeLaws: Map<string, any>
  cabinet: string[]
  lastElectionDate: number | null
  electionsHeld: boolean
}

/* =============================================================================
 * TECHNOLOGY STATE
 * ========================================================================== */

export interface TechnologyState {
  innovation: number
  researchedTechs: string[]
  researchQueue: ResearchQueue
  unlockedBuildings: string[]
  unlockedLaws: string[]
  unlockedProductionMethods: string[]
}

/* =============================================================================
 * DIPLOMACY STATE
 * ========================================================================== */

export interface DiplomacyState {
  diplomaticState: DiplomaticState
  prestige: number
  infamy: number
  powerRank: number
  subjects: string[]
}

/* =============================================================================
 * COMPLETE GAME STATE (for Zustand)
 * ========================================================================== */

export interface CompleteGameState {
  // Base
  time: number
  timeScale: number
  isPaused: boolean
  gameSpeed: number
  currentYear: number
  currentMonth: number

  // Economy
  economy: EconomyState

  // Population
  population: PopulationState

  // Politics
  politics: PoliticsState

  // Technology
  technology: TechnologyState

  // Diplomacy
  diplomacy: DiplomacyState

  // UI State
  selectedTile: { x: number; y: number } | null
  selectedState: string | null
  cameraPosition: { x: number; y: number }
  cameraZoom: number
  isLoaded: boolean
}

/* =============================================================================
 * SYSTEM UPDATE CONTEXT
 * Each system receives this context for updates
 * ========================================================================== */

export interface SystemUpdateContext {
  delta: number
  time: number
  year: number
  month: number
  gameSpeed: number
}

/* =============================================================================
 * ECONOMY UPDATE RESULT
 * ========================================================================== */

export interface EconomyUpdateResult {
  income: number
  expenses: number
  netIncome: number
  constructionProgress: number
  completedBuildings: string[]
}

/* =============================================================================
 * POPULATION UPDATE RESULT
 * ========================================================================== */

export interface PopulationUpdateResult {
  populationChange: number
  employmentChange: number
  migration: number
  radicalChange: number
}

/* =============================================================================
 * POLITICS UPDATE RESULT
 * ========================================================================== */

export interface PoliticsUpdateResult {
  legitimacyChange: number
  igCloutChanges: Map<string, number>
  lawChanges: string[]
  electionTriggered: boolean
}

/* =============================================================================
 * TECHNOLOGY UPDATE RESULT
 * ========================================================================== */

export interface TechnologyUpdateResult {
  progress: number
  completedResearch: string[]
  techsUnlocked: string[]
  innovationChange: number
}

/* =============================================================================
 * DIPLOMACY UPDATE RESULT
 * ========================================================================== */

export interface DiplomacyUpdateResult {
  prestigeChange: number
  infamyChange: number
  warsConcluded: string[]
  newWars: string[]
  treatiesExpired: string[]
}