/**
 * Culture and Religion Systems
 * Phase 4: Population System - Culture, Religion, and Discrimination
 */

import { Pop } from './types';

// ============================================================================
// CULTURE TYPES
// ============================================================================

export interface Culture {
  id: string;
  nameKey: string;
  languageGroup: string;
  trait: string;
  primaryReligion: string;
}

export interface CultureGroup {
  id: string;
  nameKey: string;
  cultures: string[];
}

// ============================================================================
// CULTURE REGISTRY
// ============================================================================

export const CULTURES: Record<string, Culture> = {
  // Western European
  british: { id: 'british', nameKey: 'culture.british', languageGroup: 'germanic', trait: 'western', primaryReligion: 'anglican' },
  french: { id: 'french', nameKey: 'culture.french', languageGroup: 'romance', trait: 'western', primaryReligion: 'catholic' },
  german: { id: 'german', nameKey: 'culture.german', languageGroup: 'germanic', trait: 'western', primaryReligion: 'protestant' },
  spanish: { id: 'spanish', nameKey: 'culture.spanish', languageGroup: 'romance', trait: 'western', primaryReligion: 'catholic' },
  portuguese: { id: 'portuguese', nameKey: 'culture.portuguese', languageGroup: 'romance', trait: 'western', primaryReligion: 'catholic' },
  italian: { id: 'italian', nameKey: 'culture.italian', languageGroup: 'romance', trait: 'western', primaryReligion: 'catholic' },

  // Eastern European
  russian: { id: 'russian', nameKey: 'culture.russian', languageGroup: 'slavic', trait: 'eastern', primaryReligion: 'orthodox' },
  polish: { id: 'polish', nameKey: 'culture.polish', languageGroup: 'slavic', trait: 'eastern', primaryReligion: 'catholic' },

  // Asian
  chinese: { id: 'chinese', nameKey: 'culture.chinese', languageGroup: 'sinitic', trait: 'eastern', primaryReligion: 'confucian' },
  japanese: { id: 'japanese', nameKey: 'culture.japanese', languageGroup: 'japonic', trait: 'eastern', primaryReligion: 'shinto' },
  indian: { id: 'indian', nameKey: 'culture.indian', languageGroup: 'indo_aryan', trait: 'southern', primaryReligion: 'hindu' },

  // Americas
  american: { id: 'american', nameKey: 'culture.american', languageGroup: 'germanic', trait: 'western', primaryReligion: 'protestant' },
  brazilian: { id: 'brazilian', nameKey: 'culture.brazilian', languageGroup: 'romance', trait: 'western', primaryReligion: 'catholic' },
};

export const CULTURE_GROUPS: Record<string, CultureGroup> = {
  western: { id: 'western', nameKey: 'culture_group.western', cultures: ['british', 'french', 'german', 'spanish', 'italian', 'portuguese', 'american', 'brazilian'] },
  eastern: { id: 'eastern', nameKey: 'culture_group.eastern', cultures: ['russian', 'polish', 'chinese', 'japanese'] },
  southern: { id: 'southern', nameKey: 'culture_group.southern', cultures: ['indian'] },
};

// ============================================================================
// RELIGION TYPES
// ============================================================================

export type ReligionType = 'christian' | 'muslim' | 'jewish' | 'eastern' | 'pagan';

export interface Religion {
  id: string;
  nameKey: string;
  type: ReligionType;
  allowed: boolean;
  hasClergy: boolean;
  clericProfession: string;
  conversionResistance: number;
  allowsConversion: boolean;
}

// ============================================================================
// RELIGION REGISTRY
// ============================================================================

export const RELIGIONS: Record<string, Religion> = {
  // Christianity
  catholic: { id: 'catholic', nameKey: 'religion.catholic', type: 'christian', allowed: true, hasClergy: true, clericProfession: 'clergy', conversionResistance: 0.7, allowsConversion: true },
  protestant: { id: 'protestant', nameKey: 'religion.protestant', type: 'christian', allowed: true, hasClergy: true, clericProfession: 'clergy', conversionResistance: 0.5, allowsConversion: true },
  anglican: { id: 'anglican', nameKey: 'religion.anglican', type: 'christian', allowed: true, hasClergy: true, clericProfession: 'clergy', conversionResistance: 0.6, allowsConversion: true },
  orthodox: { id: 'orthodox', nameKey: 'religion.orthodox', type: 'christian', allowed: true, hasClergy: true, clericProfession: 'clergy', conversionResistance: 0.8, allowsConversion: true },

  // Other
  hindu: { id: 'hindu', nameKey: 'religion.hindu', type: 'eastern', allowed: true, hasClergy: false, clericProfession: 'clergy', conversionResistance: 1.0, allowsConversion: false },
  muslim: { id: 'muslim', nameKey: 'religion.muslim', type: 'muslim', allowed: true, hasClergy: true, clericProfession: 'clergy', conversionResistance: 0.9, allowsConversion: false },
  shinto: { id: 'shinto', nameKey: 'religion.shinto', type: 'eastern', allowed: true, hasClergy: false, clericProfession: 'clergy', conversionResistance: 1.0, allowsConversion: false },
  confucian: { id: 'confucian', nameKey: 'religion.confucian', type: 'eastern', allowed: true, hasClergy: false, clericProfession: 'clergy', conversionResistance: 1.0, allowsConversion: false },
  pagan: { id: 'pagan', nameKey: 'religion.pagan', type: 'pagan', allowed: false, hasClergy: false, clericProfession: 'clergy', conversionResistance: 0.3, allowsConversion: true },
};

// ============================================================================
// DISCRIMINATION SYSTEM
// ============================================================================

export type DiscriminationType = 'none' | 'cultural' | 'religious' | 'both';

export interface DiscriminationLevel {
  type: DiscriminationType;
  culturalPenalty: number;
  religiousPenalty: number;
  politicalRights: number;
  jobOpportunity: number;
}

export const DISCRIMINATION_LEVELS: Record<DiscriminationType, DiscriminationLevel> = {
  none: { type: 'none', culturalPenalty: 0, religiousPenalty: 0, politicalRights: 100, jobOpportunity: 100 },
  cultural: { type: 'cultural', culturalPenalty: 20, religiousPenalty: 0, politicalRights: 50, jobOpportunity: 70 },
  religious: { type: 'religious', culturalPenalty: 0, religiousPenalty: 20, politicalRights: 50, jobOpportunity: 70 },
  both: { type: 'both', culturalPenalty: 20, religiousPenalty: 20, politicalRights: 25, jobOpportunity: 50 },
};

export function calculateDiscriminationPenalty(
  popCultureId: string,
  stateCultureId: string,
  popReligionId: string,
  stateReligionId: string,
  discrimination: DiscriminationType
): number {
  const level = DISCRIMINATION_LEVELS[discrimination];
  let penalty = 0;

  if (popCultureId !== stateCultureId) {
    penalty += level.culturalPenalty;
  }

  if (popReligionId !== stateReligionId) {
    penalty += level.religiousPenalty;
  }

  return penalty;
}

export function getPoliticalRightsMultiplier(discrimination: DiscriminationType): number {
  return DISCRIMINATION_LEVELS[discrimination].politicalRights / 100;
}

export function getJobOpportunityMultiplier(discrimination: DiscriminationType): number {
  return DISCRIMINATION_LEVELS[discrimination].jobOpportunity / 100;
}

// ============================================================================
// CULTURE AND RELIGION CONVERSION
// ============================================================================

export type ConversionChangeType = 'conversion' | 'assimilation';

export interface ConversionResult {
  success: boolean;
  popId: string;
  fromReligion: string;
  toReligion: string;
  changeType: ConversionChangeType;
}

export function attemptConversion(
  pop: Pop,
  targetReligion: string,
  timeInState: number
): ConversionResult {
  const targetReligionData = RELIGIONS[targetReligion];
  if (!targetReligionData || !targetReligionData.allowsConversion) {
    return { success: false, popId: pop.id, fromReligion: pop.religion, toReligion: targetReligion, changeType: 'conversion' };
  }

  const baseChance = 0.05;
  const timeBonus = Math.min(timeInState * 0.02, 0.3);
  const totalChance = baseChance + timeBonus;

  if (Math.random() < totalChance) {
    return { success: true, popId: pop.id, fromReligion: pop.religion, toReligion: targetReligion, changeType: 'conversion' };
  }

  return { success: false, popId: pop.id, fromReligion: pop.religion, toReligion: targetReligion, changeType: 'conversion' };
}

export function attemptCulturalAssimilation(
  pop: Pop,
  targetCulture: string,
  timeInState: number
): boolean {
  const baseChance = 0.03;
  const timeBonus = Math.min(timeInState * 0.015, 0.25);
  const totalChance = baseChance + timeBonus;

  return Math.random() < totalChance;
}

export function applyConversion(
  pops: Pop[],
  conversions: ConversionResult[]
): Pop[] {
  const conversionMap = new Map<string, string>();
  conversions.filter(c => c.success).forEach(c => conversionMap.set(c.popId, c.toReligion));

  return pops.map(pop => {
    const newReligion = conversionMap.get(pop.id);
    if (newReligion) {
      return { ...pop, religion: newReligion };
    }
    return pop;
  });
}

export function applyCulturalAssimilation(
  pops: Pop[],
  assimilations: { popId: string; newCulture: string }[]
): Pop[] {
  const assimilationMap = new Map<string, string>();
  assimilations.forEach(a => assimilationMap.set(a.popId, a.newCulture));

  return pops.map(pop => {
    const newCulture = assimilationMap.get(pop.id);
    if (newCulture) {
      return { ...pop, culture: newCulture };
    }
    return pop;
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getCulture(cultureId: string): Culture | undefined {
  return CULTURES[cultureId];
}

export function getReligion(religionId: string): Religion | undefined {
  return RELIGIONS[religionId];
}

export function getCultureGroup(cultureId: string): CultureGroup | undefined {
  const culture = CULTURES[cultureId];
  if (!culture) return undefined;

  return Object.values(CULTURE_GROUPS).find(group => group.cultures.includes(cultureId));
}

export function areCulturesCompatible(cultureId1: string, cultureId2: string): boolean {
  const group1 = getCultureGroup(cultureId1);
  const group2 = getCultureGroup(cultureId2);

  if (!group1 || !group2) return false;
  return group1.id === group2.id;
}

export function getPrimaryReligionForCulture(cultureId: string): string {
  const culture = CULTURES[cultureId];
  return culture?.primaryReligion ?? 'catholic';
}