/**
 * Construction System - Gerencia construção de edifícios
 * Fase 3: Economia
 */

import { BuildingType } from '../types/economy';

export interface ConstructionProject {
  id: string;
  buildingType: BuildingType;
  stateId: string;
  priority: number; // 1-5
  costTotal: number;
  costPaid: number;
  daysRemaining: number;
  progress: number; // 0-100
  status: 'queued' | 'constructing' | 'completed' | 'cancelled';
}

export interface ConstructionQueue {
  countryId: string;
  projects: ConstructionProject[];
  capacity: number;
  capacityUsed: number;
}

export interface ConstructionCapacity {
  base: number;
  urbanizationBonus: number;
  total: number;
}

/**
 * Calcula a capacidade de construção do país
 * Formula: base (10) + 1 por cada 5 de urbanização
 */
export function calculateConstructionCapacity(
  base: number,
  urbanization: number
): number {
  const urbanizationBonus = Math.floor(urbanization / 5);
  return base + urbanizationBonus;
}

/**
 * Calcula o custo de um edifício baseado no nível
 * Formula: baseCost * (multiplier ^ (level - 1))
 */
export function calculateBuildingCost(
  baseCost: number,
  level: number,
  levelCostMultiplier: number
): number {
  return Math.floor(baseCost * Math.pow(levelCostMultiplier, level - 1));
}

/**
 * Cria uma nova fila de construção vazia
 */
export function createConstructionQueue(countryId: string): ConstructionQueue {
  return {
    countryId,
    projects: [],
    capacity: 10,
    capacityUsed: 0,
  };
}

/**
 * Adiciona um projeto à fila de construção
 */
export function addProject(
  queue: ConstructionQueue,
  project: ConstructionProject
): ConstructionQueue {
  return {
    ...queue,
    projects: [...queue.projects, project].sort((a, b) => a.priority - b.priority),
  };
}

/**
 * Inicia a construção do próximo projeto na fila
 */
export function startNextProject(queue: ConstructionQueue): ConstructionQueue {
  const nextProject = queue.projects.find(p => p.status === 'queued');
  if (!nextProject || queue.capacityUsed >= queue.capacity) {
    return queue;
  }

  const startedProject: ConstructionProject = {
    ...nextProject,
    status: 'constructing',
  };

  return {
    ...queue,
    projects: queue.projects.map(p =>
      p.id === nextProject.id ? startedProject : p
    ),
    capacityUsed: queue.capacityUsed + 1,
  };
}

/**
 * Atualiza o progresso de um projeto em construção
 */
export function updateProjectProgress(
  queue: ConstructionQueue,
  projectId: string,
  progressDelta: number
): ConstructionQueue {
  return {
    ...queue,
    projects: queue.projects.map(p => {
      if (p.id !== projectId || p.status !== 'constructing') {
        return p;
      }

      const newProgress = Math.min(100, p.progress + progressDelta);
      const isCompleted = newProgress >= 100;

      return {
        ...p,
        progress: newProgress,
        status: isCompleted ? 'completed' : 'constructing',
        costPaid: isCompleted ? p.costTotal : p.costPaid,
        daysRemaining: isCompleted ? 0 : Math.max(0, p.daysRemaining - 1),
      };
    }),
  };
}

/**
 * Completa projetos finalizados e libera capacidade
 */
export function completeFinishedProjects(queue: ConstructionQueue): ConstructionQueue {
  const completedCount = queue.projects.filter(
    p => p.status === 'completed'
  ).length;

  return {
    ...queue,
    projects: queue.projects.filter(p => p.status !== 'completed'),
    capacityUsed: Math.max(0, queue.capacityUsed - completedCount),
  };
}

/**
 * Cancela um projeto da fila
 */
export function cancelProject(
  queue: ConstructionQueue,
  projectId: string
): ConstructionQueue {
  const project = queue.projects.find(p => p.id === projectId);
  if (!project) {
    return queue;
  }

  const wasConstructing = project.status === 'constructing';

  return {
    ...queue,
    projects: queue.projects.filter(p => p.id !== projectId),
    capacityUsed: wasConstructing
      ? Math.max(0, queue.capacityUsed - 1)
      : queue.capacityUsed,
  };
}