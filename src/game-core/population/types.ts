/**
 * Population Types - Pop Professions and Strata
 * Phase 4: Population System
 */

export enum PopStratum {
  UPPER = 'upper',
  MIDDLE = 'middle',
  LOWER = 'lower',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  UNEMPLOYED = 'unemployed',
  LOOKING = 'looking',
  DISCOURAGED = 'discouraged',
}

export enum PopProfession {
  // Upper Stratum
  CAPITALIST = 'capitalist',
  ARISTOCRAT = 'aristocrat',
  BUREAUCRAT = 'bureaucrat',

  // Middle Stratum
  OFFICER = 'officer',
  CLERGY = 'clergy',
  ENGINEER = 'engineer',
  DOCTOR = 'doctor',
  LAWYER = 'lawyer',
  TEACHER = 'teacher',

  // Lower Stratum
  SHOPKEEPER = 'shopkeeper',
  FARMER = 'farmer',
  SOLDIER = 'soldier',
  LABORER = 'laborer',
  SLAVE = 'slave',
  NATIVE = 'native',
}

export interface Pop {
  id: string;
  stateId: string;
  profession: PopProfession;
  stratum: PopStratum;
  culture: string;
  religion: string;
  population: number;
  wealth: number;
  loyalty: number;
  militancy: number;
  radicals: number;
  consciousness: number;
  employed: boolean;
  workplaceId: string | null;
  needsMet: number;
  income: number;
  employmentStatus: EmploymentStatus;
}

export interface PopType {
  profession: PopProfession;
  stratum: PopStratum;
  wageWeight: number;
  workforceRatio: number;
  startingSoL: number;
  taxContribution: number;
  politicalStrength: number;
}

export const POP_TYPES: Record<PopProfession, PopType> = {
  // UPPER STRATUM
  [PopProfession.CAPITALIST]: {
    profession: PopProfession.CAPITALIST,
    stratum: PopStratum.UPPER,
    wageWeight: 15,
    workforceRatio: 0.20,
    startingSoL: 25,
    taxContribution: 0.30,
    politicalStrength: 10,
  },
  [PopProfession.ARISTOCRAT]: {
    profession: PopProfession.ARISTOCRAT,
    stratum: PopStratum.UPPER,
    wageWeight: 12,
    workforceRatio: 0.15,
    startingSoL: 22,
    taxContribution: 0.25,
    politicalStrength: 8,
  },
  [PopProfession.BUREAUCRAT]: {
    profession: PopProfession.BUREAUCRAT,
    stratum: PopStratum.UPPER,
    wageWeight: 8,
    workforceRatio: 0.20,
    startingSoL: 15,
    taxContribution: 0.15,
    politicalStrength: 5,
  },

  // MIDDLE STRATUM
  [PopProfession.OFFICER]: {
    profession: PopProfession.OFFICER,
    stratum: PopStratum.MIDDLE,
    wageWeight: 10,
    workforceRatio: 0.10,
    startingSoL: 18,
    taxContribution: 0.12,
    politicalStrength: 6,
  },
  [PopProfession.CLERGY]: {
    profession: PopProfession.CLERGY,
    stratum: PopStratum.MIDDLE,
    wageWeight: 7,
    workforceRatio: 0.15,
    startingSoL: 14,
    taxContribution: 0.08,
    politicalStrength: 4,
  },
  [PopProfession.ENGINEER]: {
    profession: PopProfession.ENGINEER,
    stratum: PopStratum.MIDDLE,
    wageWeight: 8,
    workforceRatio: 0.15,
    startingSoL: 16,
    taxContribution: 0.10,
    politicalStrength: 5,
  },
  [PopProfession.DOCTOR]: {
    profession: PopProfession.DOCTOR,
    stratum: PopStratum.MIDDLE,
    wageWeight: 9,
    workforceRatio: 0.10,
    startingSoL: 17,
    taxContribution: 0.12,
    politicalStrength: 5,
  },
  [PopProfession.LAWYER]: {
    profession: PopProfession.LAWYER,
    stratum: PopStratum.MIDDLE,
    wageWeight: 8,
    workforceRatio: 0.10,
    startingSoL: 15,
    taxContribution: 0.10,
    politicalStrength: 5,
  },
  [PopProfession.TEACHER]: {
    profession: PopProfession.TEACHER,
    stratum: PopStratum.MIDDLE,
    wageWeight: 6,
    workforceRatio: 0.15,
    startingSoL: 13,
    taxContribution: 0.08,
    politicalStrength: 4,
  },

  // LOWER STRATUM
  [PopProfession.SHOPKEEPER]: {
    profession: PopProfession.SHOPKEEPER,
    stratum: PopStratum.LOWER,
    wageWeight: 4,
    workforceRatio: 0.15,
    startingSoL: 10,
    taxContribution: 0.05,
    politicalStrength: 2,
  },
  [PopProfession.FARMER]: {
    profession: PopProfession.FARMER,
    stratum: PopStratum.LOWER,
    wageWeight: 3,
    workforceRatio: 0.25,
    startingSoL: 8,
    taxContribution: 0.04,
    politicalStrength: 1,
  },
  [PopProfession.SOLDIER]: {
    profession: PopProfession.SOLDIER,
    stratum: PopStratum.LOWER,
    wageWeight: 4,
    workforceRatio: 0.10,
    startingSoL: 9,
    taxContribution: 0.03,
    politicalStrength: 2,
  },
  [PopProfession.LABORER]: {
    profession: PopProfession.LABORER,
    stratum: PopStratum.LOWER,
    wageWeight: 2,
    workforceRatio: 0.30,
    startingSoL: 6,
    taxContribution: 0.02,
    politicalStrength: 1,
  },
  [PopProfession.SLAVE]: {
    profession: PopProfession.SLAVE,
    stratum: PopStratum.LOWER,
    wageWeight: 0,
    workforceRatio: 0.10,
    startingSoL: 3,
    taxContribution: 0.00,
    politicalStrength: 0,
  },
  [PopProfession.NATIVE]: {
    profession: PopProfession.NATIVE,
    stratum: PopStratum.LOWER,
    wageWeight: 0,
    workforceRatio: 0.15,
    startingSoL: 5,
    taxContribution: 0.00,
    politicalStrength: 0,
  },
};

export function getPopStratum(profession: PopProfession): PopStratum {
  return POP_TYPES[profession].stratum;
}

export function getPopType(profession: PopProfession): PopType {
  return POP_TYPES[profession];
}