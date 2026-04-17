/**
 * Population Needs System - Pop Needs and Standard of Living
 * Phase 4: Population System
 */

import { PopStratum } from './types';

/** 14 Need Categories */
export enum PopNeed {
  // Subsistence
  FOOD = 'food',
  WATER = 'water',
  CLOTHING = 'clothing',

  // Basic Comfort
  HOUSING = 'housing',
  HEATING = 'heating',
  EVERYDAY_NEEDS = 'everyday_needs',

  // Comfort
  HOUSEHOLD_ITEMS = 'household_items',
  CULTURE = 'culture',
  TOBACCO = 'tobacco',
  ALCOHOL = 'alcohol',

  // Luxury
  FURNITURE = 'furniture',
  RECREATION = 'recreation',
  LUXURY_NEEDS = 'luxury_needs',

  // Services
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
}

/** Need Definition - how each need works */
export interface NeedDefinition {
  id: PopNeed;
  nameKey: string;

  /** Which goods satisfy this need (goodId -> amount per month) */
  goods: Record<string, number>;

  /** How important (weight in SoL calculation) */
  weight: number;

  /** How sensitive to price changes */
  priceElasticity: number;

  /** Stratum that primarily needs this */
  primaryStratum: PopStratum;

  /** Satisfaction thresholds (0-100) */
  basicThreshold: number;
  comfortableThreshold: number;
  luxuriousThreshold: number;
}

/** 14 Needs Registry */
export const NEEDS: Record<PopNeed, NeedDefinition> = {
  [PopNeed.FOOD]: {
    id: PopNeed.FOOD,
    nameKey: 'need.food',
    goods: { grain: 10, fish: 5 },
    weight: 35,
    priceElasticity: 0.3,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 30,
    comfortableThreshold: 60,
    luxuriousThreshold: 90,
  },
  [PopNeed.WATER]: {
    id: PopNeed.WATER,
    nameKey: 'need.water',
    goods: {},
    weight: 30,
    priceElasticity: 0.2,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 20,
    comfortableThreshold: 50,
    luxuriousThreshold: 80,
  },
  [PopNeed.CLOTHING]: {
    id: PopNeed.CLOTHING,
    nameKey: 'need.clothing',
    goods: { textiles: 8, fabric: 5 },
    weight: 25,
    priceElasticity: 0.4,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 25,
    comfortableThreshold: 55,
    luxuriousThreshold: 85,
  },
  [PopNeed.HOUSING]: {
    id: PopNeed.HOUSING,
    nameKey: 'need.housing',
    goods: {},
    weight: 20,
    priceElasticity: 0.5,
    primaryStratum: PopStratum.MIDDLE,
    basicThreshold: 20,
    comfortableThreshold: 50,
    luxuriousThreshold: 75,
  },
  [PopNeed.HEATING]: {
    id: PopNeed.HEATING,
    nameKey: 'need.heating',
    goods: { coal: 10 },
    weight: 15,
    priceElasticity: 0.3,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 15,
    comfortableThreshold: 40,
    luxuriousThreshold: 70,
  },
  [PopNeed.EVERYDAY_NEEDS]: {
    id: PopNeed.EVERYDAY_NEEDS,
    nameKey: 'need.everyday_needs',
    goods: { fabric: 5, wood: 5 },
    weight: 15,
    priceElasticity: 0.5,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 20,
    comfortableThreshold: 50,
    luxuriousThreshold: 80,
  },
  [PopNeed.HOUSEHOLD_ITEMS]: {
    id: PopNeed.HOUSEHOLD_ITEMS,
    nameKey: 'need.household_items',
    goods: { wood: 15, iron: 5 },
    weight: 12,
    priceElasticity: 0.6,
    primaryStratum: PopStratum.MIDDLE,
    basicThreshold: 15,
    comfortableThreshold: 45,
    luxuriousThreshold: 75,
  },
  [PopNeed.CULTURE]: {
    id: PopNeed.CULTURE,
    nameKey: 'need.culture',
    goods: { silk: 2, porcelain: 3 },
    weight: 8,
    priceElasticity: 0.8,
    primaryStratum: PopStratum.UPPER,
    basicThreshold: 10,
    comfortableThreshold: 40,
    luxuriousThreshold: 70,
  },
  [PopNeed.TOBACCO]: {
    id: PopNeed.TOBACCO,
    nameKey: 'need.tobacco',
    goods: { tobacco: 5 },
    weight: 5,
    priceElasticity: 0.5,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 10,
    comfortableThreshold: 30,
    luxuriousThreshold: 60,
  },
  [PopNeed.ALCOHOL]: {
    id: PopNeed.ALCOHOL,
    nameKey: 'need.alcohol',
    goods: { wine: 3 },
    weight: 5,
    priceElasticity: 0.5,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 10,
    comfortableThreshold: 30,
    luxuriousThreshold: 60,
  },
  [PopNeed.FURNITURE]: {
    id: PopNeed.FURNITURE,
    nameKey: 'need.furniture',
    goods: { wood: 20 },
    weight: 8,
    priceElasticity: 0.7,
    primaryStratum: PopStratum.MIDDLE,
    basicThreshold: 10,
    comfortableThreshold: 35,
    luxuriousThreshold: 65,
  },
  [PopNeed.RECREATION]: {
    id: PopNeed.RECREATION,
    nameKey: 'need.recreation',
    goods: { tea: 3, coffee: 3 },
    weight: 6,
    priceElasticity: 0.8,
    primaryStratum: PopStratum.MIDDLE,
    basicThreshold: 10,
    comfortableThreshold: 30,
    luxuriousThreshold: 60,
  },
  [PopNeed.LUXURY_NEEDS]: {
    id: PopNeed.LUXURY_NEEDS,
    nameKey: 'need.luxury_needs',
    goods: { silk: 5, tea: 3, wine: 3 },
    weight: 5,
    priceElasticity: 1.0,
    primaryStratum: PopStratum.UPPER,
    basicThreshold: 5,
    comfortableThreshold: 25,
    luxuriousThreshold: 55,
  },
  [PopNeed.EDUCATION]: {
    id: PopNeed.EDUCATION,
    nameKey: 'need.education',
    goods: {},
    weight: 8,
    priceElasticity: 0.4,
    primaryStratum: PopStratum.MIDDLE,
    basicThreshold: 5,
    comfortableThreshold: 25,
    luxuriousThreshold: 50,
  },
  [PopNeed.HEALTHCARE]: {
    id: PopNeed.HEALTHCARE,
    nameKey: 'need.healthcare',
    goods: {},
    weight: 10,
    priceElasticity: 0.3,
    primaryStratum: PopStratum.LOWER,
    basicThreshold: 10,
    comfortableThreshold: 35,
    luxuriousThreshold: 70,
  },
};

/** Standard of Living Calculation Result */
export interface SoLCalculation {
  totalSoL: number;
  needsMet: Record<PopNeed, number>;
  categoryBreakdown: {
    subsistence: number;
    comfort: number;
    luxury: number;
  };
}

/** Calculate individual need satisfaction percentage */
export function calculateNeedSatisfaction(
  income: number,
  prices: Record<string, number>,
  need: NeedDefinition
): number {
  const goodsEntries = Object.entries(need.goods);

  if (goodsEntries.length === 0) {
    return 100;
  }

  let purchased = 0;

  for (const [goodId, amount] of goodsEntries) {
    const price = prices[goodId] || 10;
    const canBuy = Math.floor(income / price);
    purchased += Math.min(canBuy, amount);
  }

  const maxAmount = goodsEntries.reduce((acc, [, amt]) => acc + amt, 0);

  if (maxAmount === 0) {
    return 100;
  }

  return Math.round((purchased / maxAmount) * 100);
}

/** Calculate Standard of Living from income and prices */
export function calculateStandardOfLiving(
  income: number,
  prices: Record<string, number>
): SoLCalculation {
  const needsMet: Record<PopNeed, number> = {} as Record<PopNeed, number>;

  let subsistence = 0;
  let comfort = 0;
  let luxury = 0;

  const subsistenceNeeds: PopNeed[] = [
    PopNeed.FOOD,
    PopNeed.WATER,
    PopNeed.CLOTHING,
  ];
  const comfortNeeds: PopNeed[] = [
    PopNeed.HOUSING,
    PopNeed.HEATING,
    PopNeed.EVERYDAY_NEEDS,
    PopNeed.HOUSEHOLD_ITEMS,
    PopNeed.TOBACCO,
    PopNeed.ALCOHOL,
    PopNeed.FURNITURE,
    PopNeed.RECREATION,
  ];
  const luxuryNeeds: PopNeed[] = [
    PopNeed.CULTURE,
    PopNeed.LUXURY_NEEDS,
    PopNeed.EDUCATION,
    PopNeed.HEALTHCARE,
  ];

  for (const need of Object.values(NEEDS)) {
    const satisfaction = calculateNeedSatisfaction(income, prices, need);
    const weightSatisfaction = satisfaction * need.weight;

    needsMet[need.id] = satisfaction;

    if (subsistenceNeeds.includes(need.id)) {
      subsistence += weightSatisfaction;
    } else if (comfortNeeds.includes(need.id)) {
      comfort += weightSatisfaction;
    } else if (luxuryNeeds.includes(need.id)) {
      luxury += weightSatisfaction;
    }
  }

  const totalSoL = Math.round(subsistence + comfort + luxury) / 100;

  return {
    totalSoL: Math.min(100, totalSoL),
    needsMet,
    categoryBreakdown: {
      subsistence: Math.round(subsistence),
      comfort: Math.round(comfort),
      luxury: Math.round(luxury),
    },
  };
}

/** Get threshold level based on satisfaction */
export function getSoLLevel(
  satisfaction: number,
  thresholds: Pick<NeedDefinition, 'basicThreshold' | 'comfortableThreshold' | 'luxuriousThreshold'>
): 'subsistence' | 'comfortable' | 'luxurious' | 'basic' {
  if (satisfaction >= thresholds.luxuriousThreshold) {
    return 'luxurious';
  }
  if (satisfaction >= thresholds.comfortableThreshold) {
    return 'comfortable';
  }
  if (satisfaction >= thresholds.basicThreshold) {
    return 'basic';
  }
  return 'subsistence';
}