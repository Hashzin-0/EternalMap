/**
 * Market System - Gerencia preços e oferta/demanda
 * Fase 3: Economia
 */

import { GoodType, GOODS_DEFINITION } from '../types/world';

export interface MarketPrice {
  good: GoodType;
  price: number;
  basePrice: number;
  supply: number;
  demand: number;
  priceRatio: number; // 0.25 - 1.75
}

export interface Market {
  id: string;
  countryId: string;
  prices: Record<GoodType, MarketPrice>;
}

/**
 * Calcula o preço baseado em oferta e demanda
 * Formula: base × [1 + 0.75 × clamp((demand - supply) / min(demand, supply), ±1)]
 * Retorna preço entre 25% e 175% do preço base
 */
export function calculatePrice(
  basePrice: number,
  supply: number,
  demand: number
): number {
  if (supply === 0 && demand === 0) {
    return basePrice;
  }

  const diff = demand - supply;
  const min = Math.min(demand, supply);
  const ratio = min > 0 ? diff / min : 0;
  const clamped = Math.max(-1, Math.min(1, ratio));
  const priceRatio = 1 + 0.75 * clamped;

  return Math.round(basePrice * priceRatio);
}

/**
 * Calcula preço local considerando acesso ao mercado mundial
 */
export function calculateLocalPrice(
  marketPrice: number,
  worldPrice: number,
  marketAccess: number
): number {
  return Math.round(
    marketPrice * marketAccess + worldPrice * (1 - marketAccess)
  );
}

/**
 * Cria um mercado vazio para um país
 */
export function createMarket(
  marketId: string,
  countryId: string
): Market {
  const prices: Partial<Record<GoodType, MarketPrice>> = {};

  // Inicializa preços para todos os bens
  Object.values(GoodType).forEach(good => {
    const definition = GOODS_DEFINITION[good];
    prices[good] = {
      good,
      price: definition.basePrice,
      basePrice: definition.basePrice,
      supply: definition.tradedQuantity,
      demand: definition.tradedQuantity,
      priceRatio: 1.0,
    };
  });

  return {
    id: marketId,
    countryId,
    prices: prices as Record<GoodType, MarketPrice>,
  };
}

/**
 * Atualiza oferta de um bem no mercado
 */
export function updateSupply(
  market: Market,
  good: GoodType,
  delta: number
): Market {
  const currentPrice = market.prices[good];
  if (!currentPrice) {
    return market;
  }

  const newSupply = Math.max(0, currentPrice.supply + delta);
  const newPrice = calculatePrice(
    currentPrice.basePrice,
    newSupply,
    currentPrice.demand
  );

  return {
    ...market,
    prices: {
      ...market.prices,
      [good]: {
        ...currentPrice,
        supply: newSupply,
        price: newPrice,
        priceRatio: newPrice / currentPrice.basePrice,
      },
    },
  };
}

/**
 * Atualiza demanda de um bem no mercado
 */
export function updateDemand(
  market: Market,
  good: GoodType,
  delta: number
): Market {
  const currentPrice = market.prices[good];
  if (!currentPrice) {
    return market;
  }

  const newDemand = Math.max(0, currentPrice.demand + delta);
  const newPrice = calculatePrice(
    currentPrice.basePrice,
    currentPrice.supply,
    newDemand
  );

  return {
    ...market,
    prices: {
      ...market.prices,
      [good]: {
        ...currentPrice,
        demand: newDemand,
        price: newPrice,
        priceRatio: newPrice / currentPrice.basePrice,
      },
    },
  };
}

/**
 * Atualiza oferta e demanda simultaneamente
 */
export function updateMarketBalance(
  market: Market,
  good: GoodType,
  supplyDelta: number,
  demandDelta: number
): Market {
  const currentPrice = market.prices[good];
  if (!currentPrice) {
    return market;
  }

  const newSupply = Math.max(0, currentPrice.supply + supplyDelta);
  const newDemand = Math.max(0, currentPrice.demand + demandDelta);
  const newPrice = calculatePrice(
    currentPrice.basePrice,
    newSupply,
    newDemand
  );

  return {
    ...market,
    prices: {
      ...market.prices,
      [good]: {
        ...currentPrice,
        supply: newSupply,
        demand: newDemand,
        price: newPrice,
        priceRatio: newPrice / currentPrice.basePrice,
      },
    },
  };
}

/**
 * Obtém o preço de um bem no mercado
 */
export function getPrice(market: Market, good: GoodType): number {
  return market.prices[good]?.price ?? GOODS_DEFINITION[good].basePrice;
}

/**
 * Obtém o ratio de preço (0.25 - 1.75)
 */
export function getPriceRatio(market: Market, good: GoodType): number {
  return market.prices[good]?.priceRatio ?? 1.0;
}

/**
 * Calcula o valor total do mercado
 */
export function calculateMarketValue(market: Market): number {
  return Object.values(market.prices).reduce(
    (total, p) => total + p.price * (p.supply + p.demand) / 2,
    0
  );
}