export enum BuildingCategory {
  RURAL = 'rural',
  URBAN = 'urban',
  INFRASTRUCTURE = 'infrastructure',
  GOVERNMENT = 'government',
  DEVELOPMENT = 'development',
}

export enum OwnerType {
  STATE = 'state',
  PRIVATE = 'private',
  COMPANY = 'company',
}

export interface BuildingLevel {
  level: number;
  workforce: number;
  active: boolean;
  throughput: number;
}

export interface Building {
  id: string;
  buildingType: string;
  stateId: string;
  owner: OwnerType;
  levels: BuildingLevel[];
  isConstructing: boolean;
  constructionProgress: number;
}

export interface BuildingType {
  id: string;
  category: BuildingCategory;
  nameKey: string;
  icon: string;
  
  // Production
  inputs: Record<string, number>;  // goodId -> amount per level
  outputs: Record<string, number>; // goodId -> amount per level
  
  // Requirements
  workforceRequired: number;
  arableLandRequired?: number;
  resourcePotentialRequired?: string;
  
  // Economics
  baseCost: number;
  costMultiplier: number;
  levelCostMultiplier: number;
  
  // City/HUB
  cityType: 'none' | 'small' | 'medium' | 'large';
  
  // Economy of scale
  economyOfScale: boolean;
  maxEconomyOfScale: number;
}