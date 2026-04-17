// Economy types
export type { 
  BuildingCategory, 
  OwnerType, 
  BuildingLevel, 
  Building, 
  BuildingType 
} from '../types/economy';

// Building registry
export { BUILDING_TYPES } from './buildings';

// Re-export from types
export type { 
  GoodCategory, 
  GoodDefinition 
} from '../types/world';
export { GoodType, GOODS_DEFINITION } from '../types/world';

// Construction System
export type {
  ConstructionProject,
  ConstructionQueue,
  ConstructionCapacity
} from './construction';
export {
  calculateConstructionCapacity,
  calculateBuildingCost,
  createConstructionQueue,
  addProject,
  startNextProject,
  updateProjectProgress,
  completeFinishedProjects,
  cancelProject
} from './construction';

// Market System
export type {
  MarketPrice,
  Market
} from './market';
export {
  calculatePrice,
  calculateLocalPrice,
  createMarket,
  updateSupply,
  updateDemand,
  updateMarketBalance,
  getPrice,
  getPriceRatio,
  calculateMarketValue
} from './market';

// Trade Routes System
export type {
  TradeRoute,
  TradeCapacity
} from './trade';
export {
  calculateTradeProfit,
  calculateConvoysRequired,
  createTradeRoute,
  updateTradeRouteAmount,
  updateTariffs,
  assignConvoys,
  updateRouteProfit,
  hasSufficientConvoys,
  calculateTransportCost,
  createTradeCapacity,
  updateImportCapacity,
  updateExportCapacity,
  useImportCapacity,
  useExportCapacity,
  calculateRouteValue,
  calculateTotalTariffs
} from './trade';

// Treasury System
export type {
  IncomeType,
  ExpenseType,
  Treasury,
  TreasurySnapshot
} from './treasury';
export {
  createTreasury,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetIncome,
  addIncome,
  addExpense,
  addTransaction,
  processMonthlyBudget,
  borrowMoney,
  payOffDebt,
  updateCreditLimit,
  canAfford,
  isDeficit,
  createTreasurySnapshot,
  calculateDebtRatio,
  isOverCreditLimit,
  calculateDebtInterest,
  applyDebtInterest
} from './treasury';