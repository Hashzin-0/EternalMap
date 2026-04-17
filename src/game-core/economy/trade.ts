/**
 * Trade Routes System - Gerencia rotas de comércio
 * Fase 3: Economia
 */

import { GoodType, GOODS_DEFINITION } from '../types/world';

export interface TradeRoute {
  id: string;
  fromMarketId: string;
  toMarketId: string;
  good: GoodType;
  amount: number;
  tariffs: number; // 0-100%
  convoysRequired: number;
  convoysAvailable: number;
  profit: number;
}

export interface TradeCapacity {
  marketId: string;
  importCapacity: number;
  exportCapacity: number;
  convoys: number;
}

/**
 * Calcula o lucro de uma rota de comércio
 * Formula: (sellingPrice - buyingPrice) * amount - convoyCost
 */
export function calculateTradeProfit(
  sellingPrice: number,
  buyingPrice: number,
  amount: number,
  convoyCost: number
): number {
  return (sellingPrice - buyingPrice) * amount - convoyCost;
}

/**
 * Calcula a quantidade de comboios necessários para uma rota
 * Formula: ceil(amount * multiplier / 100)
 * 100 unidades por comboio base
 */
export function calculateConvoysRequired(
  amount: number,
  good: GoodType
): number {
  const definition = GOODS_DEFINITION[good];
  const multiplier = definition.convoyCostMultiplier || 1;
  return Math.ceil((amount * multiplier) / 100);
}

/**
 * Cria uma nova rota de comércio
 */
export function createTradeRoute(
  id: string,
  fromMarketId: string,
  toMarketId: string,
  good: GoodType,
  amount: number,
  tariffs: number = 0
): TradeRoute {
  const convoysRequired = calculateConvoysRequired(amount, good);

  return {
    id,
    fromMarketId,
    toMarketId,
    good,
    amount,
    tariffs,
    convoysRequired,
    convoysAvailable: 0,
    profit: 0,
  };
}

/**
 * Atualiza a quantidade de uma rota
 */
export function updateTradeRouteAmount(
  route: TradeRoute,
  newAmount: number
): TradeRoute {
  const convoysRequired = calculateConvoysRequired(newAmount, route.good);

  return {
    ...route,
    amount: newAmount,
    convoysRequired,
  };
}

/**
 * Atualiza as tarifas de uma rota
 */
export function updateTariffs(
  route: TradeRoute,
  newTariffs: number
): TradeRoute {
  return {
    ...route,
    tariffs: Math.max(0, Math.min(100, newTariffs)),
  };
}

/**
 * Atribui comboios a uma rota
 */
export function assignConvoys(
  route: TradeRoute,
  convoys: number
): TradeRoute {
  return {
    ...route,
    convoysAvailable: Math.min(convoys, route.convoysRequired),
  };
}

/**
 * Atualiza o lucro de uma rota
 */
export function updateRouteProfit(
  route: TradeRoute,
  profit: number
): TradeRoute {
  return {
    ...route,
    profit,
  };
}

/**
 * Verifica se uma rota tem comboios suficientes
 */
export function hasSufficientConvoys(route: TradeRoute): boolean {
  return route.convoysAvailable >= route.convoysRequired;
}

/**
 * Calcula o custo de transporte por unidade
 */
export function calculateTransportCost(
  distance: number,
  convoyCost: number,
  amount: number
): number {
  if (amount === 0) return 0;
  return (distance * convoyCost) / amount;
}

/**
 * Cria capacidade de comércio para um mercado
 */
export function createTradeCapacity(
  marketId: string,
  convoys: number = 100
): TradeCapacity {
  return {
    marketId,
    importCapacity: convoys,
    exportCapacity: convoys,
    convoys,
  };
}

/**
 * Atualiza a capacidade de importação
 */
export function updateImportCapacity(
  capacity: TradeCapacity,
  additionalCapacity: number
): TradeCapacity {
  return {
    ...capacity,
    importCapacity: capacity.importCapacity + additionalCapacity,
  };
}

/**
 * Atualiza a capacidade de exportação
 */
export function updateExportCapacity(
  capacity: TradeCapacity,
  additionalCapacity: number
): TradeCapacity {
  return {
    ...capacity,
    exportCapacity: capacity.exportCapacity + additionalCapacity,
  };
}

/**
 * Usa capacidade de importação
 */
export function useImportCapacity(
  capacity: TradeCapacity,
  amount: number
): TradeCapacity {
  return {
    ...capacity,
    importCapacity: Math.max(0, capacity.importCapacity - amount),
  };
}

/**
 * Usa capacidade de exportação
 */
export function useExportCapacity(
  capacity: TradeCapacity,
  amount: number
): TradeCapacity {
  return {
    ...capacity,
    exportCapacity: Math.max(0, capacity.exportCapacity - amount),
  };
}

/**
 * Calcula o valor total de comércio de uma rota
 */
export function calculateRouteValue(
  route: TradeRoute,
  price: number
): number {
  return route.amount * price;
}

/**
 * Calcula as tarifas totais de uma rota
 */
export function calculateTotalTariffs(
  route: TradeRoute,
  price: number
): number {
  return (route.amount * price * route.tariffs) / 100;
}