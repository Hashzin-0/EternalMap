/**
 * EternalMap - Diplomacy System
 * Phase 7: Relations, Wars, Peace, Subjects
 * 
 * Complete diplomatic mechanics inspired by Victoria 3:
 * - Country relations (-100 to +100)
 * - Diplomatic plays (3 phases)
 * - War system with fronts and occupation
 * - Peace treaties
 * - Subject relationships (vassals, dominions, etc.)
 * - Prestige and power rank (6 tiers)
 * - Infamy system with decay
 */

// ============================================================
// 1. RELATIONS (-100 to +100)
// ============================================================

export interface CountryRelation {
  fromCountryId: string;
  toCountryId: string;
  value: number; // -100 to +100
  
  // Diplomatic events
  hasEmbassy: boolean;
  tradeAgreement: boolean;
  militaryAccess: boolean;
  alliance: boolean;
  
  // Opinions
  fromOpinion: number; // -100 to +100
  toOpinion: number;
  
  lastContact: number; // timestamp
}

export function createRelation(
  fromId: string,
  toId: string,
  baseValue: number = 0
): CountryRelation {
  return {
    fromCountryId: fromId,
    toCountryId: toId,
    value: Math.max(-100, Math.min(100, baseValue)),
    hasEmbassy: false,
    tradeAgreement: false,
    militaryAccess: false,
    alliance: false,
    fromOpinion: 0,
    toOpinion: 0,
    lastContact: Date.now(),
  };
}

export function updateRelation(
  relation: CountryRelation,
  change: number
): CountryRelation {
  const newValue = Math.max(-100, Math.min(100, relation.value + change));
  return { ...relation, value: newValue, lastContact: Date.now() };
}

export function setRelationValue(
  relation: CountryRelation,
  value: number
): CountryRelation {
  return { 
    ...relation, 
    value: Math.max(-100, Math.min(100, value)), 
    lastContact: Date.now() 
  };
}

// ============================================================
// 2. DIPLOMATIC PLAYS (3 phases)
// ============================================================

export enum DiplomaticPlayPhase {
  INITIAL = 'initial',     // Initiator declares
  MOBILIZATION = 'mobilization', // Both sides prepare
  RESOLUTION = 'resolution',    // War or peace
}

export enum DiplomaticPlayType {
  ANNEXATION = 'annexation',
  VASSALIZATION = 'vassalization',
  LIBERATE = 'liberate',
  TRANSFER = 'transfer',
  CEASEFIRE = 'ceasefire',
}

export interface DiplomaticPlay {
  id: string;
  type: DiplomaticPlayType;
  initiatorId: string;
  targetId: string;
  
  // Current state
  phase: DiplomaticPlayPhase;
  startDate: number;
  
  // Participants
  backers: string[]; // countries supporting initiator
  opponents: string[]; // countries supporting target
  
  // Stakes
  wargoal: string;
  wargoalStateId: string;
  
  // Resolution
  outcome: 'initiator_wins' | 'target_wins' | 'stalemate' | null;
  outcomeDate: number | null;
}

export function createDiplomaticPlay(
  initiatorId: string,
  targetId: string,
  type: DiplomaticPlayType,
  wargoalStateId: string
): DiplomaticPlay {
  return {
    id: `dp_${initiatorId}_${targetId}_${Date.now()}`,
    type,
    initiatorId,
    targetId,
    phase: DiplomaticPlayPhase.INITIAL,
    startDate: Date.now(),
    backers: [initiatorId],
    opponents: [targetId],
    wargoal: type,
    wargoalStateId,
    outcome: null,
    outcomeDate: null,
  };
}

export function advanceDiplomaticPlayPhase(
  play: DiplomaticPlay
): DiplomaticPlay {
  if (play.phase === DiplomaticPlayPhase.INITIAL) {
    return { ...play, phase: DiplomaticPlayPhase.MOBILIZATION };
  }
  if (play.phase === DiplomaticPlayPhase.MOBILIZATION) {
    return { ...play, phase: DiplomaticPlayPhase.RESOLUTION };
  }
  return play;
}

export function resolveDiplomaticPlay(
  play: DiplomaticPlay,
  outcome: 'initiator_wins' | 'target_wins' | 'stalemate'
): DiplomaticPlay {
  return {
    ...play,
    phase: DiplomaticPlayPhase.RESOLUTION,
    outcome,
    outcomeDate: Date.now(),
  };
}

// ============================================================
// 3. WAR SYSTEM (fronts, occupation)
// ============================================================

export interface War {
  id: string;
  name: string;
  
  // Participants
  attackers: string[];
  defenders: string[];
  
  // Fronts
  fronts: WarFront[];
  
  // Stats
  startDate: number;
  endDate: number | null;
  
  // Peace
  isOngoing: boolean;
  peaceTreaty: PeaceTreaty | null;
}

export interface WarFront {
  id: string;
  stateId: string;
  controller: string | null;
  attackerProgress: number; // 0-100
  defenderProgress: number;
  
  // Battle
  isBattleActive: boolean;
  lastBattleDate: number | null;
}

export function createWar(
  name: string,
  attackers: string[],
  defenders: string[],
  fronts: WarFront[]
): War {
  return {
    id: `war_${Date.now()}`,
    name,
    attackers,
    defenders,
    fronts,
    startDate: Date.now(),
    endDate: null,
    isOngoing: true,
    peaceTreaty: null,
  };
}

export function processWarProgress(
  war: War,
  monthsElapsed: number
): War {
  const updatedFronts = war.fronts.map(front => {
    // Fronts advance based on troop strength (simplified)
    const attackerAdvance = Math.random() * monthsElapsed * 2;
    const defenderAdvance = Math.random() * monthsElapsed * 2;
    
    return {
      ...front,
      attackerProgress: Math.min(100, front.attackerProgress + attackerAdvance),
      defenderProgress: Math.min(100, front.defenderProgress + defenderAdvance),
    };
  });
  
  return { ...war, fronts: updatedFronts };
}

export function endWar(
  war: War,
  treaty: PeaceTreaty
): War {
  return {
    ...war,
    isOngoing: false,
    endDate: Date.now(),
    peaceTreaty: treaty,
  };
}

export function addWarFront(
  war: War,
  front: WarFront
): War {
  return {
    ...war,
    fronts: [...war.fronts, front],
  };
}

// ============================================================
// 4. PEACE TREATIES
// ============================================================

export enum PeaceTreatyType {
  STATUS_QUO = 'status_quo',
  ANNEXATION = 'annexation',
  VASSALIZATION = 'vassalization',
  INDEPENDENCE = 'independence',
  WAR_REPARATIONS = 'war_reparations',
  DEMILITARIZATION = 'demilitarization',
}

export interface PeaceTreaty {
  id: string;
  warId: string;
  type: PeaceTreatyType;
  
  // Participants
  winnerId: string;
  loserId: string;
  
  // Terms
  statesTaken: string[]; // state IDs
  statesReleased: string[]; // new countries
  reparationAmount: number;
  demilitarizedZones: string[];
  
  // Duration
  signedDate: number;
  expirationDate: number | null;
}

export function createPeaceTreaty(
  war: War,
  winnerId: string,
  loserId: string,
  type: PeaceTreatyType,
  statesTaken: string[]
): PeaceTreaty {
  return {
    id: `treaty_${war.id}_${Date.now()}`,
    warId: war.id,
    type,
    winnerId,
    loserId,
    statesTaken,
    statesReleased: [],
    reparationAmount: 0,
    demilitarizedZones: [],
    signedDate: Date.now(),
    expirationDate: type === PeaceTreatyType.STATUS_QUO ? Date.now() + 365 * 24 * 60 * 60 * 1000 : null,
  };
}

export function isTreatyExpired(treaty: PeaceTreaty): boolean {
  if (treaty.expirationDate === null) return false;
  return Date.now() > treaty.expirationDate;
}

// ============================================================
// 5. SUBJECTS (Vassal, Dominion, etc.)
// ============================================================

export enum SubjectType {
  VASSAL = 'vassal',
  DOMINION = 'dominion',
  PROTECTORATE = 'protectorate',
  PUPPET = 'puppet',
  COLONY = 'colony',
}

export interface SubjectRelation {
  overlordId: string;
  subjectId: string;
  type: SubjectType;
  
  // Economic
  tribute: number; // % of income
  tradeRights: boolean;
  
  // Military
  subjectMilitaryControl: boolean;
  independentDiplomacy: boolean;
  
  // Political
  autonomy: number; // 0-100 (100 = independent)
  status: 'active' | 'rebellious' | 'free';
  
  since: number;
}

export function createSubjectRelation(
  overlordId: string,
  subjectId: string,
  type: SubjectType
): SubjectRelation {
  const tributeRates: Record<SubjectType, number> = {
    [SubjectType.VASSAL]: 15,
    [SubjectType.DOMINION]: 5,
    [SubjectType.PROTECTORATE]: 2,
    [SubjectType.PUPPET]: 20,
    [SubjectType.COLONY]: 25,
  };
  
  return {
    overlordId,
    subjectId,
    type,
    tribute: tributeRates[type],
    tradeRights: true,
    subjectMilitaryControl: type === SubjectType.DOMINION,
    independentDiplomacy: type === SubjectType.DOMINION,
    autonomy: type === SubjectType.DOMINION ? 75 : 0,
    status: 'active',
    since: Date.now(),
  };
}

export function liberationSubject(subject: SubjectRelation): SubjectRelation {
  return { ...subject, status: 'free', autonomy: 100 };
}

export function increaseAutonomy(subject: SubjectRelation, amount: number): SubjectRelation {
  return { ...subject, autonomy: Math.min(100, subject.autonomy + amount) };
}

export function decreaseAutonomy(subject: SubjectRelation, amount: number): SubjectRelation {
  const newAutonomy = Math.max(0, subject.autonomy - amount);
  const newStatus = newAutonomy < 25 ? 'rebellious' : subject.status;
  return { ...subject, autonomy: newAutonomy, status: newStatus };
}

// ============================================================
// 6. PRESTIGE/RANK (6 tiers)
// ============================================================

export enum CountryRank {
  GREAT_POWER = 'great_power',
  MAJOR_POWER = 'major_power',
  REGIONAL_POWER = 'regional_power',
  MIDDLE_POWER = 'middle_power',
  MINOR_POWER = 'minor_power',
  INSIGNIFICANT = 'insignificant',
}

export interface PrestigeMetrics {
  score: number; // raw prestige points
  rank: CountryRank;
  gdpShare: number; // % of world GDP
  militarySizeShare: number; // % of world military
  populationShare: number; // % of world population
}

export function calculateRank(
  prestige: number,
  gdpShare: number,
  militaryShare: number,
  populationShare: number
): CountryRank {
  const powerScore = (prestige * 0.3) + (gdpShare * 30) + (militaryShare * 20) + (populationShare * 10);
  
  if (powerScore >= 100) return CountryRank.GREAT_POWER;
  if (powerScore >= 50) return CountryRank.MAJOR_POWER;
  if (powerScore >= 25) return CountryRank.REGIONAL_POWER;
  if (powerScore >= 10) return CountryRank.MIDDLE_POWER;
  if (powerScore >= 5) return CountryRank.MINOR_POWER;
  return CountryRank.INSIGNIFICANT;
}

export function calculatePrestige(
  currentPrestige: number,
  gdpShare: number,
  militarySizeShare: number,
  populationShare: number,
  rank: CountryRank,
  monthsElapsed: number
): number {
  // Prestige grows based on power metrics and rank
  const rankBonuses: Record<CountryRank, number> = {
    [CountryRank.GREAT_POWER]: 5,
    [CountryRank.MAJOR_POWER]: 3,
    [CountryRank.REGIONAL_POWER]: 2,
    [CountryRank.MIDDLE_POWER]: 1,
    [CountryRank.MINOR_POWER]: 0.5,
    [CountryRank.INSIGNIFICANT]: 0.1,
  };
  
  const monthlyGrowth = (gdpShare * 10 + militarySizeShare * 5 + populationShare * 2) * rankBonuses[rank];
  return currentPrestige + (monthlyGrowth * monthsElapsed);
}

// ============================================================
// 7. INFAMY (0-1000)
// ============================================================

export interface InfamyMetrics {
  current: number;
  max: number; // 1000
  
  // Decay
  lastDecayDate: number;
  decayRate: number; // per year
}

export enum InfamyCause {
  ANNEXATION = 50,
  VASSALIZATION = 30,
  WAR = 20,
  GENOCIDE = 200,
  COLONIZATION = 40,
  ABUSE_SUBJECTS = 25,
}

export function createInfamyMetrics(): InfamyMetrics {
  return {
    current: 0,
    max: 1000,
    lastDecayDate: Date.now(),
    decayRate: 10,
  };
}

export function addInfamy(
  current: number,
  cause: InfamyCause
): number {
  return Math.min(1000, current + cause);
}

export function calculateInfamyDecay(
  current: number,
  yearsSince: number,
  legitimacy: number
): number {
  // Decay = base * (1 + legitimacy/200) * years
  const baseDecay = 10 * yearsSince; // 10 per year base
  const legitimacyBonus = (legitimacy / 200) * baseDecay;
  return Math.max(0, current - baseDecay - legitimacyBonus);
}

export function applyInfamyDecay(
  metrics: InfamyMetrics
): InfamyMetrics {
  const yearsSince = (Date.now() - metrics.lastDecayDate) / (365 * 24 * 60 * 60 * 1000);
  const decayed = calculateInfamyDecay(metrics.current, yearsSince, 50); // Assuming 50 legitimacy
  return {
    ...metrics,
    current: decayed,
    lastDecayDate: Date.now(),
  };
}

// ============================================================
// 8. COMPLETE DIPLOMATIC STATE
// ============================================================

export interface DiplomaticState {
  // Relations between country pairs
  relations: Map<string, CountryRelation>; // key: "fromId_toId"
  
  // Active diplomatic plays
  diplomaticPlays: DiplomaticPlay[];
  
  // Ongoing wars
  wars: War[];
  
  // Subject relationships
  subjects: SubjectRelation[];
  
  // Treaty history
  treaties: PeaceTreaty[];
}

export function createDiplomaticState(): DiplomaticState {
  return {
    relations: new Map(),
    diplomaticPlays: [],
    wars: [],
    subjects: [],
    treaties: [],
  };
}

// Helper function to generate relation key
export function relationKey(fromId: string, toId: string): string {
  return `${fromId}_${toId}`;
}

// Helper to get or create relation
export function getOrCreateRelation(
  state: DiplomaticState,
  fromId: string,
  toId: string
): CountryRelation {
  const key = relationKey(fromId, toId);
  const existing = state.relations.get(key);
  if (existing) return existing;
  
  const newRelation = createRelation(fromId, toId);
  state.relations.set(key, newRelation);
  return newRelation;
}

// ============================================================
// 9. AI OPINION CALCULATIONS
// ============================================================

/**
 * Calculate opinion based on various factors
 * Returns value between -100 and +100
 */
export function calculateOpinion(
  relation: CountryRelation,
  myCultureCount: number,
  theirCultureCount: number,
  rivalGoal: boolean
): number {
  let opinion = 0;
  
  // Relations base
  opinion += relation.value * 0.5;
  
  // Cultural proximity bonus (simplified)
  if (myCultureCount > 0 && theirCultureCount > 0) {
    const culturalOverlap = Math.min(myCultureCount, theirCultureCount) / Math.max(myCultureCount, theirCultureCount);
    opinion += culturalOverlap * 30;
  }
  
  // Diplomatic agreements
  if (relation.hasEmbassy) opinion += 10;
  if (relation.tradeAgreement) opinion += 15;
  if (relation.militaryAccess) opinion += 10;
  if (relation.alliance) opinion += 25;
  
  // Rivalry penalty
  if (rivalGoal) opinion -= 30;
  
  return Math.max(-100, Math.min(100, opinion));
}

