/**
 * Treasury System - Gerencia finanças do país
 * Fase 3: Economia
 */

export type IncomeType =
  | 'land_tax'
  | 'income_tax'
  | 'production_tax'
  | 'tariff'
  | 'trade_revenue'
  | 'building_revenue';

export type ExpenseType =
  | 'construction'
  | 'military'
  | 'bureaucracy'
  | 'subsidies'
  | 'debt_interest';

export interface Treasury {
  countryId: string;
  balance: number;
  income: Record<IncomeType, number>;
  expenses: Record<ExpenseType, number>;
  debt: number;
  creditLimit: number;
}

export interface TreasurySnapshot {
  balance: number;
  income: number;
  expenses: number;
  netIncome: number;
}

/**
 * Cria uma nova tesouraria com valores padrão
 */
export function createTreasury(countryId: string, initialBalance: number = 0): Treasury {
  return {
    countryId,
    balance: initialBalance,
    income: {
      land_tax: 0,
      income_tax: 0,
      production_tax: 0,
      tariff: 0,
      trade_revenue: 0,
      building_revenue: 0,
    },
    expenses: {
      construction: 0,
      military: 0,
      bureaucracy: 0,
      subsidies: 0,
      debt_interest: 0,
    },
    debt: 0,
    creditLimit: 10000,
  };
}

/**
 * Calcula a renda total
 */
export function calculateTotalIncome(
  income: Record<IncomeType, number>
): number {
  return Object.values(income).reduce((total, amount) => total + amount, 0);
}

/**
 * Calcula as despesas totais
 */
export function calculateTotalExpenses(
  expenses: Record<ExpenseType, number>
): number {
  return Object.values(expenses).reduce((total, amount) => total + amount, 0);
}

/**
 * Calcula o lucro líquido (income - expenses)
 */
export function calculateNetIncome(
  income: Record<IncomeType, number>,
  expenses: Record<ExpenseType, number>
): number {
  return calculateTotalIncome(income) - calculateTotalExpenses(expenses);
}

/**
 * Adiciona receita à tesouraria
 */
export function addIncome(
  treasury: Treasury,
  type: IncomeType,
  amount: number
): Treasury {
  return {
    ...treasury,
    balance: treasury.balance + amount,
    income: {
      ...treasury.income,
      [type]: (treasury.income[type] || 0) + amount,
    },
  };
}

/**
 * Adiciona despesa à tesouraria
 */
export function addExpense(
  treasury: Treasury,
  type: ExpenseType,
  amount: number
): Treasury {
  return {
    ...treasury,
    balance: treasury.balance - amount,
    expenses: {
      ...treasury.expenses,
      [type]: (treasury.expenses[type] || 0) + amount,
    },
  };
}

/**
 * Adiciona receita e despesa simultaneamente
 */
export function addTransaction(
  treasury: Treasury,
  incomeType: IncomeType | null,
  incomeAmount: number,
  expenseType: ExpenseType | null,
  expenseAmount: number
): Treasury {
  let result = treasury;

  if (incomeAmount > 0 && incomeType) {
    result = addIncome(result, incomeType, incomeAmount);
  }

  if (expenseAmount > 0 && expenseType) {
    result = addExpense(result, expenseType, expenseAmount);
  }

  return result;
}

/**
 * Processa o fechamento do mês (aplica receitas e despesas)
 */
export function processMonthlyBudget(treasury: Treasury): Treasury {
  const netIncome = calculateNetIncome(treasury.income, treasury.expenses);

  return {
    ...treasury,
    balance: treasury.balance + netIncome,
    income: initializeIncome(),
    expenses: initializeExpenses(),
  };
}

function initializeIncome(): Record<IncomeType, number> {
  return {
    land_tax: 0,
    income_tax: 0,
    production_tax: 0,
    tariff: 0,
    trade_revenue: 0,
    building_revenue: 0,
  };
}

function initializeExpenses(): Record<ExpenseType, number> {
  return {
    construction: 0,
    military: 0,
    bureaucracy: 0,
    subsidies: 0,
    debt_interest: 0,
  };
}

/**
 * Pegar dinheiro (aumenta dívida)
 */
export function borrowMoney(treasury: Treasury, amount: number): Treasury {
  const newDebt = treasury.debt + amount;
  const newBalance = treasury.balance + amount;

  return {
    ...treasury,
    balance: newBalance,
    debt: newDebt,
  };
}

/**
 * Pagar dívida
 */
export function payOffDebt(treasury: Treasury, amount: number): Treasury {
  const payment = Math.min(amount, treasury.debt);
  const remainingBalance = treasury.balance - payment;

  return {
    ...treasury,
    balance: Math.max(0, remainingBalance),
    debt: treasury.debt - payment,
  };
}

/**
 * Atualiza o limite de crédito
 */
export function updateCreditLimit(
  treasury: Treasury,
  newLimit: number
): Treasury {
  return {
    ...treasury,
    creditLimit: Math.max(0, newLimit),
  };
}

/**
 * Verifica se pode fazer uma despesa
 */
export function canAfford(treasury: Treasury, amount: number): boolean {
  return treasury.balance >= amount;
}

/**
 * Verifica se está em déficit
 */
export function isDeficit(
  income: Record<IncomeType, number>,
  expenses: Record<ExpenseType, number>
): boolean {
  return calculateNetIncome(income, expenses) < 0;
}

/**
 * Cria um snapshot da tesouraria
 */
export function createTreasurySnapshot(treasury: Treasury): TreasurySnapshot {
  const totalIncome = calculateTotalIncome(treasury.income);
  const totalExpenses = calculateTotalExpenses(treasury.expenses);
  const netIncome = totalIncome - totalExpenses;

  return {
    balance: treasury.balance,
    income: totalIncome,
    expenses: totalExpenses,
    netIncome,
  };
}

/**
 * Calcula a razão dívida/limite de crédito
 */
export function calculateDebtRatio(treasury: Treasury): number {
  if (treasury.creditLimit === 0) return 1;
  return treasury.debt / treasury.creditLimit;
}

/**
 * Verifica se está acima do limite de crédito
 */
export function isOverCreditLimit(treasury: Treasury): boolean {
  return treasury.debt > treasury.creditLimit;
}

/**
 * Calcula os juros da dívida
 */
export function calculateDebtInterest(
  treasury: Treasury,
  interestRate: number
): number {
  return Math.floor(treasury.debt * interestRate);
}

/**
 * Aplica juros à dívida
 */
export function applyDebtInterest(
  treasury: Treasury,
  interestRate: number
): Treasury {
  const interest = calculateDebtInterest(treasury, interestRate);

  return addExpense(treasury, 'debt_interest', interest);
}