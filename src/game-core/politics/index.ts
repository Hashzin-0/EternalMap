/**
 * Politics System - Government, Laws, Interest Groups, Elections
 * Phase 5: Political System
 * A Victoria-like grand strategy political simulation
 */

import {
  PopProfession,
  PopStratum,
} from '../population/types';

/* =============================================================================
 * GOVERNMENT TYPES
 * ========================================================================== */

export enum GovernmentType {
  MONARCHY = 'monarchy',
  REPUBLIC = 'republic',
  THEOCRACY = 'theocracy',
  COMMUNISM = 'communism',
  FASCISM = 'fascism',
}

export type SuccessionType = 'hereditary' | 'elective' | 'revolutionary';

export interface GovernmentDefinition {
  type: GovernmentType;
  nameKey: string;
  hasRuler: boolean;
  rulerTitle: string;
  isElective: boolean;
  electionCycle: number;
  canEnactLaws: boolean;
  canAppointIGs: boolean;
  legitimacyRequired: number;
  successionType: SuccessionType;
}

/* =============================================================================
 * GOVERNMENT REGISTRY (5 Main Types)
 * ========================================================================== */

export const GOVERNMENTS: Record<GovernmentType, GovernmentDefinition> = {
  [GovernmentType.MONARCHY]: {
    type: GovernmentType.MONARCHY,
    nameKey: 'government.monarchy',
    hasRuler: true,
    rulerTitle: 'ruler.king',
    isElective: false,
    electionCycle: 0,
    canEnactLaws: true,
    canAppointIGs: true,
    legitimacyRequired: 50,
    successionType: 'hereditary',
  },
  [GovernmentType.REPUBLIC]: {
    type: GovernmentType.REPUBLIC,
    nameKey: 'government.republic',
    hasRuler: true,
    rulerTitle: 'ruler.president',
    isElective: true,
    electionCycle: 4,
    canEnactLaws: true,
    canAppointIGs: false,
    legitimacyRequired: 30,
    successionType: 'elective',
  },
  [GovernmentType.THEOCRACY]: {
    type: GovernmentType.THEOCRACY,
    nameKey: 'government.theocracy',
    hasRuler: true,
    rulerTitle: 'ruler.high_priest',
    isElective: false,
    electionCycle: 0,
    canEnactLaws: true,
    canAppointIGs: true,
    legitimacyRequired: 50,
    successionType: 'hereditary',
  },
  [GovernmentType.COMMUNISM]: {
    type: GovernmentType.COMMUNISM,
    nameKey: 'government.communism',
    hasRuler: true,
    rulerTitle: 'ruler.dictator',
    isElective: false,
    electionCycle: 0,
    canEnactLaws: true,
    canAppointIGs: true,
    legitimacyRequired: 0,
    successionType: 'revolutionary',
  },
  [GovernmentType.FASCISM]: {
    type: GovernmentType.FASCISM,
    nameKey: 'government.fascism',
    hasRuler: true,
    rulerTitle: 'ruler.duce',
    isElective: false,
    electionCycle: 0,
    canEnactLaws: true,
    canAppointIGs: true,
    legitimacyRequired: 0,
    successionType: 'revolutionary',
  },
};

export function getGovernmentDefinition(type: GovernmentType): GovernmentDefinition {
  return GOVERNMENTS[type];
}

export function isElectiveGovernment(type: GovernmentType): boolean {
  return GOVERNMENTS[type].isElective;
}

export function getElectionCycle(type: GovernmentType): number {
  return GOVERNMENTS[type].electionCycle;
}

/* =============================================================================
 * LAWS SYSTEM (24 Law Groups)
 * ========================================================================== */

export enum LawGroup {
  // Constitutional
  GOVERNMENT_TYPE = 'government_type',
  LEGISLATION = 'legislation',
  BUREAUCRACY = 'bureaucracy',
  
  // Rights
  CITIZENSHIP = 'citizenship',
  VOTING = 'voting',
  DELEGATION = 'delegation',
  
  // Economy
  ECONOMY = 'economy',
  TRADE_POLICY = 'trade_policy',
  TAXATION = 'taxation',
  LABOR = 'labor',
  PROPERTY_RIGHTS = 'property_rights',
  LAND_REFORM = 'land_reform',
  
  // Military
  MILITARY_SERVICE = 'military_service',
  ARMY_MODEL = 'army_model',
  NAVY_MODEL = 'navy_model',
  PEACE_TAX = 'peace_tax',
  
  // Social
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  SOCIAL_SECURITY = 'social_security',
  WORKPLACE = 'workplace',
  
  // Religious
  STATE_RELIGION = 'state_religion',
  RELIGIOUS_SCHOOLS = 'religious_schools',
  SECULARIZATION = 'secularization',
  
  // Other
  PUBLIC_SERVICES = 'public_services',
  ENVIRONMENT = 'environment',
  CENSORSHIP = 'censorship',
}

export interface Law {
  id: string;
  group: LawGroup;
  nameKey: string;
  level: number;
  activationDate: number | null;
  repealedDate: number | null;
  availableFor: GovernmentType[];
  requirements: Record<string, number>;
  allowed: boolean;
}

export interface LawDefinition {
  id: string;
  group: LawGroup;
  nameKey: string;
  level: number;
  availableFor: GovernmentType[];
  requirements: Record<string, number>;
}

/* =============================================================================
 * INTEREST GROUPS (8 Main IGs + 6 Political Parties)
 * ========================================================================== */

export enum InterestGroupType {
  // Main IGs
  LANDOWNERS = 'landowners',
  INDUSTRIALISTS = 'industrialists',
  PETTY_BOURGEOISIE = 'petty_bourgeoisie',
  INTELLIGENTSIA = 'intelligentsia',
  ARMY = 'army',
  CLERGY = 'clergy',
  WORKERS = 'workers',
  PEASANTS = 'peasants',
  
  // Political parties (derived from IGs)
  LIBERAL = 'liberal',
  CONSERVATIVE = 'conservative',
  REACTIONARY = 'reactionary',
  SOCIALIST = 'socialist',
  COMMUNIST = 'communist',
  FASCIST = 'fascist',
}

export interface InterestGroupDefinition {
  id: string;
  type: InterestGroupType;
  nameKey: string;
  supportedByStrata: PopStratum[];
  supportedByProfessions: PopProfession[];
  ideology: IdeologyType;
  wants: LawGroup[];
  opposes: LawGroup[];
  isCloning: boolean;
}

export interface InterestGroup extends InterestGroupDefinition {
  clout: number;
  size: number;
  inGovernment: boolean;
  rulingParty: boolean;
}

/* =============================================================================
 * POLITICAL IDEOLOGIES
 * ========================================================================== */

export enum IdeologyType {
  REACTIONARY = 'reactionary',
  CONSERVATIVE = 'conservative',
  LIBERAL = 'liberal',
  PROGRESSIVE = 'progressive',
  SOCIALIST = 'socialist',
  COMMUNIST = 'communist',
  FASCIST = 'fascist',
}

export interface Ideology {
  type: IdeologyType;
  nameKey: string;
  position: number;
}

export const IDEOLOGIES: Record<IdeologyType, Ideology> = {
  [IdeologyType.REACTIONARY]: {
    type: IdeologyType.REACTIONARY,
    nameKey: 'ideology.reactionary',
    position: -3,
  },
  [IdeologyType.CONSERVATIVE]: {
    type: IdeologyType.CONSERVATIVE,
    nameKey: 'ideology.conservative',
    position: -2,
  },
  [IdeologyType.LIBERAL]: {
    type: IdeologyType.LIBERAL,
    nameKey: 'ideology.liberal',
    position: -1,
  },
  [IdeologyType.PROGRESSIVE]: {
    type: IdeologyType.PROGRESSIVE,
    nameKey: 'ideology.progressive',
    position: 1,
  },
  [IdeologyType.SOCIALIST]: {
    type: IdeologyType.SOCIALIST,
    nameKey: 'ideology.socialist',
    position: 2,
  },
  [IdeologyType.COMMUNIST]: {
    type: IdeologyType.COMMUNIST,
    nameKey: 'ideology.communist',
    position: 3,
  },
  [IdeologyType.FASCIST]: {
    type: IdeologyType.FASCIST,
    nameKey: 'ideology.fascist',
    position: 3,
  },
};

export function getGovernmentIdeology(government: GovernmentType): IdeologyType {
  switch (government) {
    case GovernmentType.MONARCHY:
      return IdeologyType.CONSERVATIVE;
    case GovernmentType.REPUBLIC:
      return IdeologyType.LIBERAL;
    case GovernmentType.THEOCRACY:
      return IdeologyType.CONSERVATIVE;
    case GovernmentType.COMMUNISM:
      return IdeologyType.COMMUNIST;
    case GovernmentType.FASCISM:
      return IdeologyType.FASCIST;
    default:
      return IdeologyType.CONSERVATIVE;
  }
}

export function getIdeologyPosition(ideology: IdeologyType): number {
  return IDEOLOGIES[ideology].position;
}

/* =============================================================================
 * INTEREST GROUPS REGISTRY (8 Main IGs)
 * ========================================================================== */

export const INTEREST_GROUPS: Record<InterestGroupType, InterestGroupDefinition> = {
  [InterestGroupType.LANDOWNERS]: {
    id: 'landowners',
    type: InterestGroupType.LANDOWNERS,
    nameKey: 'ig.landowners',
    supportedByStrata: [PopStratum.UPPER],
    supportedByProfessions: [PopProfession.ARISTOCRAT],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.PROPERTY_RIGHTS, LawGroup.TRADE_POLICY],
    opposes: [LawGroup.LAND_REFORM],
    isCloning: false,
  },
  [InterestGroupType.INDUSTRIALISTS]: {
    id: 'industrialists',
    type: InterestGroupType.INDUSTRIALISTS,
    nameKey: 'ig.industrialists',
    supportedByStrata: [PopStratum.UPPER],
    supportedByProfessions: [PopProfession.CAPITALIST],
    ideology: IdeologyType.LIBERAL,
    wants: [LawGroup.ECONOMY, LawGroup.TRADE_POLICY],
    opposes: [LawGroup.LABOR],
    isCloning: false,
  },
  [InterestGroupType.PETTY_BOURGEOISIE]: {
    id: 'petty_bourgeoisie',
    type: InterestGroupType.PETTY_BOURGEOISIE,
    nameKey: 'ig.petty_bourgeoisie',
    supportedByStrata: [PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.SHOPKEEPER],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.PROPERTY_RIGHTS],
    opposes: [LawGroup.LABOR],
    isCloning: false,
  },
  [InterestGroupType.INTELLIGENTSIA]: {
    id: 'intelligentsia',
    type: InterestGroupType.INTELLIGENTSIA,
    nameKey: 'ig.intelligentsia',
    supportedByStrata: [PopStratum.MIDDLE],
    supportedByProfessions: [
      PopProfession.ENGINEER,
      PopProfession.DOCTOR,
      PopProfession.LAWYER,
      PopProfession.TEACHER,
    ],
    ideology: IdeologyType.LIBERAL,
    wants: [LawGroup.EDUCATION, LawGroup.VOTING],
    opposes: [LawGroup.CENSORSHIP],
    isCloning: false,
  },
  [InterestGroupType.ARMY]: {
    id: 'army',
    type: InterestGroupType.ARMY,
    nameKey: 'ig.army',
    supportedByStrata: [PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.OFFICER, PopProfession.SOLDIER],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.MILITARY_SERVICE, LawGroup.ARMY_MODEL],
    opposes: [LawGroup.PEACE_TAX],
    isCloning: false,
  },
  [InterestGroupType.CLERGY]: {
    id: 'clergy',
    type: InterestGroupType.CLERGY,
    nameKey: 'ig.clergy',
    supportedByStrata: [PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.CLERGY],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.RELIGIOUS_SCHOOLS, LawGroup.STATE_RELIGION],
    opposes: [LawGroup.SECULARIZATION],
    isCloning: false,
  },
  [InterestGroupType.WORKERS]: {
    id: 'workers',
    type: InterestGroupType.WORKERS,
    nameKey: 'ig.workers',
    supportedByStrata: [PopStratum.LOWER],
    supportedByProfessions: [PopProfession.LABORER, PopProfession.SHOPKEEPER],
    ideology: IdeologyType.SOCIALIST,
    wants: [LawGroup.LABOR, LawGroup.SOCIAL_SECURITY, LawGroup.VOTING],
    opposes: [LawGroup.LABOR],
    isCloning: false,
  },
  [InterestGroupType.PEASANTS]: {
    id: 'peasants',
    type: InterestGroupType.PEASANTS,
    nameKey: 'ig.peasants',
    supportedByStrata: [PopStratum.LOWER],
    supportedByProfessions: [PopProfession.FARMER],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.PROPERTY_RIGHTS],
    opposes: [LawGroup.LAND_REFORM],
    isCloning: false,
  },
  // Political parties (derived from IGs)
  [InterestGroupType.LIBERAL]: {
    id: 'liberal',
    type: InterestGroupType.LIBERAL,
    nameKey: 'party.liberal',
    supportedByStrata: [PopStratum.UPPER, PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.CAPITALIST, PopProfession.ENGINEER],
    ideology: IdeologyType.LIBERAL,
    wants: [LawGroup.ECONOMY, LawGroup.VOTING, LawGroup.EDUCATION],
    opposes: [LawGroup.CENSORSHIP],
    isCloning: true,
  },
  [InterestGroupType.CONSERVATIVE]: {
    id: 'conservative',
    type: InterestGroupType.CONSERVATIVE,
    nameKey: 'party.conservative',
    supportedByStrata: [PopStratum.UPPER, PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.ARISTOCRAT, PopProfession.CLERGY],
    ideology: IdeologyType.CONSERVATIVE,
    wants: [LawGroup.PROPERTY_RIGHTS, LawGroup.STATE_RELIGION],
    opposes: [LawGroup.LAND_REFORM, LawGroup.SECULARIZATION],
    isCloning: true,
  },
  [InterestGroupType.REACTIONARY]: {
    id: 'reactionary',
    type: InterestGroupType.REACTIONARY,
    nameKey: 'party.reactionary',
    supportedByStrata: [PopStratum.UPPER],
    supportedByProfessions: [PopProfession.ARISTOCRAT],
    ideology: IdeologyType.REACTIONARY,
    wants: [LawGroup.PROPERTY_RIGHTS, LawGroup.STATE_RELIGION, LawGroup.CENSORSHIP],
    opposes: [LawGroup.VOTING, LawGroup.LAND_REFORM],
    isCloning: true,
  },
  [InterestGroupType.SOCIALIST]: {
    id: 'socialist',
    type: InterestGroupType.SOCIALIST,
    nameKey: 'party.socialist',
    supportedByStrata: [PopStratum.LOWER, PopStratum.MIDDLE],
    supportedByProfessions: [PopProfession.LABORER, PopProfession.TEACHER],
    ideology: IdeologyType.SOCIALIST,
    wants: [LawGroup.LABOR, LawGroup.SOCIAL_SECURITY, LawGroup.VOTING, LawGroup.EDUCATION],
    opposes: [LawGroup.LABOR],
    isCloning: true,
  },
  [InterestGroupType.COMMUNIST]: {
    id: 'communist',
    type: InterestGroupType.COMMUNIST,
    nameKey: 'party.communist',
    supportedByStrata: [PopStratum.LOWER],
    supportedByProfessions: [PopProfession.LABORER],
    ideology: IdeologyType.COMMUNIST,
    wants: [LawGroup.LABOR, LawGroup.LAND_REFORM, LawGroup.SOCIAL_SECURITY],
    opposes: [LawGroup.PROPERTY_RIGHTS],
    isCloning: true,
  },
  [InterestGroupType.FASCIST]: {
    id: 'fascist',
    type: InterestGroupType.FASCIST,
    nameKey: 'party.fascist',
    supportedByStrata: [PopStratum.MIDDLE, PopStratum.LOWER],
    supportedByProfessions: [PopProfession.SOLDIER, PopProfession.LABORER],
    ideology: IdeologyType.FASCIST,
    wants: [LawGroup.MILITARY_SERVICE, LawGroup.CENSORSHIP],
    opposes: [LawGroup.VOTING, LawGroup.LABOR],
    isCloning: true,
  },
};

export function getInterestGroupDefinition(type: InterestGroupType): InterestGroupDefinition {
  return INTEREST_GROUPS[type];
}

export function getMainInterestGroups(): InterestGroupType[] {
  return [
    InterestGroupType.LANDOWNERS,
    InterestGroupType.INDUSTRIALISTS,
    InterestGroupType.PETTY_BOURGEOISIE,
    InterestGroupType.INTELLIGENTSIA,
    InterestGroupType.ARMY,
    InterestGroupType.CLERGY,
    InterestGroupType.WORKERS,
    InterestGroupType.PEASANTS,
  ];
}

export function getPoliticalParties(): InterestGroupType[] {
  return [
    InterestGroupType.LIBERAL,
    InterestGroupType.CONSERVATIVE,
    InterestGroupType.REACTIONARY,
    InterestGroupType.SOCIALIST,
    InterestGroupType.COMMUNIST,
    InterestGroupType.FASCIST,
  ];
}

/* =============================================================================
 * POLITICAL CLOUT CALCULATION
 * ========================================================================== */

export interface PoliticalClout {
  igId: string;
  clout: number;
  rulingParty: boolean;
  cabinetPosition: boolean;
}

export function calculateClout(
  ig: InterestGroup,
  totalPopulation: number,
  legitimacy: number,
  government: GovernmentType
): number {
  // Clout = (population share * 0.6) + (ideology alignment * 0.3) + (legitimacy * 0.1)
  const populationShare = totalPopulation > 0 
    ? ((ig.size / 100) * totalPopulation / totalPopulation) * 60
    : 0;
  
  const governmentIdeology = getGovernmentIdeology(government);
  const ideologicalAlignment = ig.ideology === governmentIdeology ? 30 : 10;
  
  const legitimacyBonus = legitimacy * 0.1;
  
  return Math.round(populationShare + ideologicalAlignment + legitimacyBonus);
}

export function calculateCloutFromPopulation(
  populationShare: number,
  government: GovernmentType,
  igIdeology: IdeologyType,
  legitimacy: number
): number {
  const populationComponent = populationShare * 0.6;
  const governmentIdeology = getGovernmentIdeology(government);
  const ideologicalComponent = igIdeology === governmentIdeology ? 30 : 10;
  const legitimacyComponent = legitimacy * 0.1;
  
  return Math.round(populationComponent + ideologicalComponent + legitimacyComponent);
}

/* =============================================================================
 * LEGITIMACY SYSTEM
 * ========================================================================== */

export enum LegitimacyType {
  TRADITIONAL = 'traditional',
  CONSTITUTIONAL = 'constitutional',
  REVOLUTIONARY = 'revolutionary',
  PARLIAMENTARY = 'parliamentary',
}

export interface Legitimacy {
  type: LegitimacyType;
  value: number;
  source: string;
}

export function calculateLegitimacy(
  government: GovernmentType,
  igsInGovernment: string[],
  electionsHeld: boolean,
  monthsSinceLastElection: number
): number {
  let legitimacy = 50;
  
  legitimacy += igsInGovernment.length * 10;
  
  if (government === GovernmentType.REPUBLIC && electionsHeld) {
    legitimacy += 20;
  }
  
  if (government === GovernmentType.THEOCRACY) {
    legitimacy += 15;
  }
  
  if (monthsSinceLastElection > 12) {
    legitimacy -= 10;
  }
  
  if (monthsSinceLastElection > 24) {
    legitimacy -= 10;
  }
  
  return Math.max(0, Math.min(100, legitimacy));
}

export function getLegitimacyType(government: GovernmentType, electionsHeld: boolean): LegitimacyType {
  switch (government) {
    case GovernmentType.MONARCHY:
      return LegitimacyType.TRADITIONAL;
    case GovernmentType.REPUBLIC:
      return electionsHeld 
        ? LegitimacyType.PARLIAMENTARY 
        : LegitimacyType.CONSTITUTIONAL;
    case GovernmentType.THEOCRACY:
      return LegitimacyType.TRADITIONAL;
    case GovernmentType.COMMUNISM:
    case GovernmentType.FASCISM:
      return LegitimacyType.REVOLUTIONARY;
    default:
      return LegitimacyType.CONSTITUTIONAL;
  }
}

/* =============================================================================
 * ELECTIONS SYSTEM
 * ========================================================================== */

export interface Election {
  id: string;
  countryId: string;
  date: number;
  type: 'national' | 'local';
  candidates: ElectionCandidate[];
  winner: string | null;
  turnout: number;
}

export interface ElectionCandidate {
  igId: string;
  ideology: IdeologyType;
  votes: number;
  percentage: number;
}

export function holdElection(
  countryId: string,
  eligibleVoters: number,
  igs: InterestGroup[]
): Election {
  const totalVotes = Math.floor(eligibleVoters * 0.7);
  
  const totalClout = igs.reduce((sum, ig) => sum + ig.clout, 0);
  
  const candidates: ElectionCandidate[] = igs.map((ig) => {
    const voteWeight = totalClout > 0 ? ig.clout / totalClout : 1 / igs.length;
    const votes = Math.floor(totalVotes * voteWeight);
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    
    return {
      igId: ig.id,
      ideology: ig.ideology,
      votes,
      percentage,
    };
  });
  
  candidates.sort((a, b) => b.votes - a.votes);
  
  const winner = candidates[0] && candidates[0].votes > 0 ? candidates[0].igId : null;
  const actualTurnout = eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0;
  
  return {
    id: `election_${countryId}_${Date.now()}`,
    countryId,
    date: Date.now(),
    type: 'national',
    candidates,
    winner,
    turnout: actualTurnout,
  };
}

export function holdLocalElection(
  countryId: string,
  regionId: string,
  eligibleVoters: number,
  igs: InterestGroup[]
): Election {
  const totalVotes = Math.floor(eligibleVoters * 0.6);
  
  const totalClout = igs.reduce((sum, ig) => sum + ig.clout, 0);
  
  const candidates: ElectionCandidate[] = igs.map((ig) => {
    const voteWeight = totalClout > 0 ? ig.clout / totalClout : 1 / igs.length;
    const votes = Math.floor(totalVotes * voteWeight);
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    
    return {
      igId: ig.id,
      ideology: ig.ideology,
      votes,
      percentage,
    };
  });
  
  candidates.sort((a, b) => b.votes - a.votes);
  
  const winner = candidates[0] && candidates[0].votes > 0 ? candidates[0].igId : null;
  const actualTurnout = eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0;
  
  return {
    id: `election_${countryId}_${regionId}_${Date.now()}`,
    countryId,
    date: Date.now(),
    type: 'local',
    candidates,
    winner,
    turnout: actualTurnout,
  };
}

/* =============================================================================
 * CABINET & GOVERNMENT FORMATION
 * ========================================================================== */

export interface CabinetPosition {
  igId: string;
  position: string;
  ministry: string;
}

export function formGovernment(
  winningIgId: string,
  coalitionIgIds: string[],
  governmentType: GovernmentType
): CabinetPosition[] {
  const positions: CabinetPosition[] = [];
  
  positions.push({
    igId: winningIgId,
    position: 'head_of_government',
    ministry: 'head_of_government',
  });
  
  const availablePositions = getAvailableMinistries(governmentType);
  
  coalitionIgIds.forEach((igId, index) => {
    if (index < availablePositions.length) {
      positions.push({
        igId,
        position: availablePositions[index],
        ministry: availablePositions[index],
      });
    }
  });
  
  return positions;
}

export function getAvailableMinistries(governmentType: GovernmentType): string[] {
  const baseMinistries = [
    'treasury',
    'defense',
    'justice',
    'interior',
  ];
  
  switch (governmentType) {
    case GovernmentType.REPUBLIC:
      return [...baseMinistries, 'state', 'war'];
    case GovernmentType.COMMUNISM:
    case GovernmentType.FASCISM:
      return [...baseMinistries, 'propaganda', 'security'];
    case GovernmentType.THEOCRACY:
      return [...baseMinistries, 'faith', 'religious_affairs'];
    default:
      return baseMinistries;
  }
}

export function canFormGovernment(
  igId: string,
  governmentType: GovernmentType,
  legitimacy: number
): boolean {
  const government = GOVERNMENTS[governmentType];
  return legitimacy >= government.legitimacyRequired;
}

/* =============================================================================
 * LAW PASSAGE & POLITICS
 * ========================================================================== */

export interface LawVote {
  igId: string;
  vote: 'for' | 'against' | 'abstain';
  clout: number;
}

export function calculateLawPassChance(
  law: Law,
  igsInGovernment: InterestGroup[],
  igsInOpposition: InterestGroup[]
): number {
  let governmentSupport = 0;
  let oppositionOpposition = 0;
  let totalClout = 0;
  
  for (const ig of igsInGovernment) {
    const supports = ig.wants.includes(law.group);
    governmentSupport += supports ? ig.clout : ig.clout * 0.2;
  }
  
  for (const ig of igsInOpposition) {
    const opposes = ig.opposes.includes(law.group);
    oppositionOpposition += opposes ? ig.clout : ig.clout * 0.1;
  }
  
  totalClout = governmentSupport + oppositionOpposition;
  
  if (totalClout === 0) return 50;
  
  return Math.min(100, Math.max(0, (governmentSupport / totalClout) * 100));
}

export function canPassLaw(
  law: Law,
  government: GovernmentType,
  legitimacy: number
): boolean {
  if (!law.availableFor.includes(government)) {
    return false;
  }
  
  for (const req of Object.keys(law.requirements)) {
    const requiredValue = law.requirements[req];
    if (req === 'legitimacy' && legitimacy < requiredValue) {
      return false;
    }
  }
  
  return law.allowed;
}

/* =============================================================================
 * GOVERNMENT TRANSITION
 * ========================================================================== */

export type RevolutionType = 'conservative' | 'liberal' | 'socialist' | 'communist' | 'fascist' | 'anarchist';

export interface GovernmentTransition {
  id: string;
  countryId: string;
  fromGovernment: GovernmentType;
  toGovernment: GovernmentType;
  date: number;
  revolutionType: RevolutionType | null;
  legitimacyBefore: number;
  legitimacyAfter: number;
}

export function revolutionaryChange(
  countryId: string,
  fromGovernment: GovernmentType,
  revolutionType: RevolutionType
): GovernmentTransition {
  let toGovernment: GovernmentType;
  
  switch (revolutionType) {
    case 'conservative':
    case 'liberal':
      toGovernment = GovernmentType.REPUBLIC;
      break;
    case 'communist':
      toGovernment = GovernmentType.COMMUNISM;
      break;
    case 'fascist':
      toGovernment = GovernmentType.FASCISM;
      break;
    default:
      toGovernment = GovernmentType.REPUBLIC;
  }
  
  return {
    id: `transition_${countryId}_${Date.now()}`,
    countryId,
    fromGovernment,
    toGovernment,
    date: Date.now(),
    revolutionType,
    legitimacyBefore: 0,
    legitimacyAfter: 80,
  };
}

export function constitutionalReform(
  countryId: string,
  fromGovernment: GovernmentType,
  toGovernment: GovernmentType,
  legitimacy: number
): GovernmentTransition {
  return {
    id: `transition_${countryId}_${Date.now()}`,
    countryId,
    fromGovernment,
    toGovernment,
    date: Date.now(),
    revolutionType: null,
    legitimacyBefore: legitimacy,
    legitimacyAfter: Math.min(100, legitimacy + 20),
  };
}

/* =============================================================================
 * POLITICAL EVENTS & AGITATION
 * ========================================================================== */

export interface PoliticalEvent {
  id: string;
  countryId: string;
  type: 'radicalization' | 'reform' | 'revolution' | 'crackdown' | 'election';
  date: number;
  severity: number;
  affectedIgIds: string[];
}

export function createPoliticalEvent(
  countryId: string,
  type: PoliticalEvent['type'],
  affectedIgIds: string[],
  severity: number
): PoliticalEvent {
  return {
    id: `event_${countryId}_${Date.now()}`,
    countryId,
    type,
    date: Date.now(),
    severity,
    affectedIgIds,
  };
}

/* =============================================================================
 * EXPORTS
 * ========================================================================== */

export type {
  GovernmentDefinition as Government,
  InterestGroupDefinition as InterestGroupBase,
};

export const POLITICS_VERSION = '1.0.0';