import {
  createTreasury,
  type Treasury,
  type ConstructionQueue,
  type Market,
  type TradeRoute,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetIncome,
  completeFinishedProjects,
  createConstructionQueue,
} from '../game-core/economy'
import {
  GovernmentType,
  calculateLegitimacy,
  calculateClout,
  type InterestGroup,
  getMainInterestGroups,
  INTEREST_GROUPS,
} from '../game-core/politics'
import {
  calculateInnovation,
  processResearch,
  createEmptyResearchQueue,
  type ResearchQueue,
} from '../game-core/technology'
import {
  createDiplomaticState,
  applyInfamyDecay,
  calculatePrestige,
  CountryRank,
} from '../game-core/diplomacy'
import type {
  EconomyState,
  PopulationState,
  PoliticsState,
  TechnologyState,
  DiplomacyState,
  EconomyUpdateResult,
  PopulationUpdateResult,
  PoliticsUpdateResult,
  TechnologyUpdateResult,
  DiplomacyUpdateResult,
  SystemUpdateContext,
} from '../game-core/types/complete-game-state'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GameEventEmitter = any

/**
 * GameManager - Coordinates all game systems
 * 
 * This class integrates economy, population, politics, technology, and diplomacy
 * systems into the Phaser game loop.
 */
export class GameManager {
  private economyState!: EconomyState
  private populationState!: PopulationState
  private politicsState!: PoliticsState
  private technologyState!: TechnologyState
  private diplomacyState!: DiplomacyState
  
  private currentYear: number = 1836
  private currentMonth: number = 1
  private lastUpdateTime: number = 0
  
  private eventEmitter: GameEventEmitter | null = null

  /* =========================================================================
   * INITIALIZATION
   * ========================================================================= */

  setEventEmitter(emitter: GameEventEmitter): void {
    this.eventEmitter = emitter
  }

  initialize(
    startingYear: number,
    startingTreasury: number,
    startingPopulation: number
  ): void {
    this.currentYear = startingYear
    this.currentMonth = 1
    
    // Initialize economy
    this.economyState = this.createEmptyEconomyState()
    this.economyState.treasury = createTreasury('player', startingTreasury)
    this.economyState.constructionQueue = createConstructionQueue('player')
    
    // Initialize population
    this.populationState = this.createEmptyPopulationState()
    this.populationState.totalPopulation = startingPopulation
    
    // Initialize politics
    this.politicsState = this.createEmptyPoliticsState()
    this.politicsState.government = GovernmentType.MONARCHY
    this.politicsState.legitimacy = 50
    
    // Initialize interest groups
    const igTypes = getMainInterestGroups()
    this.politicsState.interestGroups = new Map()
    for (const igType of igTypes) {
      const def = INTEREST_GROUPS[igType]
      const ig: InterestGroup = {
        ...def,
        clout: 10,
        size: startingPopulation * 0.1,
        inGovernment: false,
        rulingParty: false,
      }
      this.politicsState.interestGroups.set(igType, ig)
    }
    
    // Initialize technology
    this.technologyState = this.createEmptyTechnologyState()
    this.technologyState.innovation = 20
    this.technologyState.researchQueue = createEmptyResearchQueue('player')
    
    // Initialize diplomacy
    this.diplomacyState = this.createEmptyDiplomacyState()
    this.diplomacyState.prestige = 10
    this.diplomacyState.infamy = 0
    this.diplomacyState.powerRank = 0
    
    this.lastUpdateTime = performance.now()
    
    this.emitEvent('gameInitialized', {
      year: this.currentYear,
      treasury: startingTreasury,
      population: startingPopulation,
    })
  }

  /* =========================================================================
   * UPDATE LOOP
   * Called every frame from MainScene.update()
   * ========================================================================= */

  update(delta: number): void {
    const now = performance.now()
    const realDelta = (now - this.lastUpdateTime) / 1000 // Convert to seconds
    this.lastUpdateTime = now
    
    if (realDelta <= 0 || realDelta > 1) return // Skip irregular updates
    
    const gameSpeed = 1 // Could be tied to game settings
    const context: SystemUpdateContext = {
      delta: realDelta,
      time: realDelta * gameSpeed,
      year: this.currentYear,
      month: this.currentMonth,
      gameSpeed,
    }
    
    // Update time
    this.updateTime(context)
    
    // Update all systems in order
    this.updateEconomy(context)
    this.updatePopulation(context)
    this.updatePolitics(context)
    this.updateTechnology(context)
    this.updateDiplomacy(context)
    
    // Emit events for UI updates
    this.emitPeriodicEvents()
  }

  /* =========================================================================
   * TIME MANAGEMENT
   * ========================================================================= */

  private updateTime(context: SystemUpdateContext): void {
    // Accumulate months
    this.currentMonth += context.delta * context.gameSpeed
    
    while (this.currentMonth > 12) {
      this.currentMonth -= 12
      this.currentYear += 1
      
      this.emitEvent('yearChanged', { year: this.currentYear })
    }
    
    this.emitEvent('timeUpdated', {
      year: this.currentYear,
      month: Math.floor(this.currentMonth),
    })
  }

  /* =========================================================================
   * ECONOMY SYSTEM UPDATE
   * ========================================================================= */

  private updateEconomy(_context: SystemUpdateContext): EconomyUpdateResult {
    // Calculate income/expenses from treasury
    const income = calculateTotalIncome(this.economyState.treasury.income)
    const expenses = calculateTotalExpenses(this.economyState.treasury.expenses)
    const netIncome = calculateNetIncome(
      this.economyState.treasury.income,
      this.economyState.treasury.expenses
    )
    
    // Process construction queue
    this.economyState.constructionQueue = completeFinishedProjects(
      this.economyState.constructionQueue
    )
    
    return {
      income,
      expenses,
      netIncome,
      constructionProgress: _context.delta * _context.gameSpeed * 10,
      completedBuildings: [],
    }
  }

  /* =========================================================================
   * POPULATION SYSTEM UPDATE
   * ========================================================================= */

  private updatePopulation(context: SystemUpdateContext): PopulationUpdateResult {
    const monthsElapsed = context.delta * context.gameSpeed
    
    // Calculate population growth based on needs and conditions
    const growthRate = this.calculateGrowthRate()
    const populationChange = Math.floor(
      this.populationState.totalPopulation * growthRate * monthsElapsed / 12
    )
    
    // Update employment (simplified)
    const employmentChange = 0
    
    // Update migration (simplified)
    const migration = Math.floor(
      this.populationState.totalPopulation * 0.001 * monthsElapsed
    )
    
    // Update radicals based on militancy
    let radicalChange = 0
    for (const [_id, pop] of this.populationState.pops) {
      if (pop.militancy > 5) {
        radicalChange += Math.floor(pop.population * 0.01 * monthsElapsed)
      }
    }
    
    // Apply changes
    this.populationState.totalPopulation += populationChange + migration
    this.populationState.employedPopulation += employmentChange
    this.populationState.unemployedPopulation = 
      this.populationState.totalPopulation - this.populationState.employedPopulation
    
    return {
      populationChange,
      employmentChange,
      migration,
      radicalChange,
    }
  }

  private calculateGrowthRate(): number {
    // Base growth rate + bonuses from conditions
    let rate = 0.015 // 1.5% base
    
    // Better living conditions = higher growth
    if (this.populationState.averageNeedsMet > 80) rate += 0.005
    if (this.populationState.averageNeedsMet < 40) rate -= 0.01
    
    // Healthcare advances help
    if (this.technologyState.unlockedBuildings.includes('hospital')) {
      rate += 0.003
    }
    
    return Math.max(-0.02, Math.min(0.05, rate))
  }

  /* =========================================================================
   * POLITICS SYSTEM UPDATE
   * ========================================================================= */

  private updatePolitics(_context: SystemUpdateContext): PoliticsUpdateResult {
    // Calculate legitimacy
    const igsInGovernment = Array.from(this.politicsState.interestGroups.values())
      .filter(ig => ig.inGovernment)
    
    const newLegitimacy = calculateLegitimacy(
      this.politicsState.government,
      igsInGovernment.map(ig => ig.id),
      this.politicsState.electionsHeld,
      this.currentMonth >= 6 ? 6 : 0
    )
    
    const legitimacyChange = newLegitimacy - this.politicsState.legitimacy
    this.politicsState.legitimacy = newLegitimacy
    
    // Update interest group clout
    const igCloutChanges = new Map<string, number>()
    for (const [id, ig] of this.politicsState.interestGroups) {
      const newClout = calculateClout(
        ig,
        this.populationState.totalPopulation,
        this.politicsState.legitimacy,
        this.politicsState.government
      )
      igCloutChanges.set(id, newClout - ig.clout)
      ig.clout = newClout
    }
    
    return {
      legitimacyChange,
      igCloutChanges,
      lawChanges: [],
      electionTriggered: false,
    }
  }

  /* =========================================================================
   * TECHNOLOGY SYSTEM UPDATE
   * ========================================================================= */

  private updateTechnology(context: SystemUpdateContext): TechnologyUpdateResult {
    const monthsElapsed = context.delta * context.gameSpeed
    
    // Calculate innovation based on literacy and bureaucracy
    const literacy = this.populationState.literacy
    const bureaucracy = 10 // Could be tied to government buildings
    
    const baseInnovation = this.technologyState.innovation
    const newInnovation = calculateInnovation(baseInnovation, literacy, bureaucracy)
    const innovationChange = newInnovation - baseInnovation
    this.technologyState.innovation = newInnovation
    
    // Process research queue
    const previousQueue = this.technologyState.researchQueue
    const updatedQueue = processResearch(
      previousQueue,
      newInnovation,
      monthsElapsed
    )
    
    let progress = 0
    let completedResearch: string[] = []
    
    if (previousQueue.currentTech && !updatedQueue.currentTech) {
      // Tech completed
      completedResearch = [previousQueue.currentTech]
      this.technologyState.researchedTechs.push(previousQueue.currentTech)
    } else {
      progress = updatedQueue.progress - previousQueue.progress
    }
    
    this.technologyState.researchQueue = updatedQueue
    
    return {
      progress,
      completedResearch,
      techsUnlocked: completedResearch,
      innovationChange,
    }
  }

  /* =========================================================================
   * DIPLOMACY SYSTEM UPDATE
   * ========================================================================= */

  private updateDiplomacy(context: SystemUpdateContext): DiplomacyUpdateResult {
    const monthsElapsed = context.delta * context.gameSpeed
    
    // Calculate prestige
    const gdpShare = 5 // Simplified - could calculate from economy
    const militaryShare = 3
    const populationShare = 2
    
    const previousPrestige = this.diplomacyState.prestige
    const newPrestige = calculatePrestige(
      previousPrestige,
      gdpShare,
      militaryShare,
      populationShare,
      CountryRank.MINOR_POWER,
      monthsElapsed
    )
    const prestigeChange = newPrestige - previousPrestige
    this.diplomacyState.prestige = newPrestige
    
    // Process infamy decay
    const infamyBefore = this.diplomacyState.infamy
    const updatedInfamy = applyInfamyDecay({
      current: this.diplomacyState.infamy,
      max: 1000,
      lastDecayDate: Date.now(),
      decayRate: 10,
    })
    const infamyChange = updatedInfamy.current - infamyBefore
    this.diplomacyState.infamy = updatedInfamy.current
    
    return {
      prestigeChange,
      infamyChange,
      warsConcluded: [],
      newWars: [],
      treatiesExpired: [],
    }
  }

  /* =========================================================================
   * STATE ACCESSORS
   * ========================================================================= */

  getEconomyState(): EconomyState {
    return this.economyState
  }

  getPopulationState(): PopulationState {
    return this.populationState
  }

  getPoliticsState(): PoliticsState {
    return this.politicsState
  }

  getTechnologyState(): TechnologyState {
    return this.technologyState
  }

  getDiplomacyState(): DiplomacyState {
    return this.diplomacyState
  }

  getCurrentYear(): number {
    return this.currentYear
  }

  getCurrentMonth(): number {
    return Math.floor(this.currentMonth)
  }

  getTreasury(): Treasury {
    return this.economyState.treasury
  }

  /* =========================================================================
   * EVENT EMITTER
   * ========================================================================= */

  private emitEvent(event: string, data: unknown): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(event, data)
    }
  }

  private emitPeriodicEvents(): void {
    // Emit more frequent UI updates (every ~1 second)
    const now = performance.now()
    if (now - this.lastUpdateTime > 1000) {
      this.emitEvent('gameTick', {
        year: this.currentYear,
        month: Math.floor(this.currentMonth),
        treasury: this.economyState.treasury.balance,
        population: this.populationState.totalPopulation,
        legitimacy: this.politicsState.legitimacy,
        prestige: this.diplomacyState.prestige,
      })
    }
  }

  /* =========================================================================
   * STATE FACTORIES
   * ========================================================================= */

  private createEmptyEconomyState(): EconomyState {
    return {
      treasury: createTreasury('player', 0),
      constructionQueue: createConstructionQueue('player'),
      markets: new Map<string, Market>(),
      tradeRoutes: [] as unknown as TradeRoute[],
      buildings: new Map<string, { id: string; stateId: string; level: number }>(),
      goods: new Map<string, { id: string; amount: number; value: number }>(),
    }
  }

  private createEmptyPopulationState(): PopulationState {
    return {
      pops: new Map<string, never>(),
      totalPopulation: 0,
      employedPopulation: 0,
      unemployedPopulation: 0,
      averageNeedsMet: 50,
      averageLoyalty: 50,
      averageMilitancy: 10,
      literacy: 20,
    }
  }

  private createEmptyPoliticsState(): PoliticsState {
    return {
      government: GovernmentType.MONARCHY,
      legitimacy: 50,
      interestGroups: new Map<string, InterestGroup>(),
      activeLaws: new Map<string, never>(),
      cabinet: [],
      lastElectionDate: null,
      electionsHeld: false,
    }
  }

  private createEmptyTechnologyState(): TechnologyState {
    return {
      innovation: 20,
      researchedTechs: [],
      researchQueue: createEmptyResearchQueue('player'),
      unlockedBuildings: [],
      unlockedLaws: [],
      unlockedProductionMethods: [],
    }
  }

  private createEmptyDiplomacyState(): DiplomacyState {
    return {
      diplomaticState: createDiplomaticState(),
      prestige: 10,
      infamy: 0,
      powerRank: 0,
      subjects: [],
    }
  }

  /* =========================================================================
   * DEBUG
   * ========================================================================= */

  getDebugState(): object {
    return {
      year: this.currentYear,
      month: Math.floor(this.currentMonth),
      treasury: this.economyState?.treasury.balance ?? 0,
      population: this.populationState.totalPopulation,
      legitimacy: this.politicsState.legitimacy,
      innovation: this.technologyState.innovation,
      prestige: this.diplomacyState.prestige,
    }
  }
}

/**
 * Create a new GameManager instance
 */
export function createGameManager(): GameManager {
  return new GameManager()
}